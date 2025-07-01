import { connectToDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().query('SELECT * FROM Faculty');
    console.log('Faculty Data:', result.recordset);
    return new Response(JSON.stringify(result.recordset), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('API Error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch reports' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 