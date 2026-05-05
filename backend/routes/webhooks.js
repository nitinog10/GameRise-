const express = require('express');
const router = express.Router();

router.post('/discord-notify', async (req,res,next)=>{
  try{
    // payload: { eventType, message }
    // in production, call Discord webhook URL here.
    console.log('Discord notify:', req.body.eventType, req.body.message);
    res.json({ success:true });
  }catch(e){ next(e); }
});

module.exports = router;
