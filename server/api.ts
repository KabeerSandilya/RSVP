// src/lib/api.ts
// Server side helper, prefer process.env on Node instead of import.meta.env
export const API_BASE = process.env.VITE_API_URL ?? '/api';

export async function adminLogin(password: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // important: accept cookies
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function submitRSVP(payload: any) {
  const res = await fetch(`${API_BASE}/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit RSVP');
  return res.json();
}

// add helpers for stats/export if needed
export async function fetchStats() {
  const res = await fetch(`${API_BASE}/guests/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
