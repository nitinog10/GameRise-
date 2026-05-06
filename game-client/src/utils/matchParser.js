/**
 * matchParser.js
 *
 * Simulates the reverse-engineering of match data from raw binary/hex packets
 * into structured, human-readable match results.
 *
 * In a real game client this module would:
 *  1. Hook into game memory / network socket to capture raw packets
 *  2. Identify packet types via magic bytes
 *  3. Decode each packet using the discovered binary schema
 *  4. Reassemble the full match timeline
 *
 * Here we simulate all of that with deterministic transformations so the UI
 * can demonstrate the full parsing pipeline without a live game connection.
 */

// ─── Packet type registry (reverse-engineered opcode table) ──────────────────

const PACKET_TYPES = {
  '01': { name: 'MATCH_START',  color: '#00ff88', desc: 'Match initialisation handshake' },
  '02': { name: 'PLAYER_KILL',  color: '#f87171', desc: 'Kill event with actor / victim IDs' },
  '03': { name: 'ZONE_EVENT',   color: '#fbbf24', desc: 'Zone / round phase transition' },
  '04': { name: 'ITEM_PICKUP',  color: '#60a5fa', desc: 'Item loot or equipment change' },
  '05': { name: 'MATCH_END',    color: '#a78bfa', desc: 'Final results payload' },
  '06': { name: 'DAMAGE_EVENT', color: '#fb923c', desc: 'Damage dealt / received' },
  'FF': { name: 'UNKNOWN',      color: '#6b7280', desc: 'Unrecognised packet opcode' },
};

// ─── Step 1 — Hex capture simulation ─────────────────────────────────────────

/**
 * Generates a realistic-looking stream of hex bytes for a match.
 * Each "packet" starts with a 1-byte opcode, then a 6-byte timestamp, then payload.
 */
export function generateRawHexStream(match) {
  const packets = [];

  packets.push({
    seq: 1,
    raw: `01 ${hexTs(0)} 4D 61 74 63 68 49 6E 69 74 00 ${slugToHex(match.gameSlug)} 00 ${slugToHex(match.map || 'unknown')}`,
    decoded: null,
  });

  match.events.forEach((evt, i) => {
    const opcode = eventTypeToOpcode(evt.type);
    packets.push({
      seq: i + 2,
      raw: `${opcode} ${hexTs(evt.time)} ${stringToHex(evt.actor).slice(0, 24)} 20 ${stringToHex(evt.detail).slice(0, 32)}`,
      decoded: null,
    });
  });

  packets.push({
    seq: packets.length + 1,
    raw: `05 ${hexTs((match.duration || 30) * 60)} 4D 61 74 63 68 45 6E 64 00 ${scoreHex(match)}`,
    decoded: null,
  });

  return packets;
}

// ─── Step 2 — Binary schema discovery ────────────────────────────────────────

/**
 * Analyses the raw hex stream and groups packets by opcode,
 * returning a "schema map" that shows discovered field layouts.
 */
export function discoverSchema(rawPackets) {
  const schema = {};

  rawPackets.forEach((pkt) => {
    const opcode = pkt.raw.slice(0, 2).toUpperCase();
    const meta = PACKET_TYPES[opcode] || PACKET_TYPES['FF'];

    if (!schema[opcode]) {
      schema[opcode] = {
        opcode,
        ...meta,
        count: 0,
        fields: [
          { offset: 0,  size: 1,  name: 'opcode',    type: 'uint8',  desc: 'Packet type identifier' },
          { offset: 1,  size: 6,  name: 'timestamp', type: 'uint48', desc: 'Milliseconds since match start' },
          { offset: 7,  size: 12, name: 'actor_id',  type: 'utf8',   desc: 'Acting player identifier' },
          { offset: 19, size: 1,  name: 'separator', type: 'uint8',  desc: 'Field separator 0x20' },
          { offset: 20, size: 16, name: 'payload',   type: 'utf8',   desc: 'Context-specific payload bytes' },
        ],
        samples: [],
      };
    }
    schema[opcode].count += 1;
    if (schema[opcode].samples.length < 3) schema[opcode].samples.push(pkt.raw);
  });

  return Object.values(schema);
}

// ─── Step 3 — Packet decoding ─────────────────────────────────────────────────

/**
 * Decodes each raw packet into a human-readable object using the
 * discovered schema.
 */
export function decodePackets(rawPackets) {
  return rawPackets.map((pkt) => {
    const bytes = pkt.raw.replace(/\s/g, '');
    const opcode = bytes.slice(0, 2).toUpperCase();
    const meta = PACKET_TYPES[opcode] || PACKET_TYPES['FF'];
    const tsHex = bytes.slice(2, 14);
    const tsMs = parseInt(tsHex, 16) || 0;
    const payloadHex = bytes.slice(14);
    const payloadText = hexToString(payloadHex);

    return {
      seq: pkt.seq,
      opcode,
      packetType: meta.name,
      color: meta.color,
      timestamp: tsMs,
      timeFormatted: formatMatchTime(tsMs),
      payloadHex: payloadHex.match(/.{1,2}/g)?.join(' ') || payloadHex,
      payloadText,
      raw: pkt.raw,
    };
  });
}

