require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const aiCoachRoutes = require('./routes/aiCoach');
const matchesRoutes = require('./routes/matches');
const statsRoutes = require('./routes/stats');
const goalsRoutes = require('./routes/goals');
const tournamentsRoutes = require('./routes/tournaments');
const leaderboardRoutes = require('./routes/leaderboard');
const profileRoutes = require('./routes/profile');
const communityRoutes = require('./routes/community');
const webhookRoutes = require('./routes/webhooks');
const observerRoutes = require('./routes/observer');
const errorHandler = require('./middleware/errorHandler');
const { loadGameData } = require('./services/gameContext');

// Load game data into memory at startup
loadGameData();

const app = express();
const server = http.createServer(app);
const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};
const io = new Server(server, { cors: { origin: allowedOrigins } });
app.set('io', io);
io.on('connection', (socket) => { socket.on('register_user', (userId) => socket.join(userId)); });
const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/observer', observerRoutes);

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`GameRise backend running on port ${PORT}`);
});
