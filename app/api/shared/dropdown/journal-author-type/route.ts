import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().execute('sp_GetAllTeacherJournalsAuthorTypes');
    const journalAuthorTypes = result.recordset ?? [];
    return NextResponse.json({ journalAuthorTypes });
  } catch (err) {
    console.error('Error fetching journal author types:', err);
    return NextResponse.json(
      { error: 'Failed to fetch journal author types' },
      { status: 500 }
    );
  }
}

