import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import Navigation from '../components/Navigation';
import MatchTimeline from '../components/MatchTimeline';
import PlayerCard from '../components/PlayerCard';
import { ALL_MATCHES, GAME_META } from '../data/sampleMatchData';
import { parseMatch } from '../utils/matchParser';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = ['Viewer', 'Results', 'Raw Packets', 'Schema'];

const MatchViewer = () => {
  const { matchId } = useParams();
  const match = ALL_MATCHES.find((m) => m.matchId === matchId) || ALL_MATCHES[0];
  const parsed = parseMatch(match);
  const meta = GAME_META[match.gameSlug] || {};

  // ─── Playback state ───────────────────────────────────────────────────────
  const maxTime = match.events[match.events.length - 1]?.time || match.duration * 60;
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(4); // seconds per real second
  const intervalRef = useRef(null);

  const startPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= maxTime) {
          clearInterval(intervalRef.current);
          setPlaying(false);
          return maxTime;
        }
        return t + speed;
      });
    }, 1000);
  }, [maxTime, speed]);

  useEffect(() => {
    if (playing) {
      startPlayback();
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, startPlayback]);

  const reset = () => { setCurrentTime(0); setPlaying(false); };
  const skip = (s) => setCurrentTime((t) => Math.max(0, Math.min(maxTime, t + s)));

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('Viewer');

  // ─── Live player stats (evolve with currentTime) ──────────────────────────
  const livePlayers = match.players.map((pl) => {
    const killEvents = match.events.filter(
      (e) => e.time <= currentTime && e.type === 'kill' && e.actor === pl.username
    ).length;
    const deathEvents = match.events.filter(
      (e) => e.time <= currentTime && e.type === 'kill' && e.target === pl.username
    ).length;
    const progress = maxTime > 0 ? currentTime / maxTime : 0;
    return {
      ...pl,
      kills:  Math.round(pl.kills * progress + killEvents * 0.3),
      deaths: Math.round(pl.deaths * progress + deathEvents * 0.3),
      score:  Math.round(pl.score * progress),
    };
  }).sort((a, b) => b.score - a.score);

  const progressPct = maxTime > 0 ? (currentTime / maxTime) * 100 : 0;
  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ─── Radar data for top 5 players ─────────────────────────────────────────
  const radarData = [
    { stat: 'Kills',    ...Object.fromEntries(livePlayers.slice(0, 5).map((p) => [p.username, p.kills])) },
    { stat: 'Assists',  ...Object.fromEntries(livePlayers.slice(0, 5).map((p) => [p.username, p.assists])) },
    { stat: 'Accuracy', ...Object.fromEntries(livePlayers.slice(0, 5).map((p) => [p.username, p.accuracy])) },
    { stat: 'Damage',   ...Object.fromEntries(livePlayers.slice(0, 5).map((p) => [p.username, Math.round(p.damage / 100)])) },
    { stat: 'Score',    ...Object.fromEntries(livePlayers.slice(0, 5).map((p) => [p.username, Math.round(p.score / 100)])) },
  ];

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto pt-24 px-4 pb-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Link to="/matches" className="hover:text-white transition">Matches</Link>
              <span>/</span>
              <span style={{ color: meta.color }}>{meta.icon} {meta.label}</span>
            </div>
            <h1 className="text-2xl font-bold">{match.map} — {match.mode}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span>{match.duration} min</span>
              <span>·</span>
              <span>{match.players.length} players</span>
              <span>·</span>
              <span>{new Date(match.playedAt).toLocaleString()}</span>
              <span className={`badge ${match.result === 'win' ? 'badge-green' : 'badge-red'}`}>
                {match.result.toUpperCase()}
              </span>
            </div>
          </div>
          {/* Other matches quick-switch */}
          <div className="flex gap-2">
            {ALL_MATCHES.filter((m) => m.matchId !== matchId).map((m) => {
              const gm = GAME_META[m.gameSlug] || {};
              return (
                <Link
                  key={m.matchId}
                  to={`/matches/${m.matchId}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 transition"
                >
                  {gm.icon} {m.map}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── Tab bar ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-black/30 rounded-xl p-1 mb-6 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ══════════════════ VIEWER TAB ══════════════════════════════════════ */}
        {tab === 'Viewer' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left — timeline + controls */}
            <div className="lg:col-span-2 space-y-4">
              {/* Playback controls */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  {/* Reset */}
                  <button onClick={reset} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition" title="Reset">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  {/* Back 10s */}
                  <button onClick={() => skip(-10)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition" title="-10s">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                    </svg>
                  </button>
                  {/* Play / Pause */}
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="w-10 h-10 rounded-full bg-[#00ff88] text-[#08080c] flex items-center justify-center hover:bg-[#33ffaa] transition font-bold"
                  >
                    {playing ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                  {/* Forward 10s */}
                  <button onClick={() => skip(10)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition" title="+10s">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                    </svg>
                  </button>

                  {/* Timestamp */}
                  <span className="font-mono text-sm ml-1 text-[#00ff88]">{formatTime(currentTime)}</span>
                  <span className="font-mono text-xs text-gray-600">/ {formatTime(maxTime)}</span>

                  {/* Speed */}
                  <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                    <span>Speed:</span>
                    {[1, 2, 4, 8].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-2 py-0.5 rounded font-mono ${speed === s ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-white/5 hover:bg-white/10'} transition`}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrubber */}
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={maxTime}
                    value={currentTime}
                    onChange={(e) => { setPlaying(false); setCurrentTime(Number(e.target.value)); }}
                    className="w-full accent-[#00ff88] cursor-pointer"
                  />
                  {/* Event markers */}
                  <div className="absolute top-0 left-0 right-0 h-1 pointer-events-none">
                    {match.events.map((evt, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-3 rounded-full -translate-y-1"
                        style={{
                          left: `${(evt.time / maxTime) * 100}%`,
                          background: evt.type === 'kill' ? '#f87171' : evt.type === 'end' ? '#a78bfa' : '#fbbf24',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                  Match Timeline
                  <span className="ml-auto text-xs text-gray-500">
                    {match.events.filter((e) => e.time <= currentTime).length} / {match.events.length} events
                  </span>
                </h3>
                <MatchTimeline events={match.events} currentTime={currentTime} />
              </div>
            </div>

            {/* Right — live scoreboard */}
            <div className="space-y-4">
              {/* Progress indicator */}
              <div className="glass rounded-xl p-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Match progress</span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Live scoreboard */}
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-[#00ff88] text-xs animate-pulse">●</span> Live Scoreboard
                </h3>
                <div className="space-y-2">
                  {livePlayers.map((pl, i) => (
                    <PlayerCard key={pl.userId} player={pl} rank={i + 1} compact />
                  ))}
                </div>
              </div>

              {/* Match teams summary */}
              {match.teams && (
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Teams</h3>
                  {Object.entries(match.teams).map(([team, info]) => (
                    <div key={team} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="font-medium">{team}</span>
                      <span className="text-2xl font-bold">{info.score}</span>
                      {info.won && <span className="badge badge-green text-[10px]">WIN</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════ RESULTS TAB ═════════════════════════════════════ */}
        {tab === 'Results' && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Kills', value: parsed.result.stats.totalKills, icon: '💀' },
                { label: 'Total Damage', value: parsed.result.stats.totalDamage.toLocaleString(), icon: '💥' },
                { label: 'Avg Accuracy', value: `${parsed.result.stats.avgAccuracy}%`, icon: '🎯' },
                { label: 'Zone Phases', value: parsed.result.stats.zonePhases, icon: '⭕' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-xl font-bold text-[#00ff88]">{value}</div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* MVP card */}
            <div className="glass rounded-xl p-5 border border-[#fbbf24]/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🌟</span>
                <h3 className="font-bold text-lg">MVP — {parsed.result.mvp.username}</h3>
              </div>
              <PlayerCard player={parsed.result.mvp} rank={1} />
            </div>

            {/* Full scoreboard */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Final Scoreboard</h3>
              <div className="space-y-2">
                {parsed.result.rankedPlayers.map((pl) => (
                  <PlayerCard key={pl.userId} player={pl} rank={pl.rank} />
                ))}
              </div>
            </div>

            {/* Performance radar */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Top 5 Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={livePlayers.slice(0, 5)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#1a1a24" />
                  <XAxis dataKey="username" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0c0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="kills"   fill="#f87171" name="Kills" />
                  <Bar dataKey="assists" fill="#60a5fa" name="Assists" />
                  <Bar dataKey="deaths"  fill="#9ca3af" name="Deaths" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══════════════════ RAW PACKETS TAB ═════════════════════════════════ */}
        {tab === 'Raw Packets' && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 border border-[#a78bfa]/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔬</span>
                <h3 className="font-semibold">Raw Hex Packet Stream</h3>
                <span className="ml-auto badge badge-purple">{parsed.rawStream.length} packets captured</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Simulated binary packets captured from the game's network socket. Each packet begins with a 1-byte
                opcode, followed by a 6-byte timestamp, then a variable-length payload. The parser below decodes each
                packet into human-readable fields.
              </p>

              {/* Raw bytes */}
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">RAW CAPTURE</h4>
                {parsed.rawStream.map((pkt) => (
                  <div key={pkt.seq} className="flex gap-3 items-start">
                    <span className="font-mono text-[10px] text-gray-600 w-8 flex-shrink-0 mt-1">#{pkt.seq}</span>
                    <pre className="font-mono text-[11px] text-[#00ff88] bg-black/40 px-3 py-2 rounded-lg overflow-x-auto flex-1 leading-relaxed">
                      {pkt.raw}
                    </pre>
                  </div>
                ))}
              </div>

              {/* Decoded packets */}
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">DECODED PACKETS</h4>
              <div className="space-y-2">
                {parsed.decodedPackets.map((pkt) => (
                  <div
                    key={pkt.seq}
                    className="flex flex-wrap md:flex-nowrap gap-3 items-center p-3 rounded-lg bg-black/20 border border-white/5"
                  >
                    <span className="font-mono text-[10px] text-gray-600 w-6 flex-shrink-0">#{pkt.seq}</span>
                    <span
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0"
                      style={{ background: pkt.color + '22', color: pkt.color, border: `1px solid ${pkt.color}44` }}
                    >
                      {pkt.packetType}
                    </span>
                    <span className="font-mono text-[10px] text-[#fbbf24] flex-shrink-0">{pkt.timeFormatted}</span>
                    <span className="text-xs text-gray-300 min-w-0 truncate flex-1">{pkt.payloadText}</span>
                    <span className="font-mono text-[9px] text-gray-600 hidden lg:block truncate max-w-[260px]">{pkt.payloadHex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ SCHEMA TAB ══════════════════════════════════════ */}
        {tab === 'Schema' && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 border border-[#60a5fa]/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📐</span>
                <h3 className="font-semibold">Discovered Binary Schema</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                By analysing the opcode frequency and byte patterns across the packet stream, the parser
                reverse-engineers the binary schema — identifying packet types, field offsets, and payload structures
                without access to the game's source code.
              </p>

              <div className="space-y-4">
                {parsed.schema.map((entry) => (
                  <div
                    key={entry.opcode}
                    className="rounded-xl p-4 border"
                    style={{ background: entry.color + '08', borderColor: entry.color + '33' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="font-mono text-sm font-bold px-2 py-0.5 rounded"
                        style={{ background: entry.color + '22', color: entry.color }}
                      >
                        0x{entry.opcode}
                      </span>
                      <span className="font-semibold">{entry.name}</span>
                      <span className="text-xs text-gray-400">{entry.desc}</span>
                      <span className="ml-auto badge text-[10px]" style={{ color: entry.color, borderColor: entry.color + '44' }}>
                        {entry.count} packets
                      </span>
                    </div>

                    {/* Field table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-500 border-b border-white/5">
                            <th className="text-left py-1 pr-4">Offset</th>
                            <th className="text-left py-1 pr-4">Size</th>
                            <th className="text-left py-1 pr-4">Field</th>
                            <th className="text-left py-1 pr-4">Type</th>
                            <th className="text-left py-1">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.fields.map((f) => (
                            <tr key={f.name} className="border-b border-white/[0.03]">
                              <td className="py-1 pr-4 font-mono text-[#fbbf24]">{f.offset}</td>
                              <td className="py-1 pr-4 font-mono">{f.size}</td>
                              <td className="py-1 pr-4 font-semibold" style={{ color: entry.color }}>{f.name}</td>
                              <td className="py-1 pr-4 font-mono text-gray-400">{f.type}</td>
                              <td className="py-1 text-gray-400">{f.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Sample bytes */}
                    {entry.samples.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Sample packet bytes:</div>
                        <pre className="font-mono text-[10px] text-[#00ff88] bg-black/40 px-3 py-2 rounded overflow-x-auto">
                          {entry.samples[0]}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchViewer;
