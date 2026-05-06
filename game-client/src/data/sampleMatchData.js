/**
 * sampleMatchData.js
 *
 * Simulated match data that mimics what a game client would receive via
 * network packets / internal game APIs (reverse-engineered match flow).
 *
 * Each match contains:
 *  - players[]   : full roster with stats
 *  - events[]    : ordered timeline of in-game events (kills, zones, pickups…)
 *  - rawPackets  : hex-encoded binary blobs representing the "wire data" that
 *                  matchParser.js will decode into structured results.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
const makePacket = (type, payload) => {
  const typeMap = { MATCH_START: '01', PLAYER_KILL: '02', ZONE_CLOSE: '03', ITEM_PICKUP: '04', MATCH_END: '05', DAMAGE: '06' };
  const typeHex = typeMap[type] || 'FF';
  const ts = Date.now().toString(16).padStart(12, '0');
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  return `${typeHex}${ts}${body.match(/.{1,2}/g)?.join('') || body}`;
};

const p = (id, name, team, rank) => ({
  userId: id,
  username: name,
  team,
  kills: 0,
  deaths: 0,
  assists: 0,
  accuracy: 0,
  damage: 0,
  placement: rank,
  score: 0,
  alive: true,
  avatar: name.slice(0, 2).toUpperCase(),
  color: ['#00ff88', '#a78bfa', '#f59e0b', '#60a5fa', '#f87171', '#34d399', '#fb923c', '#e879f9'][rank % 8],
});

// ─── Match 1 — Valorant 5v5 ───────────────────────────────────────────────────

const match1Players = [
  { ...p('u001', 'PhantomX', 'Alpha', 1), kills: 24, deaths: 8,  assists: 6,  accuracy: 72, damage: 3840, score: 2980 },
  { ...p('u002', 'ShadowByte', 'Alpha', 2), kills: 18, deaths: 11, assists: 9,  accuracy: 65, damage: 2920, score: 2310 },
  { ...p('u003', 'NeonPulse', 'Alpha', 3), kills: 15, deaths: 9,  assists: 12, accuracy: 68, damage: 2540, score: 2180 },
  { ...p('u004', 'VortexAim', 'Alpha', 4), kills: 12, deaths: 14, assists: 7,  accuracy: 61, damage: 1980, score: 1640 },
  { ...p('u005', 'GhostLine', 'Alpha', 5), kills: 9,  deaths: 16, assists: 5,  accuracy: 55, damage: 1420, score: 1120 },
  { ...p('u006', 'FrostEdge', 'Beta',  1), kills: 20, deaths: 10, assists: 8,  accuracy: 70, damage: 3200, score: 2640 },
  { ...p('u007', 'CyberWolf', 'Beta',  2), kills: 16, deaths: 12, assists: 10, accuracy: 63, damage: 2600, score: 2120 },
  { ...p('u008', 'IronClad', 'Beta',   3), kills: 13, deaths: 13, assists: 6,  accuracy: 59, damage: 2100, score: 1720 },
  { ...p('u009', 'RiftBlade', 'Beta',  4), kills: 10, deaths: 15, assists: 4,  accuracy: 52, damage: 1600, score: 1300 },
  { ...p('u010', 'DuskReaper', 'Beta', 5), kills: 7,  deaths: 19, assists: 3,  accuracy: 48, damage: 1100, score: 880  },
];

const match1Events = [
  { time: 0,    type: 'start',    actor: 'system',    detail: 'Match started — Valorant · Ascent · Ranked', icon: '🎮' },
  { time: 12,   type: 'kill',     actor: 'PhantomX',  target: 'RiftBlade',  detail: 'PhantomX eliminated RiftBlade (Vandal headshot)', icon: '💀' },
  { time: 24,   type: 'kill',     actor: 'FrostEdge', target: 'GhostLine',  detail: 'FrostEdge eliminated GhostLine (Operator)', icon: '💀' },
  { time: 31,   type: 'kill',     actor: 'ShadowByte',target: 'DuskReaper', detail: 'ShadowByte eliminated DuskReaper (Ghost)', icon: '💀' },
  { time: 45,   type: 'zone',     actor: 'system',    detail: 'Round 1 ends — Alpha wins spike planted', icon: '💥' },
  { time: 60,   type: 'kill',     actor: 'NeonPulse', target: 'CyberWolf',  detail: 'NeonPulse eliminated CyberWolf (Phantom)', icon: '💀' },
  { time: 78,   type: 'kill',     actor: 'CyberWolf', target: 'VortexAim',  detail: 'CyberWolf eliminated VortexAim (Spectre)', icon: '💀' },
  { time: 90,   type: 'zone',     actor: 'system',    detail: 'Round 2 ends — Beta wins spike defused', icon: '🛡️' },
  { time: 105,  type: 'kill',     actor: 'PhantomX',  target: 'IronClad',   detail: 'PhantomX eliminated IronClad (Vandal)', icon: '💀' },
  { time: 130,  type: 'kill',     actor: 'PhantomX',  target: 'FrostEdge',  detail: 'PhantomX eliminated FrostEdge (Vandal)', icon: '🔥' },
  { time: 145,  type: 'kill',     actor: 'ShadowByte',target: 'CyberWolf',  detail: 'ShadowByte eliminated CyberWolf (Ghost)', icon: '💀' },
  { time: 160,  type: 'kill',     actor: 'NeonPulse', target: 'DuskReaper', detail: 'NeonPulse eliminated DuskReaper (Phantom)', icon: '💀' },
  { time: 175,  type: 'zone',     actor: 'system',    detail: 'Round 3 ends — Alpha wins 3–0 lead', icon: '⚡' },
  { time: 200,  type: 'kill',     actor: 'FrostEdge', target: 'GhostLine',  detail: 'FrostEdge eliminated GhostLine (Operator)', icon: '💀' },
  { time: 240,  type: 'kill',     actor: 'PhantomX',  target: 'RiftBlade',  detail: 'PhantomX aced the round!', icon: '🌟' },
  { time: 290,  type: 'zone',     actor: 'system',    detail: 'Halftime — Alpha leads 7–5', icon: '⏸️' },
  { time: 320,  type: 'kill',     actor: 'VortexAim', target: 'FrostEdge',  detail: 'VortexAim clutch elimination (Marshal)', icon: '💀' },
  { time: 380,  type: 'kill',     actor: 'PhantomX',  target: 'CyberWolf',  detail: 'PhantomX clutched 1v3!', icon: '🏆' },
  { time: 420,  type: 'zone',     actor: 'system',    detail: 'Round 22 ends — Alpha wins match 13–9', icon: '🎉' },
  { time: 422,  type: 'end',      actor: 'system',    detail: 'Match over — Alpha VICTORY', icon: '🏆' },
];

const match1RawPackets = [
  { seq: 1,   hex: `01${Date.now().toString(16)}4D617463685374617274:Valorant:Ascent:Ranked` },
  { seq: 2,   hex: `02${(Date.now()+12000).toString(16)}50686F6E746F6D58:526966744272616465:56616E64616C:48656164` },
  { seq: 3,   hex: `02${(Date.now()+24000).toString(16)}46726F7374456467:47686F73744C696E65:4F70657261746F72` },
  { seq: 4,   hex: `03${(Date.now()+45000).toString(16)}526F756E643145:416C706861:537069B65506C616E74` },
  { seq: 5,   hex: `05${(Date.now()+422000).toString(16)}4D61746368456E64:416C706861:56696374` },
];

export const MATCH_1 = {
  matchId: 'match-001',
  gameSlug: 'valorant',
  map: 'Ascent',
  mode: 'Ranked 5v5',
  duration: 38,
  result: 'win',
  playedAt: new Date(Date.now() - 3600000).toISOString(),
  teams: { Alpha: { won: true, score: 13 }, Beta: { won: false, score: 9 } },
  players: match1Players,
  events: match1Events,
  rawPackets: match1RawPackets,
};

// ─── Match 2 — Apex Legends Battle Royale ─────────────────────────────────────

const match2Players = [
  { ...p('u011', 'StormRider', 'Solo', 1),  kills: 14, deaths: 0,  assists: 2,  accuracy: 74, damage: 4200, score: 4800 },
  { ...p('u012', 'NightHawk',  'Solo', 2),  kills: 11, deaths: 1,  assists: 3,  accuracy: 69, damage: 3600, score: 3750 },
  { ...p('u013', 'PixelSnipe', 'Solo', 3),  kills: 9,  deaths: 2,  assists: 1,  accuracy: 71, damage: 3100, score: 3200 },
  { ...p('u014', 'BoltRush',   'Solo', 4),  kills: 8,  deaths: 3,  assists: 4,  accuracy: 63, damage: 2700, score: 2600 },
  { ...p('u015', 'EchoFlash',  'Solo', 5),  kills: 7,  deaths: 5,  assists: 2,  accuracy: 58, damage: 2400, score: 2100 },
  { ...p('u016', 'ArcLight',   'Solo', 6),  kills: 6,  deaths: 6,  assists: 5,  accuracy: 55, damage: 2000, score: 1750 },
  { ...p('u017', 'TitanFist',  'Solo', 7),  kills: 5,  deaths: 7,  assists: 1,  accuracy: 51, damage: 1700, score: 1400 },
  { ...p('u018', 'VeilBreak',  'Solo', 8),  kills: 4,  deaths: 9,  assists: 0,  accuracy: 47, damage: 1300, score: 1050 },
  { ...p('u019', 'RuneSeeker', 'Solo', 9),  kills: 3,  deaths: 11, assists: 2,  accuracy: 44, damage: 1000, score: 780  },
  { ...p('u020', 'DawnWarden', 'Solo', 10), kills: 2,  deaths: 14, assists: 1,  accuracy: 38, damage: 700,  score: 520  },
];

const match2Events = [
  { time: 0,   type: 'start',  actor: 'system',    detail: 'Battle Royale starts — 60 players drop into Storm Point', icon: '🎮' },
  { time: 18,  type: 'pickup', actor: 'StormRider', detail: 'StormRider looted Kraber sniper + level 3 armour', icon: '🎒' },
  { time: 35,  type: 'kill',   actor: 'StormRider', target: 'Player_42', detail: 'StormRider first blood (Kraber 200dmg headshot)', icon: '💀' },
  { time: 52,  type: 'kill',   actor: 'NightHawk',  target: 'Player_17', detail: 'NightHawk eliminated Player_17 (R-301)', icon: '💀' },
  { time: 70,  type: 'zone',   actor: 'system',     detail: 'Ring 1 closing — move to safe zone!', icon: '⭕' },
  { time: 85,  type: 'kill',   actor: 'StormRider', target: 'Player_33', detail: 'StormRider 360 no-scope elimination', icon: '🎯' },
  { time: 110, type: 'zone',   actor: 'system',     detail: 'Ring 2 — 30 players remaining', icon: '⭕' },
  { time: 125, type: 'kill',   actor: 'PixelSnipe',  target: 'Player_08', detail: 'PixelSnipe long-range Longbow shot', icon: '💀' },
  { time: 160, type: 'kill',   actor: 'StormRider', target: 'BoltRush',  detail: 'StormRider eliminated BoltRush (Mastiff)', icon: '💀' },
  { time: 175, type: 'zone',   actor: 'system',     detail: 'Ring 3 — 15 players remaining', icon: '⭕' },
  { time: 210, type: 'kill',   actor: 'StormRider', target: 'EchoFlash', detail: 'StormRider eliminated EchoFlash (Wingman)', icon: '💀' },
  { time: 245, type: 'zone',   actor: 'system',     detail: 'Final ring — top 5 remain!', icon: '🔴' },
  { time: 268, type: 'kill',   actor: 'StormRider', target: 'NightHawk', detail: 'StormRider vs NightHawk — final duel!', icon: '⚔️' },
  { time: 280, type: 'end',    actor: 'system',     detail: 'StormRider wins — Champion of the match!', icon: '🏆' },
];

export const MATCH_2 = {
  matchId: 'match-002',
  gameSlug: 'apex-legends',
  map: 'Storm Point',
  mode: 'Battle Royale',
  duration: 28,
  result: 'win',
  playedAt: new Date(Date.now() - 7200000).toISOString(),
  teams: null,
  players: match2Players,
  events: match2Events,
  rawPackets: [],
};

// ─── Match 3 — CS2 5v5 ────────────────────────────────────────────────────────

const match3Players = [
  { ...p('u021', 'HeadshotKing', 'CT', 1), kills: 28, deaths: 14, assists: 5,  accuracy: 76, damage: 4480, score: 3400 },
  { ...p('u022', 'FlashPoint',   'CT', 2), kills: 22, deaths: 16, assists: 8,  accuracy: 68, damage: 3520, score: 2760 },
  { ...p('u023', 'WallBang',     'CT', 3), kills: 18, deaths: 18, assists: 6,  accuracy: 62, damage: 2880, score: 2160 },
  { ...p('u024', 'BunnyHop',     'CT', 4), kills: 14, deaths: 20, assists: 4,  accuracy: 57, damage: 2240, score: 1680 },
  { ...p('u025', 'SmokeMaster',  'CT', 5), kills: 10, deaths: 22, assists: 10, accuracy: 53, damage: 1600, score: 1400 },
  { ...p('u026', 'AimGod',       'T',  1), kills: 25, deaths: 15, assists: 7,  accuracy: 74, damage: 4000, score: 3100 },
  { ...p('u027', 'SprayControl', 'T',  2), kills: 19, deaths: 17, assists: 9,  accuracy: 66, damage: 3040, score: 2420 },
  { ...p('u028', 'PeekMaster',   'T',  3), kills: 15, deaths: 19, assists: 5,  accuracy: 60, damage: 2400, score: 1900 },
  { ...p('u029', 'CrouchKing',   'T',  4), kills: 11, deaths: 21, assists: 3,  accuracy: 54, damage: 1760, score: 1380 },
  { ...p('u030', 'LagSwitch',    'T',  5), kills: 7,  deaths: 25, assists: 2,  accuracy: 46, damage: 1120, score: 860  },
];

const match3Events = [
  { time: 0,   type: 'start', actor: 'system',       detail: 'CS2 Competitive — Mirage — CT wins knife round', icon: '🎮' },
  { time: 15,  type: 'kill',  actor: 'HeadshotKing', target: 'AimGod',       detail: 'HeadshotKing AWP peek through mid', icon: '💀' },
  { time: 28,  type: 'kill',  actor: 'AimGod',       target: 'BunnyHop',     detail: 'AimGod eco rifle tap', icon: '💀' },
  { time: 42,  type: 'zone',  actor: 'system',       detail: 'Round 1 — CT win (T elimination)', icon: '🛡️' },
  { time: 80,  type: 'kill',  actor: 'HeadshotKing', target: 'SprayControl', detail: 'HeadshotKing double headshot', icon: '🔥' },
  { time: 115, type: 'zone',  actor: 'system',       detail: 'Half-time — CT 9 – T 6', icon: '⏸️' },
  { time: 200, type: 'kill',  actor: 'AimGod',       target: 'SmokeMaster',  detail: 'AimGod deagle 1-tap through smoke', icon: '💀' },
  { time: 260, type: 'kill',  actor: 'HeadshotKing', target: 'CrouchKing',   detail: 'HeadshotKing wallbang', icon: '💀' },
  { time: 320, type: 'zone',  actor: 'system',       detail: 'CT wins match 16–12', icon: '🎉' },
  { time: 322, type: 'end',   actor: 'system',       detail: 'Match over — CT team VICTORY', icon: '🏆' },
];

export const MATCH_3 = {
  matchId: 'match-003',
  gameSlug: 'cs2',
  map: 'Mirage',
  mode: 'Competitive 5v5',
  duration: 42,
  result: 'win',
  playedAt: new Date(Date.now() - 86400000).toISOString(),
  teams: { CT: { won: true, score: 16 }, T: { won: false, score: 12 } },
  players: match3Players,
  events: match3Events,
  rawPackets: [],
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const ALL_MATCHES = [MATCH_1, MATCH_2, MATCH_3];

export const GAME_META = {
  'valorant':     { label: 'Valorant',      color: '#ff4655', icon: '🔫' },
  'apex-legends': { label: 'Apex Legends',  color: '#cd6116', icon: '🎯' },
  'cs2':          { label: 'CS2',           color: '#de9b35', icon: '💣' },
};
