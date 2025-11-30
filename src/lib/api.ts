export const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export type ApiCallOptions = {
  raw?: boolean; // return plain text
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
};

async function apiCall(path: string, method = 'GET', body?: any, opts: ApiCallOptions = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = {
    ...(opts.headers ?? {}),
  };

  let bodyData: BodyInit | undefined;
  if (body !== undefined) {
    if (headers['Content-Type']?.includes('application/json') || typeof body === 'object') {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
      bodyData = JSON.stringify(body);
    } else {
      bodyData = body as BodyInit;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: bodyData,
    credentials: opts.credentials ?? 'include',
  });

  if (!res.ok) {
    // Try to give a helpful error message
    const text = await res.text().catch(() => '');
    try {
      const json = JSON.parse(text || '{}');
      throw new Error(json.error || json.message || text || res.statusText);
    } catch {
      throw new Error(text || res.statusText || 'Request failed');
    }
  }

  if (opts.raw) return res.text();

  // Try JSON, fall back to text
  return res.json().catch(async () => await res.text());
}

export async function adminLogin(password: string) {
  return apiCall('/admin/login', 'POST', { password }, { credentials: 'include' });
}

export async function submitRSVP(payload: any) {
  return apiCall('/guests', 'POST', payload, { credentials: 'include' });
}

export async function fetchStats() {
  return apiCall('/guests/stats', 'GET', undefined, { credentials: 'include' });
}

export default apiCall;