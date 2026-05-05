import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axios';
import Navigation from '../components/Navigation';

export default function TournamentDetail() {
  const { id } = useParams();
  const [data, setData] = useState({ tournament: null, leaderboard: [] });
  const [score, setScore] = useState('');

  const load = async () => setData((await api.get(`/api/tournaments/${id}`)).data);
  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (data.tournament?.status !== 'live') return;
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [data.tournament?.status]);

  const register = async () => { await api.post(`/api/tournaments/${id}/register`); load(); };
  const submitScore = async (e) => { e.preventDefault(); await api.put(`/api/tournaments/${id}/submit-score`, { resultScore: Number(score) }); setScore(''); load(); };

  const t = data.tournament;
  if (!t) return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation /><div className='pt-24 px-4'>Loading...</div></div>;
  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation /><div className='max-w-5xl mx-auto pt-24 px-4 pb-10'>
    <h1 className='text-2xl font-bold'>{t.name}</h1><p className='text-gray-400'>{t.gameSlug} • {t.type}</p>
    <details className='bg-black/20 p-3 rounded mt-3'><summary>Rules</summary><p className='mt-2 whitespace-pre-wrap'>{t.rules || 'No rules added.'}</p></details>
    <button onClick={register} className='btn-primary mt-4'>Register</button>
    {t.status==='live' && <form onSubmit={submitScore} className='mt-4 flex gap-2'><input className='input' value={score} onChange={e=>setScore(e.target.value)} placeholder='Submit score' /><button className='btn-primary'>Submit</button></form>}
    <div className='mt-6 bg-black/20 rounded p-4'><h2 className='font-semibold mb-2'>Live Leaderboard</h2>{data.leaderboard.map((r, i)=><div key={r.registrationId} className={`flex justify-between border-t border-white/10 py-2 ${i===0?'text-yellow-300':i===1?'text-gray-300':i===2?'text-amber-600':''}`}><span>{r.rank}. {r.userId} {r.rankChange>0?'↑':r.rankChange<0?'↓':'-'}</span><span>{r.resultScore||0}</span></div>)}</div>
  </div></div>;
}
