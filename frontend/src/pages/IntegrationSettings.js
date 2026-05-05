import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import api from '../utils/axios';

export default function IntegrationSettings(){
  const [integrations,setIntegrations]=useState([]);
  const [form,setForm]=useState({game:'valorant',apiKey:'',region:'ap',inGameUsername:'',isActive:true});
  const [manualJson,setManualJson]=useState('');
  const load=()=>api.get('/api/observer/integrations').then(({data})=>setIntegrations(data.integrations||[]));
  useEffect(()=>{load();},[]);
  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation/><div className='max-w-5xl mx-auto pt-24 px-4 pb-10'>
    <h1 className='text-2xl font-bold mb-4'>Account Linking</h1>
    <div className='bg-black/20 p-4 rounded mb-4 space-y-2'>
      <h2>Connect Game Account</h2>
      {['game','apiKey','region','inGameUsername'].map(k=><input key={k} className='input w-full' placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}
      <button className='btn-primary' onClick={async()=>{await api.post('/api/observer/integrations',form); load();}}>Link Account</button>
    </div>
    <div className='grid gap-2 mb-6'>{integrations.map(i=><div key={i.integrationId} className='bg-black/20 rounded p-3 flex justify-between'><span>{i.game} • {i.inGameUsername}</span><span>{i.isActive?'Active':'Not connected'} {i.lastSyncAt?`• ${new Date(i.lastSyncAt).toLocaleString()}`:'• Syncing'}</span></div>)}</div>
    <div className='bg-black/20 p-4 rounded'><h2>Manual Import</h2><textarea className='input w-full h-32' value={manualJson} onChange={e=>setManualJson(e.target.value)} placeholder='Paste match JSON'/><button className='btn-primary mt-2' onClick={async()=>{await api.post('/api/observer/ingest', JSON.parse(manualJson), { headers:{'x-observer-key':'dev-observer-key'} });}}>Import Match</button></div>
  </div></div>
}
