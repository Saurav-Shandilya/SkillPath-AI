import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AIMentor from './AIMentor';
import '../dashboard.css';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <div className="dashboard-root">
            {/* EXACT SIDEBAR FROM DASHBOARD */}
            <aside className="dash-sidebar">
                <div className="dash-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <div className="dash-logo-icon">🚀</div>
                    <div className="dash-logo-text">SkillPath <span>AI</span></div>
                </div>
                <div className="dash-nav-section">
                    <div className="dash-nav-label">Main</div>
                    <div className={`dash-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}><span className="dash-nav-icon">⊞</span> Dashboard</div>
                    <div className={`dash-nav-item ${location.pathname === '/new-course' ? 'active' : ''}`} onClick={() => navigate('/new-course')}><span className="dash-nav-icon">📚</span> New Course <span className="dash-badge-pill">New</span></div>
                    <div className={`dash-nav-item ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => navigate('/profile')}><span className="dash-nav-icon">👤</span> Profile</div>
                </div>
                
                <div className="dash-sidebar-bottom">
                    <div className="dash-user-card" onClick={() => navigate('/profile')}>
                        <div className="dash-avatar">{userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}</div>
                        <div className="dash-user-info">
                            <div className="dash-uname">{userInfo?.name || 'User'}</div>
                            <div className="dash-uemail" style={{maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace:'nowrap'}}>{userInfo?.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="dash-logout-btn">⇢ &nbsp;Logout</button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="dash-main-content relative overflow-y-auto w-full h-full">
                {/* Background glow effects to match original aesthetic */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--dash-accent)]/5 rounded-full blur-3xl -z-10"></div>
                
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
                
                <AIMentor context={`User ${userInfo?.name} is on the ${location.pathname} page.`} />
            </main>
        </div>
    );
};

export default Layout;
