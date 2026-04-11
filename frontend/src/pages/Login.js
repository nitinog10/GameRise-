import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-4xl font-bold text-neon text-center">GameRise Login</h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <div className="text-red-500 text-center">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-neon"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-neon"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-neon text-dark font-bold rounded hover:bg-green-400 transition"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-400">
          Don't have an account? <Link to="/register" className="text-neon hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
