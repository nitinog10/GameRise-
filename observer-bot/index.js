require('dotenv').config({ path: process.env.OBSERVER_ENV_FILE || '.env' });
const axios = require('axios');
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';
const MODE = process.env.OBSERVER_MODE || 'mock';

async function get_match_result(integration){
  if(MODE==='live' && integration.game==='valorant' && integration.apiKey){
    return { userId: integration.userId, gameSlug:'valorant', result:'win', kills:17, deaths:9, assists:4, accuracy:31, placement:1, duration:34, notes:'Live API placeholder', playedAt:new Date().toISOString(), liveData:{ zone:'N/A', teamHealth:100 } };
  }
  return { userId: integration.userId, gameSlug:integration.game||'bgmi', result:Math.random()>0.5?'win':'loss', kills:Math.floor(Math.random()*15), deaths:Math.floor(Math.random()*10)+1, assists:Math.floor(Math.random()*8), accuracy:Math.floor(Math.random()*60)+20, placement:Math.floor(Math.random()*100)+1, duration:Math.floor(Math.random()*30)+15, notes:'Mock simulated match', playedAt:new Date().toISOString(), liveData:{ zone:'Zone 5', teamHealth:Math.floor(Math.random()*100) } };
}
async function get_live_match(integration){ return { userId:integration.userId, gameSlug:integration.game, kills:Math.floor(Math.random()*10), placement:Math.floor(Math.random()*50), zone:'Zone 3', teamHealth:Math.floor(Math.random()*100) }; }
async function get_player_rank(){ return { rank: 'Gold 2' }; }
async function analyze_replay(){ return { status:'queued' }; }

async function run(){
  const { data } = await axios.get(`${BACKEND}/api/observer/integrations`, { headers: { Authorization:`Bearer ${process.env.OBSERVER_USER_TOKEN||''}` } }).catch(()=>({data:{integrations:[{userId:process.env.MOCK_USER_ID||'user_mock',game:'bgmi',apiKey:'',region:'ap'}]}}));
  for(const integration of data.integrations){
    const live = await get_live_match(integration);
    await axios.post(`${BACKEND}/api/observer/ingest`, { ...await get_match_result(integration), liveData: live }, { headers: { 'x-observer-key': process.env.OBSERVER_SERVICE_KEY || 'dev-observer-key' } }).catch((e)=>console.error('ingest error', e.response?.data||e.message));
  }
}

setInterval(run, 5 * 60 * 1000);
run();
module.exports = { get_match_result, get_live_match, get_player_rank, analyze_replay };
