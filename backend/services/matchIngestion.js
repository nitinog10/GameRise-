const { getIntegrationBySlug } = require('./integrationCatalog');

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const pickFirst = (...values) => values.find((value) => value !== undefined && value !== null);
const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value);

const extractPrimaryPlayer = (players = [], { userId, accountId, inGameUsername } = {}) => {
  if (!Array.isArray(players) || players.length === 0) return null;
  return (
    players.find((pl) => pl.userId === userId)
    || players.find((pl) => pl.accountId === accountId)
    || players.find((pl) => pl.username === inGameUsername)
    || players[0]
  );
};

const deriveStatsFromEvents = (events = [], username) => {
  if (!Array.isArray(events) || events.length === 0) return {};
  const kills = events.filter((evt) => evt.type === 'kill' && evt.actor === username).length;
  const deaths = events.filter((evt) => evt.type === 'kill' && evt.target === username).length;
  const assists = events.filter((evt) => evt.type === 'assist' && evt.actor === username).length;
  return { kills, deaths, assists };
};

const parseCapturePayload = (capture, payload) => {
  if (!capture) return {};
  const players = capture.players || [];
  const primary = extractPrimaryPlayer(players, {
    userId: payload.userId,
    accountId: payload.accountId,
    inGameUsername: payload.inGameUsername
  });
  const username = primary?.username || primary?.inGameUsername || payload.inGameUsername || payload.userId || 'Player';
  const eventStats = deriveStatsFromEvents(capture.events || [], username);
  const duration = pickFirst(capture.duration, capture.meta?.duration);
  const maxEventTime = Math.max(
    0,
    ...(Array.isArray(capture.events) ? capture.events.map((evt) => Number(evt.time) || 0) : [0])
  );
  return {
    result: capture.result,
    kills: pickFirst(primary?.kills, eventStats.kills),
    deaths: pickFirst(primary?.deaths, eventStats.deaths),
    assists: pickFirst(primary?.assists, eventStats.assists),
    accuracy: pickFirst(primary?.accuracy, capture.accuracy),
    placement: pickFirst(primary?.placement, capture.placement),
    duration: pickFirst(duration, maxEventTime ? Math.round(maxEventTime / 60) : undefined),
    map: pickFirst(capture.map, capture.meta?.map),
    mode: pickFirst(capture.mode, capture.meta?.mode),
    teams: capture.teams,
    events: capture.events,
    rawPackets: capture.rawPackets || capture.packets,
    captureMeta: capture.meta
  };
};

const adaptValorantPayload = (payload) => {
  const match = [payload.apiMatch, payload.match, payload.stats, payload].find(isRecord) || {};
  const stats = match.stats || {};
  return {
    result: match.result,
    kills: pickFirst(stats.kills, match.kills),
    deaths: pickFirst(stats.deaths, match.deaths),
    assists: pickFirst(stats.assists, match.assists),
    accuracy: pickFirst(stats.accuracy, stats.headshotPct, match.accuracy),
    placement: match.placement,
    duration: pickFirst(match.duration, match.metadata?.gameLength),
    map: pickFirst(match.map, match.metadata?.map),
    mode: pickFirst(match.mode, match.metadata?.mode)
  };
};

const adaptBattleRoyalePayload = (payload) => {
  const match = [payload.apiMatch, payload.match, payload.telemetry, payload].find(isRecord) || {};
  return {
    result: match.result,
    kills: pickFirst(match.kills, match.stats?.kills),
    deaths: pickFirst(match.deaths, match.stats?.deaths),
    assists: pickFirst(match.assists, match.stats?.assists),
    accuracy: pickFirst(match.accuracy, match.stats?.accuracy),
    placement: pickFirst(match.placement, match.rank),
    duration: pickFirst(match.duration, match.length),
    map: pickFirst(match.map, match.metadata?.map),
    mode: pickFirst(match.mode, match.metadata?.mode)
  };
};

const gameAdapters = {
  valorant: adaptValorantPayload,
  bgmi: adaptBattleRoyalePayload,
  codm: adaptBattleRoyalePayload
};

const normalizeObserverPayload = (payload = {}) => {
  const gameSlug = payload.gameSlug || payload.game || payload.slug || 'unknown';
  const catalog = getIntegrationBySlug(gameSlug);
  const adapter = Object.prototype.hasOwnProperty.call(gameAdapters, gameSlug)
    ? gameAdapters[gameSlug]
    : null;
  const adapterStats = adapter ? adapter(payload) : {};
  const captureStats = parseCapturePayload(payload.capture, payload);
  const base = [payload.match, payload.stats, payload].find(isRecord) || {};
  const result = pickFirst(
    payload.result,
    captureStats.result,
    adapterStats.result,
    base.result,
    Number(base.placement) === 1 ? 'win' : undefined
  );
  const placement = pickFirst(
    payload.placement,
    captureStats.placement,
    adapterStats.placement,
    base.placement
  );
  const derivedResult = result || (Number(placement) === 1 ? 'win' : 'loss');
  const source = pickFirst(
    payload.source,
    payload.capture ? 'capture' : undefined,
    catalog?.hasOfficialApi ? 'api' : 'capture'
  );

  return {
    userId: payload.userId,
    gameSlug,
    result: derivedResult,
    kills: numberValue(pickFirst(payload.kills, captureStats.kills, adapterStats.kills, base.kills)),
    deaths: numberValue(pickFirst(payload.deaths, captureStats.deaths, adapterStats.deaths, base.deaths)),
    assists: numberValue(pickFirst(payload.assists, captureStats.assists, adapterStats.assists, base.assists)),
    accuracy: numberValue(pickFirst(payload.accuracy, captureStats.accuracy, adapterStats.accuracy, base.accuracy)),
    placement: placement ?? null,
    duration: numberValue(pickFirst(payload.duration, captureStats.duration, adapterStats.duration, base.duration)),
    notes: pickFirst(payload.notes, captureStats.notes, base.notes) || '',
    playedAt: pickFirst(payload.playedAt, base.playedAt) || new Date().toISOString(),
    liveData: pickFirst(payload.liveData, base.liveData, captureStats.liveData) || null,
    map: pickFirst(payload.map, captureStats.map, adapterStats.map, base.map),
    mode: pickFirst(payload.mode, captureStats.mode, adapterStats.mode, base.mode),
    teams: pickFirst(payload.teams, captureStats.teams, base.teams) || null,
    events: pickFirst(payload.events, captureStats.events, base.events) || null,
    rawPackets: pickFirst(payload.rawPackets, captureStats.rawPackets, base.rawPackets) || [],
    source,
    provider: pickFirst(payload.provider, catalog?.provider, base.provider, 'observer-bot'),
    integrationId: payload.integrationId || null,
    captureMeta: captureStats.captureMeta || null,
    telemetry: payload.telemetry || null
  };
};

module.exports = { normalizeObserverPayload };
