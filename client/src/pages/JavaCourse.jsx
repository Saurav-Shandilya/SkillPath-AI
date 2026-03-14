import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './JavaCourse.css';

const chapters = [
  { tag: "Chapter 1: Operator Overloading", title: "Operator Overloading in Java", desc: "Learn how to overload operators in Java, including arithmetic, comparison, and assignment operators.", hours: 4, status: "IN-PROGRESS" },
  { tag: "Chapter 2: Inheritance", title: "Inheritance & Polymorphism", desc: "Deep dive into OOP pillars — extend classes, override methods, and leverage runtime polymorphism.", hours: 8, status: "NOT STARTED" },
  { tag: "Chapter 3: Exception Handling", title: "Exception Handling", desc: "Master try-catch-finally, custom exceptions, and best practices for robust error handling.", hours: 7, status: "NOT STARTED" },
  { tag: "Chapter 4: Collections", title: "Collections Framework", desc: "Explore Lists, Sets, Maps, and Queues with hands-on examples and performance trade-offs.", hours: 10, status: "NOT STARTED" },
  { tag: "Chapter 5: Multithreading", title: "Multithreading & Concurrency", desc: "Build concurrent programs using threads, executors, locks, and java.util.concurrent package.", hours: 16, status: "NOT STARTED" },
];

const JavaCourse = () => {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(new Set());
  const [openLessons, setOpenLessons] = useState(new Set());
  const [lessonContent, setLessonContent] = useState({});
  const [loading, setLoading] = useState(null);

  const toggleDone = (i) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(i)) {
      newCompleted.delete(i);
    } else {
      newCompleted.add(i);
    }
    setCompleted(newCompleted);
  };

  const loadContent = async (i) => {
    // Open the box unconditionally
    setOpenLessons(prev => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });

    // If already loaded or currently loading, skip fetching
    if (lessonContent[i] || loading === i) {
      return;
    }

    setLoading(i);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE.replace('/api', '')}/api/anthropic/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write a lesson for this Java chapter: "${chapters[i].title}". Context: ${chapters[i].desc}`,
          system: "You are an expert Java instructor. Generate a clear lesson (around 300 words) covering: 1) Key Concepts  2) A short code example (plain text, no markdown)  3) Key Takeaway. Keep it beginner-friendly and practical.",
          max_tokens: 1000
        })
      });
      const data = await res.json();
      const text = data?.content?.[0]?.text || "Could not load content. Please try again.";
      setLessonContent(prev => ({ ...prev, [i]: text }));
    } catch (e) {
      setLessonContent(prev => ({ ...prev, [i]: "⚠ Network error. Please check your connection and try again." }));
    } finally {
      setLoading(null);
    }
  };

  const pct = Math.round((completed.size / chapters.length) * 100);

  return (
    <div className="java-course-container">
      <a className="back" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} href="#">
        &#8592; Back to Dashboard
      </a>
      <div className="badge">Ongoing Course</div>
      <div className="header-row">
        <div className="course-title">java</div>
        <div>
          <div className="completion-label">Completion</div>
          <div className="completion-pct">{pct}%</div>
        </div>
      </div>
      <div className="meta">
        <div className="meta-pill">📖 5 Chapters</div>
        <div className="meta-pill">🕐 45 Total Hours</div>
      </div>

      <div id="chapters">
        {chapters.map((ch, i) => {
          const isCompleted = completed.has(i);
          const isOpen = openLessons.has(i);
          const statusText = isCompleted ? 'COMPLETED' : ch.status;

          return (
            <div className="chapter-card" key={`card-${i}`}>
              <div className="chapter-left">
                <span className="chapter-tag">{ch.tag}</span>
                <div className="chapter-name">{ch.title}</div>
                <div className="chapter-desc">{ch.desc}</div>
                <div className="chapter-meta">
                  🕐 {ch.hours} hours
                  <span className={`status-badge ${isCompleted ? 'done' : ''}`} id={`status-${i}`}>
                    {statusText}
                  </span>
                </div>

                <div className={`ai-box ${isOpen ? 'open' : ''}`} id={`ai-${i}`}>
                  <div className="ai-header">
                    ✦ AI Lesson — {ch.title}
                  </div>
                  <div className="ai-body" id={`ai-body-${i}`}>
                    {isOpen && !lessonContent[i] && (
                      <div className="dots">
                        <span></span><span></span><span></span>
                      </div>
                    )}
                    {lessonContent[i] && (
                      <ReactMarkdown>{lessonContent[i]}</ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>

              <div className="btn-col">
                <button className="play-btn" onClick={() => loadContent(i)} title="Generate AI Lesson">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </button>
                <button
                  className={`check-btn ${isCompleted ? 'marked' : ''}`}
                  id={`check-${i}`}
                  onClick={() => toggleDone(i)}
                  title="Mark complete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JavaCourse;
