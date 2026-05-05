import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const Home = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Game Knowledge Hub',
      desc: 'Deep-dive into Valorant, BGMI, and CODM with strategies, maps, roles, and pro tips.',
      badge: '3 Games',
      badgeClass: 'badge-green',
      link: '/games',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI Esports Coach',
      desc: 'Personalized coaching powered by AI. Get real-time strategies, aim drills, and mental game tips.',
      badge: 'AI Powered',
      badgeClass: 'badge-purple',
      link: '/ai-coach',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'India-First',
      desc: 'Built for Indian gamers. BGMI tournaments, VCT India, Skyesports — we know the scene.',
      badge: 'Local',
      badgeClass: 'badge-blue',
      link: '/games',
    },
  ];

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] bg-purple-600/[0.07] top-[-10%] left-[-5%]" />
      <div className="orb w-[400px] h-[400px] bg-neon/[0.04] bottom-[10%] right-[-5%]" style={{ animationDelay: '-7s' }} />
      <div className="orb w-[300px] h-[300px] bg-blue-600/[0.05] top-[40%] left-[50%]" style={{ animationDelay: '-14s' }} />

      <Navigation />

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Status badge */}
          <div className={`opacity-0 ${mounted ? 'animate-fade-up' : ''}`}>
            <span className="badge badge-green mb-6 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-soft" />
              AI-Powered Esports Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className={`opacity-0 ${mounted ? 'animate-fade-up delay-100' : ''} text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1]`}>
            <span className="text-white">Level Up Your</span>
            <br />
            <span className="bg-gradient-to-r from-neon via-emerald-300 to-accent-purple bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
              Esports Career
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`opacity-0 ${mounted ? 'animate-fade-up delay-200' : ''} mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed`}>
            Your AI-powered companion for competitive gaming. Get personalized coaching,
            explore game strategies, and dominate the leaderboard.
          </p>

          {/* CTAs */}
          <div className={`opacity-0 ${mounted ? 'animate-fade-up delay-300' : ''} mt-10 flex flex-col sm:flex-row gap-3 justify-center`}>
            <Link to="/games" className="btn-primary text-base px-8 py-3.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Browse Games
            </Link>
            <Link to="/ai-coach" className="btn-secondary text-base px-8 py-3.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Coach
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <Link
                key={i}
                to={f.link}
                className={`opacity-0 ${mounted ? 'animate-fade-up' : ''} group`}
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <div className="glass-card rounded-xl p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400 group-hover:text-neon transition-colors">
                      {f.icon}
                    </div>
                    <span className={`badge ${f.badgeClass}`}>{f.badge}</span>
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2 group-hover:text-neon transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-xl p-6 flex items-center justify-around divide-x divide-white/[0.06]">
            <div className="text-center px-6">
              <div className="text-2xl font-bold text-neon">3+</div>
              <div className="text-xs text-gray-500 mt-1">Games</div>
            </div>
            <div className="text-center px-6">
              <div className="text-2xl font-bold text-accent-purple">AI</div>
              <div className="text-xs text-gray-500 mt-1">Powered</div>
            </div>
            <div className="text-center px-6">
              <div className="text-2xl font-bold text-accent-blue">24/7</div>
              <div className="text-xs text-gray-500 mt-1">Coaching</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
