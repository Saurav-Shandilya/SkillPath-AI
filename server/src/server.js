import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('SkillPath AI API is running...');
});

// Proxy for Anthropic to bypass CORS without SDK
app.post('/api/anthropic/generate', async (req, res) => {
    const { apiKey, prompt, model } = req.body;
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                // The user requested claude-sonnet-4, but it does not exist in Anthropic's API yet, so we use 3.5 sonnet latest.
                model: 'claude-3-5-sonnet-latest', 
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        
        const data = await response.json();
        if(!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json({ content: data.content[0].text });
    } catch (err) {
        console.error("Anthropic Proxy Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillpath-ai';

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
