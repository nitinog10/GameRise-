import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex items-center justify-center px-4">
      {/* Background */}
      <div className="orb w-[400px] h-[400px] bg-neon/[0.05] top-[15%] right-[10%]" />
      <div className="orb w-[300px] h-[300px] bg-accent-purple/[0.04] bottom-[10%] left-[10%]" style={{ animationDelay: '-12s' }} />

      <div className="relative z-10 w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon to-accent-purple flex items-center justify-center">
              <span className="text-dark font-black text-base">G</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">GameRise</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Join GameRise</h1>
          <p className="text-gray-500 text-sm mt-1">Start your esports journey today</p>
        </div>

        {/* Form */}
        <div className="glass rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/15 text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Username</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  placeholder="Your gamer tag"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-icon"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Email</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-icon"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Password</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-icon"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-40"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-neon font-medium hover:underline">Sign In</Link>
        </p>

        <div className="mt-6 flex items-center justify-center gap-5 text-[10px] text-gray-600">
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-neon" />Free Forever</span>
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-accent-purple" />AI Coach</span>
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-accent-blue" />3+ Games</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
