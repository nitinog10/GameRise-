require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Game = require('../models/Game');

const seedGames = async () => {
  try {
    const gamesDir = path.join(__dirname, '../../data/games');
    const gameFiles = ['valorant.json', 'bgmi.json', 'codm.json'];

    for (const file of gameFiles) {
      const filePath = path.join(gamesDir, file);
      const gameData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      await Game.create(gameData);
      console.log(`✓ Seeded ${gameData.name}`);
    }

    console.log('\n✓ All games seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedGames();
