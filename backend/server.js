require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const aiCoachRoutes = require('./routes/aiCoach');
const matchesRoutes = require('./routes/matches');
const statsRoutes = require('./routes/stats');
const goalsRoutes = require('./routes/goals');
const errorHandler = require('./middleware/errorHandler');
const { loadGameData } = require('./services/gameContext');

// Load game data into memory at startup
loadGameData();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`GameRise backend running on port ${PORT}`);
});
