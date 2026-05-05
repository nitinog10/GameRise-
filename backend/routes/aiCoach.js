const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { authMiddleware } = require('../middleware/auth');
const { buildGameContext } = require('../services/gameContext');
const CoachSession = require('../models/CoachSession');

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SYSTEM_PROMPT_BASE = `You are GameRise AI Coach, an expert esports analyst and coach for competitive gaming in India.
You help players improve their skills, tactics, and mental game.
Use the following game data to answer questions accurately.
Always give structured, actionable advice. Keep responses under 200 words unless asked for detail.
Be encouraging but direct. Always end with a specific drill or action item the player can practice.
Reference pro players and meta when relevant. Know the Indian esports context (BGMI tournaments, VCT India, Skyesports, etc.).
If asked about a game not in the data, give general esports advice and suggest the player explore the available games.`;

/**
 * POST /api/ai-coach - Stream AI coaching response via SSE
 * Body: { message, gameSlug?, conversationHistory[], sessionId? }
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { message, gameSlug, conversationHistory = [], sessionId } = req.body;
    const userId = req.user.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build game context
    const gameContext = buildGameContext(gameSlug || null, message);
    const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\n${gameContext}`;

    // Build messages array for Claude
    const claudeMessages = (conversationHistory || []).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add the current user message
    claudeMessages.push({
      role: 'user',
      content: message
    });

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Create or update session in background
    let currentSessionId = sessionId;
    const saveSession = async (assistantResponse) => {
      try {
        if (!currentSessionId) {
          const session = await CoachSession.create({ userId, gameSlug });
          currentSessionId = session.sessionId;
          // Send session ID to client
          res.write(`data: ${JSON.stringify({ type: 'session', sessionId: currentSessionId })}\n\n`);
        }

        await CoachSession.addMessage(currentSessionId, userId, {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        });

        await CoachSession.addMessage(currentSessionId, userId, {
          role: 'assistant',
          content: assistantResponse,
          timestamp: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('Failed to save session:', dbError.message);
      }
    };

    let fullResponse = '';

    try {
      // Stream from Claude API
      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: claudeMessages
      });

      stream.on('text', (text) => {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ type: 'token', text })}\n\n`);
      });

      stream.on('end', async () => {
        res.write(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`);
        res.end();

        // Save to DB in background
        await saveSession(fullResponse);
      });

      stream.on('error', (error) => {
        console.error('Claude stream error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'AI service error' })}\n\n`);
        res.end();
      });

    } catch (aiError) {
      console.error('Claude API error:', aiError.message);
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to connect to AI service' })}\n\n`);
      res.end();
    }

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-coach/sessions - Get recent coaching sessions for the user
 */
router.get('/sessions', authMiddleware, async (req, res, next) => {
  try {
    const sessions = await CoachSession.findRecentByUserId(req.user.userId);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-coach/sessions/:sessionId - Get a specific session
 */
router.get('/sessions/:sessionId', authMiddleware, async (req, res, next) => {
  try {
    const session = await CoachSession.findById(req.params.sessionId);
    if (!session || session.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
