require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const Game = require('../models/Game');

const TABLE_NAME = process.env.DYNAMO_TABLE_GAMES || 'gamerise-games';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Wait for a DynamoDB table to become ACTIVE
 */
async function waitForTable(tableName, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await client.send(new DescribeTableCommand({ TableName: tableName }));
      if (result.Table.TableStatus === 'ACTIVE') return;
    } catch (err) {
      // Table not found yet, keep waiting
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error(`Table ${tableName} did not become active in time`);
}

/**
 * Create the games table if it doesn't exist
 */
async function ensureTableExists() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`✓ Table "${TABLE_NAME}" already exists`);
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`Creating table "${TABLE_NAME}"...`);

      await client.send(new CreateTableCommand({
        TableName: TABLE_NAME,
        KeySchema: [
          { AttributeName: 'gameId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'gameId', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }));

      console.log('Waiting for table to become active...');
      await waitForTable(TABLE_NAME);
      console.log(`✓ Table "${TABLE_NAME}" created and active`);
    } else {
      throw err;
    }
  }
}

const seedGames = async () => {
  try {
    // Ensure the DynamoDB table exists before seeding
    await ensureTableExists();

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
