import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { apiFetch, API_BASE, API_ORIGIN } from '../utils/api';
import { buildGameMeta, getStoredUser, getUserIdentity, normalizeMatches } from '../utils/matchAdapter';

/**
 * Load live matches and game metadata for the game client experience.
 * @param {object} [options]
 * @param {number} [options.limit=50] - Maximum matches to request
 * @returns {{matches: Array, games: Array, gameMeta: object, loading: boolean, error: string, reload: Function, user: object}}
 */
const useGameClientData = ({ limit = 50 } = {}) => {
  const [matches, setMatches] = useState([]);
  const [games, setGames] = useState([]);
  const [gameMeta, setGameMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketUserId, setSocketUserId] = useState(() => getUserIdentity().userId);
  const [diagnostics, setDiagnostics] = useState({
    apiBase: API_BASE,
    apiOrigin: API_ORIGIN,
    hasToken: false,
    tokenUserId: null,
    healthStatus: null,
    healthError: '',
    matchesStatus: null,
    matchesError: '',
    originMismatch: false,
    socketStatus: 'disconnected',
    lastUpdateAt: null
  });
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [lastUpdateAt, setLastUpdateAt] = useState(null);
  const storedUser = useMemo(() => getStoredUser(), []);
  const loadRef = useRef(null);

  const load = useCallback(async (trigger = 'manual') => {
    setLoading(true);
    setError('');
    try {
      const identity = getUserIdentity();
      setSocketUserId(identity.userId || null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const hasToken = Boolean(token);
      const originMismatch = typeof window !== 'undefined' && API_ORIGIN !== window.location.origin;
      const healthPromise = fetch(`${API_BASE}/api/test`)
        .then(async (res) => {
          let data = null;
          try {
            data = await res.json();
          } catch (err) {
            data = null;
          }
          return { ok: res.ok, status: res.status, data };
        })
        .catch((err) => ({ ok: false, status: null, error: err.message || 'Failed to reach backend' }));
      const safeFetch = async (promise) => {
        try {
          const data = await promise;
          return { ok: true, data };
        } catch (err) {
          return { ok: false, error: err };
        }
      };
      const missingTokenError = new Error('Missing auth token for /api/matches.');
      missingTokenError.status = 401;
      const matchesPromise = hasToken
        ? safeFetch(apiFetch(`/api/matches?limit=${limit}`))
        : Promise.resolve({ ok: false, error: missingTokenError });
      const [healthResult, gamesResult, matchesResult] = await Promise.all([
        healthPromise,
        safeFetch(apiFetch('/api/games', { skipAuth: true })),
        matchesPromise
      ]);

      const fetchedGames = gamesResult.ok ? (gamesResult.data.games || []) : [];
      const meta = buildGameMeta(fetchedGames);
      const normalized = matchesResult.ok
        ? normalizeMatches(matchesResult.data.matches || [], { gameMeta: meta, user: storedUser })
        : [];

      setGames(fetchedGames);
      setGameMeta(meta);
      setMatches(normalized);

      setDiagnostics((prev) => ({
        ...prev,
        apiBase: API_BASE,
        apiOrigin: API_ORIGIN,
        hasToken,
        tokenUserId: identity.userId,
        healthStatus: healthResult.status,
        healthError: healthResult.ok ? '' : healthResult.error || 'Backend health check failed',
        matchesStatus: matchesResult.ok ? 200 : matchesResult.error?.status || null,
        matchesError: matchesResult.ok ? '' : matchesResult.error?.message || 'Failed to load matches',
        originMismatch
      }));

      if (!gamesResult.ok) {
        setError(gamesResult.error?.message || 'Failed to load game data.');
      } else if (!matchesResult.ok) {
        setError(matchesResult.error?.message || 'Failed to load match data.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load match data.');
      setGames([]);
      setGameMeta({});
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [limit, storedUser]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    if (!socketUserId) {
      setSocketStatus('disconnected');
      return () => {};
    }
    const socket = io(API_ORIGIN, { transports: ['websocket'] });
    socket.on('connect', () => {
      setSocketStatus('connected');
      socket.emit('register_user', socketUserId);
    });
    socket.on('disconnect', () => setSocketStatus('disconnected'));
    socket.on('connect_error', (err) => setSocketStatus(`error: ${err.message}`));
    socket.on('observer_update', (payload) => {
      if (payload?.type === 'match_ingested') {
        setLastUpdateAt(new Date().toISOString());
        if (loadRef.current) loadRef.current('observer_update');
      }
    });
    return () => socket.disconnect();
  }, [socketUserId]);

  useEffect(() => {
    setDiagnostics((prev) => ({
      ...prev,
      socketStatus,
      lastUpdateAt
    }));
  }, [socketStatus, lastUpdateAt]);

  return { matches, games, gameMeta, loading, error, diagnostics, reload: load, user: storedUser };
};

export default useGameClientData;
