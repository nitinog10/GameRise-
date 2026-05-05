const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const IntegrationConfig = require('../models/IntegrationConfig');
const router = express.Router();

router.post('/ingest', async (req,res,next)=>{
  try{
    if(req.headers['x-observer-key'] !== process.env.OBSERVER_SERVICE_KEY) return res.status(401).json({error:'Unauthorized observer key'});
    const p=req.body;
    const match=await Match.create({ userId:p.userId, gameSlug:p.gameSlug, result:p.result, kills:p.kills||0, deaths:p.deaths||0, assists:p.assists||0, accuracy:p.accuracy||0, placement:p.placement||null, duration:p.duration||0, notes:p.notes||'', playedAt:p.playedAt||new Date().toISOString(), analyzed:false, source:'observer_auto', liveData:p.liveData||null });
    await Notification.create({ userId:p.userId, type:'match_analyzed', message:'Your match has been analyzed', link:'/dashboard' });
    if(req.app.get('io')) req.app.get('io').to(p.userId).emit('observer_update', { type:'match_ingested', match });
    res.status(201).json({ match });
  }catch(e){next(e);} 
});

router.post('/integrations', authMiddleware, async (req,res,next)=>{
  try{ const integration=await IntegrationConfig.create({ userId:req.user.userId, ...req.body }); res.status(201).json({ integration }); }catch(e){next(e);} 
});

router.get('/integrations', authMiddleware, async (req,res,next)=>{
  try{ const integrations=await IntegrationConfig.listByUser(req.user.userId); res.json({ integrations }); }catch(e){next(e);} 
});

module.exports=router;
