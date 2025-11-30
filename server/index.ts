import 'dotenv/config';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { addGuest, getGuests, getGuestStats, convertGuestsToCSV } from './db';

const app = express();
// Security headers
app.use(helmet());

// Parse JSON body and cookies
app.use(express.json());
app.use(cookieParser());

// CORS middleware — allow requests from frontend. Set ALLOWED_ORIGIN in env for prod.
app.use((req: Request, res: Response, next: any) => {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', origin);
  // Allow cookies to be sent when the origin is explicit (not '*')
  if (origin && origin !== '*') res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rate limiting — general API limiter and stricter limits for login
const generalLimiter = rateLimit({ windowMs: 60_000, max: 120 }); // 120 requests per minute per IP
const loginLimiter = rateLimit({ windowMs: 60_000, max: 6 }); // 6 login attempts per minute
app.use('/api/', generalLimiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Admin middleware - protect routes with ADMIN_TOKEN
function requireAdmin(req: Request, res: Response, next: any) {
  // Look for cookie first, then Authorization header or x-admin-token
  const cookieToken = req.cookies?.admin_token as string | undefined;
  const authHeader = (req.headers.authorization as string) || (req.headers['x-admin-token'] as string) || '';
  let token = '';
  if (cookieToken) token = cookieToken;
  else if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  else token = authHeader;

  if (!process.env.ADMIN_TOKEN) {
    console.warn('ADMIN_TOKEN is not set on the server; all admin routes will be denied');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// Admin login
app.post('/api/admin/login', loginLimiter, (req: Request, res: Response) => {
  try {
    const { password } = req.body || {};
    const configured = process.env.ADMIN_PASSWORD;
    if (!configured) {
      console.error('ADMIN_PASSWORD not set on server');
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    if (password === configured) {
      // Set the admin token as a secure httpOnly cookie so it cannot be reached by JavaScript
      const token = process.env.ADMIN_TOKEN as string;
      const cookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      };
      res.cookie('admin_token', token, cookieOptions);
      return res.json({ ok: true });
    }

    return res.status(401).json({ error: 'Invalid password' });
  } catch (err: any) {
    console.error('POST /api/admin/login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Admin logout — clears the admin cookie
app.post('/api/admin/logout', (req: Request, res: Response) => {
  try {
    res.clearCookie('admin_token');
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('POST /api/admin/logout error:', err);
    return res.status(500).json({ error: 'Failed to logout' });
  }
});

// POST /api/guests — Insert a new RSVP
app.post('/api/guests', async (req: Request, res: Response) => {
  try {
    console.log('POST /api/guests received:', req.body);
    // Validate input using zod
    const GuestSchema = z.object({
      name: z.string().min(1).max(120),
      email: z.string().email().max(256),
      phone: z.string().max(64).nullable().or(z.string()).optional(),
      adults: z.preprocess((v) => Number(v), z.number().int().min(0)).default(1),
      children: z.preprocess((v) => Number(v), z.number().int().min(0)).default(0),
      message: z.string().max(500).nullable().optional(),
    });

    const parsed = GuestSchema.safeParse(req.body);
    if (!parsed.success) {
      console.warn('Invalid RSVP payload', parsed.error.format());
      return res.status(400).json({ error: 'Invalid input' });
    }

    const { name, email, phone, adults, children, message } = parsed.data;

    const result = await addGuest({
      name,
      email,
      phone: phone || null,
      adults: adults || 1,
      children: children || 0,
      message: message || null,
    });

    console.log('Guest inserted:', result);
    res.json({ insertedId: result.insertedId });
  } catch (err: any) {
    console.error('POST /api/guests error:', err);
    res.status(500).json({ error: err.message || 'Failed to insert guest' });
  }
});

// GET /api/guests — Fetch all guests (admin-only in production)
app.get('/api/guests', requireAdmin, async (req: Request, res: Response) => {
  try {
    const guests = await getGuests();
    res.json(guests);
  } catch (err: any) {
    console.error('GET /api/guests error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch guests' });
  }
});

// GET /api/guests/stats — Fetch guest statistics
app.get('/api/guests/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await getGuestStats();
    res.json(stats);
  } catch (err: any) {
    console.error('GET /api/guests/stats error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

// GET /api/guests/export — Export guests as CSV (admin-only)
app.get('/api/guests/export', requireAdmin, async (req: Request, res: Response) => {
  try {
    const guests = await getGuests();
    const csv = convertGuestsToCSV(guests);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="anniversary-guests-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  } catch (err: any) {
    console.error('GET /api/guests/export error:', err);
    res.status(500).json({ error: err.message || 'Failed to export guests' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(`  POST   /api/guests`);
  console.log(`  GET    /api/guests`);
  console.log(`  GET    /api/guests/stats`);
  console.log(`  GET    /api/guests/export`);
});
