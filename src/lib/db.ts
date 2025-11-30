export interface Guest {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  adults: number;
  children: number;
  message?: string | null;
  created_at?: string;
}

// Server-side API endpoints (kept secrets server-side, safe for public use).
// In development we proxy /api requests to the backend (vite config) and use a relative base so cookies stay same-origin.
const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');

async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' } as HeadersInit,
    // send cookies (httpOnly session cookie) for admin endpoints — works for same-origin or with proper CORS and credentials
    credentials: 'include',
  };
  if (body) options.body = JSON.stringify(body);

  console.log(`[API] ${method} ${url}`, body);
  
  try {
    // Cookie-based admin auth will be sent automatically when credentials: 'include' is enabled

    const resp = await fetch(url, options);
    console.log(`[API] Response status:`, resp.status);
    
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`[API] Error response:`, text);
      throw new Error(`API error (${resp.status}): ${text}`);
    }
    const data = await resp.json();
    console.log(`[API] Success:`, data);
    return data;
  } catch (err: any) {
    console.error(`[API] Fetch failed:`, err.message);
    throw err;
  }
}

export async function addGuest(guest: Guest) {
  const res = await apiCall('/api/guests', 'POST', guest);
  return { insertedId: res.insertedId };
}

export async function getGuests(): Promise<Guest[]> {
  const res = await apiCall('/api/guests', 'GET');
  return res as Guest[];
}

export async function getGuestStats() {
  const res = await apiCall('/api/guests/stats', 'GET');
  return res;
}

export async function exportGuestsCSV(): Promise<string> {
  // Return the raw CSV as text — server expects the admin cookie (httpOnly) and will authorize accordingly
  const headers: Record<string, string> = { 'Content-Type': 'text/csv' };
  const resp = await fetch(`${API_BASE_URL}/api/guests/export`, { headers, credentials: 'include' });
  if (!resp.ok) {
    throw new Error(`Failed to export: ${resp.status}`);
  }
  return resp.text();
}
