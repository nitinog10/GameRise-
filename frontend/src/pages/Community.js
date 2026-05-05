import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function Community(){
  const games=['valorant','bgmi','codm'];
  return <div className='min-h-screen bg-[#1a1a24] text-white'><Navigation/><div className='max-w-6xl mx-auto pt-24 px-4 pb-10'>
    <div className='bg-black/20 rounded-2xl p-6 mb-6'><h1 className='text-2xl font-bold'>Community Hub</h1><p className='text-gray-300 mb-3'>Join the GameRise Discord server for live community action.</p><a className='btn-primary' href={process.env.REACT_APP_DISCORD_INVITE||'https://discord.gg/'} target='_blank' rel='noreferrer'>Join Discord Server</a></div>
    <div className='grid md:grid-cols-3 gap-4'>{games.map(g=><Link key={g} to={`/community/tips?game=${g}`} className='bg-black/20 rounded-xl p-4'><h2 className='font-semibold'>{g.toUpperCase()}</h2><p className='text-sm text-gray-400'>Tips, recent posts and team listings</p></Link>)}</div>
    <div className='mt-6 flex gap-3'><Link className='btn-primary' to='/community/teams'>Team Finder</Link><Link className='btn-primary' to='/community/tips'>Tips Feed</Link><Link className='btn-primary' to='/community/clips'>Clip Showcase</Link></div>
  </div></div>
}
