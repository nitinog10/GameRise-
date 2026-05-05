const { docClient } = require('../config/db');
const { PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMO_TABLE_GOALS || 'gamerise-daily-goals';

class DailyGoal {
  static async create({ userId, date, goals }) {
    const goal = {
      goalId: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      userId,
      date,
      goals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: goal }));
    return goal;
  }

  static async findByUser(userId, limit = 10) {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false,
      Limit: limit
    }));
    return result.Items || [];
  }

  static async updateProgress(goalId, goals) {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { goalId },
      UpdateExpression: 'SET goals = :goals, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':goals': goals,
        ':updatedAt': new Date().toISOString()
      }
    }));
  }
}

module.exports = DailyGoal;
