// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// API Wrapper import
// -----------------------------------------------------------------------------
import apiCall from './api.ts';

// -----------------------------------------------------------------------------
// Public API (RSVP submission)
// -----------------------------------------------------------------------------
export async function addGuest(guest: Guest) {
  // POST /api/guests
  const res = await apiCall('/guests', 'POST', guest);
  return { insertedId: res.insertedId };
}

// -----------------------------------------------------------------------------
// Admin-required API calls
// These must include credentials internally so the admin_token cookie is sent
// -----------------------------------------------------------------------------
export async function getGuests(): Promise<Guest[]> {
  // GET /api/guests
  const res = await apiCall('/guests', 'GET', undefined, {
    credentials: 'include',
  });
  return res as Guest[];
}

export async function getGuestStats() {
  // GET /api/guests/stats
  const res = await apiCall('/guests/stats', 'GET', undefined, {
    credentials: 'include',
  });
  return res;
}

export async function exportGuestsCSV(): Promise<string> {
  // GET /api/guests/export — return raw CSV
  const res = await apiCall('/guests/export', 'GET', undefined, {
    raw: true,
    credentials: 'include', // IMPORTANT so admin cookie is sent
    headers: { 'Content-Type': 'text/csv' },
  });
  return String(res);
}
