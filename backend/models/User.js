const { docClient } = require('../config/db');
const { PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcrypt');

const TABLE_NAME = process.env.DYNAMO_TABLE_USERS;

class User {
  static async create({ username, email, password, role = 'player' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      userId, username, email, passwordHash, role,
      createdAt: new Date().toISOString(),
      displayName: username, bio: '', mainGames: [], roles: [], specialties: [], country: '', city: '',
      socialLinks: { youtube: '', twitch: '', instagram: '', twitter: '' },
      isOpenToOffers: false, profileVisibility: 'public'
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: user, ConditionExpression: 'attribute_not_exists(email)' }));
    return user;
  }

  static async findByEmail(email) {
    const result = await docClient.send(new QueryCommand({ TableName: TABLE_NAME, IndexName: 'email-index', KeyConditionExpression: 'email = :email', ExpressionAttributeValues: { ':email': email } }));
    return result.Items?.[0] || null;
  }

  static async findByUsername(username) {
    const result = await docClient.send(new QueryCommand({ TableName: TABLE_NAME, IndexName: 'username-index', KeyConditionExpression: 'username = :username', ExpressionAttributeValues: { ':username': username } }));
    return result.Items?.[0] || null;
  }

  static async updateProfile(userId, profile) {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: 'SET displayName=:displayName, bio=:bio, mainGames=:mainGames, roles=:roles, specialties=:specialties, country=:country, city=:city, socialLinks=:socialLinks, isOpenToOffers=:isOpenToOffers, profileVisibility=:profileVisibility',
      ExpressionAttributeValues: {
        ':displayName': profile.displayName || '', ':bio': profile.bio || '', ':mainGames': profile.mainGames || [], ':roles': profile.roles || [], ':specialties': profile.specialties || [], ':country': profile.country || '', ':city': profile.city || '',
        ':socialLinks': profile.socialLinks || { youtube: '', twitch: '', instagram: '', twitter: '' }, ':isOpenToOffers': !!profile.isOpenToOffers, ':profileVisibility': profile.profileVisibility || 'public'
      }
    }));
  }

  static async comparePassword(plainPassword, hashedPassword) { return bcrypt.compare(plainPassword, hashedPassword); }
}

module.exports = User;
