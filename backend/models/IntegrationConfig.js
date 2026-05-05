const { docClient } = require('../config/db');
const { PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const TABLE_NAME = process.env.DYNAMO_TABLE_INTEGRATIONS || 'gamerise-integrations';
class IntegrationConfig {
 static async create(item){ const rec={ integrationId:`int_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, isActive:true, lastSyncAt:null, ...item }; await docClient.send(new PutCommand({TableName:TABLE_NAME,Item:rec})); return rec; }
 static async listByUser(userId){ const out=await docClient.send(new QueryCommand({TableName:TABLE_NAME,IndexName:'userId-index',KeyConditionExpression:'userId=:u',ExpressionAttributeValues:{':u':userId}})); return out.Items||[]; }
 static async listActive(){ const out=await docClient.send(new QueryCommand({TableName:TABLE_NAME,IndexName:'isActive-index',KeyConditionExpression:'isActive=:a',ExpressionAttributeValues:{':a':true}})); return out.Items||[]; }
}
module.exports=IntegrationConfig;
