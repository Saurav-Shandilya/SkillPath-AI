import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import Anthropic from "@anthropic-ai/sdk";
import Course from '../models/Course.js';
import User from '../models/User.js';

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "", // Defaults to process.env.ANTHROPIC_API_KEY
});

const parseAIResponse = (text) => {
    try {
        console.log("Parsing AI response...");
        // Strip markdown code blocks if present
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();

        const firstBracket = jsonString.search(/[\[\{]/);
        const lastBracket = Math.max(jsonString.lastIndexOf(']'), jsonString.lastIndexOf('}'));

        if (firstBracket === -1 || lastBracket === -1 || lastBracket < firstBracket) {
            console.error("No valid JSON brackets found in text:", text);
            throw new Error("Invalid AI response format");
        }

        const cleanedJson = jsonString.substring(firstBracket, lastBracket + 1);
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Parse Error:", error, "Original Text:", text);
        throw new Error("Failed to parse AI response: " + error.message);
    }
};

const callBedrock = async (prompt) => {
    const modelId = "meta.llama3-8b-instruct-v1:0";

    // Llama 3.2 prompt format
    const formattedPrompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    const body = JSON.stringify({
        prompt: formattedPrompt,
        max_gen_len: 2048,
        temperature: 0.5,
        top_p: 0.9,
    });

    const command = new InvokeModelCommand({
        modelId,
        body,
        contentType: "application/json",
        accept: "application/json",
    });

    try {
        const response = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.body));
        // Llama 3 on Bedrock returns the result in the 'generation' field
        return parseAIResponse(result.generation);
    } catch (error) {
        console.error("Bedrock Error:", error);
        throw error;
    }
};

