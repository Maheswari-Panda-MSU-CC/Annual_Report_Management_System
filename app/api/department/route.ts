import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = parseInt(searchParams.get('facultyId') || '', 10);

    if (isNaN(facultyId)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing facultyId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input('Fid', sql.Int, facultyId) // param name, type, value
      .execute('GetDepartmentDetailsByFid');


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
