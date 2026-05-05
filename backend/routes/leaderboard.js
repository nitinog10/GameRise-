const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Tournament = require('../models/Tournament');
const TournamentRegistration = require('../models/TournamentRegistration');
const Match = require('../models/Match');

const router = express.Router();

router.get('/season', authMiddleware, async (req, res, next) => {
  try {
    const { gameSlug } = req.query;
    const tournaments = (await Promise.all(['completed'].map((s) => Tournament.list({ type: 'career', gameSlug, status: s, limit: 500 })))).flat();
    const ids = tournaments.map((t) => t.tournamentId);
    const allRegs = (await Promise.all(ids.map((id) => TournamentRegistration.listByTournament(id)))).flat();

    const byUser = {};
    for (const reg of allRegs) {
      byUser[reg.userId] = byUser[reg.userId] || { userId: reg.userId, tournamentsPlayed: 0, topFinishes: 0 };
      byUser[reg.userId].tournamentsPlayed += 1;
      if ((reg.resultScore || 0) >= 90) byUser[reg.userId].topFinishes += 1;
    }

    const users = await Promise.all(Object.keys(byUser).map(async (userId) => {
      const matches = await Match.findByUser(userId, { gameSlug, limit: 200 });
      const wins = matches.filter((m) => m.result === 'win').length;
      const avgKD = matches.length ? matches.reduce((a,m)=>a + (m.deaths ? m.kills / m.deaths : m.kills), 0) / matches.length : 0;
      const base = byUser[userId];
      const score = (wins * 100) + (avgKD * 20) + (base.tournamentsPlayed * 10) + (base.topFinishes * 50);
      return { userId, wins, avgKD, ...base, score };
    }));

    const leaderboard = users.sort((a,b)=>b.score-a.score).map((u, i) => ({ rank: i + 1, rankChange: 0, ...u }));
    res.json({ leaderboard, seasonResetsIn: '6d 12h' });
  } catch (e) { next(e); }
});

module.exports = router;
