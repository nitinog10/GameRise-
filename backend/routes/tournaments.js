const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const Tournament = require('../models/Tournament');
const TournamentRegistration = require('../models/TournamentRegistration');
const Match = require('../models/Match');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { type, gameSlug, status } = req.query;
    let tournaments;
    if (status) tournaments = await Tournament.list({ type, gameSlug, status, limit: 200 });
    else {
      const all = await Promise.all(['upcoming', 'live', 'completed'].map((s) => Tournament.list({ type, gameSlug, status: s, limit: 200 })));
      tournaments = all.flat();
    }
    res.json({ tournaments });
  } catch (e) { next(e); }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Not found' });
    const registrations = await TournamentRegistration.listByTournament(req.params.id);
    const leaderboard = registrations.sort((a,b)=>(b.resultScore||0)-(a.resultScore||0)).map((r,i)=>({ rank:i+1, ...r }));
    res.json({ tournament, leaderboard });
  } catch (e) { next(e); }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const tournament = await Tournament.create({ ...req.body, createdBy: req.user.userId });
    fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks/discord-notify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ eventType:'tournament_created', message:`New tournament: ${tournament.name}` }) }).catch(()=>{});
    res.status(201).json({ tournament });
  } catch (e) { next(e); }
});

router.post('/:id/register', authMiddleware, async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Not found' });
    if ((tournament.registeredPlayers || []).includes(req.user.userId)) return res.status(400).json({ error: 'Already registered' });
    if ((tournament.registeredPlayers || []).length >= tournament.maxPlayers) return res.status(400).json({ error: 'Tournament is full' });

    const registration = await TournamentRegistration.create({
      tournamentId: req.params.id,
      userId: req.user.userId,
      paymentStatus: tournament.entryFee > 0 ? 'pending' : 'free',
      resultScore: 0
    });

    await Tournament.update(req.params.id, { registeredPlayers: [...(tournament.registeredPlayers || []), req.user.userId] });
    res.status(201).json({ registration });
  } catch (e) { next(e); }
});

router.put('/:id/submit-score', authMiddleware, async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament || tournament.status !== 'live') return res.status(400).json({ error: 'Tournament is not live' });
    const regs = await TournamentRegistration.listByTournament(req.params.id);
    const reg = regs.find((r) => r.userId === req.user.userId);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    await TournamentRegistration.setScore(reg.registrationId, Number(req.body.resultScore || 0));
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.get('/:id/leaderboard', authMiddleware, async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1); const pageSize = Number(req.query.pageSize || 20);
    const regs = await TournamentRegistration.listByTournament(req.params.id);
    const sorted = regs.sort((a,b)=>(b.resultScore||0)-(a.resultScore||0));
    const start = (page - 1) * pageSize;
    const entries = sorted.slice(start, start + pageSize).map((r,idx)=>({ rank:start+idx+1, ...r }));
    res.json({ entries, total: sorted.length, page, pageSize });
  } catch (e) { next(e); }
});

router.put('/:id/status', authMiddleware, adminMiddleware, async (req,res,next)=>{
  try { await Tournament.update(req.params.id, { status: req.body.status, results: req.body.results || undefined }); if(req.body.status==='completed' && (req.body.results||[])[0]) fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks/discord-notify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ eventType:'tournament_winner', message:`Winner announced for tournament ${req.params.id}` }) }).catch(()=>{}); res.json({ success:true }); }
  catch(e){ next(e);} 
});

router.get('/season/rankings/global', authMiddleware, async (req, res, next) => {
  try {
    const { gameSlug } = req.query;
    const regs = await TournamentRegistration.listByUser(req.user.userId);
    res.json({ regs, gameSlug });
  } catch (e) { next(e); }
});

module.exports = router;
