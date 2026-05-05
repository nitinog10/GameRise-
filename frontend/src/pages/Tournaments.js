import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import Navigation from '../components/Navigation';

export default function Tournaments() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ type: '', gameSlug: '', status: '' });

  useEffect(() => { api.get('/api/tournaments').then(({ data }) => setItems(data.tournaments || [])); }, []);
  const filtered = useMemo(() => items.filter(t => (!filters.type || t.type === filters.type) && (!filters.gameSlug || t.gameSlug === filters.gameSlug) && (!filters.status || t.status === filters.status)), [items, filters]);
  const sections = { upcoming: filtered.filter(t=>t.status==='upcoming'), live: filtered.filter(t=>t.status==='live'), completed: filtered.filter(t=>t.status==='completed') };

  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation /><div className='max-w-7xl mx-auto pt-24 px-4 pb-10'>
    <h1 className='text-2xl font-bold mb-4'>Tournaments</h1>
    <div className='flex gap-2 mb-6'>{['','daily','career'].map(v=><button key={v} onClick={()=>setFilters({...filters, type:v})} className='px-3 py-1 rounded bg-black/30'>{v||'All'}</button>)}<input className='input max-w-40' placeholder='Game slug' value={filters.gameSlug} onChange={e=>setFilters({...filters,gameSlug:e.target.value})}/></div>
    {Object.entries(sections).map(([label,list])=><section key={label} className='mb-6'><h2 className='text-xl capitalize mb-3'>{label}</h2><div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>{list.map(t=><Link key={t.tournamentId} to={`/tournaments/${t.tournamentId}`} className='bg-black/20 rounded-xl p-4 block'><div className='font-semibold'>{t.name}</div><div className='text-xs text-gray-400'>{t.gameSlug} • {t.type}</div><div className='mt-2 text-sm'>Prize: {t.prizePool} | Players: {(t.registeredPlayers||[]).length}/{t.maxPlayers}</div><div className='mt-1 text-xs uppercase'>{t.status}</div></Link>)}</div></section>)}
  </div></div>
}
