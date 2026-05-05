# GameRise - Esports Career Platform

Full-stack esports platform for Indian and global gamers, featuring a Game Knowledge Hub and AI-powered coaching.

## Features

### 🔐 Authentication & Authorization
- User registration and login with JWT
- Role-based access control (player/admin)
- Protected routes with automatic redirect
- Persistent sessions via localStorage

### 🎮 Game Knowledge Hub
- Browse games with grid layout and cover images
- Search by name or genre
- Filter by genre (All, FPS, Battle Royale, MOBA)
- Difficulty indicators (color-coded)
- Genre badges with distinct colors

### 📖 Game Detail Pages
- Hero section with cover image and gradient overlay
- Tabbed navigation: Overview, Roles, Maps, Pro Strategies, Tips
- Deep link to AI Coach pre-selected for that game
- Fully responsive design

### 🤖 AI Esports Coach
- Game-aware AI coaching powered by Claude (Anthropic)
- Streaming responses via Server-Sent Events (SSE)
- Game selector dropdown for context-aware answers
- Multi-turn conversation with history
- Session history sidebar (last 5 sessions)
- Suggested starter questions as chips
- Deep link from game detail pages (`/ai-coach?game=valorant`)
- Conversation sessions saved to DynamoDB

### 🌱 Seeded Game Data
- Valorant (FPS, Hard)
- BGMI (Battle Royale, Medium)
- Call of Duty Mobile (FPS, Medium)

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router v6, Axios
- **Backend**: Node.js, Express, AWS DynamoDB (SDK v3)
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`)
- **Auth**: JWT + bcrypt
- **Dev Tools**: Nodemon, dotenv, CORS

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your AWS and Anthropic credentials
npm run dev
```

### Seed Game Data
```bash
cd backend
npm run seed
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |

### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | List all active games |
| GET | `/api/games/:slug` | Get game details by slug |
| POST | `/api/games` | Create game (admin only) |

### AI Coach
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai-coach` | Send message and stream AI response (SSE) |
| GET | `/api/ai-coach/sessions` | Get recent coaching sessions |
| GET | `/api/ai-coach/sessions/:sessionId` | Get specific session |

## Frontend Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/` | Home | Protected |
| `/games` | GamesList | Protected |
| `/games/:slug` | GameDetail | Protected |
| `/ai-coach` | AiCoach | Protected |
| `/ai-coach?game=:slug` | AiCoach (pre-selected game) | Protected |
| `/login` | Login | Public |
| `/register` | Register | Public |

## Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
DYNAMO_TABLE_USERS=gamerise-users
DYNAMO_TABLE_GAMES=gamerise-games
DYNAMO_TABLE_COACH_SESSIONS=gamerise-coach-sessions
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## Project Structure

```
gamerise/
├── backend/
│   ├── config/db.js              # DynamoDB connection
│   ├── models/
│   │   ├── User.js               # User model with DynamoDB operations
│   │   ├── Game.js               # Game model with DynamoDB operations
│   │   └── CoachSession.js       # AI Coach session model
│   ├── routes/
│   │   ├── auth.js               # Auth endpoints (register/login)
│   │   ├── games.js              # Game endpoints (CRUD)
│   │   └── aiCoach.js            # AI Coach endpoint (SSE streaming)
│   ├── services/
│   │   └── gameContext.js        # Game data loader & context builder for AI
│   ├── middleware/
│   │   ├── auth.js               # JWT auth + admin middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── scripts/
│   │   └── seedGames.js          # Seed game data to DynamoDB
│   ├── server.js                 # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.js   # Auth guard component
│   │   ├── context/
│   │   │   └── AuthContext.js    # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.js           # Landing page with nav
│   │   │   ├── Login.js          # Login form
│   │   │   ├── Register.js       # Registration form
│   │   │   ├── GamesList.js      # Game browsing with search/filter
│   │   │   ├── GameDetail.js     # Game detail with tabs
│   │   │   └── AiCoach.js        # AI Coach chat interface
│   │   ├── utils/
│   │   │   └── axios.js          # API client with JWT interceptor
│   │   ├── App.js                # Router configuration
│   │   ├── index.css             # Tailwind + custom styles
│   │   └── index.js              # React entry point
│   └── package.json
├── data/games/                   # Game data JSON files
│   ├── valorant.json
│   ├── bgmi.json
│   └── codm.json
└── README.md
```

## UI Theme

- Background: `#0f0f14` (dark)
- Cards: `#1a1a24`
- Accent: `#00ff88` (neon green)
- AI Coach accent: `purple-600`
- Difficulty colors: green (easy), amber (medium), red (hard)
- Genre badges: blue (FPS), purple (Battle Royale), pink (MOBA)
