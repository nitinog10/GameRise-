const express = require('express');
const Game = require('../models/Game');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const games = await Game.findAll();
    res.json({ games });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const game = await Game.findBySlug(req.params.slug);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ game });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json({ message: 'Game created', game });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
