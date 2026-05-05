# GameRise Setup Guide

Complete step-by-step setup instructions for the GameRise platform.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS Account with DynamoDB access
- Anthropic API key (for AI Coach feature)

## Step 1: AWS DynamoDB Setup

### Create Users Table

1. Go to AWS Console → DynamoDB → Tables → Create table
2. Configure the table:
   - **Table name**: `gamerise-users`
   - **Partition key**: `userId` (String)
   - Leave other settings as default
   - Click "Create table"

### Create Global Secondary Index (GSI) for Email

After the table is created:

1. Click on your `gamerise-users` table
2. Go to the "Indexes" tab
3. Click "Create index"
4. Configure:
   - **Partition key**: `email` (String)
   - **Index name**: `email-index`
   - **Projected attributes**: All
5. Click "Create index"

Wait for the index status to become "Active" (takes 1-2 minutes).

### Create Games Table

1. Go to AWS Console → DynamoDB → Tables → Create table
2. Configure:
   - **Table name**: `gamerise-games`
   - **Partition key**: `gameId` (String)
   - Click "Create table"

No GSI needed for this table.

### Create Coach Sessions Table

1. Go to AWS Console → DynamoDB → Tables → Create table
2. Configure:
   - **Table name**: `gamerise-coach-sessions`
   - **Partition key**: `sessionId` (String)
   - Click "Create table"

### Create GSI for Coach Sessions (User lookup)

After the `gamerise-coach-sessions` table is created:

1. Click on your `gamerise-coach-sessions` table
2. Go to the "Indexes" tab
3. Click "Create index"
4. Configure:
   - **Partition key**: `userId` (String)
   - **Index name**: `userId-index`
   - **Projected attributes**: All
5. Click "Create index"

Wait for the index status to become "Active".

