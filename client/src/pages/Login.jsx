import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import GoogleLoginBtn from '../components/GoogleLoginBtn';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const { data } = await axios.post(`${API_BASE}/auth/login`, formData);
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-4 overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-accent1/10 rounded-full blur-3xl"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-md p-8 relative z-10"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl text-white mb-2 tracking-tight">SkillPath <span className="text-accent1">AI</span></h1>
                    <p className="text-secondary font-jost">Welcome back! Please login.</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-10 text-white focus:outline-none focus:border-accent1 transition-colors"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-10 text-white focus:outline-none focus:border-accent1 transition-colors"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Login'}
                    </button>

                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <span className="relative px-4 bg-primary text-secondary/50 text-sm uppercase tracking-widest font-jost">or continue with</span>
                    </div>

                    <GoogleLoginBtn />
                </form>

                <p className="mt-8 text-center text-secondary/70">
                    New here? <Link to="/register" className="text-accent2 hover:underline">Create an account</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
