import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().execute('sp_GetAllPatents_Level');
    const patentStatuses = result.recordset ?? [];
    return NextResponse.json({ patentStatuses });
  } catch (err) {
    console.error('Error fetching patent statuses:', err);
    return NextResponse.json(
      { error: 'Failed to fetch patent statuses' },
      { status: 500 }
    );
  }
}

