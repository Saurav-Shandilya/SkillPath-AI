import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, BookOpen, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AIMentor from './AIMentor';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'New Course', path: '/new-course', icon: BookOpen },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-primary text-white font-jost flex">
            {/* Sidebar */}
            <nav className="w-64 glass border-r border-white/10 p-6 flex flex-col fixed h-full">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 bg-accent1 rounded-lg"></div>
                    <h2 className="text-2xl font-bricolage tracking-tight">SkillPath <span className="text-accent1">AI</span></h2>
                </div>

                <div className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-accent1 text-white shadow-lg shadow-accent1/20'
                                : 'hover:bg-white/5 text-secondary'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-auto border-t border-white/10 pt-6">
                    <div className="flex items-center gap-3 px-2 mb-6">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border border-white/10">
                            <User className="text-secondary w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{userInfo?.name || 'User'}</p>
                            <p className="text-xs text-secondary truncate">{userInfo?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent1/5 rounded-full blur-3xl -z-10"></div>
                {children}
                <AIMentor context={`User ${userInfo?.name} is on the ${location.pathname} page.`} />
            </main>
        </div>
    );
};

export default Layout;
