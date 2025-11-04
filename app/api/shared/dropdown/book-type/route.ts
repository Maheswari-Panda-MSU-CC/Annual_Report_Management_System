import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().execute('sp_GetAll_Book_Type');
    const bookTypes = result.recordset ?? [];
    return NextResponse.json({ bookTypes });
  } catch (err) {
    console.error('Error fetching book types:', err);
    return NextResponse.json(
      { error: 'Failed to fetch book types' },
      { status: 500 }
    );
  }
}

