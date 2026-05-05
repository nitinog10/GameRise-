import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchGames();
    setLoaded(true);
  }, []);

  useEffect(() => {
    filterGames();
  }, [search, selectedGenre, games]);

  const fetchGames = async () => {
    try {
      const { data } = await api.get('/api/games');
      setGames(data.games);
      setFilteredGames(data.games);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setLoading(false);
    }
  };

  const filterGames = () => {
    let filtered = games;

    if (selectedGenre !== 'All') {
      filtered = filtered.filter(game => game.genre === selectedGenre);
    }

    if (search) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(search.toLowerCase()) ||
        game.genre.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredGames(filtered);
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

  const genres = ['All', 'FPS', 'Battle Royale', 'MOBA'];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon/20 border-t-neon rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark bg-hero-gradient bg-grid relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-40 right-20 w-80 h-80 bg-neon/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />

      {/* Navigation */}
      <nav className={`relative z-10 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon to-purple-600 flex items-center justify-center font-bold text-dark text-lg group-hover:shadow-lg group-hover:shadow-neon/20 transition">
            G
          </div>
          <span className="text-xl font-bold text-white">GameRise</span>
        </Link>
        <Link to="/ai-coach" className="btn-purple text-sm py-2 px-4 flex items-center gap-2">
          <span>🤖</span> AI Coach
        </Link>
      </nav>

      <div className="relative z-10 px-6 md:px-12 pb-16">
        {/* Header */}
        <div className={`animate-slide-up opacity-0 stagger-1 mb-10`}>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3">
            Game <span className="neon-text">Knowledge</span> Hub
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Master your game with deep strategy guides, role breakdowns, and pro tips.
          </p>
        </div>

        {/* Search & Filters */}
        <div className={`animate-slide-up opacity-0 stagger-2 mb-10 space-y-4`}>
          <div className="relative max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-glass pl-12"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {genres.map(genre => {
              const config = genre === 'All' ? null : getGenreConfig(genre);
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    selectedGenre === genre
                      ? 'btn-neon py-2.5 px-5 text-sm'
                      : 'glass text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {genre !== 'All' && config && <span className="mr-1.5">{config.icon}</span>}
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game, idx) => {
            const diffConfig = getDifficultyConfig(game.difficulty);
            const genreConfig = getGenreConfig(game.genre);

            return (
              <Link
                key={game.slug}
                to={`/games/${game.slug}`}
                className={`animate-slide-up opacity-0 group`}
                style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
              >
                <div className="glass-card rounded-2xl overflow-hidden h-full">
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={game.coverImage}
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />

                    {/* Genre Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg ${genreConfig.bg} ${genreConfig.border} border backdrop-blur-sm flex items-center gap-1.5`}>
                      <span className="text-xs">{genreConfig.icon}</span>
                      <span className={`text-xs font-medium ${genreConfig.color}`}>{game.genre}</span>
                    </div>

                    {/* Difficulty */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg ${diffConfig.bg} ${diffConfig.border} border backdrop-blur-sm flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
                      <span className={`text-xs font-medium ${diffConfig.color}`}>{diffConfig.label}</span>
                    </div>

                    {/* Game Title Overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-2xl font-black text-white group-hover:text-neon transition-colors">
                        {game.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {game.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        View Guide
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-neon/10 flex items-center justify-center group-hover:bg-neon/20 transition">
                        <svg className="w-4 h-4 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No games found matching your search.</p>
            <button
              onClick={() => { setSearch(''); setSelectedGenre('All'); }}
              className="mt-4 btn-ghost text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesList;
