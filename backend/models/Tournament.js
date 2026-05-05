const { docClient } = require('../config/db');
const { PutCommand, QueryCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMO_TABLE_TOURNAMENTS || 'gamerise-tournaments';

class Tournament {
  static async create(data) {
    const item = {
      tournamentId: `tournament_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      registeredPlayers: [],
      results: [],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      ...data
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item;
  }

  static async findById(tournamentId) {
    const out = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { tournamentId } }));
    return out.Item || null;
  }

  static async list({ type, gameSlug, status, limit = 100 }) {
    const out = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'status-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status || 'upcoming' },
      ScanIndexForward: true,
      Limit: limit
    }));
    let items = out.Items || [];
    if (type) items = items.filter((t) => t.type === type);
    if (gameSlug) items = items.filter((t) => t.gameSlug === gameSlug);
    return items;
  }

  static async update(tournamentId, patch) {
    const names = {}; const values = {}; const set = [];
    Object.entries(patch).forEach(([k, v]) => { names[`#${k}`] = k; values[`:${k}`] = v; set.push(`#${k} = :${k}`); });
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { tournamentId },
      UpdateExpression: `SET ${set.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values
    }));
  }
}

module.exports = Tournament;
