const { docClient } = require('../config/db');
const { PutCommand, QueryCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMO_TABLE_INTEGRATIONS || 'gamerise-integrations';

const buildUpdate = (updates = {}) => {
  const entries = Object.entries(updates).filter(([, value]) => value !== undefined);
  if (!entries.length) return null;
  const names = {};
  const values = {};
  const sets = entries.map(([key, value], idx) => {
    const nameKey = `#k${idx}`;
    const valueKey = `:v${idx}`;
    names[nameKey] = key;
    values[valueKey] = value;
    return `${nameKey} = ${valueKey}`;
  });
  return {
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values
  };
};

class IntegrationConfig {
  static async create(item) {
    const rec = {
      integrationId: `int_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      isActive: true,
      status: 'pending',
      lastSyncAt: null,
      lastIngestAt: null,
      lastError: '',
      createdAt: new Date().toISOString(),
      ...item
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: rec }));
    return rec;
  }

  static async findById(integrationId) {
    const out = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { integrationId } }));
    return out.Item || null;
  }

  static async update(integrationId, updates = {}) {
    const update = buildUpdate({ ...updates, updatedAt: new Date().toISOString() });
    if (!update) return null;
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { integrationId },
      ...update,
      ReturnValues: 'ALL_NEW'
    }));
    return result.Attributes || null;
  }

  static async updateStatus(integrationId, updates = {}) {
    return IntegrationConfig.update(integrationId, updates);
  }

  static async listByUser(userId) {
    const out = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId=:u',
      ExpressionAttributeValues: { ':u': userId }
    }));
    return out.Items || [];
  }

  static async listActive() {
    const out = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'isActive-index',
      KeyConditionExpression: 'isActive=:a',
      ExpressionAttributeValues: { ':a': true }
    }));
    return out.Items || [];
  }
}

module.exports = IntegrationConfig;
