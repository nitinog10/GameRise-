require('dotenv').config({ path: process.env.OBSERVER_ENV_FILE || '.env' });
const axios = require('axios');
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';
const MODE = process.env.OBSERVER_MODE || 'mock';

const buildMockPlayers = (integration) => {
  const base = [
    { username: integration.inGameUsername || 'You', team: 'Alpha', kills: 8, deaths: 4, assists: 3, accuracy: 32, damage: 1450 },
    { username: 'Rogue', team: 'Alpha', kills: 6, deaths: 5, assists: 2, accuracy: 28, damage: 1030 },
    { username: 'Nova', team: 'Bravo', kills: 5, deaths: 7, assists: 1, accuracy: 22, damage: 940 },
    { username: 'Viper', team: 'Bravo', kills: 4, deaths: 6, assists: 4, accuracy: 25, damage: 890 }
  ];
  return base.map((pl, idx) => ({
    ...pl,
    userId: idx === 0 ? integration.userId : `npc_${idx}`,
    placement: idx + 1
  }));
};

const buildMockCapture = (integration, matchContext) => ({
  meta: {
    map: matchContext.map,
    mode: matchContext.mode,
    duration: matchContext.duration
  },
  players: buildMockPlayers(integration),
  events: [
    { time: 30, type: 'start', actor: 'system', detail: 'Match start' },
    { time: 90, type: 'kill', actor: matchContext.inGameUsername || 'You', target: 'Rogue', detail: 'Opening duel' },
    { time: 480, type: 'zone', actor: 'system', detail: 'Zone shrink' },
    { time: 960, type: 'kill', actor: 'Viper', target: matchContext.inGameUsername || 'You', detail: 'Final fight' },
    { time: matchContext.duration * 60, type: 'end', actor: 'system', detail: 'Match end' }
  ],
  rawPackets: [
    '01 00 00 00 00 00 01 4D 61 74 63 68',
    '02 00 00 00 00 02 00 6B 69 6C 6C'
  ]
});

async function get_match_result(integration){
  const gameSlug = integration.gameSlug || integration.game || 'bgmi';
  if(MODE==='live' && gameSlug==='valorant' && integration.apiKey){
    return { userId: integration.userId, gameSlug:'valorant', result:'win', kills:17, deaths:9, assists:4, accuracy:31, placement:1, duration:34, map:'Ascent', mode:'Competitive', notes:'Live API placeholder', playedAt:new Date().toISOString() };
  }
  return {
    userId: integration.userId,
    gameSlug,
    result: Math.random()>0.5?'win':'loss',
    kills: Math.floor(Math.random()*15),
    deaths: Math.floor(Math.random()*10)+1,
    assists: Math.floor(Math.random()*8),
    accuracy: Math.floor(Math.random()*60)+20,
    placement: Math.floor(Math.random()*100)+1,
    duration: Math.floor(Math.random()*30)+15,
    map: 'Erangel',
    mode: 'Ranked',
    notes: 'Mock simulated match',
    playedAt: new Date().toISOString()
  };
}
async function get_live_match(integration){
  const gameSlug = integration.gameSlug || integration.game || 'bgmi';
  return { userId:integration.userId, gameSlug, kills:Math.floor(Math.random()*10), placement:Math.floor(Math.random()*50), zone:'Zone 3', teamHealth:Math.floor(Math.random()*100) };
}
async function get_player_rank(){ return { rank: 'Gold 2' }; }
async function analyze_replay(){ return { status:'queued' }; }

async function run(){
  const { data } = await axios.get(`${BACKEND}/api/observer/integrations`, { headers: { Authorization:`Bearer ${process.env.OBSERVER_USER_TOKEN||''}` } }).catch(()=>({data:{integrations:[{userId:process.env.MOCK_USER_ID||'user_mock',game:'bgmi',apiKey:'',region:'ap',hasOfficialApi:false,provider:'observer-bot'}]}}));
  for(const integration of data.integrations){
    const match = await get_match_result(integration);
    const live = await get_live_match(integration);
    const payload = {
      ...match,
      liveData: live,
      integrationId: integration.integrationId,
      provider: integration.provider || 'observer-bot',
      source: integration.hasOfficialApi ? 'api' : 'capture',
      inGameUsername: integration.inGameUsername
    };
    if (!integration.hasOfficialApi) {
      payload.capture = buildMockCapture(integration, { ...match, inGameUsername: integration.inGameUsername });
    }
    try {
      await axios.post(
        `${BACKEND}/api/observer/ingest`,
        payload,
        { headers: { 'x-observer-key': process.env.OBSERVER_SERVICE_KEY || 'dev-observer-key' } }
      );
      if (integration.integrationId) {
        await axios.post(
          `${BACKEND}/api/observer/integrations/${integration.integrationId}/status`,
          { status: 'ok', lastError: '', lastSyncAt: new Date().toISOString(), lastIngestAt: new Date().toISOString() },
          { headers: { 'x-observer-key': process.env.OBSERVER_SERVICE_KEY || 'dev-observer-key' } }
        );
      }
    } catch (e) {
      console.error('ingest error', e.response?.data||e.message);
      if (integration.integrationId) {
        await axios.post(
          `${BACKEND}/api/observer/integrations/${integration.integrationId}/status`,
          { status: 'error', lastError: e.response?.data?.error || e.message, lastSyncAt: new Date().toISOString() },
          { headers: { 'x-observer-key': process.env.OBSERVER_SERVICE_KEY || 'dev-observer-key' } }
        );
      }
    }
  }
}

setInterval(run, 5 * 60 * 1000);
run();
module.exports = { get_match_result, get_live_match, get_player_rank, analyze_replay };
