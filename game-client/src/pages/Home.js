import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { ALL_MATCHES, GAME_META } from '../data/sampleMatchData';

const Home = () => {
  const totalMatches = ALL_MATCHES.length;
  const totalKills   = ALL_MATCHES.reduce((s, m) => s + m.players.reduce((ps, p) => ps + p.kills, 0), 0);
  const totalPlayers = new Set(ALL_MATCHES.flatMap((m) => m.players.map((p) => p.userId))).size;
  const gamesTracked = new Set(ALL_MATCHES.map((m) => m.gameSlug)).size;

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <Navigation />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="orb w-96 h-96 bg-[#00ff88]/8 top-20 -left-32" />
        <div className="orb w-80 h-80 bg-[#8b5cf6]/8 top-40 right-0" />

        <div className="relative max-w-7xl mx-auto pt-32 pb-20 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-xs font-semibold mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            GameRise Game Client v1.0
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
            Watch. Parse.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#8b5cf6]">
              Dominate.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Reverse-engineer match data, replay every moment, and climb the leaderboard with deep game analytics.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/matches" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Matches
            </Link>
            <Link to="/leaderboard" className="btn-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Matches Tracked', value: totalMatches, icon: '🎮' },
            { label: 'Total Kills',     value: totalKills.toLocaleString(), icon: '💀' },
            { label: 'Players',         value: totalPlayers, icon: '👤' },
            { label: 'Games',           value: gamesTracked, icon: '🕹️' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="glass-card rounded-xl p-5 text-center">
              <div className="text-3xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-[#00ff88]">{value}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <h2 className="text-xl font-bold mb-4">Features</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: 'Match Viewer',
              desc: 'Watch full match replays with a live event timeline, scrubber controls, and per-player stats updating in real time.',
              icon: '▶️',
              link: '/matches',
              cta: 'Watch now',
              color: '#00ff88',
            },
            {
              title: 'Result Parser',
              desc: 'Inspect the raw hex packet stream captured from the game, discover the binary schema, and see how results are decoded.',
              icon: '🔬',
              link: '/matches',
              cta: 'Parse data',
              color: '#a78bfa',
            },
            {
              title: 'Leaderboard',
              desc: 'Global rankings built from aggregated match data — filter by game, sort by K/D, damage, accuracy, or total score.',
              icon: '🏆',
              link: '/leaderboard',
              cta: 'View rankings',
              color: '#fbbf24',
            },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-6 flex flex-col">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm flex-1 mb-4">{f.desc}</p>
              <Link
                to={f.link}
                className="text-sm font-semibold transition hover:opacity-80"
                style={{ color: f.color }}
              >
                {f.cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* Recent matches preview */}
        <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {ALL_MATCHES.map((m) => {
            const meta = GAME_META[m.gameSlug] || {};
            const mvp  = [...m.players].sort((a, b) => b.score - a.score)[0];
            return (
              <Link
                key={m.matchId}
                to={`/matches/${m.matchId}`}
                className="glass-card rounded-xl p-5 block"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: meta.color }}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className={`badge ${m.result === 'win' ? 'badge-green' : 'badge-red'}`}>
                    {m.result.toUpperCase()}
                  </span>
                </div>
                <div className="font-bold mb-1">{m.map}</div>
                <div className="text-xs text-gray-400 mb-3">{m.mode} · {m.duration} min</div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: mvp.color + '33', color: mvp.color }}
                  >
                    {mvp.avatar}
                  </div>
                  MVP: <span className="text-white">{mvp.username}</span>
                  <span className="ml-auto">{mvp.kills}K / {mvp.deaths}D</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
