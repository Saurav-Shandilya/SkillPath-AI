import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, ChevronRight, Zap, Play, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/Layout';

const CourseView = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedChapter, setExpandedChapter] = useState(null);
    const [generatingContent, setGeneratingContent] = useState(null); // storing the moduleIndex taking action
    const [errorContent, setErrorContent] = useState({}); // storing error strings per moduleIndex
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

    const handleReadTopic = async (moduleIndex) => {
        if (expandedChapter === moduleIndex) {
            setExpandedChapter(null); // close if already open
            return;
        }

        const module = course.structure[moduleIndex];
        
        // If content is already present (from previous generation), just expand
        if (module.content) {
            setExpandedChapter(moduleIndex);
            if (module.status === 'pending') {
                handleStatusUpdate(moduleIndex, 'in-progress');
            }
            return;
        }

        // Otherwise generate content
        setGeneratingContent(moduleIndex);
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            
            // Call our robust backend endpoint (which uses Bedrock)
            const { data } = await axios.post(`${API_BASE}/courses/${courseId}/chapter/${moduleIndex}/generate-content`, {}, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            if(!data.content) throw new Error('No content returned from server');

            const textContent = data.content;

            // Update course state with the new content
            const updatedCourse = { ...course };
            updatedCourse.structure[moduleIndex].content = textContent;
            
            // Backend handles status update to in-progress if needed, but we reflect it here
            if (updatedCourse.structure[moduleIndex].status === 'pending') {
                updatedCourse.structure[moduleIndex].status = 'in-progress';
            }
            
            setCourse(updatedCourse);
            setExpandedChapter(moduleIndex);
            
            // clear any previous error
            setErrorContent(prev => ({ ...prev, [moduleIndex]: null }));
        } catch (err) {
            console.error('Error generating chapter content via backend:', err);
            
            // Set error state so user can retry, but still open the tab
            setErrorContent(prev => ({ ...prev, [moduleIndex]: "⚠ Error generating lesson material. The server might be busy. Please try again." }));
            setExpandedChapter(moduleIndex);
        } finally {
            setGeneratingContent(null);
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
                        <span className="text-[#ff6b2b] font-bold tracking-widest uppercase text-xs mb-2 block">Ongoing Course</span>
                        <h1 className="text-4xl mb-4 font-bold">{course.courseName}</h1>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2 text-gray-400 bg-[#13161e] px-4 py-2 rounded-full border border-white/5">
                                <BookOpen className="w-4 h-4 text-[#00d4aa]" /> {course.structure.length} Chapters
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 bg-[#13161e] px-4 py-2 rounded-full border border-white/5">
                                <Clock className="w-4 h-4 text-[#00d4aa]" /> {totalHours} Total Hours
                            </div>
                        </div>
                    </motion.div>

                    <div className="text-right">
                        <div className="text-gray-400 text-sm mb-2">Completion</div>
                        <div className="text-3xl font-bold text-[#ff6b2b]">
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
                                className={`dash-card p-8 group relative overflow-hidden transition-all ${module.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full transition-transform origin-top ${module.status === 'completed' ? 'bg-[#00d4aa] scale-y-100' : 'bg-[#ff6b2b] transform scale-y-0 group-hover:scale-y-100'}`}></div>
                                <div className="flex gap-6 text-white">
                                    <div className="shrink-0 flex flex-col items-center gap-2">
                                        <span className={`text-[#00d4aa] font-bold text-sm px-3 py-1 rounded-full border ${module.status === 'completed' ? 'bg-[#00d4aa]/10 border-green-500/20 text-[#00d4aa]' : 'bg-[#00d4aa]/10 border-[#00d4aa]/20'}`}>{(module.chapter || module.dayRange || '').replace('Day', 'Chapter')}</span>
                                        {module.status === 'completed' && <CheckCircle className="w-5 h-5 text-[#00d4aa]" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl mb-2 font-bold group-hover:text-[#ff6b2b] transition-colors">{module.topic}</h3>
                                        <p className="text-gray-400 mb-4 leading-relaxed">{module.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-400/60">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {module.estimatedTime}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight ${module.status === 'completed' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' :
                                                module.status === 'in-progress' ? 'bg-[#ff6b2b]/20 text-[#ff6b2b] animate-pulse' : 'bg-white/5'
                                                }`}>{module.status || 'pending'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 self-center">
                                        <button
                                            onClick={() => {
                                                handleReadTopic(i);
                                            }}
                                            disabled={generatingContent === i}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${module.status === 'in-progress' || expandedChapter === i ? 'bg-[#ff6b2b] text-white shadow-lg shadow-[#ff6b2b]/30' : 'bg-[#ff6b2b]/10 text-[#ff6b2b] border border-[#ff6b2b]/20 hover:bg-[#ff6b2b] hover:text-white'}`}
                                            title="Study Topic"
                                        >
                                            {generatingContent === i ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                        </button>

                                        {module.status !== 'completed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(i, 'completed')}
                                                className="w-12 h-12 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 hover:bg-[#00d4aa] hover:text-white transition-all flex items-center justify-center"
                                                title="Mark as Completed"
                                            >
                                                <CheckCircle className="w-6 h-6" />
                                            </button>
                                        )}

                                        {module.status === 'completed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(i, 'in-progress')}
                                                className="text-xs text-secondary hover:text-white underline mt-2"
                                            >
                                                Undo
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Study Material Expansion */}
                                {expandedChapter === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-6 pt-6 border-t border-white/10"
                                    >
                                        <div className="prose prose-invert max-w-none text-secondary">
                                            {errorContent[i] ? (
                                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                                                    {errorContent[i]}
                                                </div>
                                            ) : (
                                                <ReactMarkdown>{module.content}</ReactMarkdown>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
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
