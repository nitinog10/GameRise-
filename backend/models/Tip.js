const { docClient } = require('../config/db');
const { PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const TABLE_NAME = process.env.DYNAMO_TABLE_TIPS || 'gamerise-tips';
class Tip {
  static async create(item){ const rec={ tipId:`tip_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, upvotes:0, createdAt:new Date().toISOString(), ...item }; await docClient.send(new PutCommand({TableName:TABLE_NAME,Item:rec})); return rec; }
  static async listByGame(game){ const out=await docClient.send(new QueryCommand({TableName:TABLE_NAME,IndexName:'game-index',KeyConditionExpression:'game=:g',ExpressionAttributeValues:{':g':game||'valorant'}})); return out.Items||[]; }
  static async upvote(tipId){ await docClient.send(new UpdateCommand({TableName:TABLE_NAME,Key:{tipId},UpdateExpression:'SET upvotes = if_not_exists(upvotes,:z) + :o',ExpressionAttributeValues:{':o':1,':z':0}})); }
}
module.exports=Tip;
