import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import api from '../utils/axios';

export default function CommunityTeams(){
  const [game,setGame]=useState('valorant'); const [role,setRole]=useState(''); const [rank,setRank]=useState(''); const [listings,setListings]=useState([]);
  const [form,setForm]=useState({game:'valorant',rolesWanted:[],schedule:'',rank:'',description:''});
  const load=()=>api.get(`/api/community/teams/lfg?game=${game}${role?`&role=${role}`:''}${rank?`&rank=${rank}`:''}`).then(({data})=>setListings(data.listings||[]));
  useEffect(()=>{load();},[game,role,rank]);
  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation/><div className='max-w-5xl mx-auto pt-24 px-4 pb-10'>
    <h1 className='text-2xl font-bold mb-3'>Team Finder</h1><div className='flex gap-2 mb-4'><input className='input' value={game} onChange={e=>setGame(e.target.value)} placeholder='game'/><input className='input' value={role} onChange={e=>setRole(e.target.value)} placeholder='role'/><input className='input' value={rank} onChange={e=>setRank(e.target.value)} placeholder='rank'/></div>
    <div className='grid gap-3'>{listings.map(l=><div key={l.lfgId} className='bg-black/20 p-4 rounded'><div className='font-semibold'>{l.game} • {l.rank}</div><div>{l.description}</div><a href={`https://discord.com/channels/@me`} target='_blank' rel='noreferrer' className='text-[#00ff88]'>Send invite</a></div>)}</div>
    <div className='bg-black/20 rounded p-4 mt-6 space-y-2'><h2>Post listing</h2><input className='input w-full' placeholder='Game' value={form.game} onChange={e=>setForm({...form,game:e.target.value})}/><input className='input w-full' placeholder='Roles wanted comma separated' onChange={e=>setForm({...form,rolesWanted:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/><input className='input w-full' placeholder='Schedule' value={form.schedule} onChange={e=>setForm({...form,schedule:e.target.value})}/><input className='input w-full' placeholder='Rank' value={form.rank} onChange={e=>setForm({...form,rank:e.target.value})}/><textarea className='input w-full' placeholder='Description' value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><button className='btn-primary' onClick={async()=>{await api.post('/api/community/teams/lfg',form); load();}}>Post</button></div>
  </div></div>
}