// ─── Step 4 — Result aggregation ─────────────────────────────────────────────

/**
 * Takes a decoded match and reconstructs the full result summary:
 * kills per player, round scores, MVP, team totals.
 */
export function aggregateResults(match) {
  const sorted = [...match.players].sort((a, b) => b.score - a.score);
  const mvp = sorted[0];

  const teamTotals = {};
  match.players.forEach((pl) => {
    if (!teamTotals[pl.team]) teamTotals[pl.team] = { team: pl.team, kills: 0, deaths: 0, damage: 0, players: 0, won: false };
    teamTotals[pl.team].kills   += pl.kills;
    teamTotals[pl.team].deaths  += pl.deaths;
    teamTotals[pl.team].damage  += pl.damage;
    teamTotals[pl.team].players += 1;
  });

  if (match.teams) {
    Object.keys(match.teams).forEach((t) => {
      if (teamTotals[t]) teamTotals[t].won = match.teams[t].won;
    });
  }

  const killEvents  = match.events.filter((e) => e.type === 'kill').length;
  const zoneEvents  = match.events.filter((e) => e.type === 'zone').length;
  const totalDamage = match.players.reduce((s, p) => s + p.damage, 0);

  return {
    matchId:     match.matchId,
    gameSlug:    match.gameSlug,
    map:         match.map,
    mode:        match.mode,
    duration:    match.duration,
    result:      match.result,
    playedAt:    match.playedAt,
    mvp,
    rankedPlayers: sorted.map((pl, i) => ({ ...pl, rank: i + 1 })),
    teamTotals:  Object.values(teamTotals),
    stats: {
      totalKills:  killEvents,
      totalEvents: match.events.length,
      zonePhases:  zoneEvents,
      totalDamage,
      avgAccuracy: Math.round(match.players.reduce((s, p) => s + p.accuracy, 0) / match.players.length),
    },
  };
}

// ─── Step 5 — Full parse pipeline ─────────────────────────────────────────────

/**
 * Runs the complete reverse-engineering pipeline on a match object and
 * returns all intermediate + final artefacts.
 *
 *  { rawStream, schema, decodedPackets, result }
 */
export function parseMatch(match) {
  const rawStream     = generateRawHexStream(match);
  const schema        = discoverSchema(rawStream);
  const decodedPackets = decodePackets(rawStream);
  const result        = aggregateResults(match);
  return { rawStream, schema, decodedPackets, result };
}

// ─── Leaderboard helpers ─────────────────────────────────────────────────────

/**
 * Builds a cross-match leaderboard from an array of match objects.
 * Aggregates kills, score, and accuracy per unique player.
 */
export function buildLeaderboard(matches) {
  const map = {};

  matches.forEach((match) => {
    match.players.forEach((pl) => {
      if (!map[pl.userId]) {
        map[pl.userId] = {
          userId:       pl.userId,
          username:     pl.username,
          avatar:       pl.avatar,
          color:        pl.color,
          kills:        0,
          deaths:       0,
          assists:      0,
          damage:       0,
          score:        0,
          matchesPlayed: 0,
          wins:         0,
          bestPlacement: Infinity,
          accuracy:     [],
          games:        new Set(),
        };
      }
      const e = map[pl.userId];
      e.kills        += pl.kills;
      e.deaths       += pl.deaths;
      e.assists      += pl.assists;
      e.damage       += pl.damage;
      e.score        += pl.score;
      e.matchesPlayed += 1;
      e.accuracy.push(pl.accuracy);
      e.games.add(match.gameSlug);
      if (pl.placement < e.bestPlacement) e.bestPlacement = pl.placement;
      if (match.result === 'win' && pl.placement === 1) e.wins += 1;
    });
  });

  return Object.values(map)
    .map((e) => ({
      ...e,
      kd:          e.deaths ? +(e.kills / e.deaths).toFixed(2) : e.kills,
      avgAccuracy: Math.round(e.accuracy.reduce((s, v) => s + v, 0) / e.accuracy.length),
      games:       [...e.games],
    }))
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function hexTs(seconds) {
  return (seconds * 1000).toString(16).padStart(12, '0').match(/.{2}/g).join(' ');
}

function slugToHex(slug) {
  return [...slug].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
}

function stringToHex(str) {
  return [...(str || '').slice(0, 20)].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
}

function hexToString(hex) {
  try {
    const clean = hex.replace(/\s/g, '');
    let str = '';
    for (let i = 0; i < clean.length - 1; i += 2) {
      const code = parseInt(clean.slice(i, i + 2), 16);
      if (code >= 32 && code < 127) str += String.fromCharCode(code);
    }
    return str.trim() || '[binary payload]';
  } catch {
    return '[parse error]';
  }
}

function scoreHex(match) {
  const total = match.players.reduce((s, p) => s + p.score, 0);
  return total.toString(16).padStart(8, '0').match(/.{2}/g).join(' ');
}

function formatMatchTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function eventTypeToOpcode(type) {
  const map = { start: '01', kill: '02', zone: '03', pickup: '04', end: '05', damage: '06' };
  return map[type] || 'FF';
}
