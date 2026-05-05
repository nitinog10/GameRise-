import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import api from '../utils/axios';

export default function CommunityClips(){
  const [game,setGame]=useState('valorant'); const [clips,setClips]=useState([]); const [form,setForm]=useState({game:'valorant',title:'',url:''});
  const load=()=>api.get(`/api/community/clips?game=${game}`).then(({data})=>setClips(data.clips||[]));
  useEffect(()=>{load();},[game]);
  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation/><div className='max-w-6xl mx-auto pt-24 px-4 pb-10'>
    <h1 className='text-2xl font-bold mb-3'>Clip Showcase</h1><input className='input mb-4' value={game} onChange={e=>setGame(e.target.value)} />
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-3'>{clips.map(c=><div key={c.clipId} className='bg-black/20 p-3 rounded'><h3>{c.title}</h3><a href={c.url} target='_blank' rel='noreferrer' className='text-[#00ff88]'>Open clip</a><button onClick={async()=>{await api.put(`/api/community/clips/${c.clipId}/upvote`); load();}} className='block mt-2'>▲ {c.upvotes||0}</button></div>)}</div>
    <div className='bg-black/20 p-4 rounded mt-6'><input className='input w-full mb-2' placeholder='Title' value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input className='input w-full mb-2' placeholder='YouTube URL' value={form.url} onChange={e=>setForm({...form,url:e.target.value})}/><button className='btn-primary' onClick={async()=>{await api.post('/api/community/clips',form); load();}}>Submit Clip</button></div>
  </div></div>
}
