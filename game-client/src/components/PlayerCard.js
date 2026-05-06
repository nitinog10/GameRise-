import React from 'react';

/**
 * PlayerCard — displays a single player's stats in the match viewer / leaderboard.
 * Props:
 *  player  — player object from sampleMatchData
 *  rank    — numeric rank (optional, shows medal for top 3)
 *  compact — smaller layout for timeline sidebars
 */
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const PlayerCard = ({ player, rank, compact = false }) => {
  const kd = player.deaths ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(0);
  const medal = rank && rank <= 3 ? MEDALS[rank] : null;

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-black/20 hover:bg-black/30 transition">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: player.color + '33', color: player.color, border: `1px solid ${player.color}55` }}
        >
          {player.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{player.username}</div>
          <div className="text-xs text-gray-400">{player.kills}K / {player.deaths}D / {player.assists}A</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-semibold" style={{ color: player.color }}>{player.score.toLocaleString()}</div>
          <div className="text-xs text-gray-500">pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 hover:bg-black/30 transition rounded-xl p-4 flex items-center gap-4 border border-white/[0.04] hover:border-white/[0.08]">
      {/* Rank */}
      <div className="w-10 text-center flex-shrink-0">
        {medal ? (
          <span className="text-2xl">{medal}</span>
        ) : (
          <span className="text-xl font-bold text-gray-500">#{rank || '—'}</span>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
        style={{ background: player.color + '22', color: player.color, border: `2px solid ${player.color}44` }}
      >
        {player.avatar}
      </div>

      {/* Name + team */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{player.username}</div>
        <div className="text-xs text-gray-400">{player.team ? `Team ${player.team}` : `Placement #${player.placement}`}</div>
      </div>

      {/* Stats grid */}
      <div className="hidden sm:grid grid-cols-3 gap-4 text-center flex-shrink-0">
        <Stat label="K/D" value={kd} />
        <Stat label="Kills" value={player.kills} />
        <Stat label="Accuracy" value={`${player.accuracy}%`} />
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <div className="text-lg font-bold" style={{ color: player.color }}>{player.score.toLocaleString()}</div>
        <div className="text-xs text-gray-500">score</div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div className="text-sm font-semibold text-white">{value}</div>
    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
  </div>
);

export default PlayerCard;
