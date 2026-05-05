import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import api from '../utils/axios';

export default function CommunityTips(){
  const [game,setGame]=useState('valorant'); const [sort,setSort]=useState('trending'); const [tips,setTips]=useState([]); const [form,setForm]=useState({game:'valorant',title:'',content:''});
  const load=()=>api.get(`/api/community/tips?game=${game}&sort=${sort}`).then(({data})=>setTips(data.tips||[]));
  useEffect(()=>{load();},[game,sort]);
  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation/><div className='max-w-5xl mx-auto pt-24 px-4 pb-10'>
    <h1 className='text-2xl font-bold mb-3'>Tips Feed</h1><div className='flex gap-2 mb-4'><input className='input' value={game} onChange={e=>setGame(e.target.value)}/><select className='input' value={sort} onChange={e=>setSort(e.target.value)}><option value='trending'>Trending</option><option value='new'>New</option><option value='top'>Top All Time</option></select></div>
    <div className='space-y-3'>{tips.map(t=><div key={t.tipId} className='bg-black/20 p-4 rounded'><h3 className='font-semibold'>{t.title}</h3><pre className='whitespace-pre-wrap font-sans'>{t.content}</pre><button onClick={async()=>{await api.put(`/api/community/tips/${t.tipId}/upvote`,{authorId:t.author}); load();}} className='text-[#00ff88]'>▲ {t.upvotes||0}</button></div>)}</div>
    <div className='bg-black/20 rounded p-4 mt-6'><input className='input w-full mb-2' placeholder='Title' value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><textarea className='input w-full mb-2' placeholder='Markdown content' value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/><button className='btn-primary' onClick={async()=>{await api.post('/api/community/tips',form); load();}}>Post Tip</button></div>
  </div></div>
}
