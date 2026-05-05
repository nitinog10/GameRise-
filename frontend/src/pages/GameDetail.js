import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axios';

const GameDetail = () => {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchGame();
  }, [slug]);

  useEffect(() => {
    if (game) setLoaded(true);
  }, [game]);

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

  const getDifficultyConfig = (difficulty) => {
    const configs = {
      easy: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', dot: 'bg-green-400', label: 'Easy' },
      medium: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', dot: 'bg-amber-400', label: 'Medium' },
      hard: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', dot: 'bg-red-400', label: 'Hard' }
    };
    return configs[difficulty] || configs.medium;
  };

  const getGenreConfig = (genre) => {
    const configs = {
      FPS: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '🎯' },
      'Battle Royale': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: '🔫' },
      MOBA: { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: '⚔️' }
    };
    return configs[genre] || { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: '🎮' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon/20 border-t-neon rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Game not found</p>
          <Link to="/games" className="btn-neon">Browse Games</Link>
        </div>
      </div>
    );
  }

  const diffConfig = getDifficultyConfig(game.difficulty);
  const genreConfig = getGenreConfig(game.genre);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📖' },
    { id: 'roles', label: 'Roles', icon: '🛡️' },
    { id: 'maps', label: 'Maps', icon: '🗺️' },
    { id: 'strategies', label: 'Pro Strategies', icon: '🏆' },
    { id: 'tips', label: 'Tips', icon: '💡' }
  ];

  return (
    <div className="min-h-screen bg-dark relative">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/50 to-transparent" />

        {/* Nav overlay */}
        <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 md:px-12 py-5">
          <Link to="/games" className="flex items-center gap-2 text-gray-300 hover:text-white transition glass px-4 py-2 rounded-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <Link
            to={`/ai-coach?game=${game.slug}`}
            className="btn-purple text-sm py-2 px-4 flex items-center gap-2"
          >
            <span>🤖</span> Ask AI Coach
          </Link>
        </nav>

        {/* Hero Content */}
        <div className={`absolute bottom-8 left-6 md:left-12 right-6 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-lg ${genreConfig.bg} ${genreConfig.border} border flex items-center gap-1.5`}>
              <span className="text-xs">{genreConfig.icon}</span>
              <span className={`text-xs font-medium ${genreConfig.color}`}>{game.genre}</span>
            </span>
            <span className={`px-3 py-1 rounded-lg ${diffConfig.bg} ${diffConfig.border} border flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
              <span className={`text-xs font-medium ${diffConfig.color}`}>{diffConfig.label}</span>
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-2">{game.name}</h1>
          <p className="text-gray-300 text-lg max-w-2xl">{game.description}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-20 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex gap-1 overflow-x-auto py-2 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-neon/10 text-neon border border-neon/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold neon-text mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-lg">⚙️</span>
                  Core Mechanics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {game.mechanics.map((mechanic, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition">
                      <span className="w-6 h-6 rounded-lg bg-neon/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-neon text-xs font-bold">{idx + 1}</span>
                      </span>
                      <span className="text-gray-300 text-sm">{mechanic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {game.roles.map((role, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-6 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <span className="text-purple-400 font-bold text-sm">{role.name[0]}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-neon transition">{role.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{role.description}</p>
                  {role.agents && role.agents.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {role.agents.map((agent, i) => (
                        <span key={i} className="px-3 py-1 glass rounded-lg text-gray-300 text-xs font-medium hover:border-purple-500/30 transition">
                          {agent}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="space-y-6">
              {game.maps.map((map, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg">🗺️</span>
                    {map.name}
                  </h3>
                  <div className="space-y-3">
                    {map.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
                        <span className="text-neon mt-0.5">→</span>
                        <span className="text-gray-300 text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="space-y-6">
              {game.proStrategies.map((strategy, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-8 border-l-4 border-l-neon group">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🏆</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-neon transition">{strategy.title}</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{strategy.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold neon-text mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-lg">💡</span>
                Essential Tips
              </h2>
              <div className="space-y-4">
                {game.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition">
                    <span className="w-8 h-8 rounded-lg bg-neon/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-neon text-sm">✓</span>
                    </span>
                    <span className="text-gray-300 text-sm leading-relaxed pt-1">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Coach CTA */}
        <div className="mt-12 glass-card rounded-2xl p-8 text-center border border-purple-500/20">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-white mb-2">Want personalized coaching?</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Our AI Coach knows {game.name} inside out. Get custom strategies, aim drills, and mental game tips.
          </p>
          <Link
            to={`/ai-coach?game=${game.slug}`}
            className="btn-purple inline-flex items-center gap-2"
          >
            <span>🤖</span> Ask AI Coach about {game.name}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
