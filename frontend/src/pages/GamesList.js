import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import Navigation from '../components/Navigation';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchGames();
    setMounted(true);
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

  const genres = ['All', 'FPS', 'Battle Royale', 'MOBA'];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-neon/20 border-t-neon rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Background */}
      <div className="orb w-[400px] h-[400px] bg-neon/[0.04] top-[20%] right-[-5%]" />
      <div className="orb w-[300px] h-[300px] bg-accent-purple/[0.05] bottom-[10%] left-[-5%]" style={{ animationDelay: '-10s' }} />

      <Navigation />

      <div className="relative z-10 pt-24 px-6 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className={`opacity-0 ${mounted ? 'animate-fade-up' : ''} mb-10`}>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Game <span className="text-neon">Knowledge</span> Hub
          </h1>
          <p className="text-gray-500 mt-3 text-base max-w-lg">
            Master your game with deep strategy guides, role breakdowns, and pro tips.
          </p>
        </div>

        {/* Search & Filters */}
        <div className={`opacity-0 ${mounted ? 'animate-fade-up delay-100' : ''} mb-8 space-y-4`}>
          <div className="relative max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-icon"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {genres.map(genre => {
              const config = genreMap[genre];
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGenre === genre
                      ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game, idx) => {
            const diff = difficultyMap[game.difficulty] || difficultyMap.medium;
            const genre = genreMap[game.genre] || { badge: 'badge-blue', icon: '🎮' };

            return (
              <Link
                key={game.slug}
                to={`/games/${game.slug}`}
                className={`opacity-0 ${mounted ? 'animate-fade-up' : ''} group`}
                style={{ animationDelay: `${200 + idx * 80}ms` }}
              >
                <div className="glass-card rounded-xl overflow-hidden">
                  {/* Cover */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={game.coverImage}
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`badge ${genre.badge}`}>{genre.icon} {game.genre}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`badge ${diff.badge}`}>{diff.label}</span>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-neon transition-colors">
                        {game.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">View Guide →</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">No games found matching your search.</p>
            <button onClick={() => { setSearch(''); setSelectedGenre('All'); }} className="btn-ghost mt-4 text-sm">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesList;
