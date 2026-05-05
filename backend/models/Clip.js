const { docClient } = require('../config/db');
const { PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const TABLE_NAME = process.env.DYNAMO_TABLE_CLIPS || 'gamerise-clips';
class Clip {
  static async create(item){ const rec={ clipId:`clip_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, upvotes:0, createdAt:new Date().toISOString(), ...item }; await docClient.send(new PutCommand({TableName:TABLE_NAME,Item:rec})); return rec; }
  static async listByGame(game){ const out=await docClient.send(new QueryCommand({TableName:TABLE_NAME,IndexName:'game-index',KeyConditionExpression:'game=:g',ExpressionAttributeValues:{':g':game||'valorant'}})); return out.Items||[]; }
  static async upvote(clipId){ await docClient.send(new UpdateCommand({TableName:TABLE_NAME,Key:{clipId},UpdateExpression:'SET upvotes = if_not_exists(upvotes,:z) + :o',ExpressionAttributeValues:{':o':1,':z':0}})); }
}
module.exports=Clip;
