const { docClient } = require('../config/db');
const { PutCommand, QueryCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMO_TABLE_MATCHES || 'gamerise-matches';

class Match {
  static async create(data) {
    const match = {
      matchId: `match_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      analyzed: false,
      createdAt: new Date().toISOString(),
      ...data
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: match }));
    return match;
  }

  static async findById(matchId) {
    const result = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { matchId } }));
    return result.Item || null;
  }

  static async findByUser(userId, { gameSlug, limit = 20 } = {}) {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false,
      Limit: Math.max(limit, 50)
    }));

    let items = result.Items || [];
    if (gameSlug) items = items.filter((m) => m.gameSlug === gameSlug);
    return items.slice(0, limit);
  }

  static async markAnalyzed(matchId, analysis) {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { matchId },
      UpdateExpression: 'SET analyzed = :analyzed, analysis = :analysis, analyzedAt = :analyzedAt',
      ExpressionAttributeValues: {
        ':analyzed': true,
        ':analysis': analysis,
        ':analyzedAt': new Date().toISOString()
      }
    }));
  }
}

module.exports = Match;
