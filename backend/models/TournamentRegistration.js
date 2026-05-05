const { docClient } = require('../config/db');
const { PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMO_TABLE_TOURNAMENT_REGISTRATIONS || 'gamerise-tournament-registrations';

class TournamentRegistration {
  static async create(data) {
    const item = { registrationId: `reg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, registeredAt: new Date().toISOString(), ...data };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item;
  }

  static async listByTournament(tournamentId) {
    const out = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'tournamentId-index',
      KeyConditionExpression: 'tournamentId = :t',
      ExpressionAttributeValues: { ':t': tournamentId }
    }));
    return out.Items || [];
  }

  static async listByUser(userId) {
    const out = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: { ':u': userId },
      ScanIndexForward: false
    }));
    return out.Items || [];
  }

  static async setScore(registrationId, resultScore) {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { registrationId },
      UpdateExpression: 'SET resultScore = :s',
      ExpressionAttributeValues: { ':s': resultScore }
    }));
  }
}
module.exports = TournamentRegistration;
