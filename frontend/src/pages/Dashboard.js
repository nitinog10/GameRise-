import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import Navigation from '../components/Navigation';
import api from '../utils/axios';

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [chartData, setChartData] = useState([]);
  const [matches, setMatches] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const [myTournaments, setMyTournaments] = useState([]);
  const [liveMatch, setLiveMatch] = useState(null);
  const [form, setForm] = useState({ gameSlug: 'valorant', result: 'win', kills: 0, deaths: 0, assists: 0, accuracy: 50, duration: 20, notes: '' });

  const fetchAll = async () => {
    const [s, c, m, g, t] = await Promise.all([
      api.get('/api/stats/summary'),
      api.get('/api/stats/chart?range=30d'),
      api.get('/api/matches?limit=20'),
      api.get('/api/goals?limit=5'),
      api.get('/api/tournaments')
    ]);
    setSummary(s.data); setChartData(c.data.chart || []); setMatches(m.data.matches || []); setGoals(g.data.goals || []); setMyTournaments((t.data.tournaments||[]).filter(x=>(x.registeredPlayers||[]).includes(localStorage.getItem('userId')||'')));
  };

  useEffect(() => { fetchAll().catch(console.error); const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000'); const userId = JSON.parse(atob((localStorage.getItem('token')||'.').split('.')[1]||'e30=')).userId; socket.emit('register_user', userId); socket.on('observer_update', (payload) => { if (payload.match?.liveData) setLiveMatch(payload.match.liveData); fetchAll(); }); return () => socket.close(); }, []);

  const perGame = useMemo(() => {
    const map = {};
    matches.forEach((m) => {
      map[m.gameSlug] = map[m.gameSlug] || { game: m.gameSlug, wins: 0, losses: 0 };
      if (m.result === 'win') map[m.gameSlug].wins++; else map[m.gameSlug].losses++;
    });
    return Object.values(map);
  }, [matches]);

  const submitMatch = async (e) => {
    e.preventDefault();
    await api.post('/api/matches', form);
    setShowModal(false);
    fetchAll();
  };

  const runAnalysis = async (id) => {
    const { data } = await api.post(`/api/matches/${id}/analyze`);
    setAnalysis(data.analysis);
    fetchAll();
  };

  return <div className="min-h-screen bg-[#1a1a24] text-white"><Navigation /><div className="max-w-7xl mx-auto pt-24 px-4 pb-10">
    <div className="flex justify-between items-center mb-4"><h1 className="text-2xl font-bold">Player Dashboard</h1><button className="btn-primary" onClick={()=>setShowModal(true)}>Log Match</button></div>
    {liveMatch && <div className="bg-[#102019] border border-[#00ff88]/40 rounded-xl p-4 mb-4"><div className="animate-pulse text-[#00ff88] text-sm">Match in progress</div><div className="grid grid-cols-4 gap-2 mt-2 text-sm"><div>Kills: {liveMatch.kills}</div><div>Placement: {liveMatch.placement}</div><div>Zone: {liveMatch.zone}</div><div>Team HP: {liveMatch.teamHealth}</div></div></div>}

    <div className="grid md:grid-cols-4 gap-4 mb-6">{[
      ['Total matches', summary.totalMatches || 0],
      ['Win rate', `${(summary.winRate || 0).toFixed(1)}%`],
      ['Avg K/D', (summary.avgKD || 0).toFixed(2)],
      ['Best game', summary.bestGame || '-']
    ].map(([k,v]) => <div key={k} className="bg-black/20 rounded-xl p-4"><div className="text-gray-400 text-sm">{k}</div><div className="text-2xl font-semibold">{v}</div></div>)}</div>

    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-black/20 rounded-xl p-4 h-80"><h3 className="mb-2">K/D Ratio (last 14/30 days)</h3><ResponsiveContainer width="100%" height="90%"><LineChart data={chartData}><CartesianGrid stroke="#2a2a38"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Line type="monotone" dataKey="kd" stroke="#00ff88"/></LineChart></ResponsiveContainer></div>
      <div className="bg-black/20 rounded-xl p-4 h-80"><h3 className="mb-2">Wins vs Losses per Game</h3><ResponsiveContainer width="100%" height="90%"><BarChart data={perGame}><CartesianGrid stroke="#2a2a38"/><XAxis dataKey="game"/><YAxis/><Tooltip/><Legend/><Bar dataKey="wins" fill="#00ff88"/><Bar dataKey="losses" fill="#ff4466"/></BarChart></ResponsiveContainer></div>
    </div>

    <div className="bg-black/20 rounded-xl p-4 mb-6 overflow-x-auto"><h3 className="mb-3">Recent Matches</h3><table className="w-full text-sm"><thead><tr className="text-gray-400"><th>Game</th><th>Result</th><th>KDA</th><th>Date</th><th></th></tr></thead><tbody>{matches.map(m=><tr key={m.matchId} className="border-t border-white/10"><td>{m.gameSlug}</td><td><span className={m.result==='win'?'text-green-400':'text-red-400'}>{m.result==='win'?'W':'L'}</span></td><td>{m.kills}/{m.deaths}/{m.assists}</td><td>{new Date(m.playedAt).toLocaleDateString()}</td><td><button onClick={()=>runAnalysis(m.matchId)} className="text-neon">Analyze</button></td></tr>)}</tbody></table></div>

    <div className="bg-black/20 rounded-xl p-4 mb-6"><h3 className="mb-3">Daily Goals</h3>{goals[0]?.goals?.map((g, i) => <div key={i} className="mb-3"><div className="flex justify-between text-sm"><span>{g.title}</span><span>{g.current}/{g.target} {g.unit}</span></div><div className="w-full bg-[#2a2a38] h-2 rounded"><div className="bg-[#00ff88] h-2 rounded" style={{width:`${Math.min(100, (g.current/g.target)*100 || 0)}%`}} /></div></div>) || <p className="text-gray-400">No goals yet.</p>}</div>

    <div className="bg-black/20 rounded-xl p-4 mb-6"><h3 className="mb-3">My Tournaments</h3>{myTournaments.map(t=><div key={t.tournamentId} className="border-t border-white/10 py-2 flex justify-between"><span>{t.name}</span><span>{t.status}</span></div>)}</div>


    {analysis && <div className="bg-black/30 rounded-xl p-4"><h3 className="mb-2">Match Analysis</h3><p><strong>What went well:</strong> {analysis.wentWell}</p><p><strong>What to improve:</strong> {analysis.improve}</p><p><strong>Drill to try:</strong> {analysis.drill}</p></div>}
  </div>

  {showModal && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"><form onSubmit={submitMatch} className="bg-[#1a1a24] border border-white/10 rounded-xl p-5 w-full max-w-lg space-y-3"><h2 className="text-lg font-semibold">Log Match</h2>
    <input className="input" placeholder="Game slug" value={form.gameSlug} onChange={e=>setForm({...form,gameSlug:e.target.value})}/>
    <div className="flex gap-2"><button type="button" className={`px-3 py-1 rounded ${form.result==='win'?'bg-green-600':'bg-gray-700'}`} onClick={()=>setForm({...form,result:'win'})}>Win</button><button type="button" className={`px-3 py-1 rounded ${form.result==='loss'?'bg-red-600':'bg-gray-700'}`} onClick={()=>setForm({...form,result:'loss'})}>Loss</button></div>
    <div className="grid grid-cols-3 gap-2"><input type="number" className="input" placeholder="Kills" value={form.kills} onChange={e=>setForm({...form,kills:Number(e.target.value)})}/><input type="number" className="input" placeholder="Deaths" value={form.deaths} onChange={e=>setForm({...form,deaths:Number(e.target.value)})}/><input type="number" className="input" placeholder="Assists" value={form.assists} onChange={e=>setForm({...form,assists:Number(e.target.value)})}/></div>
    <label>Accuracy: {form.accuracy}%<input type="range" min="0" max="100" value={form.accuracy} onChange={e=>setForm({...form,accuracy:Number(e.target.value)})} className="w-full"/></label>
    <input type="number" className="input" placeholder="Duration (min)" value={form.duration} onChange={e=>setForm({...form,duration:Number(e.target.value)})}/>
    <textarea className="input" placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
    <div className="flex justify-end gap-2"><button type="button" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn-primary">Submit</button></div>
  </form></div>}
  </div>;
};

export default Dashboard;
