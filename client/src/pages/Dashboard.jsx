import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../dashboard.css';

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
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="dashboard-root" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--dash-muted)' }}>Loading dashboard...</div>
            </div>
        );
    }

    const activeCourse = courses.length > 0 ? courses[0] : null;

    return (
        <div className="dashboard-root">
            {/* SIDEBAR */}
            <aside className="dash-sidebar">
                <div className="dash-logo">
                    <div className="dash-logo-icon">🚀</div>
                    <div className="dash-logo-text">SkillPath <span>AI</span></div>
                </div>
                <div className="dash-nav-section">
                    <div className="dash-nav-label">Main</div>
                    <div className="dash-nav-item active"><span className="dash-nav-icon">⊞</span> Dashboard</div>
                    <div className="dash-nav-item" onClick={() => navigate('/new-course')}><span className="dash-nav-icon">📚</span> New Course <span className="dash-badge-pill">New</span></div>
                    <div className="dash-nav-item" onClick={() => navigate('/profile')}><span className="dash-nav-icon">👤</span> Profile</div>
                </div>
                
                <div className="dash-sidebar-bottom">
                    <div className="dash-user-card" onClick={() => navigate('/profile')}>
                        <div className="dash-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                        <div className="dash-user-info">
                            <div className="dash-uname">{user?.name || 'User'}</div>
                            <div className="dash-uemail" style={{maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace:'nowrap'}}>{user?.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="dash-logout-btn">⇢ &nbsp;Logout</button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="dash-main-content">
                {/* Mobile Header (Visible only on small screens) */}
                <div className="dash-mobile-header" style={{ display: 'none' }}>
                    <div className="dash-mobile-logo">
                        🚀 SkillPath <span>AI</span>
                    </div>
                </div>

                <header className="dash-topbar">
                    <div className="dash-greeting">
                        <h1>Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋</h1>
                        <p>Continue your learning journey</p>
                    </div>
                    <div className="dash-topbar-right">
                        <div className="dash-stat-pill">
                            <span>🔥</span>
                            <div><div className="dash-val">{user?.streak || 0}</div><div className="dash-lbl">Streak</div></div>
                        </div>
                        <div className="dash-stat-pill">
                            <span>🏆</span>
                            <div><div className="dash-val">{user?.xp || 0}</div><div className="dash-lbl">XP Points</div></div>
                        </div>
                        <div className="dash-icon-btn">🔔<div className="dash-notif-dot"></div></div>
                    </div>
                </header>

                <div className="dash-content-area">

                    {/* HERO CARD */}
                    {activeCourse ? (
                        <div className="dash-hero-card">
                            <div className="dash-hero-left">
                                <h2>{activeCourse.courseName}</h2>
                                <p>Next up: {(activeCourse.structure.find(s => s.status === 'in-progress')?.topic || activeCourse.structure[0]?.topic || 'Not Started')} &nbsp;·&nbsp; {activeCourse.structure.length} Chapters total</p>
                                <div className="dash-prog-bar-bg"><div className="dash-prog-bar" style={{ width: `${activeCourse.progress || 0}%` }}></div></div>
                                <div className="dash-prog-meta"><span>{activeCourse.progress || 0}% Completed</span><span>{activeCourse.targetGoal || 'Keep going!'}</span></div>
                                <div className="dash-hero-actions">
                                    <button onClick={() => navigate(`/course/${activeCourse._id}`)} className="dash-btn-primary">▶ Continue Session</button>
                                </div>
                            </div>
                            <div className="dash-hero-right">
                                <div className="dash-mini-stat"><div className="dash-micon">📖</div><div className="dash-mnum">{activeCourse.structure.length}</div><div className="dash-mdesc">Chapters</div></div>
                                <div className="dash-mini-stat"><div className="dash-micon">⏱</div><div className="dash-mnum">{activeCourse.duration}</div><div className="dash-mdesc">Days Left</div></div>
                            </div>
                        </div>
                    ) : (
                        <div className="dash-hero-card" style={{justifyContent: 'center', textAlign: 'center'}}>
                            <div className="dash-hero-left" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <h2>Ready to start your journey?</h2>
                                <p>Create a personalized AI-generated learning path today.</p>
                                <div className="dash-hero-actions">
                                    <button onClick={() => navigate('/new-course')} className="dash-btn-primary">📚 Start New Path</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QUICK STATS */}
                    <div className="dash-grid-3">
                        <div className="dash-qstat">
                            <div className="dash-qs-icon">📈</div>
                            <div className="dash-qs-val">{user?.stats?.totalHours || 0}h</div>
                            <div className="dash-qs-lbl">Total Learning Hours</div>
                            <div className="dash-qs-sub">Keep pushing forward!</div>
                        </div>
                        <div className="dash-qstat">
                            <div className="dash-qs-icon">🎓</div>
                            <div className="dash-qs-val">{user?.stats?.completedCourses || 0}/{user?.stats?.totalCourses || 0}</div>
                            <div className="dash-qs-lbl">Course Completion</div>
                            <div className="dash-qs-sub">{user?.stats?.totalCourses || 0} courses in progress</div>
                        </div>
                        <div className="dash-qstat">
                            <div className="dash-qs-icon">⭐</div>
                            <div className="dash-qs-val">{user?.xp || 0}</div>
                            <div className="dash-qs-lbl">Total XP Earned</div>
                            <div className="dash-qs-sub">Complete lessons to earn XP</div>
                        </div>
                    </div>

                    {/* TODAY'S PLAN + CHAPTER PROGRESS */}
                    <div className="dash-grid-2-1">
                        {/* ALL ACTIVE COURSES (Replaces Today's Plan for accurate dynamic data) */}
                        <div className="dash-card">
                            <div className="dash-sec-title"><div className="dash-sec-dot"></div>My Learning Paths</div>
                            <div className="dash-plan-items">
                                {courses.length > 0 ? courses.map((course, idx) => (
                                    <div key={course._id} className="dash-plan-item" onClick={() => navigate(`/course/${course._id}`)}>
                                        <div className="dash-plan-checkbox">✓</div>
                                        <div className="dash-plan-text">
                                            <div className="dash-pt">{course.courseName}</div>
                                            <div className="dash-ps">{course.progress || 0}% Completed · {course.structure.length} Chapters</div>
                                        </div>
                                        <div className="dash-plan-dur">View {"->"}</div>
                                    </div>
                                )) : (
                                    <div style={{color: 'var(--dash-muted)', fontSize: '12px', padding: '10px'}}>No active paths found.</div>
                                )}
                            </div>
                        </div>

                        {/* ACTIVE COURSE STRUCTURE */}
                        <div className="dash-card">
                            <div className="dash-sec-title"><div className="dash-sec-dot"></div>Course Progress</div>
                            <div className="dash-chapter-list">
                                {activeCourse ? activeCourse.structure.slice(0, 5).map((module, idx) => (
                                    <div key={idx} className={`dash-ch-item ${module.status === 'completed' ? 'done' : module.status === 'in-progress' ? 'active' : 'todo'}`}>
                                        <div className="dash-ch-num">{idx + 1}</div>
                                        <div className="dash-ch-name" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{module.topic}</div>
                                        <div className="dash-ch-dur">{module.status !== 'completed' ? module.estimatedTime : 'Done'}</div>
                                    </div>
                                )) : (
                                    <div style={{color: 'var(--dash-muted)', fontSize: '12px', padding: '10px'}}>Start a course to see chapters.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM ROW GRID */}
                    <div className="dash-grid-3">
                        {/* RECOMMENDED COURSES (Static examples matching mockup) */}
                        <div className="dash-card">
                            <div className="dash-sec-title"><div className="dash-sec-dot"></div>Recommended Skills</div>
                            <div className="dash-rec-list">
                                <div className="dash-rec-item" onClick={() => navigate('/new-course')}>
                                    <div className="dash-rec-icon" style={{background: 'rgba(255,107,43,.12)'}}>☕</div>
                                    <div className="dash-rec-info"><div className="dash-rt">Advanced Java Concepts</div><div className="dash-rs">Generics, Streams, Lambda</div></div>
                                </div>
                                <div className="dash-rec-item" onClick={() => navigate('/new-course')}>
                                    <div className="dash-rec-icon" style={{background: 'rgba(79,142,247,.12)'}}>🌿</div>
                                    <div className="dash-rec-info"><div className="dash-rt">Spring Boot Essentials</div><div className="dash-rs">REST APIs, JPA, Security</div></div>
                                </div>
                            </div>
                        </div>

                        {/* ACHIEVEMENTS */}
                        <div className="dash-card">
                            <div className="dash-sec-title"><div className="dash-sec-dot"></div>Achievements</div>
                            <div className="dash-badge-grid">
                                <div className={`dash-badge-item ${user?.streak >= 7 ? '' : 'locked'}`}><div className="dash-bi">🔥</div><div className="dash-bn">7-Day</div><div className="dash-bd">Streak</div></div>
                                <div className={`dash-badge-item ${user?.xp > 500 ? '' : 'locked'}`}><div className="dash-bi">⚡</div><div className="dash-bn">Speed</div><div className="dash-bd">Learner</div></div>
                                <div className={`dash-badge-item ${user?.xp > 1000 ? '' : 'locked'}`}><div className="dash-bi">🎯</div><div className="dash-bn">Quiz</div><div className="dash-bd">Master</div></div>
                                <div className={`dash-badge-item ${user?.stats?.completedCourses > 0 ? '' : 'locked'}`}><div className="dash-bi">🏆</div><div className="dash-bn">First</div><div className="dash-bd">Course</div></div>
                            </div>
                        </div>

                        {/* WEEKLY ANALYTICS */}
                        <div className="dash-analytics-card">
                            <div className="dash-sec-title"><div className="dash-sec-dot"></div>Weekly Activity</div>
                            <div className="dash-week-bars">
                                <div className="dash-wbar-wrap"><div className="dash-wbar" style={{height:'8px'}}></div><div className="dash-wday">Mon</div></div>
                                <div className="dash-wbar-wrap"><div className="dash-wbar" style={{height:'8px'}}></div><div className="dash-wday">Tue</div></div>
                                <div className="dash-wbar-wrap"><div className="dash-wbar" style={{height:'8px'}}></div><div className="dash-wday">Wed</div></div>
                                <div className="dash-wbar-wrap"><div className="dash-wbar" style={{height:'8px'}}></div><div className="dash-wday">Thu</div></div>
                                <div className="dash-wbar-wrap"><div className="dash-wbar has" style={{height:'24px'}}></div><div className="dash-wday">Fri</div></div>
                                <div className="dash-wbar-wrap"><div className="dash-wbar" style={{height:'8px'}}></div><div className="dash-wday">Sat</div></div>
                                <div className="dash-wbar-wrap"><div className="dash-wbar today" style={{height:'14px'}}></div><div className="dash-wday" style={{color:'var(--dash-orange)'}}>Sun</div></div>
                            </div>
                            <div style={{marginTop:'16px',fontSize:'12px',color:'var(--dash-muted)'}}>Keep building your streak to unlock more rewards.</div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
