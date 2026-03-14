import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Heart, Share2, Search, Filter, Plus, Code, Lightbulb, Link as LinkIcon } from 'lucide-react';
import Layout from '../components/Layout';

const Community = () => {
    const [activeTab, setActiveTab] = useState('all');

    const posts = [
        {
            id: 1,
            author: "Sarah Chen",
            role: "Frontend Developer",
            avatar: "SC",
            type: "project",
            title: "Built my first React Native app! 📱",
            content: "Just finished building a weather app using React Native and the OpenWeather API. Would love some feedback on the code structure and UI!",
            tags: ["React Native", "API", "Mobile"],
            likes: 24,
            comments: 8,
            timeAgo: "2h ago"
        },
        {
            id: 2,
            author: "Alex Kumar",
            role: "Data Science Learner",
            avatar: "AK",
            type: "idea",
            title: "Study Group: Machine Learning Math",
            content: "Looking for 3-4 people to study Linear Algebra and Calculus for ML together. We'll meet virtually twice a week.",
            tags: ["Machine Learning", "Math", "Study Group"],
            likes: 15,
            comments: 12,
            timeAgo: "5h ago"
        },
        {
            id: 3,
            author: "Emily Watson",
            role: "UX Designer",
            avatar: "EW",
            type: "resource",
            title: "Curated list of free design resources 🎨",
            content: "I've put together a Notion board with all the high-quality free icons, fonts, and illustrations I use daily. Link in comments!",
            tags: ["Design", "Resources", "UX/UI"],
            likes: 89,
            comments: 21,
            timeAgo: "1d ago"
        }
    ];

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4 sm:px-0">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 mb-8 md:mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl mb-2 font-bold tracking-tight flex items-center gap-3">
                            <Users className="text-blue-400 w-8 h-8" /> 
                            Learner <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Community</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base">Share projects, exchange ideas, and grow together.</p>
                    </div>
                    <button className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
                        <Plus className="w-5 h-5" /> New Post
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search discussions, tags, or members..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <button className="glass px-6 py-3 rounded-xl flex items-center justify-center gap-2 border-white/10 hover:bg-white/10 transition-colors shrink-0">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['all', 'projects', 'ideas', 'resources'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                                        activeTab === tab 
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Posts List */}
                        {posts.map(post => (
                            <motion.div 
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 border-white/10 hover:border-blue-500/30 transition-all group"
                            >
                                {/* Post Author Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold shadow-inner">
                                            {post.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-100 leading-tight group-hover:text-blue-400 transition-colors">{post.author}</h4>
                                            <p className="text-xs text-gray-500">{post.role} • {post.timeAgo}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                                        {post.type === 'project' && <Code className="w-3 h-3 text-cyan-400" />}
                                        {post.type === 'idea' && <Lightbulb className="w-3 h-3 text-yellow-500" />}
                                        {post.type === 'resource' && <LinkIcon className="w-3 h-3 text-purple-400" />}
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{post.type}</span>
                                    </div>
                                </div>

                                {/* Post Body */}
                                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{post.content}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Interactions */}
                                <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-gray-400 text-sm">
                                    <button className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                                        <Heart className="w-4 h-4" /> {post.likes}
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                                        <MessageCircle className="w-4 h-4" /> {post.comments}
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-green-400 transition-colors ml-auto">
                                        <Share2 className="w-4 h-4" /> Share
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Trending Tags */}
                        <div className="glass-card p-6 border-white/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-purple-400" /> Trending Topics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'MachineLearning', 'Python', 'WebDev', 'DataScience', 'UIUX'].map((tag, i) => (
                                    <div key={tag} className="bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 px-3 py-1.5 rounded-lg text-sm transition-colors text-gray-300">
                                        #{tag}
                                        <span className="text-gray-500 text-xs ml-2">{Math.floor(Math.random() * 50) + 10}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Contributors */}
                        <div className="glass-card p-6 border-white/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-cyan-400" /> Top Contributors
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold">U{i}</div>
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">Top User {i}</p>
                                                <p className="text-xs text-gray-500">{100 - i * 15} points</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded hover:bg-blue-500/20 transition-colors">
                                            Follow
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Community;
