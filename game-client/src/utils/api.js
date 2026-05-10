const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

/**
 * Fetch JSON from the GameRise API with auth headers and helpful error messages.
 * @param {string} path - Relative API path (e.g. /api/matches)
 * @param {RequestInit} [options] - Fetch options (method, headers, body)
 * @returns {Promise<any>} Parsed JSON response payload
 */
export async function apiFetch(path, options = {}) {
  const { skipAuth, ...fetchOptions } = options;
  const headers = { ...(fetchOptions.headers || {}) };
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!skipAuth && token) headers.Authorization = `Bearer ${token}`;
  if (!headers['Content-Type'] && !(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data?.error || data?.message || message;
    } catch (error) {
      const statusText = response.statusText ? `: ${response.statusText}` : '';
      message = `${message}${statusText} (unable to parse error response)`;
    }
    const err = new Error(message);
    err.status = response.status;
    err.statusText = response.statusText;
    err.url = response.url;
    throw err;
  }
  return response.json();
}

export { API_BASE, API_ORIGIN };
