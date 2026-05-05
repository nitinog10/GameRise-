const express = require('express');
const https = require('https');
const { authMiddleware } = require('../middleware/auth');
const { buildGameContext } = require('../services/gameContext');
const CoachSession = require('../models/CoachSession');

const router = express.Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Build game context
    const gameContext = buildGameContext(gameSlug || null, message);
    const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\n${gameContext}`;

    // Build messages array for OpenRouter (OpenAI-compatible format)
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Track session for DB persistence
    let currentSessionId = sessionId;
    let fullResponse = '';

    const saveSession = async (assistantResponse) => {
      try {
        if (!currentSessionId) {
          const session = await CoachSession.create({ userId, gameSlug });
          currentSessionId = session.sessionId;
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

    // Build request to OpenRouter
    const requestBody = JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: apiMessages,
      stream: true,
      max_tokens: 1024
    });

    const url = new URL(OPENROUTER_API_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://gamerise.app',
        'X-Title': 'GameRise AI Coach',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const apiReq = https.request(options, (apiRes) => {
      let buffer = '';

      apiRes.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            res.write(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`);
            res.end();
            saveSession(fullResponse);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              fullResponse += content;
              res.write(`data: ${JSON.stringify({ type: 'token', text: content })}\n\n`);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      });

      apiRes.on('end', () => {
        // If we haven't sent 'done' yet (e.g., no [DONE] marker received)
        if (fullResponse) {
          res.write(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`);
          res.end();
          saveSession(fullResponse);
        } else {
          res.write(`data: ${JSON.stringify({ type: 'error', error: 'Empty response from AI service' })}\n\n`);
          res.end();
        }
      });

      apiRes.on('error', (error) => {
        console.error('OpenRouter response error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'AI service response error' })}\n\n`);
        res.end();
      });
    });

    apiReq.on('error', (error) => {
      console.error('OpenRouter request error:', error.message);
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to connect to AI service' })}\n\n`);
      res.end();
    });

    apiReq.write(requestBody);
    apiReq.end();

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
