require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_BOT_TOKEN; const clientId = process.env.DISCORD_CLIENT_ID; const guildId = process.env.DISCORD_GUILD_ID; const api = process.env.BACKEND_URL || 'http://localhost:5000';

const commands = [
  new SlashCommandBuilder().setName('register').setDescription('Link Discord to GameRise profile').addStringOption(o=>o.setName('username').setDescription('GameRise username').setRequired(true)),
  new SlashCommandBuilder().setName('stats').setDescription('Get user stats').addStringOption(o=>o.setName('username').setDescription('GameRise username').setRequired(true)),
  new SlashCommandBuilder().setName('tournament').setDescription('Tournament commands').addStringOption(o=>o.setName('action').setDescription('list').setRequired(true)),
  new SlashCommandBuilder().setName('leaderboard').setDescription('Top season rankings'),
  new SlashCommandBuilder().setName('helpgr').setDescription('GameRise bot help')
].map(c=>c.toJSON());

(async()=>{ if(!token) return; const rest=new REST({version:'10'}).setToken(token); await rest.put(Routes.applicationGuildCommands(clientId,guildId),{body:commands}); client.login(token); })();

client.on('interactionCreate', async (i)=>{ if(!i.isChatInputCommand()) return; try {
  if(i.commandName==='register'){ return i.reply(`Linked with GameRise username **${i.options.getString('username')}** (placeholder).`); }
  if(i.commandName==='stats'){ const u=i.options.getString('username'); const {data}=await axios.get(`${api}/api/profile/${u}/stats`); return i.reply(`Stats for ${u}: KD ${Number(data.stats.avgKD||0).toFixed(2)}, WR ${Number(data.stats.overallWinRate||0).toFixed(1)}%, Score ${Math.round(data.stats.careerScore||0)}`); }
  if(i.commandName==='tournament'){ const {data}=await axios.get(`${api}/api/tournaments?status=upcoming`); return i.reply(`Upcoming tournaments:\n${(data.tournaments||[]).slice(0,10).map(t=>`• ${t.name} (${t.gameSlug})`).join('\n')||'None'}`); }
  if(i.commandName==='leaderboard'){ const {data}=await axios.get(`${api}/api/leaderboard/season`,{headers:{Authorization:`Bearer ${process.env.BOT_SERVICE_TOKEN||''}`}}).catch(()=>({data:{leaderboard:[]}})); return i.reply(`Top 10 Season:\n${(data.leaderboard||[]).slice(0,10).map(p=>`#${p.rank} ${p.userId} - ${Math.round(p.score)}`).join('\n')||'No data'}`); }
  if(i.commandName==='helpgr'){ return i.reply('Commands: /register /stats /tournament /leaderboard'); }
} catch(e){ i.reply('Command failed.'); }});
