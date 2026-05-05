const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const TeamLfg = require('../models/TeamLfg');
const Tip = require('../models/Tip');
const Clip = require('../models/Clip');
const Notification = require('../models/Notification');
const router = express.Router();

router.get('/teams/lfg', authMiddleware, async (req,res,next)=>{ try{ const { game='valorant', role, rank }=req.query; let items=await TeamLfg.listByGame(game); if(role) items=items.filter(i=>(i.rolesWanted||[]).includes(role)); if(rank) items=items.filter(i=>(i.rank||'').toLowerCase().includes(String(rank).toLowerCase())); res.json({ listings:items }); }catch(e){next(e);} });
router.post('/teams/lfg', authMiddleware, async (req,res,next)=>{ try{ const listing=await TeamLfg.create({ userId:req.user.userId, ...req.body}); res.status(201).json({ listing }); }catch(e){next(e);} });

router.get('/tips', authMiddleware, async (req,res,next)=>{ try{ const { game='valorant', sort='trending' }=req.query; let tips=await Tip.listByGame(game); if(sort==='new') tips=tips.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); else if(sort==='top') tips=tips.sort((a,b)=>(b.upvotes||0)-(a.upvotes||0)); else tips=tips.sort((a,b)=>((b.upvotes||0)/(1+((Date.now()-new Date(b.createdAt))/86400000)))-((a.upvotes||0)/(1+((Date.now()-new Date(a.createdAt))/86400000)))); res.json({ tips }); }catch(e){next(e);} });
router.post('/tips', authMiddleware, async (req,res,next)=>{ try{ const tip=await Tip.create({ author:req.user.userId, ...req.body}); res.status(201).json({ tip }); }catch(e){next(e);} });
router.put('/tips/:id/upvote', authMiddleware, async (req,res,next)=>{ try{ await Tip.upvote(req.params.id); if(req.body.authorId) await Notification.create({ userId:req.body.authorId, type:'tip_upvote', message:'Someone upvoted your tip', link:'/community/tips' }); res.json({ success:true }); }catch(e){next(e);} });

router.get('/clips', authMiddleware, async (req,res,next)=>{ try{ const clips=await Clip.listByGame(req.query.game||'valorant'); res.json({ clips:clips.sort((a,b)=>(b.upvotes||0)-(a.upvotes||0)) }); }catch(e){next(e);} });
router.post('/clips', authMiddleware, async (req,res,next)=>{ try{ const clip=await Clip.create({ author:req.user.userId, ...req.body}); res.status(201).json({ clip }); }catch(e){next(e);} });
router.put('/clips/:id/upvote', authMiddleware, async (req,res,next)=>{ try{ await Clip.upvote(req.params.id); res.json({ success:true }); }catch(e){next(e);} });

router.get('/notifications', authMiddleware, async (req,res,next)=>{ try{ const notifications=await Notification.listByUser(req.user.userId); res.json({ notifications, unread:notifications.filter(n=>!n.read).length }); }catch(e){next(e);} });
router.put('/notifications/:id/read', authMiddleware, async (req,res,next)=>{ try{ await Notification.markRead(req.params.id); res.json({ success:true }); }catch(e){next(e);} });

module.exports = router;
