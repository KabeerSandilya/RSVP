import { MongoClient, Db, Collection } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const uri = process.env.MONGO_URL;
if (!uri) {
  throw new Error('MONGO_URL environment variable is not set');
}

const dbName = process.env.MONGODB_DB_NAME || 'rsvp';
const collectionName = process.env.MONGODB_COLLECTION || 'guests';

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri as string);

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  console.log(`Connected to MongoDB (db: ${dbName})`);
  return { client, db };
}

export async function getGuestsCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

export async function addGuest(guest: any) {
  const col = await getGuestsCollection();
  const doc = { ...guest, created_at: new Date().toISOString() };
  const result = await col.insertOne(doc);
  return { insertedId: result.insertedId };
}

export async function getGuests() {
  const col = await getGuestsCollection();
  return col.find({}).sort({ created_at: -1 }).toArray();
}

export async function getGuestStats() {
  const guests = await getGuests();
  const totalGuests = guests.length;
  const totalAdults = guests.reduce((sum, g) => sum + (g.adults || 0), 0);
  const totalChildren = guests.reduce((sum, g) => sum + (g.children || 0), 0);
  const totalAttendees = totalAdults + totalChildren;
  return { totalGuests, totalAdults, totalChildren, totalAttendees };
}

export function convertGuestsToCSV(guests: any[]): string {
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
      escapeCsv(guest.name || ''),
      escapeCsv(guest.email || ''),
      escapeCsv(guest.phone || ''),
      guest.adults ?? 0,
      guest.children ?? 0,
      total,
      escapeCsv(guest.message || ''),
      escapeCsv(rsvp),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function escapeCsv(field: string | number) {
  if (typeof field === 'number') return String(field);
  if (!field) return '';
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
