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

import apiCall from './api';

export async function addGuest(guest: Guest) {
  const res = await apiCall('/guests', 'POST', guest);
  return { insertedId: res.insertedId };
}

export async function getGuests(): Promise<Guest[]> {
  const res = await apiCall('/guests', 'GET');
  return res as Guest[];
}

export async function getGuestStats() {
  const res = await apiCall('/guests/stats', 'GET');
  return res;
}

export async function exportGuestsCSV(): Promise<string> {
  // Return the CSV as raw text; rely on apiCall's credentials/include behavior
  const res = await apiCall('/guests/export', 'GET', undefined, { raw: true, headers: { 'Content-Type': 'text/csv' } });
  return String(res);
}
