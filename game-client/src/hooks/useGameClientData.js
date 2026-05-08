import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';
import { buildGameMeta, getStoredUser, normalizeMatches } from '../utils/matchAdapter';

const useGameClientData = ({ limit = 50 } = {}) => {
  const [matches, setMatches] = useState([]);
  const [games, setGames] = useState([]);
  const [gameMeta, setGameMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const storedUser = useMemo(() => getStoredUser(), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [gamesResponse, matchesResponse] = await Promise.all([
        apiFetch('/api/games'),
        apiFetch(`/api/matches?limit=${limit}`)
      ]);
      const fetchedGames = gamesResponse.games || [];
      const meta = buildGameMeta(fetchedGames);
      const normalized = normalizeMatches(matchesResponse.matches || [], { gameMeta: meta, user: storedUser });
      setGames(fetchedGames);
      setGameMeta(meta);
      setMatches(normalized);
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

  return { matches, games, gameMeta, loading, error, reload: load, user: storedUser };
};

export default useGameClientData;
