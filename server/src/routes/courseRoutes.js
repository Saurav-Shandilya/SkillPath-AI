import express from 'express';
import { generateDiagnosticTest, analyzeSkillGap, generateCourseStructure, enrollInCourse, updateModuleStatus } from '../controllers/courseController.js';
import { askMentor } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import Course from '../models/Course.js';

const router = express.Router();

router.post('/generate-test', protect, generateDiagnosticTest);
router.post('/:id/analyze', protect, analyzeSkillGap);
router.post('/:id/generate-structure', protect, generateCourseStructure);
router.post('/:id/enroll', protect, enrollInCourse);
router.put('/update-module', protect, updateModuleStatus);
router.post('/ask-mentor', protect, askMentor);
router.get('/my-courses', protect, async (req, res) => {
    try {
        const courses = await Course.find({ userId: req.user._id, isEnrolled: true });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/:id', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
