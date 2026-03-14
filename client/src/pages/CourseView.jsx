import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, ChevronRight, Zap, Play, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const CourseView = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get(`${API_BASE}/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setCourse(data);
            } catch (err) {
                console.error('Error fetching course:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleStatusUpdate = async (moduleIndex, newStatus) => {
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.put(`${API_BASE}/courses/update-module`, {
                courseId,
                moduleIndex,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setCourse(data);
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    if (loading) return (
        <Layout>
            <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent1 animate-spin mb-4" />
                <p className="text-secondary">Loading your course content...</p>
            </div>
        </Layout>
    );

    if (!course) return <Layout><div className="p-10 text-center">Course not found.</div></Layout>;

    const totalHours = course.duration * course.dailyTime;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-10">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-secondary hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>

                <div className="flex justify-between items-start mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <span className="text-accent1 font-bold tracking-widest uppercase text-xs mb-2 block">Ongoing Course</span>
                        <h1 className="text-4xl mb-4 font-bricolage">{course.courseName}</h1>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2 text-secondary bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                <BookOpen className="w-4 h-4 text-accent2" /> {course.structure.length} Chapters
                            </div>
                            <div className="flex items-center gap-2 text-secondary bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                <Clock className="w-4 h-4 text-accent2" /> {totalHours} Total Hours
                            </div>
                        </div>
                    </motion.div>

                    <div className="text-right">
                        <div className="text-secondary text-sm mb-2">Completion</div>
                        <div className="text-3xl font-bricolage text-accent1">
                            {course.structure?.length > 0
                                ? Math.round((course.structure.filter(m => m.status === 'completed').length / course.structure.length) * 100)
                                : 0}%
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {course.structure && course.structure.length > 0 ? (
                        course.structure.map((module, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass-card p-8 group relative overflow-hidden transition-all ${module.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full transition-transform origin-top ${module.status === 'completed' ? 'bg-green-500 scale-y-100' : 'bg-accent1 transform scale-y-0 group-hover:scale-y-100'}`}></div>
                                <div className="flex gap-6">
                                    <div className="shrink-0 flex flex-col items-center gap-2">
                                        <span className={`text-accent2 font-bold text-sm px-3 py-1 rounded-full border ${module.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-accent2/10 border-accent2/20'}`}>{(module.chapter || module.dayRange || '').replace('Day', 'Chapter')}</span>
                                        {module.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl mb-2 font-medium group-hover:text-accent1 transition-colors">{module.topic}</h3>
                                        <p className="text-secondary mb-4 leading-relaxed">{module.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-secondary/60">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {module.estimatedTime}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight ${module.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                module.status === 'in-progress' ? 'bg-accent2/20 text-accent2 animate-pulse' : 'bg-white/5'
                                                }`}>{module.status || 'pending'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 self-center">
                                        {module.status !== 'completed' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(i, 'in-progress')}
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${module.status === 'in-progress' ? 'bg-accent1 text-white' : 'bg-accent1/10 text-accent1 border border-accent1/20 hover:bg-accent1 hover:text-white'}`}
                                                    title="Start Module"
                                                >
                                                    <Play className="w-6 h-6 fill-current" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(i, 'completed')}
                                                    className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center"
                                                    title="Mark as Completed"
                                                >
                                                    <CheckCircle className="w-6 h-6" />
                                                </button>
                                            </>
                                        )}
                                        {module.status === 'completed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(i, 'in-progress')}
                                                className="text-xs text-secondary hover:text-white underline"
                                            >
                                                Undo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="glass-card p-12 text-center border-accent1/20">
                            <Zap className="w-12 h-12 text-accent2 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-xl mb-2">Roadmap not yet generated</h3>
                            <button
                                onClick={() => navigate(`/generate-course/${courseId}`)}
                                className="btn-primary mt-4 px-8"
                            >
                                Generate Full Roadmap
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default CourseView;
