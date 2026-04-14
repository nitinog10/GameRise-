const { docClient } = require('../config/db');
const { PutCommand, GetCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMO_TABLE_GAMES || 'gamerise-games';

class Game {
  static async create(gameData) {
    const game = {
      gameId: `game_${Date.now()}`,
      slug: gameData.slug,
      ...gameData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: game
    }));

    return game;
  }

  static async findAll() {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'isActive = :active',
      ExpressionAttributeValues: { ':active': true },
      ProjectionExpression: '#name, slug, genre, coverImage, difficulty',
      ExpressionAttributeNames: { '#name': 'name' }
    }));

    return result.Items || [];
  }

  static async findBySlug(slug) {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'slug = :slug',
      ExpressionAttributeValues: { ':slug': slug }
    }));

    return result.Items?.[0] || null;
  }
}

module.exports = Game;
