const { docClient } = require('../config/db');
const { PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcrypt');

const TABLE_NAME = process.env.DYNAMO_TABLE_USERS;

class User {
  static async create({ username, email, password, role = 'player' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user = {
      userId,
      username,
      email,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)'
    }));

    return user;
  }

  static async findByEmail(email) {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    }));

    return result.Items?.[0] || null;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
