import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = ({ showAuth = true }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  useEffect(() => { api.get('/api/community/notifications').then(({ data }) => setUnread(data.unread || 0)).catch(() => {}); }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/games', label: 'Games', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3V3zm11 0h7v4h-7V3zM3 14h7v7H3v-7zm11-3h7v10h-7V11z' },
    { path: '/tournaments', label: 'Tournaments', icon: 'M9 2l2 2 2-2 2 2h3v4a5 5 0 01-5 5h-2a5 5 0 01-5-5V4h3l2-2zM5 20h14' },
    { path: '/settings/profile', label: 'Profile', icon: 'M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { path: '/community', label: `Community ${unread ? `(${unread})` : ''}`, icon: 'M17 20h5V4H2v16h5m10 0v-6a3 3 0 10-6 0v6m6 0H7' },
    { path: '/ai-coach', label: 'AI Coach', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between rounded-b-2xl bg-[#0c0c14]/80 backdrop-blur-xl border-b border-white/[0.06] px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#8b5cf6] flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-[#0a0a0f] font-black text-sm">G</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">GameRise</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-white bg-white/[0.08]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {showAuth && user && (
              <>
                <span className="hidden sm:block text-xs text-gray-500">
                  <span className="text-gray-300 font-medium">{user.username}</span>
                </span>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition"
                >
                  Sign out
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-gray-400 hover:text-white p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 rounded-xl bg-[#0c0c14]/95 backdrop-blur-xl border border-white/[0.06] p-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive(link.path)
                    ? 'text-white bg-white/[0.08]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
