import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axios';

const GameDetail = () => {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGame();
  }, [slug]);

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

  if (loading) {
    return <div className="min-h-screen bg-dark flex items-center justify-center text-neon">Loading...</div>;
  }

  if (!game) {
    return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Game not found</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'roles', label: 'Roles' },
    { id: 'maps', label: 'Maps' },
    { id: 'strategies', label: 'Pro Strategies' },
    { id: 'tips', label: 'Tips' }
  ];

  return (
    <div className="min-h-screen bg-dark">
      <div
        className="h-80 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${game.coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
        <div className="absolute bottom-8 left-8">
          <h1 className="text-6xl font-bold text-white mb-2">{game.name}</h1>
          <p className="text-xl text-gray-300">{game.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-800 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'text-neon border-b-2 border-neon'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-[#1a1a24] p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-neon mb-4">Core Mechanics</h2>
                <ul className="space-y-2">
                  {game.mechanics.map((mechanic, idx) => (
                    <li key={idx} className="text-gray-300 flex items-start">
                      <span className="text-neon mr-2">•</span>
                      {mechanic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {game.roles.map((role, idx) => (
                <div key={idx} className="bg-[#1a1a24] p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-neon mb-2">{role.name}</h3>
                  <p className="text-gray-300 mb-4">{role.description}</p>
                  {role.agents && role.agents.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {role.agents.map((agent, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
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
                <div key={idx} className="bg-[#1a1a24] p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-neon mb-4">{map.name}</h3>
                  <ul className="space-y-2">
                    {map.tips.map((tip, i) => (
                      <li key={i} className="text-gray-300 flex items-start">
                        <span className="text-neon mr-2">→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="space-y-6">
              {game.proStrategies.map((strategy, idx) => (
                <div key={idx} className="bg-[#1a1a24] p-6 rounded-lg border-l-4 border-neon">
                  <h3 className="text-xl font-bold text-white mb-2">{strategy.title}</h3>
                  <p className="text-gray-300">{strategy.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="bg-[#1a1a24] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-neon mb-4">Essential Tips</h2>
              <ul className="space-y-3">
                {game.tips.map((tip, idx) => (
                  <li key={idx} className="text-gray-300 flex items-start">
                    <span className="text-neon mr-3 text-xl">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link
          to={`/ai-coach?game=${game.slug}`}
          className="block w-full md:w-auto text-center px-8 py-4 bg-neon text-dark font-bold rounded-lg hover:bg-green-400 transition"
        >
          Ask AI Coach
        </Link>
      </div>
    </div>
  );
};

export default GameDetail;
