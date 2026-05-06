import React from 'react';

/**
 * MatchTimeline — renders the ordered list of match events.
 *
 * Props:
 *  events       — array of event objects from sampleMatchData
 *  currentTime  — current playback time in seconds (events at/before this time are "revealed")
 *  compact      — renders a smaller sidebar variant
 */

const EVENT_COLORS = {
  start:  { bg: 'bg-[#00ff88]/10',  border: 'border-[#00ff88]/30', text: 'text-[#00ff88]' },
  kill:   { bg: 'bg-[#f87171]/10',  border: 'border-[#f87171]/30', text: 'text-[#f87171]' },
  zone:   { bg: 'bg-[#fbbf24]/10',  border: 'border-[#fbbf24]/30', text: 'text-[#fbbf24]' },
  pickup: { bg: 'bg-[#60a5fa]/10',  border: 'border-[#60a5fa]/30', text: 'text-[#60a5fa]' },
  end:    { bg: 'bg-[#a78bfa]/10',  border: 'border-[#a78bfa]/30', text: 'text-[#a78bfa]' },
  damage: { bg: 'bg-[#fb923c]/10',  border: 'border-[#fb923c]/30', text: 'text-[#fb923c]' },
};

const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const MatchTimeline = ({ events = [], currentTime = Infinity, compact = false }) => {
  const visible = events.filter((e) => e.time <= currentTime);

  if (compact) {
    return (
      <div className="space-y-1 overflow-y-auto max-h-80 pr-1">
        {visible.map((evt, i) => {
          const styles = EVENT_COLORS[evt.type] || EVENT_COLORS.start;
          return (
            <div
              key={i}
              className={`flex items-start gap-2 px-2 py-1.5 rounded-lg border text-xs ${styles.bg} ${styles.border}`}
            >
              <span className="flex-shrink-0 mt-0.5">{evt.icon}</span>
              <div className="min-w-0">
                <span className="text-gray-300 truncate block">{evt.detail}</span>
              </div>
              <span className={`ml-auto flex-shrink-0 font-mono ${styles.text}`}>{formatTime(evt.time)}</span>
            </div>
          );
        })}
        {visible.length === 0 && <p className="text-gray-500 text-xs text-center py-4">Waiting for match start…</p>}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[22px] top-0 bottom-0 w-px bg-white/[0.06]" />

      <div className="space-y-3">
        {visible.map((evt, i) => {
          const styles = EVENT_COLORS[evt.type] || EVENT_COLORS.start;
          return (
            <div key={i} className="flex items-start gap-4 group">
              {/* Icon node */}
              <div className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0 border ${styles.bg} ${styles.border}`}>
                {evt.icon}
              </div>

              {/* Content */}
              <div className={`flex-1 rounded-xl p-3 border ${styles.bg} ${styles.border}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{evt.detail}</p>
                  <span className={`text-xs font-mono flex-shrink-0 ${styles.text}`}>{formatTime(evt.time)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${styles.text}`}>{evt.type}</span>
                  {evt.actor && evt.actor !== 'system' && (
                    <span className="text-[10px] text-gray-500">by {evt.actor}</span>
                  )}
                  {evt.target && (
                    <span className="text-[10px] text-gray-500">→ {evt.target}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">⏳</div>
            <p>Press Play to start watching the match</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchTimeline;
