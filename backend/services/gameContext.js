const fs = require('fs');
const path = require('path');

let gamesData = {};

/**
 * Load all game JSON files from /data/games/ into memory at server startup
 */
function loadGameData() {
  const gamesDir = path.join(__dirname, '../../data/games');

  try {
    const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(gamesDir, file);
      const gameData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      // Skip files that don't have a top-level slug (e.g. placeholder.json)
      if (!gameData.slug || !gameData.name) continue;
      gamesData[gameData.slug] = gameData;
    }

    console.log(`✓ Loaded ${Object.keys(gamesData).length} game(s) into context memory`);
  } catch (error) {
    console.error('Failed to load game data:', error.message);
  }
}

/**
 * Build context string for the AI coach prompt
 * @param {string|null} gameSlug - Optional game slug to focus context
 * @param {string} userMessage - The user's message (used for keyword matching if no slug)
 * @returns {string} Formatted game data context
 */
function buildGameContext(gameSlug, userMessage) {
  // If a specific game is selected, provide detailed context for that game
  if (gameSlug && gamesData[gameSlug]) {
    return formatGameDetail(gamesData[gameSlug]);
  }

  // If no game specified, try to detect from user message
  if (!gameSlug && userMessage) {
    const messageLower = userMessage.toLowerCase();
    for (const [slug, data] of Object.entries(gamesData)) {
      const gameName = data.name.toLowerCase();
      if (messageLower.includes(gameName) || messageLower.includes(slug)) {
        return formatGameDetail(data);
      }
    }
  }

  // No specific game — provide general context from all games
  return formatAllGamesSummary();
}

/**
 * Format a single game's full data for detailed context
 */
function formatGameDetail(game) {
  let context = `## ${game.name} (${game.genre})\n`;
  context += `Description: ${game.description}\n`;
  context += `Difficulty: ${game.difficulty}\n\n`;

  if (game.roles && game.roles.length > 0) {
    context += `### Roles\n`;
    for (const role of game.roles) {
      context += `- **${role.name}**: ${role.description}`;
      if (role.agents && role.agents.length > 0) {
        context += ` (Agents: ${role.agents.join(', ')})`;
      }
      context += `\n`;
    }
    context += `\n`;
  }

  if (game.maps && game.maps.length > 0) {
    context += `### Maps & Tips\n`;
    for (const map of game.maps) {
      context += `- **${map.name}**: ${map.tips.join('; ')}\n`;
    }
    context += `\n`;
  }

  if (game.mechanics && game.mechanics.length > 0) {
    context += `### Core Mechanics\n`;
    context += game.mechanics.map(m => `- ${m}`).join('\n');
    context += `\n\n`;
  }

  if (game.proStrategies && game.proStrategies.length > 0) {
    context += `### Pro Strategies\n`;
    for (const strat of game.proStrategies) {
      context += `- **${strat.title}**: ${strat.description}\n`;
    }
    context += `\n`;
  }

  if (game.tips && game.tips.length > 0) {
    context += `### Essential Tips\n`;
    context += game.tips.map(t => `- ${t}`).join('\n');
    context += `\n`;
  }

  return context;
}

/**
 * Format a summary of all games for general context
 */
function formatAllGamesSummary() {
  let context = `## Available Games Overview\n\n`;

  for (const data of Object.values(gamesData)) {
    context += `### ${data.name} (${data.genre})\n`;
    context += `${data.description}\n`;
    if (data.tips && data.tips.length > 0) {
      context += `Key tips: ${data.tips.slice(0, 3).join('; ')}\n`;
    }
    context += `\n`;
  }

  context += `\nGeneral esports tips: Practice consistently, review your gameplay, communicate with your team, stay updated on meta changes, and maintain physical and mental health for peak performance.`;

  return context;
}

/**
 * Get list of available game slugs
 */
function getAvailableGameSlugs() {
  return Object.keys(gamesData);
}

module.exports = {
  loadGameData,
  buildGameContext,
  getAvailableGameSlugs
};
