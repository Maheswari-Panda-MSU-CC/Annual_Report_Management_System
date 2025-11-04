import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().execute('sp_GetAll_Teacher_Jour_Edited_Type');
    const journalEditedTypes = result.recordset ?? [];
    return NextResponse.json({ journalEditedTypes });
  } catch (err) {
    console.error('Error fetching journal edited types:', err);
    return NextResponse.json(
      { error: 'Failed to fetch journal edited types' },
      { status: 500 }
    );
  }
}

