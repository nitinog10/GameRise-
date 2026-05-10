import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import DiagnosticsPanel from '../components/DiagnosticsPanel';
import useGameClientData from '../hooks/useGameClientData';
import { resolveGameMeta } from '../utils/matchAdapter';

const MatchList = () => {
  const [filter, setFilter] = useState('');
  const { matches, gameMeta, loading, error, diagnostics } = useGameClientData({ limit: 100 });
  const showDiagnostics = Boolean(error || diagnostics?.matchesError || diagnostics?.healthError || diagnostics?.originMismatch);

  const filtered = filter
    ? matches.filter((m) => m.gameSlug === filter)
    : matches;

  const games = useMemo(() => [...new Set(matches.map((m) => m.gameSlug))], [matches]);

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <Navigation />
      <div className="max-w-7xl mx-auto pt-24 px-4 pb-10">
        {error && (
          <div className="glass-card rounded-xl p-4 mb-4 text-sm text-red-300 border border-red-500/20">
            {error}
          </div>
        )}
        {showDiagnostics && <DiagnosticsPanel diagnostics={diagnostics} />}
        {loading && (
          <div className="glass-card rounded-xl p-4 mb-6 text-sm text-gray-400">
            Loading matches…
          </div>
        )}
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
              const meta = resolveGameMeta(gameMeta, g);
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

        {filtered.length === 0 && !loading ? (
          <div className="glass-card rounded-xl p-6 text-gray-400 text-sm">
            No matches found for this filter yet.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((m, index) => {
              const meta = resolveGameMeta(gameMeta, m.gameSlug, index);
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
        )}
      </div>
    </div>
  );
};

export default MatchList;
