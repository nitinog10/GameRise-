import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '../components/Navigation';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

export default function ProfileSettings(){
  const { user } = useAuth();
  const [games,setGames]=useState([]);
  const [form,setForm]=useState({displayName:'',bio:'',mainGames:[],roles:[],specialties:[],country:'',city:'',socialLinks:{youtube:'',twitch:'',instagram:'',twitter:''},isOpenToOffers:false,profileVisibility:'public'});
  useEffect(()=>{ api.get('/api/games').then(({data})=>setGames(data.games||[])); api.get(`/api/profile/${user.username}`).then(({data})=>setForm({...form,...data.profile})).catch(()=>{}); },[]);
  const completion=useMemo(()=>{const checks=[form.displayName,form.bio,form.mainGames?.length,form.roles?.length,form.specialties?.length,form.country,form.city,form.socialLinks?.youtube||form.socialLinks?.twitch||form.socialLinks?.instagram||form.socialLinks?.twitter]; return Math.round((checks.filter(Boolean).length/checks.length)*100);},[form]);
  const toggle=(key,val)=>setForm(prev=>({...prev,[key]:prev[key].includes(val)?prev[key].filter(x=>x!==val):[...prev[key],val]}));
  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation/><div className='max-w-4xl mx-auto pt-24 px-4 pb-10'>
    <h1 className='text-2xl font-bold mb-4'>Profile Settings</h1>
    <div className='mb-4'>Completion {completion}%<div className='h-2 bg-white/10 rounded'><div className='h-2 bg-[#00ff88]' style={{width:`${completion}%`}}/></div></div>
    <div className='grid gap-3'>
      <input className='input' placeholder='Display name' value={form.displayName} onChange={e=>setForm({...form,displayName:e.target.value})}/>
      <textarea className='input' placeholder='Bio' value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/>
      <div><p>Main Games</p><div className='flex flex-wrap gap-2'>{games.map(g=><button type='button' key={g.slug} onClick={()=>toggle('mainGames',g.slug)} className={`px-2 py-1 rounded ${form.mainGames?.includes(g.slug)?'bg-[#00ff88] text-black':'bg-white/10'}`}>{g.name}</button>)}</div></div>
      <input className='input' placeholder='Roles (comma separated)' value={(form.roles||[]).join(',')} onChange={e=>setForm({...form,roles:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)})}/>
      <input className='input' placeholder='Specialties (comma separated)' value={(form.specialties||[]).join(',')} onChange={e=>setForm({...form,specialties:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)})}/>
      <div className='grid grid-cols-2 gap-2'><input className='input' placeholder='Country' value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/><input className='input' placeholder='City' value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></div>
      {['youtube','twitch','instagram','twitter'].map(k=><input key={k} className='input' placeholder={k} value={form.socialLinks?.[k]||''} onChange={e=>setForm({...form,socialLinks:{...form.socialLinks,[k]:e.target.value}})}/>) }
      <label><input type='checkbox' checked={form.isOpenToOffers} onChange={e=>setForm({...form,isOpenToOffers:e.target.checked})}/> Open to team offers</label>
      <label>Visibility <select className='input' value={form.profileVisibility} onChange={e=>setForm({...form,profileVisibility:e.target.value})}><option value='public'>Public</option><option value='private'>Private</option></select></label>
      <button className='btn-primary' onClick={async()=>{await api.put('/api/profile',form);}}>Save Profile</button>
    </div>
  </div></div>
}