### Get AWS Credentials

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. **User name**: `gamerise-backend` (or any name you prefer)
4. Click "Next"
5. Select "Attach policies directly"
6. Search and select: `AmazonDynamoDBFullAccess`
7. Click "Next" → "Create user"
8. Click on the newly created user
9. Go to "Security credentials" tab
10. Click "Create access key"
11. Select "Application running outside AWS"
12. Click "Next" → "Create access key"
13. **IMPORTANT**: Copy and save both:
    - Access Key ID
    - Secret Access Key
    (You won't be able to see the secret again!)

## Step 2: Get Anthropic API Key (for AI Coach)

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys section
4. Click "Create Key"
5. Copy and save the API key

**Note**: The AI Coach feature requires a valid Anthropic API key with access to Claude. The app uses `claude-sonnet-4-20250514` model.

## Step 3: Backend Setup

```bash
cd backend
npm install
```

### Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `backend/.env` with your values:
```
PORT=5000
JWT_SECRET=your_random_secret_key_min_32_chars
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
DYNAMO_TABLE_USERS=gamerise-users
DYNAMO_TABLE_GAMES=gamerise-games
DYNAMO_TABLE_COACH_SESSIONS=gamerise-coach-sessions
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Start Backend Server

```bash
npm run dev
```

Server should start on http://localhost:5000

Test health check:
```bash
curl http://localhost:5000/api/test
```

## Step 4: Seed Game Data

Run the seed script to populate the database with 3 games:

```bash
cd backend
npm run seed
```

This will add:
- Valorant (FPS, Hard)
- BGMI (Battle Royale, Medium)
- Call of Duty Mobile (FPS, Medium)

## Step 5: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

### Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

### Start Frontend

```bash
npm start
```

Frontend should open at http://localhost:3000

## Step 6: Test the Application

1. Go to http://localhost:3000
2. Click "Register" and create a new account
3. Login with your credentials
4. You should see the GameRise home page with "Browse Games" and "AI Coach" buttons
5. Click "Browse Games" to explore the Game Knowledge Hub
6. Click on a game card to see detailed info (Overview, Roles, Maps, Strategies, Tips)
7. Click "Ask AI Coach" from a game detail page (pre-selects the game)
8. Or click "AI Coach" from home to start a general coaching session
9. Try asking: "How do I improve my aim?" or "Best strategy for ranked?"

## API Reference

### Auth Endpoints

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{ username, email, password, role? }` | `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |

### Game Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/games` | No | List all active games (name, slug, genre, coverImage, difficulty) |
| GET | `/api/games/:slug` | No | Get full game details by slug |
| POST | `/api/games` | Admin | Create new game |

### AI Coach Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai-coach` | Yes | Send message, receive streaming AI response (SSE) |
| GET | `/api/ai-coach/sessions` | Yes | Get last 5 coaching sessions |
| GET | `/api/ai-coach/sessions/:sessionId` | Yes | Get specific session with messages |

**POST /api/ai-coach** request body:
```json
{
  "message": "How do I improve my aim?",
  "gameSlug": "valorant",
  "conversationHistory": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ],
  "sessionId": "session_123..."
}
```

**SSE Response format** (stream):
```
data: {"type": "session", "sessionId": "session_123..."}
data: {"type": "token", "text": "Here"}
data: {"type": "token", "text": " are"}
data: {"type": "done", "fullResponse": "Here are some tips..."}
```

## Frontend Routes

| Route | Page | Auth Required | Description |
|-------|------|---------------|-------------|
| `/` | Home | Yes | Landing page with navigation |
| `/games` | GamesList | Yes | Browse games with search/filter |
| `/games/:slug` | GameDetail | Yes | Game details with tabbed content |
| `/ai-coach` | AiCoach | Yes | AI coaching chat interface |
| `/ai-coach?game=:slug` | AiCoach | Yes | AI Coach with pre-selected game |
| `/login` | Login | No | Login form |
| `/register` | Register | No | Registration form |

## Roles & Permissions

| Role | Capabilities |
|------|-------------|
| `player` (default) | Browse games, use AI Coach, manage own sessions |
| `admin` | All player capabilities + create new games via POST /api/games |

The role is set during registration. The `adminMiddleware` checks `req.user.role === 'admin'` for protected endpoints.

## Troubleshooting

### DynamoDB Connection Issues

- Verify AWS credentials are correct
- Check AWS region matches your DynamoDB table region
- Ensure IAM user has DynamoDB permissions

### Email Already Exists Error

- Make sure the `email-index` GSI is created and Active
- Check DynamoDB table for duplicate emails

### CORS Errors

- Verify backend is running on port 5000
- Check frontend .env has correct API URL
- Ensure backend CORS is set to http://localhost:3000

### JWT Errors

- Make sure JWT_SECRET is set in backend .env
- JWT_SECRET should be at least 32 characters long

### Game Seeding Issues

- Ensure `gamerise-games` DynamoDB table exists before running seed
- Check that game JSON files exist in `data/games/`
- If seeding fails with duplicate errors, the games may already exist in the table

### Game Not Found (404)

- Verify the game was seeded: check DynamoDB `gamerise-games` table
- Ensure the `isActive` field is set to `true` in the game data
- Check that the slug in the URL matches the game's slug field

### AI Coach Not Responding

- Verify `ANTHROPIC_API_KEY` is set in backend .env
- Check that the API key is valid and has credits
- Ensure the backend can reach `api.anthropic.com`
- Check browser console for SSE connection errors
- Verify the `gamerise-coach-sessions` table and `userId-index` GSI exist

### AI Coach Session History Not Loading

- Ensure `gamerise-coach-sessions` table exists
- Verify `userId-index` GSI is created and Active
- Check that the user is authenticated (JWT token present)

## What is GSI (Global Secondary Index)?

A GSI allows you to query DynamoDB by fields other than the primary key.

In our case:
- **Users table**: Primary key is `userId`, GSI on `email` enables fast email lookups during login
- **Coach Sessions table**: Primary key is `sessionId`, GSI on `userId` enables fetching recent sessions by user

Think of it like adding an index in SQL databases for faster queries.

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

## Next Steps

- Add more game data to `data/games/`
- Build player profile pages
- Add tournament features
- Implement team management
- Add voice coaching integration
- Build community features (forums, leaderboards)
