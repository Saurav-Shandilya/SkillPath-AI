import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Flame, Target, ChevronRight, PlayCircle, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const Dashboard = () => {
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo || !userInfo.token) {
                    navigate('/login');
                    return;
                }
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

                // Get complete profile with stats
                const profileRes = await axios.get(`${API_BASE}/users/profile`, config);
                setUser({
                    ...profileRes.data.user,
                    name: profileRes.data.user.name || userInfo.name,
                    email: profileRes.data.user.email || userInfo.email,
                    stats: profileRes.data.stats
                });

                const coursesRes = await axios.get(`${API_BASE}/courses/my-courses`, config);

                // Calculate individual course progress for display
                const updatedCourses = coursesRes.data.map(course => {
                    const completed = course.structure.filter(m => m.status === 'completed').length;
                    const total = course.structure.length;
                    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return { ...course, progress };
                });

                setCourses(updatedCourses);
            } catch (err) {
                console.error('Critical Dashboard Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <Layout><div className="h-full flex items-center justify-center font-jost text-secondary">Loading dashboard...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-6">
                {/* Welcome Section */}
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl mb-2">Welcome back, <span className="text-secondary">{user?.name}</span> 👋</h1>
                        <p className="text-secondary/70">Continue your journey where you left off.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-accent1/20">
                            <Flame className="text-accent1 w-6 h-6 fill-accent1" />
                            <div>
                                <p className="text-xs text-secondary font-bold uppercase tracking-wider">Streak</p>
                                <p className="text-xl font-bold">{user?.streak || 0} 🔥</p>
                            </div>
                        </div>
                        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-accent2/20">
                            <Trophy className="text-accent2 w-6 h-6" />
                            <div>
                                <p className="text-xs text-secondary font-bold uppercase tracking-wider">XP Points</p>
                                <p className="text-xl font-bold">{user?.xp || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {courses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-16 text-center border-dashed border-white/10 rounded-[2rem]"
                    >
                        <div className="w-20 h-20 bg-accent1/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="text-accent1 w-10 h-10" />
                        </div>
                        <h2 className="text-3xl mb-4">No active courses yet</h2>
                        <p className="text-secondary mb-10 max-w-md mx-auto">Start your personalized learning experience by generating your first path.</p>
                        <button
                            onClick={() => navigate('/new-course')}
                            className="btn-primary py-4 px-10 text-lg flex items-center gap-2 mx-auto"
                        >
                            Start New Path <Plus className="w-5 h-5" />
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Active Course Card */}
                        <div className="lg:col-span-2 space-y-8">
                            <h2 className="text-2xl font-medium mb-6 flex items-center gap-3">
                                <Target className="text-accent1" /> Active Learning Path
                            </h2>
                            {courses.map((course) => (
                                <motion.div
                                    key={course._id}
                                    whileHover={{ y: -5 }}
                                    className="glass-card p-10 overflow-hidden relative group cursor-pointer"
                                    onClick={() => navigate(`/course/${course._id}`)}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent1/5 rounded-full blur-3xl group-hover:bg-accent1/10 transition-all"></div>

                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <span className="text-accent2 text-xs font-bold uppercase tracking-widest bg-accent2/10 px-3 py-1 rounded-full border border-accent2/20">Current: {(course.structure.find(s => s.status === 'in-progress')?.chapter || course.structure.find(s => s.status === 'in-progress')?.dayRange || 'Not Started').replace('Day', 'Chapter')}</span>
                                            <h3 className="text-3xl mt-3 mb-2">{course.courseName}</h3>
                                            <p className="text-secondary/70">{course.targetGoal}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-4xl font-bold font-bricolage text-accent1">{course.progress || 0}%</p>
                                            <p className="text-xs text-secondary font-medium lowercase">completed</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-8">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${course.progress || 0}%` }}
                                            className="h-full bg-gradient-to-r from-accent1 to-orange-400"
                                        ></motion.div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 text-sm text-secondary">
                                                <BookOpen className="w-4 h-4" /> {course.structure.length} Chapters
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-secondary">
                                                <PlayCircle className="w-4 h-4" /> Next: {course.structure[0]?.topic}
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 text-accent1 font-bold group">
                                            Continue Session <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Sidebar Stats */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-medium mb-6">Mastery Stats</h2>
                            <div className="glass-card p-8 border-secondary/20">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-secondary">Learning Hours</span>
                                            <span className="text-white font-bold font-bricolage">{user?.stats?.totalHours || 0}h</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-accent1 transition-all" style={{ width: `${Math.min((user?.stats?.totalHours || 0) / 100 * 100, 100)}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-secondary">Course Completion</span>
                                            <span className="text-white font-bold font-bricolage">{user?.stats?.completedCourses || 0}/{user?.stats?.totalCourses || 0}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-accent2 transition-all" style={{ width: `${user?.stats?.totalCourses > 0 ? (user?.stats?.completedCourses / user?.stats?.totalCourses * 100) : 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 bg-gradient-to-br from-accent1/10 to-transparent border-accent1/20">
                                <h3 className="text-xl mb-3 flex items-center gap-2">
                                    <Trophy className="text-accent2" /> Next Milestone
                                </h3>
                                <p className="text-sm text-secondary mb-4">Complete more lessons to reach your next skill milestone!</p>
                                <div className="bg-white/5 p-4 rounded-xl text-xs text-accent1 font-medium text-center border border-white/5">
                                    Total XP: {user?.xp || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
