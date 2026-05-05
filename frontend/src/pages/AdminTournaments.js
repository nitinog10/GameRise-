import React, { useState } from 'react';
import api from '../utils/axios';
import Navigation from '../components/Navigation';

export default function AdminTournaments(){
  const [form,setForm]=useState({name:'',gameSlug:'valorant',type:'daily',entryFee:0,prizePool:0,maxPlayers:100,startTime:'',endTime:'',rules:''});
  const [id,setId]=useState(''); const [status,setStatus]=useState('live');
  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation /><div className='max-w-4xl mx-auto pt-24 px-4 space-y-6'>
    <form onSubmit={async e=>{e.preventDefault(); await api.post('/api/tournaments', form);}} className='bg-black/20 p-4 rounded space-y-2'>
      <h1 className='text-xl font-bold'>Admin Tournament Panel</h1>
      {Object.keys(form).map(k=><input key={k} className='input w-full' placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>) }
      <button className='btn-primary'>Create Tournament</button>
    </form>
    <div className='bg-black/20 p-4 rounded space-y-2'><h2>Update Status</h2><input className='input w-full' placeholder='tournamentId' value={id} onChange={e=>setId(e.target.value)}/><select className='input w-full' value={status} onChange={e=>setStatus(e.target.value)}><option>upcoming</option><option>live</option><option>completed</option></select><button className='btn-primary' onClick={async()=>api.put(`/api/tournaments/${id}/status`,{status})}>Set Status</button></div>
  </div></div>
}
