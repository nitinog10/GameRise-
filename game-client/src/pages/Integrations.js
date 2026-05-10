import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '../components/Navigation';
import DiagnosticsPanel from '../components/DiagnosticsPanel';
import { apiFetch, API_BASE, API_ORIGIN } from '../utils/api';
import { getUserIdentity } from '../utils/matchAdapter';

const DEFAULT_FORM = {
  gameSlug: 'valorant',
  region: 'ap',
  accountId: '',
  inGameUsername: '',
  apiKey: '',
  platform: '',
  isActive: true
};

const statusBadge = (status) => {
  if (status === 'ok') return 'badge-green';
  if (status === 'error') return 'badge-red';
  if (status === 'pending') return 'badge-amber';
  return 'badge-blue';
};

const Integrations = () => {
  const [catalog, setCatalog] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [diagnostics, setDiagnostics] = useState(null);

  const identity = useMemo(() => getUserIdentity(), []);
  const hasToken = Boolean(typeof window !== 'undefined' && localStorage.getItem('token'));
  const selectedCatalog = catalog.find((entry) => entry.gameSlug === form.gameSlug);

  const load = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const catalogResponse = await apiFetch('/api/observer/catalog', { skipAuth: true });
      setCatalog(catalogResponse.catalog || []);
      if (hasToken) {
        const integrationsResponse = await apiFetch('/api/observer/integrations');
        setIntegrations(integrationsResponse.integrations || []);
      } else {
        setIntegrations([]);
      }
      setDiagnostics({
        apiBase: API_BASE,
        apiOrigin: API_ORIGIN,
        hasToken,
        tokenUserId: identity.userId,
        healthStatus: null,
        healthError: '',
        matchesError: hasToken ? '' : 'Missing auth token for /api/observer/integrations',
        matchesStatus: hasToken ? 200 : 401,
        originMismatch: typeof window !== 'undefined' && API_ORIGIN !== window.location.origin,
        socketStatus: 'disconnected',
        lastUpdateAt: null
      });
    } catch (err) {
      setError(err.message || 'Failed to load integrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSelectIntegration = (integration) => {
    setEditingId(integration.integrationId);
    setForm({
      gameSlug: integration.gameSlug || integration.game || 'valorant',
      region: integration.region || 'ap',
      accountId: integration.accountId || '',
      inGameUsername: integration.inGameUsername || '',
      apiKey: integration.apiKey || '',
      platform: integration.platform || '',
      isActive: integration.isActive ?? true
    });
    setMessage('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = { ...form };
      if (editingId) {
        await apiFetch(`/api/observer/integrations/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        setMessage('Integration updated.');
      } else {
        await apiFetch('/api/observer/integrations', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setMessage('Integration saved.');
      }
      setForm(DEFAULT_FORM);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message || 'Failed to save integration.');
    }
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <Navigation />
      <div className="max-w-6xl mx-auto pt-24 px-4 pb-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure game API access and observer capture settings for each title.
          </p>
        </div>

        {error && (
          <div className="glass-card rounded-xl p-4 text-sm text-red-300 border border-red-500/20">
            {error}
          </div>
        )}
        {diagnostics && !hasToken && <DiagnosticsPanel diagnostics={diagnostics} />}
        {loading && (
          <div className="glass-card rounded-xl p-4 text-sm text-gray-400">
            Loading integrations…
          </div>
        )}

        <div className="grid lg:grid-cols-[1.2fr,1fr] gap-6">
          <form className="glass rounded-xl p-5 space-y-4" onSubmit={onSubmit}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Link Game Account</h2>
              {message && <span className="text-xs text-[#00ff88]">{message}</span>}
            </div>
            <div>
              <label className="text-xs text-gray-400">Game</label>
              <select
                className="input mt-1"
                value={form.gameSlug}
                onChange={(e) => setForm({ ...form, gameSlug: e.target.value })}
              >
                {catalog.length === 0 && <option value="valorant">Valorant</option>}
                {catalog.map((game) => (
                  <option key={game.gameSlug} value={game.gameSlug}>{game.name}</option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Region</label>
                <input
                  className="input mt-1"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  placeholder="ap"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Platform</label>
                <input
                  className="input mt-1"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  placeholder="PC / Mobile"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Account ID</label>
                <input
                  className="input mt-1"
                  value={form.accountId}
                  onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                  placeholder="Player#1234"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">In-game Username</label>
                <input
                  className="input mt-1"
                  value={form.inGameUsername}
                  onChange={(e) => setForm({ ...form, inGameUsername: e.target.value })}
                  placeholder="Game ID"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400">API Key</label>
              <input
                className="input mt-1"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="Optional if game supports official API"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Active</label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
            </div>
            <button className="btn-primary" type="submit">
              {editingId ? 'Update Integration' : 'Save Integration'}
            </button>
          </form>

          <div className="space-y-4">
            <div className="glass rounded-xl p-5">
              <h2 className="font-semibold mb-3">Supported Data Fields</h2>
              {selectedCatalog ? (
                <div className="text-xs text-gray-400 space-y-2">
                  <div>API Available: <span className="text-white">{selectedCatalog.hasOfficialApi ? 'Yes' : 'No'}</span></div>
                  <div>Provider: <span className="text-white">{selectedCatalog.provider}</span></div>
                  <div>Required (API): {selectedCatalog.requiredFields.api.join(', ') || 'None'}</div>
                  <div>Required (Capture): {selectedCatalog.requiredFields.capture.join(', ') || 'None'}</div>
                  <div>Telemetry Fields: {selectedCatalog.telemetryFields.join(', ')}</div>
                  <div>Capture Strategy: {selectedCatalog.captureStrategy.method}</div>
                  <div className="text-gray-500">{selectedCatalog.captureStrategy.notes}</div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">Select a game to view requirements.</p>
              )}
            </div>

            <div className="glass rounded-xl p-5">
              <h2 className="font-semibold mb-3">Linked Accounts</h2>
              {integrations.length === 0 ? (
                <p className="text-xs text-gray-500">No integrations linked yet.</p>
              ) : (
                <div className="space-y-2">
                  {integrations.map((integration) => (
                    <button
                      type="button"
                      key={integration.integrationId}
                      className="w-full text-left glass-card rounded-lg p-3 hover:border-white/20"
                      onClick={() => onSelectIntegration(integration)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{integration.gameName || integration.gameSlug}</span>
                        <span className={`badge ${statusBadge(integration.status)}`}>{integration.status || 'pending'}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {integration.inGameUsername || integration.accountId || 'Account not set'} · {integration.region || 'region n/a'}
                      </div>
                      {integration.lastError && (
                        <div className="text-[11px] text-red-300 mt-1">{integration.lastError}</div>
                      )}
                      {integration.lastSyncAt && (
                        <div className="text-[11px] text-gray-500 mt-1">
                          Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
