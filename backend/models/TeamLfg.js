const { docClient } = require('../config/db');
const { PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const TABLE_NAME = process.env.DYNAMO_TABLE_TEAMS_LFG || 'gamerise-teams-lfg';
class TeamLfg {
  static async create(item){ const rec={ lfgId:`lfg_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, createdAt:new Date().toISOString(), ...item }; await docClient.send(new PutCommand({TableName:TABLE_NAME,Item:rec})); return rec; }
  static async listByGame(game){ const out=await docClient.send(new QueryCommand({TableName:TABLE_NAME,IndexName:'game-index',KeyConditionExpression:'game=:g',ExpressionAttributeValues:{':g':game||'valorant'}})); return out.Items||[]; }
}
module.exports=TeamLfg;
