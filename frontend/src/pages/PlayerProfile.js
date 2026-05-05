import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api from '../utils/axios';

const rankLabel = (score=0)=> score>5000?'Pro':score>3000?'Diamond':score>1500?'Gold':score>700?'Silver':'Bronze';

export default function PlayerProfile(){
  const { username } = useParams();
  const [profile,setProfile]=useState(null); const [stats,setStats]=useState(null); const [history,setHistory]=useState([]);
  useEffect(()=>{(async()=>{
    const p=await api.get(`/api/profile/${username}`); setProfile(p.data.profile);
    const s=await api.get(`/api/profile/${username}/stats`); setStats(s.data.stats);
    const h=await api.get(`/api/profile/${username}/history`); setHistory(h.data.history||[]);
  })().catch(console.error)},[username]);
  const completion = useMemo(()=>{ if(!profile) return 0; const checks=[profile.displayName,profile.bio,profile.mainGames?.length,profile.roles?.length,profile.specialties?.length,profile.country,profile.city,profile.socialLinks?.youtube||profile.socialLinks?.twitch||profile.socialLinks?.instagram||profile.socialLinks?.twitter]; return Math.round((checks.filter(Boolean).length/checks.length)*100);},[profile]);
  if(!profile||!stats) return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation/><div className='pt-24 px-4'>Loading...</div></div>;
  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation/><div className='max-w-6xl mx-auto pt-24 px-4 pb-10'>
    <div className='bg-black/20 rounded-2xl p-6 border' style={{borderColor:'#00ff88'}}><div className='flex justify-between'><div><div className='w-16 h-16 rounded-full bg-[#00ff88] text-black flex items-center justify-center text-2xl font-bold'>{(profile.displayName||profile.username||'P').split(' ').map(x=>x[0]).join('').slice(0,2)}</div><h1 className='text-3xl font-bold mt-3'>{profile.displayName}</h1><p className='text-gray-300'>{profile.bio}</p><p className='text-sm text-gray-400'>{profile.city}, {profile.country}</p></div><button className='btn-primary h-fit' onClick={()=>navigator.clipboard.writeText(window.location.href)}>Share</button></div>
    <div className='mt-3 flex flex-wrap gap-2'>{profile.mainGames?.map(g=><span key={g} className='px-2 py-1 rounded bg-white/10'>{g}</span>)}{profile.roles?.map(g=><span key={g} className='px-2 py-1 rounded bg-blue-500/20'>{g}</span>)}{profile.specialties?.map(g=><span key={g} className='px-2 py-1 rounded bg-purple-500/20'>{g}</span>)}{profile.isOpenToOffers&&<span className='px-2 py-1 rounded bg-green-500/20 text-green-300'>Open to offers</span>}</div>
    <div className='mt-4 text-sm text-gray-300'>Profile completion: {completion}%</div><div className='w-full h-2 bg-white/10 rounded'><div className='h-2 bg-[#00ff88] rounded' style={{width:`${completion}%`}}/></div>
    </div>

    <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-6'>{[['K/D',stats.avgKD?.toFixed(2)],['Win Rate',`${stats.overallWinRate?.toFixed(1)}%`],['Tournament Wins',stats.tournamentWins],['Season Rank',`#${stats.seasonRank}`],['Career Score',Math.round(stats.careerScore)],['Rank Label',rankLabel(stats.careerScore)]].map(([k,v])=><div key={k} className='bg-black/20 rounded-xl p-4'><div className='text-gray-400 text-xs'>{k}</div><div className='text-2xl font-semibold'>{v}</div></div>)}</div>
    <div className='mt-4 overflow-x-auto flex gap-2'>{(stats.badges||[]).map(b=><span key={b} title={b} className='px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-sm'>{b}</span>)}</div>
    <div className='mt-6 bg-black/20 rounded-xl p-4'><h2 className='font-semibold mb-3'>Tournament History</h2><table className='w-full text-sm'><thead><tr className='text-gray-400'><th>Name</th><th>Game</th><th>Placement</th><th>Score</th><th>Date</th></tr></thead><tbody>{history.map((h,i)=><tr key={i} className='border-t border-white/10'><td>{h.name}</td><td>{h.gameSlug}</td><td>{h.results?.findIndex(r=>r.userId===stats.userId)+1 || '-'}</td><td>{h.resultScore||0}</td><td>{new Date(h.endTime||h.createdAt||Date.now()).toLocaleDateString()}</td></tr>)}</tbody></table></div>
  </div></div>
}
