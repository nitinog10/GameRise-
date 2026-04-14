import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-500',
      medium: 'bg-amber-500',
      hard: 'bg-red-500'
    };
    return colors[difficulty] || 'bg-gray-500';
  };

  const getGenreColor = (genre) => {
    const colors = {
      FPS: 'bg-blue-600',
      'Battle Royale': 'bg-purple-600',
      MOBA: 'bg-pink-600'
    };
    return colors[genre] || 'bg-gray-600';
  };

  const genres = ['All', 'FPS', 'Battle Royale', 'MOBA'];

  if (loading) {
    return <div className="min-h-screen bg-dark flex items-center justify-center text-neon">Loading games...</div>;
  }

  return (
    <div className="min-h-screen bg-dark py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-neon mb-8">Game Knowledge Hub</h1>

        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon"
          />

          <div className="flex gap-3 flex-wrap">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedGenre === genre
                    ? 'bg-neon text-dark'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map(game => (
            <Link
              key={game.slug}
              to={`/games/${game.slug}`}
              className="bg-[#1a1a24] rounded-lg overflow-hidden hover:ring-2 hover:ring-neon transition group"
            >
              <img
                src={game.coverImage}
                alt={game.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getGenreColor(game.genre)}`}>
                    {game.genre}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-sm mr-2">Difficulty:</span>
                  {[1, 2, 3].map(level => (
                    <div
                      key={level}
                      className={`w-2 h-2 rounded-full ${
                        level <= (game.difficulty === 'easy' ? 1 : game.difficulty === 'medium' ? 2 : 3)
                          ? getDifficultyColor(game.difficulty)
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            No games found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesList;
