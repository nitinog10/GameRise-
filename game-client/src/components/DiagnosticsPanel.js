import React from 'react';

const DiagnosticsPanel = ({ diagnostics }) => {
  if (!diagnostics) return null;

  const {
    apiBase,
    apiOrigin,
    hasToken,
    tokenUserId,
    healthStatus,
    healthError,
    matchesStatus,
    matchesError,
    originMismatch,
    socketStatus,
    lastUpdateAt
  } = diagnostics;

  const statusBadge = (status) => {
    if (status === 'connected') return 'badge-green';
    if (status?.startsWith('error')) return 'badge-red';
    return 'badge-amber';
  };

  return (
    <div className="glass-card rounded-xl p-4 text-xs text-gray-300 space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-semibold text-gray-200">Diagnostics</span>
        <span className={`badge ${statusBadge(socketStatus)}`}>Socket: {socketStatus}</span>
        {lastUpdateAt && <span className="badge badge-blue">Last update: {new Date(lastUpdateAt).toLocaleTimeString()}</span>}
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <div><span className="text-gray-500">API Base:</span> {apiBase}</div>
          <div><span className="text-gray-500">API Origin:</span> {apiOrigin}</div>
          {originMismatch && (
            <div className="text-amber-300">Origin mismatch — update backend CORS to include {typeof window !== 'undefined' ? window.location.origin : 'current origin'}.</div>
          )}
        </div>
        <div>
          <div><span className="text-gray-500">Token:</span> {hasToken ? `present (${tokenUserId || 'unknown user'})` : 'missing'}</div>
          <div><span className="text-gray-500">Health:</span> {healthStatus ?? 'n/a'} {healthError && `· ${healthError}`}</div>
          <div><span className="text-gray-500">Matches:</span> {matchesStatus ?? 'n/a'} {matchesError && `· ${matchesError}`}</div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
