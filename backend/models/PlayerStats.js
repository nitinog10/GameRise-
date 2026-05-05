const { docClient } = require('../config/db');
const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMO_TABLE_PLAYER_STATS || 'gamerise-player-stats';

class PlayerStats {
  static async upsert(stats) {
    const item = { ...stats, updatedAt: new Date().toISOString() };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item;
  }

  static async findByUserId(userId) {
    const out = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { userId } }));
    return out.Item || null;
  }
}

module.exports = PlayerStats;
