import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Target, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-primary text-white overflow-hidden font-jost selection:bg-accent1/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-primary/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-accent1 rounded-xl flex items-center justify-center shadow-lg shadow-accent1/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bricolage tracking-tight">SkillPath <span className="text-accent1">AI</span></span>
                    </div>
                    <div className="flex items-center gap-8">
                        <button onClick={() => navigate('/login')} className="text-secondary hover:text-white transition-colors">Login</button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-white text-primary px-6 py-2.5 rounded-full font-bold hover:bg-accent1 hover:text-white transition-all shadow-xl shadow-white/5"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent1/10 rounded-full blur-[100px]"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
                            <Sparkles className="w-4 h-4 text-accent2 shadow-[0_0_10px_#f4db7d]" />
                            <span className="text-sm font-medium text-secondary">The Future of Personalized Learning</span>
                        </div>
                        <h1 className="text-7xl md:text-8xl font-bricolage mb-8 leading-[1.1] tracking-tight">
                            Master Any Skill <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent1 to-accent2 underline decoration-accent1/30">Guided by AI</span>
                        </h1>
                        <p className="text-xl text-secondary/80 max-w-2xl mx-auto mb-12 font-jost leading-relaxed">
                            Stop following generic courses. SkillPath AI crafts a unique learning journey for you based on a deep analysis of your current knowledge and personal goals.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => navigate('/register')}
                                className="group bg-accent1 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-all shadow-2xl shadow-accent1/20 flex items-center gap-3"
                            >
                                Start Your Journey <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="text-white border border-white/10 px-10 py-5 rounded-2xl text-xl font-bold bg-white/5 hover:bg-white/10 transition-all">
                                See How it Works
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Preview */}
            <section className="py-32 px-6 bg-white/2">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
                    {[
                        { icon: <Target className="text-accent1" />, title: "Precision Diagnostics", desc: "Our AI evaluates your current level with technical assessments tailored to your specific goals." },
                        { icon: <Zap className="text-accent2" />, title: "Adaptive Roadmaps", desc: "Skip what you know. Focus on skill gaps with a roadmap that optimizes your available study time." },
                        { icon: <Bot className="text-secondary" />, title: "AI Learning Mentor", desc: "A personal tutor available 24/7 to explain complex concepts and keep you motivated." }
                    ].map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="glass-card p-10 border-white/5 hover:border-accent1/30 transition-colors group"
                        >
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-bricolage mb-4">{f.title}</h3>
                            <p className="text-secondary/70 leading-relaxed font-jost">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Glassy CTA */}
            <section className="py-40 px-6 relative">
                <div className="max-w-5xl mx-auto glass-card p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent1/20 to-transparent"></div>
                    <div className="relative z-10">
                        <h2 className="text-5xl font-bricolage mb-8">Ready to Level Up?</h2>
                        <p className="text-xl text-secondary/80 mb-12 max-w-xl mx-auto font-jost">Join thousands of learners who are mastering new technologies with AI-powered precision.</p>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-white text-primary px-12 py-5 rounded-2xl text-xl font-bold hover:bg-accent1 hover:text-white transition-all shadow-[0_20px_40px_rgba(255,106,61,0.2)]"
                        >
                            Create Free Account
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 bg-primary/50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Bot className="w-5 h-5 text-accent1" />
                        <span className="text-xl font-bricolage tracking-tight">SkillPath <span className="text-accent1 text-sm uppercase">AI</span></span>
                    </div>
                    <p className="text-secondary/40 text-sm font-jost">© 2026 SkillPath AI. All rights reserved. Crafted with ✨ and AI.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
