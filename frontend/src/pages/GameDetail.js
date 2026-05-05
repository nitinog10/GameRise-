import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axios';
import Navigation from '../components/Navigation';

const GameDetail = () => {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { fetchGame(); }, [slug]);
  useEffect(() => { if (game) setMounted(true); }, [game]);

  const fetchGame = async () => {
    try {
      const { data } = await api.get(`/api/games/${slug}`);
      setGame(data.game);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch game:', error);
      setLoading(false);
    }
  };

  const difficultyMap = {
    easy: { label: 'Easy', badge: 'badge-green' },
    medium: { label: 'Medium', badge: 'badge-amber' },
    hard: { label: 'Hard', badge: 'badge-red' },
  };

  const genreMap = {
    FPS: { badge: 'badge-blue', icon: '🎯' },
    'Battle Royale': { badge: 'badge-purple', icon: '🔫' },
    MOBA: { badge: 'badge-pink', icon: '⚔️' },
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📖' },
    { id: 'roles', label: 'Roles', icon: '🛡️' },
    { id: 'maps', label: 'Maps', icon: '🗺️' },
    { id: 'strategies', label: 'Strategies', icon: '🏆' },
    { id: 'tips', label: 'Tips', icon: '💡' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-neon/20 border-t-neon rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Game not found</p>
          <Link to="/games" className="btn-primary">Browse Games</Link>
        </div>
      </div>
    );
  }

  const diff = difficultyMap[game.difficulty] || difficultyMap.medium;
  const genre = genreMap[game.genre] || { badge: 'badge-blue', icon: '🎮' };

  return (
    <div className="min-h-screen bg-dark relative">
      {/* Hero */}
      <div className="relative h-[45vh] min-h-[360px] overflow-hidden">
        <img src={game.coverImage} alt={game.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/30" />

        <Navigation />

        {/* Hero Content */}
        <div className={`absolute bottom-8 left-6 md:left-12 right-6 z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`badge ${genre.badge}`}>{genre.icon} {game.genre}</span>
            <span className={`badge ${diff.badge}`}>{diff.label}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2">{game.name}</h1>
          <p className="text-gray-300 max-w-2xl">{game.description}</p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="border-b border-white/[0.04] bg-dark/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-3 flex items-center justify-between">
          <Link to="/games" className="btn-ghost text-xs py-2 px-3">
            ← Back to Games
          </Link>
          <Link to={`/ai-coach?game=${game.slug}`} className="btn-secondary text-xs py-2 px-3">
            🤖 Ask AI Coach
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-20 bg-dark/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex gap-1 overflow-x-auto py-2 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/[0.06] text-white'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                }`}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-neon/[0.08] flex items-center justify-center text-sm">⚙️</span>
                Core Mechanics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {game.mechanics.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                    <span className="w-6 h-6 rounded-md bg-neon/[0.08] flex items-center justify-center flex-shrink-0 text-neon text-xs font-mono font-bold">
                      {i + 1}
                    </span>
                    <span className="text-gray-400 text-sm">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {game.roles.map((role, i) => (
                <div key={i} className="glass-card rounded-xl p-6 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-purple/[0.08] flex items-center justify-center">
                      <span className="text-accent-purple font-bold text-sm">{role.name[0]}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-neon transition-colors">{role.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{role.description}</p>
                  {role.agents?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {role.agents.map((a, j) => (
                        <span key={j} className="px-2.5 py-1 rounded-md bg-white/[0.04] text-gray-400 text-xs font-medium">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="space-y-4">
              {game.maps.map((map, i) => (
                <div key={i} className="glass-card rounded-xl p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-accent-blue/[0.08] flex items-center justify-center text-sm">🗺️</span>
                    {map.name}
                  </h3>
                  <div className="space-y-2">
                    {map.tips.map((tip, j) => (
                      <div key={j} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02]">
                        <span className="text-neon text-xs mt-0.5">→</span>
                        <span className="text-gray-400 text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="space-y-4">
              {game.proStrategies.map((s, i) => (
                <div key={i} className="glass-card rounded-xl p-6 md:p-8 border-l-2 border-l-neon/40">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <span>🏆</span> {s.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-neon/[0.08] flex items-center justify-center text-sm">💡</span>
                Essential Tips
              </h2>
              <div className="space-y-2">
                {game.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                    <span className="w-6 h-6 rounded-md bg-neon/[0.08] flex items-center justify-center flex-shrink-0 text-neon text-xs">✓</span>
                    <span className="text-gray-400 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Coach CTA */}
        <div className="mt-10 glass-card rounded-xl p-8 text-center border border-accent-purple/10">
          <h3 className="text-lg font-bold text-white mb-2">Want personalized coaching?</h3>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            Our AI Coach knows {game.name} inside out. Get custom strategies, aim drills, and mental game tips.
          </p>
          <Link to={`/ai-coach?game=${game.slug}`} className="btn-secondary">
            🤖 Ask AI Coach about {game.name}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
