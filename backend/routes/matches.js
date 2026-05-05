const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Match = require('../models/Match');

const router = express.Router();

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const payload = req.body;
    const match = await Match.create({
      userId: req.user.userId,
      gameSlug: payload.gameSlug,
      result: payload.result,
      kills: Number(payload.kills || 0),
      deaths: Number(payload.deaths || 0),
      assists: Number(payload.assists || 0),
      accuracy: Number(payload.accuracy || 0),
      placement: payload.placement ?? null,
      duration: Number(payload.duration || 0),
      notes: payload.notes || '',
      playedAt: payload.playedAt || new Date().toISOString()
    });
    res.status(201).json({ match });
  } catch (error) { next(error); }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { gameSlug, limit = 20 } = req.query;
    const matches = await Match.findByUser(req.user.userId, { gameSlug, limit: Number(limit) || 20 });
    res.json({ matches });
  } catch (error) { next(error); }
});


router.post('/:id/analyze', authMiddleware, async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match || match.userId !== req.user.userId) return res.status(404).json({ error: 'Match not found' });

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
    if (!apiKey) return res.status(500).json({ error: 'OpenRouter API key not configured' });

    const prompt = `Analyze this esports match and return JSON with keys: wentWell, improve, drill.\nMatch: ${JSON.stringify(match)}`;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://gamerise.app',
        'X-Title': 'GameRise Match Analysis'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a pro esports analyst. Return concise JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4
      })
    });

    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content || '{}';
    let analysis;
    try { analysis = JSON.parse(raw); }
    catch {
      analysis = { wentWell: raw, improve: 'Focus on consistency and map awareness.', drill: '10-minute aim + positioning VOD review.' };
    }

    await Match.markAnalyzed(match.matchId, analysis);
    res.json({ analysis });
  } catch (error) { next(error); }
});

module.exports = router;
