# GameRise — Game Client

A standalone React application that provides three core capabilities for analysing competitive matches:

| Feature | Description |
|---|---|
| **Match Viewer** | Interactive replay viewer — watch every match event unfold with play/pause/scrub controls and a live scoreboard |
| **Result Parser** | Reverse-engineer pipeline — capture raw hex packets, discover the binary schema, and decode every packet into human-readable results |
| **Leaderboard** | Global rankings built from aggregated match data — filter by game, sort by score / K/D / damage / accuracy |

---

## Directory Structure

```
game-client/
├── public/
│   └── index.html
├── src/
│   ├── App.js                     # Router root
│   ├── index.js                   # React entry point
│   ├── index.css                  # Global styles (GameRise dark theme + Tailwind)
│   ├── data/
│   │   └── sampleMatchData.js     # Simulated match data — 3 full matches across Valorant, Apex, CS2
│   ├── utils/
│   │   └── matchParser.js         # Full reverse-engineering pipeline (hex capture → schema → decode → aggregate)
│   ├── components/
│   │   ├── Navigation.js          # Top nav bar
│   │   ├── MatchTimeline.js       # Ordered event feed (supports live playback mode)
│   │   └── PlayerCard.js          # Player stat card (full + compact variants)
│   └── pages/
│       ├── Home.js                # Landing page with stats overview
│       ├── MatchList.js           # Browse / filter available matches
│       ├── MatchViewer.js         # Main viewer — Viewer / Results / Raw Packets / Schema tabs
│       └── Leaderboard.js         # Global rankings table + podium + bar chart
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Getting Started

```bash
# 1. Install dependencies
cd game-client
npm install

# 2. Start the development server
npm start
# → opens http://localhost:3000
```

> Requires **Node.js ≥ 16**.

---

## How the Reverse-Engineering Pipeline Works

The `matchParser.js` module simulates a real game-client reverse-engineering workflow in five steps:

1. **Hex Capture** — `generateRawHexStream(match)`  
   Produces a stream of binary packets as they would appear on the network socket or in a memory dump. Each packet has a 1-byte opcode, a 6-byte timestamp, and a variable payload.

2. **Schema Discovery** — `discoverSchema(rawPackets)`  
   Analyses opcode frequency and byte offsets to reconstruct the packet schema without access to the game's source code.

3. **Packet Decoding** — `decodePackets(rawPackets)`  
   Applies the discovered schema to convert every raw byte sequence into a structured object with typed fields.

4. **Result Aggregation** — `aggregateResults(match)`  
   Combines decoded events to produce the final match results — MVP, team totals, ranked scoreboard, and match-wide statistics.

5. **Leaderboard Building** — `buildLeaderboard(matches[])`  
   Cross-match aggregation: merges stats from multiple matches per player and ranks globally by configurable criteria.

---

## Sample Data

Three full matches are included:

| Match | Game | Map | Mode | Players |
|---|---|---|---|---|
| match-001 | Valorant | Ascent | Ranked 5v5 | 10 |
| match-002 | Apex Legends | Storm Point | Battle Royale | 10 |
| match-003 | CS2 | Mirage | Competitive 5v5 | 10 |

Each match includes a detailed event timeline (kills, zone transitions, match start/end) and per-player stats (kills, deaths, assists, accuracy, damage, score).

---

## Tech Stack

- **React 18** — UI framework
- **React Router v6** — client-side routing
- **Recharts** — bar and radar charts
- **Tailwind CSS v3** — utility-first styling (GameRise dark theme)
