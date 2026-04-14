# Game Knowledge Hub - Setup Guide

This module adds the game browsing and educational content feature to GameRise.

## AWS DynamoDB Setup

### Create Games Table

1. Go to AWS Console → DynamoDB → Tables → Create table
2. Configure:
   - **Table name**: `gamerise-games`
   - **Partition key**: `gameId` (String)
   - Click "Create table"

No GSI needed for this table.

## Backend Setup

### Update Environment Variables

Add to your `backend/.env`:
```
DYNAMO_TABLE_GAMES=gamerise-games
```

### Seed Game Data

Run the seed script to populate the database with 3 games:

```bash
cd backend
npm run seed
```

This will add:
- Valorant (FPS)
- BGMI (Battle Royale)
- Call of Duty Mobile (FPS)

## API Endpoints

- `GET /api/games` - List all active games (returns name, slug, genre, coverImage, difficulty)
- `GET /api/games/:slug` - Get full game details
- `POST /api/games` - Create new game (admin only, requires JWT auth)

## Frontend Routes

- `/games` - Games list page with search and genre filters
- `/games/:slug` - Game detail page with tabs (Overview, Roles, Maps, Strategies, Tips)

## Features

### Games List Page
- Grid layout with game cards
- Search by name or genre
- Filter by genre (All, FPS, Battle Royale, MOBA)
- Difficulty indicators (colored dots)
- Genre badges with distinct colors
- Hover effects with neon accent

### Game Detail Page
- Hero section with cover image
- Tabbed navigation:
  - Overview: Core mechanics
  - Roles: Character/role descriptions
  - Maps: Map-specific tips
  - Pro Strategies: Advanced tactics
  - Tips: Essential advice
- "Ask AI Coach" button (placeholder for future feature)
- Fully responsive design

## Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Login to your account
4. Click "Browse Games" from home
5. Explore game cards and detail pages

## Game Data Structure

Each game JSON includes:
- name, slug, genre, coverImage
- description, difficulty, isActive
- roles[] - Character roles with descriptions
- maps[] - Map names with tips
- mechanics[] - Core gameplay mechanics
- tips[] - Essential player tips
- proStrategies[] - Advanced strategies

## Adding New Games

Create a JSON file in `data/games/` following the structure, then either:
1. Run seed script again, or
2. Use POST /api/games endpoint with admin JWT token

## UI Theme

- Background: #0f0f14 (dark)
- Cards: #1a1a24
- Accent: #00ff88 (neon green)
- Difficulty colors: green (easy), amber (medium), red (hard)
- Genre badges: blue (FPS), purple (Battle Royale), pink (MOBA)
