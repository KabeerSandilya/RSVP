import { corsHeaders } from '../_shared/cors.ts';

// This Supabase function has been decommissioned and replaced by the server-side
// API route /api/guests/export in the Node server. The server keeps database
// credentials and export logic within the app (no client-side secrets).

// Return a 410 Gone so callers know the function is no longer available.
Deno.serve((_req) => {
  return new Response(JSON.stringify({
    error: 'This function is deprecated. Use the server API at /api/guests/export instead.'
  }), { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
