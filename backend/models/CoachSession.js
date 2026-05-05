const { docClient } = require('../config/db');
const { PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMO_TABLE_COACH_SESSIONS || 'gamerise-coach-sessions';

class CoachSession {
  /**
   * Create a new coaching session
   */
  static async create({ userId, gameSlug }) {
    const session = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      gameSlug: gameSlug || null,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: session
    }));

    return session;
  }

  /**
   * Add a message to an existing session
   */
  static async addMessage(sessionId, userId, message) {
    const params = {
      TableName: TABLE_NAME,
      Key: { sessionId },
      UpdateExpression: 'SET #messages = list_append(#messages, :message), #updatedAt = :now',
      ExpressionAttributeNames: {
        '#messages': 'messages',
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':message': [message],
        ':now': new Date().toISOString()
      },
      ConditionExpression: 'userId = :userId',
    };

    await docClient.send(new UpdateCommand(params));
  }

  /**
   * Get recent sessions for a user (last 5)
   */
  static async findRecentByUserId(userId) {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false,
      Limit: 5
    }));

    return result.Items || [];
  }

  /**
   * Get a session by ID
   */
  static async findById(sessionId) {
    const { GetCommand } = require('@aws-sdk/lib-dynamodb');
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { sessionId }
    }));

    return result.Item || null;
  }
}

module.exports = CoachSession;
