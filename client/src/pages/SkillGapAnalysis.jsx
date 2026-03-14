import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, CheckCircle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const SkillGapAnalysis = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get(`${API_BASE}/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setCourse(data);
            } catch (err) {
                console.error('Error fetching analysis:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [courseId]);

    const handleGenerateCourse = () => {
        navigate(`/generate-course/${courseId}`);
    };

    if (loading) return <Layout><div className="h-full flex items-center justify-center font-jost">Analyzing skill gaps...</div></Layout>;

    const results = course.diagnosticResults;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-12 glass p-10 flex items-center justify-between overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <span className="text-accent2 font-bold tracking-widest uppercase text-sm">Analysis Complete</span>
                        <h1 className="text-5xl mt-2 mb-4">You are a <span className="text-accent1">{results.skillLevel}</span></h1>
                        <p className="text-xl text-secondary max-w-md">We&apos;ve identified {results.missingSkills.length} key areas to focus on to reach your goal: <span className="text-white italic">{course.targetGoal}</span></p>
                    </div>
                    <div className="relative z-10 text-center">
                        <div className="w-32 h-32 rounded-full border-4 border-accent1 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(255,106,61,0.3)]">
                            <span className="text-4xl font-bold font-bricolage">{results.score}%</span>
                        </div>
                        <p className="text-secondary font-medium">Diagnostic Score</p>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-accent1/10 rounded-full blur-3xl -z-0"></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Missing Skills */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 border-accent1/20"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-accent1/20 rounded-lg text-accent1">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl">Missing Skills (Priority)</h2>
                        </div>
                        <div className="space-y-4">
                            {results.missingSkills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-accent1/30 transition-all">
                                    <div className="w-2 h-2 rounded-full bg-accent1 group-hover:scale-150 transition-transform"></div>
                                    <span className="text-lg text-white/90">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Known Skills */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 border-secondary/20"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl">Already Mastered</h2>
                        </div>
                        <div className="space-y-4">
                            {results.knownSkills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 opacity-70">
                                    <CheckCircle className="w-5 h-5 text-secondary" />
                                    <span className="text-lg">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-accent1/5 p-12 rounded-3xl border border-accent1/20 relative overflow-hidden"
                >
                    <Sparkles className="absolute top-10 left-10 text-accent1/20 w-12 h-12" />
                    <Sparkles className="absolute bottom-10 right-10 text-accent1/20 w-12 h-12" />

                    <h2 className="text-3xl mb-6">Ready for your personalized path?</h2>
                    <p className="text-secondary mb-10 text-lg max-w-2xl mx-auto">
                        We&apos;ll optimize your {course.duration}-day schedule to focus precisely on these gaps, skipping what you already know to save you time.
                    </p>

                    <button
                        onClick={handleGenerateCourse}
                        className="btn-primary py-5 px-12 text-xl flex items-center justify-center gap-4 mx-auto"
                    >
                        Generate Personalized Course <ArrowRight className="w-6 h-6" />
                    </button>
                </motion.div>
            </div>
        </Layout>
    );
};

export default SkillGapAnalysis;
