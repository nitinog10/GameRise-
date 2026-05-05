const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Match = require('../models/Match');

const router = express.Router();

const calcKD = (k, d) => (d > 0 ? k / d : k);

router.get('/summary', authMiddleware, async (req, res, next) => {
  try {
    const matches = await Match.findByUser(req.user.userId, { limit: 200 });
    const totalMatches = matches.length;
    const wins = matches.filter((m) => m.result === 'win').length;
    const losses = totalMatches - wins;
    const avgKD = totalMatches ? matches.reduce((a, m) => a + calcKD(m.kills, m.deaths), 0) / totalMatches : 0;
    const avgAccuracy = totalMatches ? matches.reduce((a, m) => a + (m.accuracy || 0), 0) / totalMatches : 0;

    const byGame = {};
    matches.forEach((m) => {
      byGame[m.gameSlug] = byGame[m.gameSlug] || { wins: 0, total: 0 };
      byGame[m.gameSlug].total += 1;
      if (m.result === 'win') byGame[m.gameSlug].wins += 1;
    });
    const bestGame = Object.entries(byGame).sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0]?.[0] || null;

    let current = 0; let longest = 0; let run = 0;
    matches.forEach((m, idx) => {
      if (idx === 0) {
        const target = m.result;
        for (const item of matches) { if (item.result === target) current++; else break; }
      }
      if (m.result === 'win') { run++; longest = Math.max(longest, run); } else { run = 0; }
    });

    res.json({
      totalMatches,
      wins,
      losses,
      winRate: totalMatches ? (wins / totalMatches) * 100 : 0,
      avgKD,
      avgAccuracy,
      bestGame,
      streaks: { current, longest },
      recentForm: matches.slice(0, 5).reverse().map((m) => (m.result === 'win' ? 'W' : 'L'))
    });
  } catch (error) { next(error); }
});

router.get('/chart', authMiddleware, async (req, res, next) => {
  try {
    const { gameSlug, range = '7d' } = req.query;
    const days = range === '30d' ? 30 : 7;
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    const matches = await Match.findByUser(req.user.userId, { gameSlug, limit: 400 });
    const filtered = matches.filter((m) => new Date(m.playedAt).getTime() >= since);

    const map = {};
    filtered.forEach((m) => {
      const date = new Date(m.playedAt).toISOString().split('T')[0];
      map[date] = map[date] || { date, matches: 0, wins: 0, kdSum: 0, kills: 0, deaths: 0 };
      map[date].matches += 1;
      if (m.result === 'win') map[date].wins += 1;
      map[date].kdSum += calcKD(m.kills, m.deaths);
      map[date].kills += m.kills;
      map[date].deaths += m.deaths;
    });

    const chart = Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).map((d) => ({
      date: d.date,
      kd: d.matches ? d.kdSum / d.matches : 0,
      winRate: d.matches ? (d.wins / d.matches) * 100 : 0,
      wins: d.wins,
      losses: d.matches - d.wins,
      kills: d.kills,
      deaths: d.deaths
    }));

    res.json({ chart });
  } catch (error) { next(error); }
});

module.exports = router;
