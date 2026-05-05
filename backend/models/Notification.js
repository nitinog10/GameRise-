const { docClient } = require('../config/db');
const { PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const TABLE_NAME = process.env.DYNAMO_TABLE_NOTIFICATIONS || 'gamerise-notifications';
class Notification {
 static async create(item){ const rec={ notificationId:`noti_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, read:false, createdAt:new Date().toISOString(), ...item}; await docClient.send(new PutCommand({TableName:TABLE_NAME,Item:rec})); return rec; }
 static async listByUser(userId){ const out=await docClient.send(new QueryCommand({TableName:TABLE_NAME,IndexName:'userId-index',KeyConditionExpression:'userId=:u',ExpressionAttributeValues:{':u':userId},ScanIndexForward:false,Limit:50})); return out.Items||[]; }
 static async markRead(notificationId){ await docClient.send(new UpdateCommand({TableName:TABLE_NAME,Key:{notificationId},UpdateExpression:'SET #read=:r',ExpressionAttributeNames:{'#read':'read'},ExpressionAttributeValues:{':r':true}})); }
}
module.exports=Notification;
