const DEFAULT_COLORS = ['#00ff88', '#a78bfa', '#f59e0b', '#60a5fa', '#f87171', '#34d399', '#fb923c', '#e879f9'];
const SECONDS_PER_EVENT = 12;
const DEFAULT_ICONS = {
  valorant: '🔫',
  'apex-legends': '🎯',
  cs2: '💣',
  bgmi: '🎮',
  codm: '🎯'
};

/**
 * Safely coerce a value to a finite number with a fallback for invalid input.
 * @param {unknown} value
 * @param {number} [fallback=0]
 * @returns {number}
 */
const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

/**
 * Extract up to two initials from a display name, or ?? when unavailable.
 * @param {string} name
 * @returns {string}
 */
const getInitials = (name) => {
  if (!name || !name.trim()) return '??';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const getTokenUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch (error) {
    return null;
  }
};

/**
 * Convert game records into a slug-keyed metadata map for UI display.
 * @param {Array} games
 * @returns {Record<string, {label: string, color: string, icon: string}>}
 */
export const buildGameMeta = (games = []) => {
  const meta = {};
  games.forEach((game, index) => {
    const color = game.themeColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    meta[game.slug] = {
      label: game.name,
      color,
      icon: DEFAULT_ICONS[game.slug] || '🎮',
      coverImage: game.coverImage,
      genre: game.genre,
      difficulty: game.difficulty
    };
  });
  return meta;
};

const fallbackMeta = (slug, index = 0) => ({
  label: slug ? slug.replace(/-/g, ' ') : 'Unknown Game',
  color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  icon: DEFAULT_ICONS[slug] || '🎮'
});

export const resolveGameMeta = (gameMeta, slug, index = 0) => {
  if (gameMeta && gameMeta[slug]) return gameMeta[slug];
  return fallbackMeta(slug, index);
};

/**
 * Compute a display score using kills×100 + assists×50 + accuracy×2 + win bonus (250).
 * @param {object} match
 * @returns {number}
 */
const buildScore = (match) => {
  if (Number.isFinite(match.score)) return Number(match.score);
  const kills = toNumber(match.kills);
  const assists = toNumber(match.assists);
  const accuracy = toNumber(match.accuracy);
  const winBonus = match.result === 'win' ? 250 : 0;
  return Math.round(kills * 100 + assists * 50 + accuracy * 2 + winBonus);
};

const normalizePlayers = (players, match, meta, storedUser) => {
  if (Array.isArray(players) && players.length > 0) {
    return players.map((pl, index) => ({
      ...pl,
      userId: pl.userId || `${match.matchId || 'match'}_player_${index}`,
      username: pl.username || `Player ${index + 1}`,
      team: pl.team || null,
      kills: toNumber(pl.kills),
      deaths: toNumber(pl.deaths),
      assists: toNumber(pl.assists),
      accuracy: toNumber(pl.accuracy),
      damage: toNumber(pl.damage),
      score: Number.isFinite(pl.score) ? Number(pl.score) : buildScore({ ...match, ...pl }),
      placement: pl.placement ?? null,
      avatar: pl.avatar || getInitials(pl.username || `P${index + 1}`),
      color: pl.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      alive: pl.alive ?? match.result !== 'loss'
    }));
  }

  const resolvedUser = storedUser || getStoredUser();
  const tokenUser = getTokenUser();
  const username = resolvedUser?.displayName || resolvedUser?.username || resolvedUser?.email || tokenUser?.email || match.userId || 'Player';

  return [
    {
      userId: match.userId || resolvedUser?.userId || tokenUser?.userId || match.matchId,
      username,
      team: match.team || null,
      kills: toNumber(match.kills),
      deaths: toNumber(match.deaths),
      assists: toNumber(match.assists),
      accuracy: toNumber(match.accuracy),
      damage: toNumber(match.damage),
      placement: match.placement ?? null,
      score: buildScore(match),
      alive: match.result !== 'loss',
      avatar: getInitials(username),
      color: meta.color
    }
  ];
};

const buildEventsFromMatch = (match, username, meta) => {
  const kills = toNumber(match.kills);
  const deaths = toNumber(match.deaths);
  const totalEvents = kills + deaths;
  const durationSeconds = Math.max(toNumber(match.duration) * 60, totalEvents ? totalEvents * SECONDS_PER_EVENT : 60);
  const events = [
    {
      time: 0,
      type: 'start',
      actor: 'system',
      detail: `Match started — ${meta.label}`,
      icon: '🎮'
    }
  ];

  const spacing = durationSeconds / (totalEvents + 1);
  let index = 0;
  for (let i = 0; i < kills; i += 1) {
    index += 1;
    events.push({
      time: Math.round(spacing * index),
      type: 'kill',
      actor: username,
      target: `Opponent ${i + 1}`,
      detail: `${username} eliminated Opponent ${i + 1}`,
      icon: '💀'
    });
  }

  for (let i = 0; i < deaths; i += 1) {
    index += 1;
    events.push({
      time: Math.round(spacing * index),
      type: 'kill',
      actor: `Opponent ${i + 1}`,
      target: username,
      detail: `Opponent ${i + 1} eliminated ${username}`,
      icon: '💀'
    });
  }

  events.push({
    time: durationSeconds,
    type: 'end',
    actor: 'system',
    detail: `Match ended — ${match.result === 'win' ? 'Victory' : 'Defeat'}`,
    icon: match.result === 'win' ? '🏆' : '🏁'
  });

  return events.sort((a, b) => a.time - b.time);
};

/**
 * Normalize raw match data into viewer-friendly shape with resolved meta, players, and events.
 * @param {object} match
 * @param {object} options
 * @param {object} [options.gameMeta]
 * @param {object} [options.user]
 * @param {number} index
 * @returns {object}
 */
export const normalizeMatch = (match, { gameMeta, user } = {}, index = 0) => {
  const slug = match.gameSlug || match.game || 'unknown';
  const meta = resolveGameMeta(gameMeta, slug, index);
  const normalizedMatchId = match.matchId || match.id || `${slug}-${match.playedAt || index}`;
  const result = match.result || (match.placement === 1 ? 'win' : 'loss');
  const players = normalizePlayers(match.players, { ...match, matchId: normalizedMatchId, result }, meta, user);
  const events = Array.isArray(match.events) && match.events.length
    ? match.events.map((evt) => ({ ...evt, time: toNumber(evt.time) }))
    : buildEventsFromMatch({ ...match, result }, players[0]?.username || 'Player', meta);
  const durationMinutes = toNumber(match.duration)
    || Math.max(1, Math.round((events[events.length - 1]?.time || 0) / 60));

  return {
    matchId: normalizedMatchId,
    gameSlug: slug,
    map: match.map || meta.label || 'Unknown Map',
    mode: match.mode || 'Match',
    duration: durationMinutes,
    result,
    playedAt: match.playedAt || new Date().toISOString(),
    teams: match.teams || null,
    players,
    events,
    rawPackets: match.rawPackets || []
  };
};

export const normalizeMatches = (matches = [], options = {}) =>
  matches.map((match, index) => normalizeMatch(match, options, index));
