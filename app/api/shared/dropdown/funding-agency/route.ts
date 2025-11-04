import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().execute('sp_GetAllFundingAgencies');
    const agencies = result.recordset ?? [];
    return NextResponse.json({ agencies });
  } catch (err) {
    console.error('Error fetching funding agencies:', err);
    return NextResponse.json(
      { error: 'Failed to fetch funding agencies' },
      { status: 500 }
    );
  }
}