// Step 3: Generate Diagnostic Test
export const generateDiagnosticTest = async (req, res) => {
    const { courseName, targetGoal, duration, dailyTime } = req.body;

    try {
        const prompt = `You are a specialized technical instructor for the topic: "${courseName}".
        Generate a unique, challenging diagnostic test strictly for "${courseName}" based on the goal: "${targetGoal}".
        DO NOT include questions about unrelated technologies (e.g., if the topic is Python, do not ask about React).
        
        The assessment must contain exactly 5 technical questions:
        - 3 Multiple Choice Questions (MCQ) with 4 plausible options.
        - 2 Technical Short Answer questions (set options to an empty array).
        Ensure the questions are specific to the core concepts and advanced features of ${courseName}.
        
        Return ONLY a JSON array of objects.
        Format: [{"question": "...", "options": ["...", "..."], "answer": "...", "difficulty": "...", "skill": "..."}]`;

        const diagnosticTest = await callBedrock(prompt);

        const course = await Course.create({
            userId: req.user._id,
            courseName,
            targetGoal,
            duration,
            dailyTime,
            diagnosticTest
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Step 4: Analyze Skill Gap
export const analyzeSkillGap = async (req, res) => {
    const { testResults } = req.body;
    const courseId = req.params.id;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const prompt = `Analyze these test results for the course "${course.courseName}": ${JSON.stringify(testResults)}. 
        Some results are MCQ selections, while others are technical short-answer explanations.
        Based on the accuracy and technical depth of the answers, determine:
        1. Current skill level (Beginner, Intermediate, Advanced).
        2. A list of 4-6 specifically missing skills or areas for improvement.
        3. A list of 3-4 already known skills based on correct answers.
        4. Calculation of a diagnostic score (0-100) reflecting technical proficiency.
        Return ONLY a JSON object with fields: score, skillLevel, missingSkills, knownSkills.`;

        console.log("Analyzing Skill Gap with prompt...");
        const aiResults = await callBedrock(prompt);
        console.log("AI Analysis Analysis Results:", aiResults);
        course.diagnosticResults = aiResults;

        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Step 5 & 6: Generate Personalized Course Structure & Time Optimization
export const generateCourseStructure = async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        console.log(`Generating structure for course: ${courseId} (User: ${course.userId})`);

        // Extract diagnostic info safely
        const { skillLevel = 'Beginner', missingSkills = [] } = course.diagnosticResults || {};
        console.log(`Current Skill Level: ${skillLevel}`);
        console.log(`Missing Skills Identified: ${Array.isArray(missingSkills) ? missingSkills.join(', ') : 'None'}`);

        const prompt = `Generate a personalized learning roadmap for "${course.courseName}" targeting "${course.targetGoal}" in ${course.duration} days.
        Current Level: ${skillLevel}. Missing Skills: ${Array.isArray(missingSkills) ? missingSkills.join(', ') : 'None'}.
        Optimize for ${course.dailyTime} hours/day. 
        Total study hours available: ${course.duration * course.dailyTime}.
        Return ONLY a JSON array of 4-6 modules where each module object has: 
        chapter (e.g. "Chapter 1: Title"), topic, description, estimatedTime (e.g. "8 hours"), status (set to "pending").`;

        console.log("Sending prompt to Bedrock for structure generation...");
        const aiResponse = await callBedrock(prompt);
        console.log("Structure AI Response received and parsed.");

        course.structure = aiResponse;
        console.log("Structure saved to course object. Module count:", course.structure?.length);
        console.log("Structure generated successfully. Module count:", course.structure?.length);
        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Step 7: Course Enrollment
export const enrollInCourse = async (req, res) => {
    const courseId = req.params.id;

    try {
        console.log(`Enrollment starting: User ${req.user._id} attempting to enroll in Course ${courseId}`);
        const course = await Course.findById(courseId);
        if (!course) {
            console.error(`Course not found: ${courseId}`);
            return res.status(404).json({ message: 'Course not found' });
        }

        course.isEnrolled = true;
        // Ensure userId matches if we want strict ownership, but for now just enroll
        if (!course.userId) {
            course.userId = req.user._id;
        }
        await course.save();

        console.log(`Enrollment successful for Course ID: ${courseId}. Updating user: ${req.user._id}`);

        // Update user's enrolledCourses
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { enrolledCourses: { courseId: course._id, progress: 0 } }
        }, { new: true });

        console.log(`User ${req.user._id} enrolledCourses count: ${updatedUser?.enrolledCourses?.length}`);

        console.log(`User ${req.user._id} enrolled in course ${courseId}`);

        res.json({ message: 'Enrolled successfully', course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateModuleStatus = async (req, res) => {
    const { courseId, moduleIndex, status } = req.body; // status: pending, in-progress, completed

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.structure[moduleIndex]) {
            course.structure[moduleIndex].status = status;

            // Add XP if completed
            if (status === 'completed') {
                const user = await User.findById(req.user._id);
                user.xp += 50; // default 50 XP per module
                await user.save();
            }

            await course.save();
            res.json(course);
        } else {
            res.status(400).json({ message: 'Invalid module index' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate Content for a specific Chapter/Topic
export const generateChapterContent = async (req, res) => {
    const courseId = req.params.id;
    const { chapterIndex } = req.params;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const module = course.structure[chapterIndex];
        if (!module) return res.status(400).json({ message: 'Invalid chapter index' });

        // If content already exists, just return it
        if (module.content) {
            return res.json({ content: module.content });
        }

        const prompt = `You are a specialized technical instructor teaching ${course.courseName}. 
        The student is at a ${course.diagnosticResults?.skillLevel || 'Beginner'} level.
        
        Write a comprehensive, in-depth study guide for the topic: "${module.topic}".
        Description / Context: "${module.description}".
        
        Requirements:
        1. Explain the core concepts clearly and in detail.
        2. Provide at least 2 practical, real-world examples or analogies that make it relatable.
        3. Include a code snippet if applicable to the topic.
        4. Output purely in rich Markdown format with appropriate headers, bullet points, and code blocks.`;

        console.log(`Generating content for chapter: ${module.topic} using Anthropic Claude...`);
        
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            temperature: 0.7,
            messages: [
                { role: "user", content: prompt }
            ]
        });
        
        const generatedContent = response.content[0].text.trim();
        
        // Save back to course
        course.structure[chapterIndex].content = generatedContent;
        await course.save();

        res.json({ content: generatedContent });
    } catch (error) {
        console.error("Error generating chapter content:", error);
        res.status(500).json({ message: error.message });
    }
};
