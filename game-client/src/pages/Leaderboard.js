import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Navigation from '../components/Navigation';
import { ALL_MATCHES, GAME_META } from '../data/sampleMatchData';
import { buildLeaderboard } from '../utils/matchParser';

const SORT_OPTIONS = [
  { key: 'score',       label: 'Score' },
  { key: 'kills',       label: 'Kills' },
  { key: 'kd',          label: 'K/D' },
  { key: 'damage',      label: 'Damage' },
  { key: 'avgAccuracy', label: 'Accuracy' },
];

const Leaderboard = () => {
  const [gameFilter, setGameFilter] = useState('');
  const [sortKey, setSortKey] = useState('score');
  const [highlighted, setHighlighted] = useState(null);

  const games = [...new Set(ALL_MATCHES.map((m) => m.gameSlug))];

  // Build leaderboard from all matches (or filtered by game)
  const matchesForBoard = useMemo(
    () => (gameFilter ? ALL_MATCHES.filter((m) => m.gameSlug === gameFilter) : ALL_MATCHES),
    [gameFilter]
  );

  const board = useMemo(() => {
    const raw = buildLeaderboard(matchesForBoard);
    return [...raw].sort((a, b) => b[sortKey] - a[sortKey]).map((e, i) => ({ ...e, rank: i + 1 }));
  }, [matchesForBoard, sortKey]);

  // Chart data — top 8 players
  const chartData = board.slice(0, 8).map((p) => ({
    name: p.username,
    Score:    Math.round(p.score),
    Kills:    p.kills,
    Damage:   Math.round(p.damage / 100),
  }));

  const medalEmoji = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null);
  const rankColor  = (rank) => (rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd6116' : null);

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto pt-24 px-4 pb-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">🏆 Leaderboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Global rankings computed from {matchesForBoard.length} match{matchesForBoard.length !== 1 ? 'es' : ''} · {board.length} players
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Game filter */}
            <div className="flex gap-1 bg-black/30 rounded-xl p-1">
              <button
                onClick={() => setGameFilter('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!gameFilter ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                All Games
              </button>
              {games.map((g) => {
                const meta = GAME_META[g] || {};
                return (
                  <button
                    key={g}
                    onClick={() => setGameFilter(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${gameFilter === g ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex gap-1 bg-black/30 rounded-xl p-1">
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortKey(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${sortKey === key ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'text-gray-400 hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[board[1], board[0], board[2]].filter(Boolean).map((pl, podiumIdx) => {
            const actualRank = pl.rank;
            const heights = ['h-28', 'h-36', 'h-24'];
            return (
              <div
                key={pl.userId}
                className={`glass-card rounded-xl flex flex-col items-center justify-end pb-5 pt-4 cursor-pointer transition ${heights[podiumIdx]} ${highlighted === pl.userId ? 'border-white/20' : ''}`}
                onClick={() => setHighlighted(highlighted === pl.userId ? null : pl.userId)}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-2"
                  style={{ background: pl.color + '33', color: pl.color, border: `2px solid ${pl.color}66` }}
                >
                  {pl.avatar}
                </div>
                <div className="text-lg">{medalEmoji(actualRank)}</div>
                <div className="font-bold text-sm mt-0.5">{pl.username}</div>
                <div className="text-xs text-gray-400">{pl.score.toLocaleString()} pts</div>
                <div className="text-xs text-gray-500">{pl.kd} K/D</div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="glass rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-4">Top 8 — Score / Kills / Damage (÷100)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1a1a24" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0c0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Score"  fill="#00ff88" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Kills"  fill="#f87171" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Damage" fill="#a78bfa" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Full rankings table */}
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Player</th>
                <th className="text-right py-3 px-4">Score</th>
                <th className="text-right py-3 px-4">K/D</th>
                <th className="text-right py-3 px-4 hidden sm:table-cell">Kills</th>
                <th className="text-right py-3 px-4 hidden md:table-cell">Deaths</th>
                <th className="text-right py-3 px-4 hidden md:table-cell">Assists</th>
                <th className="text-right py-3 px-4 hidden lg:table-cell">Damage</th>
                <th className="text-right py-3 px-4 hidden lg:table-cell">Accuracy</th>
                <th className="text-right py-3 px-4 hidden xl:table-cell">Matches</th>
                <th className="text-right py-3 px-4 hidden xl:table-cell">Games</th>
              </tr>
            </thead>
            <tbody>
              {board.map((pl) => (
                <tr
                  key={pl.userId}
                  className={`border-b border-white/[0.03] hover:bg-white/[0.03] transition cursor-pointer ${highlighted === pl.userId ? 'bg-white/[0.04]' : ''}`}
                  onClick={() => setHighlighted(highlighted === pl.userId ? null : pl.userId)}
                >
                  {/* Rank */}
                  <td className="py-3 px-4">
                    {medalEmoji(pl.rank) ? (
                      <span className="text-lg">{medalEmoji(pl.rank)}</span>
                    ) : (
                      <span className="font-bold text-gray-500">#{pl.rank}</span>
                    )}
                  </td>

                  {/* Player */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: pl.color + '33', color: pl.color }}
                      >
                        {pl.avatar}
                      </div>
                      <span className="font-medium">{pl.username}</span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className="font-bold"
                      style={{ color: rankColor(pl.rank) || '#00ff88' }}
                    >
                      {pl.score.toLocaleString()}
                    </span>
                  </td>

                  {/* K/D */}
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={pl.kd >= 2 ? 'text-[#00ff88]' : pl.kd >= 1 ? 'text-white' : 'text-[#f87171]'}>
                      {pl.kd}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right hidden sm:table-cell">{pl.kills}</td>
                  <td className="py-3 px-4 text-right hidden md:table-cell text-gray-400">{pl.deaths}</td>
                  <td className="py-3 px-4 text-right hidden md:table-cell text-gray-400">{pl.assists}</td>
                  <td className="py-3 px-4 text-right hidden lg:table-cell text-gray-400">{pl.damage.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right hidden lg:table-cell">
                    <span className={pl.avgAccuracy >= 65 ? 'text-[#00ff88]' : 'text-gray-300'}>{pl.avgAccuracy}%</span>
                  </td>
                  <td className="py-3 px-4 text-right hidden xl:table-cell text-gray-400">{pl.matchesPlayed}</td>
                  <td className="py-3 px-4 text-right hidden xl:table-cell">
                    <div className="flex justify-end gap-1">
                      {pl.games.map((g) => (
                        <span key={g} className="text-sm" title={g}>{GAME_META[g]?.icon || '🕹️'}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
