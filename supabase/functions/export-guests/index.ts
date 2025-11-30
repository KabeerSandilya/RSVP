import { corsHeaders } from '../_shared/cors.ts';

// This function has been migrated from Supabase to use MongoDB Atlas Data API.
// Environment variables required (set these in your Supabase function secrets):
// MONGODB_DATA_API_URL - e.g. https://data.mongodb-api.com/app/<app-id>/endpoint/data/v1/action
// MONGODB_DATA_API_KEY - your Data API key (keep secret)
// MONGODB_DATA_SOURCE - e.g. Cluster0
// MONGODB_DB_NAME - e.g. rsvp
// MONGODB_COLLECTION - e.g. guests

interface Guest {
  _id?: { $oid?: string } | string;
  name: string;
  email: string;
  phone?: string | null;
  adults: number;
  children: number;
  message?: string | null;
  created_at?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiUrl = (Deno.env.get('MONGODB_DATA_API_URL') || '').replace(/\/$/, '');
    const apiKey = Deno.env.get('MONGODB_DATA_API_KEY') || '';
    const dataSource = Deno.env.get('MONGODB_DATA_SOURCE') || 'Cluster0';
    const database = Deno.env.get('MONGODB_DB_NAME') || 'rsvp';
    const collection = Deno.env.get('MONGODB_COLLECTION') || 'guests';

    if (!apiUrl || !apiKey) {
      console.error('Missing MongoDB Data API config');
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Query MongoDB Data API find action
    const resp = await fetch(`${apiUrl}/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        dataSource,
        database,
        collection,
        filter: {},
        sort: { created_at: -1 },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Data API error', resp.status, text);
      throw new Error(`Data API error: ${text}`);
    }

    const body = await resp.json();
    const guests: Guest[] = body.documents || [];

    // Convert to CSV
    const csv = convertToCSV(guests || []);

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="anniversary-guests-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to export guests' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function convertToCSV(guests: Guest[]): string {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Adults',
    'Children',
    'Total Guests',
    'Message',
    'RSVP Date',
  ];

  const rows = guests.map((guest) => {
    const total = (guest.adults || 0) + (guest.children || 0);
    const rsvp = guest.created_at ? new Date(guest.created_at).toLocaleString() : '';
    return [
      escapeCsvField(guest.name || ''),
      escapeCsvField(guest.email || ''),
      escapeCsvField(guest.phone || ''),
      guest.adults ?? 0,
      guest.children ?? 0,
      total,
      escapeCsvField(guest.message || ''),
      escapeCsvField(rsvp),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function escapeCsvField(field: string | number): string {
  if (typeof field === 'number') return String(field);
  if (!field) return '';
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
