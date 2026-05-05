import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Floating particles background
function Particles() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      size: 2 + Math.random() * 4,
      opacity: 0.1 + Math.random() * 0.3
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.id % 3 === 0 ? '#00ff88' : p.id % 3 === 1 ? '#8b5cf6' : '#3b82f6',
            opacity: p.opacity,
            animation: `particle-float ${p.duration}s linear ${p.delay}s infinite`
          }}
        />
      ))}
    </div>
  );
}

const Home = () => {
  const { user, logout } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-dark bg-hero-gradient bg-grid relative overflow-hidden">
      <Particles />

      {/* Decorative orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

      {/* Navigation */}
      <nav className={`relative z-10 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon to-purple-600 flex items-center justify-center font-bold text-dark text-lg">
            G
          </div>
          <span className="text-xl font-bold text-white">GameRise</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">
            Welcome, <span className="text-neon font-medium">{user?.username}</span>
          </span>
          <button
            onClick={logout}
            className="btn-ghost text-sm py-2 px-4"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 md:pt-20 pb-20">
        {/* Badge */}
        <div className={`animate-slide-up opacity-0 stagger-1 mb-6`}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-neon border border-neon/20">
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            AI-Powered Esports Platform
          </span>
        </div>

        {/* Title */}
        <h1 className={`animate-slide-up opacity-0 stagger-2 text-5xl md:text-7xl lg:text-8xl font-black text-center leading-tight`}>
          <span className="text-white">Level Up Your</span>
          <br />
          <span className="bg-gradient-to-r from-neon via-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
            Esports Career
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`animate-slide-up opacity-0 stagger-3 mt-6 text-lg md:text-xl text-gray-400 text-center max-w-2xl leading-relaxed`}>
          Your AI-powered companion for competitive gaming. Get personalized coaching,
          explore game strategies, and dominate the leaderboard.
        </p>

        {/* CTA Buttons */}
        <div className={`animate-slide-up opacity-0 stagger-4 mt-10 flex flex-col sm:flex-row gap-4`}>
          <Link to="/games" className="btn-neon text-center text-lg px-10 py-4 flex items-center justify-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Browse Games
          </Link>
          <Link to="/ai-coach" className="btn-purple text-center text-lg px-10 py-4 flex items-center justify-center gap-3">
            <span className="text-xl">🤖</span>
            AI Coach
          </Link>
        </div>

        {/* Feature Cards */}
        <div className={`animate-slide-up opacity-0 stagger-5 mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full`}>
          <div className="glass-card rounded-2xl p-6 group">
            <div className="w-12 h-12 rounded-xl bg-neon/10 flex items-center justify-center mb-4 group-hover:bg-neon/20 transition">
              <svg className="w-6 h-6 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Game Knowledge Hub</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Deep dive into Valorant, BGMI, CODM with strategies, maps, roles, and pro tips.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">AI Esports Coach</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Get personalized coaching from our AI that knows your game inside out. Real-time streaming responses.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">India-First</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Built for Indian gamers. BGMI tournaments, VCT India, Skyesports — we know the scene.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className={`animate-slide-up opacity-0 stagger-6 mt-16 flex gap-8 md:gap-16`}>
          <div className="text-center">
            <div className="text-3xl font-black neon-text">3+</div>
            <div className="text-gray-500 text-sm mt-1">Games</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black neon-text-purple">AI</div>
            <div className="text-gray-500 text-sm mt-1">Powered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-blue-400">24/7</div>
            <div className="text-gray-500 text-sm mt-1">Coaching</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
