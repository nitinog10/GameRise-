const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const DailyGoal = require('../models/DailyGoal');

const router = express.Router();

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { date, goals } = req.body;
    const goal = await DailyGoal.create({ userId: req.user.userId, date, goals: goals || [] });
    res.status(201).json({ goal });
  } catch (error) { next(error); }
});

router.put('/:id/progress', authMiddleware, async (req, res, next) => {
  try {
    await DailyGoal.updateProgress(req.params.id, req.body.goals || []);
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const goals = await DailyGoal.findByUser(req.user.userId, Number(req.query.limit) || 10);
    res.json({ goals });
  } catch (error) { next(error); }
});

module.exports = router;
