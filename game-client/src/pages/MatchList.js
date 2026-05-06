import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { ALL_MATCHES, GAME_META } from '../data/sampleMatchData';

const MatchList = () => {
  const [filter, setFilter] = useState('');

  const filtered = filter
    ? ALL_MATCHES.filter((m) => m.gameSlug === filter)
    : ALL_MATCHES;

  const games = [...new Set(ALL_MATCHES.map((m) => m.gameSlug))];

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <Navigation />
      <div className="max-w-7xl mx-auto pt-24 px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Match Library</h1>
            <p className="text-gray-400 text-sm mt-1">Select a match to watch the replay and inspect the parsed data</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${!filter ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              All
            </button>
            {games.map((g) => {
              const meta = GAME_META[g] || {};
              return (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === g ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((m) => {
            const meta = GAME_META[m.gameSlug] || {};
            const sortedPlayers = [...m.players].sort((a, b) => b.score - a.score);
            const mvp = sortedPlayers[0];
            const kills = m.players.reduce((s, p) => s + p.kills, 0);

            return (
              <Link
                key={m.matchId}
                to={`/matches/${m.matchId}`}
                className="block glass-card rounded-xl p-5 hover:border-white/[0.12] transition"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Game + result */}
                  <div className="flex items-center gap-3 flex-shrink-0 w-44">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: (meta.color || '#888') + '22', border: `1px solid ${meta.color || '#888'}44` }}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{meta.label || m.gameSlug}</div>
                      <span className={`badge ${m.result === 'win' ? 'badge-green' : 'badge-red'} text-[10px]`}>
                        {m.result.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Map + mode */}
                  <div className="flex-1">
                    <div className="font-semibold">{m.map}</div>
                    <div className="text-xs text-gray-400">{m.mode}</div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="font-bold text-[#00ff88]">{m.players.length}</div>
                      <div className="text-[10px] text-gray-500">PLAYERS</div>
                    </div>
                    <div>
                      <div className="font-bold">{kills}</div>
                      <div className="text-[10px] text-gray-500">KILLS</div>
                    </div>
                    <div>
                      <div className="font-bold">{m.duration}m</div>
                      <div className="text-[10px] text-gray-500">DURATION</div>
                    </div>
                    <div>
                      <div className="font-bold">{m.events.length}</div>
                      <div className="text-[10px] text-gray-500">EVENTS</div>
                    </div>
                  </div>

                  {/* MVP */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: mvp.color + '33', color: mvp.color }}
                    >
                      {mvp.avatar}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">MVP</div>
                      <div className="text-sm font-semibold">{mvp.username}</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchList;
