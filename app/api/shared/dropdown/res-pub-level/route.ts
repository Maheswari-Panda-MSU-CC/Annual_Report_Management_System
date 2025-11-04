import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().execute('sp_GetAll_Res_Pub_Level');
    const resPubLevels = result.recordset ?? [];
    return NextResponse.json({ resPubLevels });
  } catch (err) {
    console.error('Error fetching research publication levels:', err);
    return NextResponse.json(
      { error: 'Failed to fetch research publication levels' },
      { status: 500 }
    );
  }
}

