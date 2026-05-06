import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MatchList from './pages/MatchList';
import MatchViewer from './pages/MatchViewer';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                     element={<Home />} />
        <Route path="/matches"              element={<MatchList />} />
        <Route path="/matches/:matchId"     element={<MatchViewer />} />
        <Route path="/leaderboard"          element={<Leaderboard />} />
        <Route path="*"                     element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
