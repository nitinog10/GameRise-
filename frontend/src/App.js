import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import GamesList from './pages/GamesList';
import GameDetail from './pages/GameDetail';
import AiCoach from './pages/AiCoach';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import AdminTournaments from './pages/AdminTournaments';
import PlayerProfile from './pages/PlayerProfile';
import ProfileSettings from './pages/ProfileSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/games"
            element={
              <PrivateRoute>
                <GamesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/games/:slug"
            element={
              <PrivateRoute>
                <GameDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/tournaments"
            element={
              <PrivateRoute>
                <Tournaments />
              </PrivateRoute>
            }
          />
          <Route
            path="/tournaments/:id"
            element={
              <PrivateRoute>
                <TournamentDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/tournaments"
            element={
              <PrivateRoute>
                <AdminTournaments />
              </PrivateRoute>
            }
          />

          <Route path="/player/:username" element={<PrivateRoute><PlayerProfile /></PrivateRoute>} />
          <Route path="/settings/profile" element={<PrivateRoute><ProfileSettings /></PrivateRoute>} />
          <Route
            path="/ai-coach"
            element={
              <PrivateRoute>
                <AiCoach />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
