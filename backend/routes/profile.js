const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const TournamentRegistration = require('../models/TournamentRegistration');
const PlayerStats = require('../models/PlayerStats');

const router = express.Router();

const calcStats = async (user) => {
  const matches = await Match.findByUser(user.userId, { limit: 500 });
  const totalMatches = matches.length;
  const wins = matches.filter(m => m.result === 'win').length;
  const overallWinRate = totalMatches ? (wins / totalMatches) * 100 : 0;
  const avgKD = totalMatches ? matches.reduce((a,m)=>a + (m.deaths ? m.kills / m.deaths : m.kills), 0) / totalMatches : 0;
  const byGame = {}; matches.forEach(m=>{byGame[m.gameSlug]=(byGame[m.gameSlug]||0)+1;});
  const bestGame = Object.entries(byGame).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;

  const regs = await TournamentRegistration.listByUser(user.userId);
  const tournamentsPlayed = regs.length;
  const allTourneys = await Promise.all(regs.map(r=>Tournament.findById(r.tournamentId)));
  const valid = allTourneys.filter(Boolean);
  const tournamentWins = regs.filter(r => (r.resultScore || 0) >= 100).length;
  const topFinishes = regs.filter(r => (r.resultScore || 0) >= 90).length;
  const seasonRank = Math.max(1, 100 - topFinishes);
  const careerScore = (wins * 100) + (avgKD * 20) + (tournamentsPlayed * 10) + (topFinishes * 50);

  const badges = [];
  if (wins >= 1) badges.push('First Win');
  if (totalMatches >= 10) badges.push('10 Matches');
  if (topFinishes >= 1) badges.push('Tournament Finalist');
  if (seasonRank <= 10) badges.push('Top 10 Season');
  if (overallWinRate >= 55 && totalMatches >= 20) badges.push('Consistent Performer');

  return { userId: user.userId, totalMatches, overallWinRate, avgKD, bestGame, tournamentsPlayed, tournamentWins, topFinishes, seasonRank, careerScore, badges };
};

router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'Player not found' });
    if (user.profileVisibility === 'private') return res.status(403).json({ error: 'Profile is private' });
    const { passwordHash, email, ...profile } = user;
    res.json({ profile });
  } catch (e) { next(e); }
});

router.put('/', authMiddleware, async (req, res, next) => {
  try {
    await User.updateProfile(req.user.userId, req.body || {});
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.get('/:username/stats', async (req, res, next) => {
  try {
    const user = await User.findByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'Player not found' });
    if (user.profileVisibility === 'private') return res.status(403).json({ error: 'Profile is private' });
    const cached = await PlayerStats.findByUserId(user.userId);
    if (cached) return res.json({ stats: cached });
    const stats = await calcStats(user);
    await PlayerStats.upsert(stats);
    res.json({ stats });
  } catch (e) { next(e); }
});

router.get('/:username/history', async (req, res, next) => {
  try {
    const user = await User.findByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'Player not found' });
    if (user.profileVisibility === 'private') return res.status(403).json({ error: 'Profile is private' });
    const regs = await TournamentRegistration.listByUser(user.userId);
    const history = await Promise.all(regs.map(async (r) => ({ ...(await Tournament.findById(r.tournamentId)), resultScore: r.resultScore })));
    res.json({ history: history.filter(Boolean) });
  } catch (e) { next(e); }
});

router.post('/refresh-stats', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findByUsername(req.user.username);
    const stats = await calcStats(user);
    await PlayerStats.upsert(stats);
    res.json({ stats });
  } catch (e) { next(e); }
});

router.get('/scouts/search', authMiddleware, async (req, res, next) => {
  try {
    const { game, role, minRank = 999 } = req.query;
    const season = require('../models/PlayerStats');
    // basic premium-like gate via role
    if (!['admin', 'scout'].includes(req.user.role)) return res.status(403).json({ error: 'Premium scouting access required' });
    // no table scan helper exists, so return by querying provided usernames list future improvement
    res.json({ players: [], filters: { game, role, minRank: Number(minRank) }, note: 'Scouting index endpoint placeholder until scan/index is provisioned.' });
  } catch (e) { next(e); }
});

module.exports = router;
