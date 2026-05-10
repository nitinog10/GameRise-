const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const IntegrationConfig = require('../models/IntegrationConfig');
const { getIntegrationCatalog, getIntegrationBySlug } = require('../services/integrationCatalog');
const { normalizeObserverPayload } = require('../services/matchIngestion');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const updateIntegrationStatus = async (integrationId, updates) => {
  if (!integrationId) return;
  try {
    await IntegrationConfig.updateStatus(integrationId, updates);
  } catch (error) {
    console.error('Observer integration status update failed', error.message || error);
  }
};

router.post('/ingest', rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-observer-key'] || req.ip
}), async (req, res, next) => {
  const payload = req.body || {};
  try {
    if (req.headers['x-observer-key'] !== process.env.OBSERVER_SERVICE_KEY) {
      return res.status(401).json({ error: 'Unauthorized observer key' });
    }
    const normalized = normalizeObserverPayload(payload);
    if (!normalized.userId) return res.status(400).json({ error: 'userId is required for observer ingest' });
    const match = await Match.create({ ...normalized, analyzed: false });
    await Notification.create({
      userId: normalized.userId,
      type: 'match_analyzed',
      message: 'Your match has been analyzed',
      link: '/dashboard'
    });
    await updateIntegrationStatus(normalized.integrationId, {
      status: 'ok',
      lastError: '',
      lastSyncAt: new Date().toISOString(),
      lastIngestAt: new Date().toISOString()
    });
    if (req.app.get('io')) req.app.get('io').to(normalized.userId).emit('observer_update', { type: 'match_ingested', match });
    res.status(201).json({ match });
  } catch (e) {
    await updateIntegrationStatus(payload.integrationId, {
      status: 'error',
      lastError: e.message || 'Observer ingest failed',
      lastSyncAt: new Date().toISOString()
    });
    next(e);
  }
});

router.get('/catalog', (req, res) => {
  res.json({ catalog: getIntegrationCatalog() });
});

router.post('/integrations', authMiddleware, rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip
}), async (req, res, next) => {
  try {
    const payload = req.body || {};
    const gameSlug = payload.gameSlug || payload.game;
    const catalog = getIntegrationBySlug(gameSlug);
    const integration = await IntegrationConfig.create({
      userId: req.user.userId,
      gameSlug,
      game: gameSlug,
      gameName: catalog?.name || payload.gameName || gameSlug,
      provider: payload.provider || catalog?.provider || 'observer-bot',
      hasOfficialApi: payload.hasOfficialApi ?? catalog?.hasOfficialApi ?? false,
      accountId: payload.accountId || payload.inGameUsername || '',
      inGameUsername: payload.inGameUsername || payload.accountId || '',
      apiKey: payload.apiKey || '',
      region: payload.region || 'ap',
      platform: payload.platform || '',
      isActive: payload.isActive ?? true,
      captureMethod: payload.captureMethod || (catalog?.hasOfficialApi ? 'api' : 'observer-bot'),
      status: 'pending'
    });
    res.status(201).json({ integration });
  } catch (e) {
    next(e);
  }
});

router.get('/integrations', authMiddleware, rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip
}), async (req, res, next) => {
  try {
    const integrations = await IntegrationConfig.listByUser(req.user.userId);
    res.json({ integrations });
  } catch (e) {
    next(e);
  }
});

router.patch('/integrations/:id', authMiddleware, rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip
}), async (req, res, next) => {
  try {
    const integration = await IntegrationConfig.findById(req.params.id);
    if (!integration || integration.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    const updates = { ...req.body };
    delete updates.userId;
    delete updates.integrationId;
    if (updates.gameSlug && !updates.game) updates.game = updates.gameSlug;
    const updated = await IntegrationConfig.update(req.params.id, updates);
    res.json({ integration: updated });
  } catch (e) {
    next(e);
  }
});

router.post('/integrations/:id/status', rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-observer-key'] || req.ip
}), async (req, res, next) => {
  try {
    if (req.headers['x-observer-key'] !== process.env.OBSERVER_SERVICE_KEY) {
      return res.status(401).json({ error: 'Unauthorized observer key' });
    }
    const updates = { ...req.body };
    delete updates.integrationId;
    const updated = await IntegrationConfig.updateStatus(req.params.id, updates);
    res.json({ integration: updated });
  } catch (e) {
    next(e);
  }
});

module.exports=router;
