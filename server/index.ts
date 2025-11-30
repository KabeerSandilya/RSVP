import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { z } from 'zod';
import {
  addGuest,
  getGuests,
  getGuestStats,
  convertGuestsToCSV,
} from './db.js';

const app = express();

// ---------- Constants ----------
const PORT = Number(process.env.PORT) || 5000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const STATIC_DIR = path.join(process.cwd(), 'dist');

// ---------- Middleware ----------
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Simple CORS middleware — explicit origin recommended in production
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  if (ALLOWED_ORIGIN && ALLOWED_ORIGIN !== '*') {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-admin-token');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Rate limiting
const generalLimiter = rateLimit({ windowMs: 60_000, max: 120 }); // 120 req/min
const loginLimiter = rateLimit({ windowMs: 60_000, max: 6 }); // 6 logins/min
app.use('/api/', generalLimiter);

// ---------- Utility / Admin ----------
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const cookieToken = (req.cookies as Record<string, string | undefined>)?.admin_token;
  const authHeader = (req.headers.authorization as string) || (req.headers['x-admin-token'] as string) || '';
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  const token = cookieToken || tokenFromHeader || '';

  if (!process.env.ADMIN_TOKEN) {
    console.warn('ADMIN_TOKEN not set; denying admin routes.');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

// ---------- Routes ----------
// Health check
app.get('/health', (_: Request, res: Response) => res.json({ status: 'ok' }));

// Admin login
app.post('/api/admin/login', loginLimiter, (req: Request, res: Response) => {
  try {
    const { password } = req.body || {};
    const configured = process.env.ADMIN_PASSWORD;
    if (!configured) {
      console.error('ADMIN_PASSWORD not set');
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    if (password === configured) {
      const token = process.env.ADMIN_TOKEN as string;
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
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

// Admin logout
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
      adults: adults ?? 1,
      children: children ?? 0,
      message: message || null,
    });

    console.log('Guest inserted:', result);
    return res.json({ insertedId: result.insertedId });
  } catch (err: any) {
    console.error('POST /api/guests error:', err);
    return res.status(500).json({ error: err.message || 'Failed to insert guest' });
  }
});

// GET /api/guests — admin-only
app.get('/api/guests', requireAdmin, async (_: Request, res: Response) => {
  try {
    const guests = await getGuests();
    return res.json(guests);
  } catch (err: any) {
    console.error('GET /api/guests error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch guests' });
  }
});

// GET /api/guests/stats — admin-only
app.get('/api/guests/stats', requireAdmin, async (_: Request, res: Response) => {
  try {
    const stats = await getGuestStats();
    return res.json(stats);
  } catch (err: any) {
    console.error('GET /api/guests/stats error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

// GET /api/guests/export — admin-only CSV export
app.get('/api/guests/export', requireAdmin, async (_: Request, res: Response) => {
  try {
    const guests = await getGuests();
    const csv = convertGuestsToCSV(guests);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="anniversary-guests-${new Date().toISOString().split('T')[0]}.csv"`
    );
    return res.send(csv);
  } catch (err: any) {
    console.error('GET /api/guests/export error:', err);
    return res.status(500).json({ error: err.message || 'Failed to export guests' });
  }
});

// ---------- Serve frontend build (static) ----------
// Serve all static files from dist (JS, CSS, images)
app.use(express.static(STATIC_DIR));

// SPA fallback — serve index.html for non-API routes
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('API endpoints:');
  console.log('  POST   /api/guests');
  console.log('  GET    /api/guests');
  console.log('  GET    /api/guests/stats');
  console.log('  GET    /api/guests/export');
});

export default app;
