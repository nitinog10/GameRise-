import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-neon mb-4">GameRise</h1>
      <p className="text-2xl text-gray-300 mb-8">Coming Soon</p>
      <div className="text-center">
        <p className="text-gray-400 mb-4">Welcome, {user?.username}!</p>
        <button
          onClick={logout}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
