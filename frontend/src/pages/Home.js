import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-neon mb-4">GameRise</h1>
      <p className="text-2xl text-gray-300 mb-8">Esports Career Platform</p>
      <div className="text-center space-y-4">
        <p className="text-gray-400 mb-4">Welcome, {user?.username}!</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/games"
            className="px-8 py-3 bg-neon text-dark font-bold rounded-lg hover:bg-green-400 transition"
          >
            Browse Games
          </Link>
          <Link
            to="/ai-coach"
            className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
          >
            🤖 AI Coach
          </Link>
          <button
            onClick={logout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
