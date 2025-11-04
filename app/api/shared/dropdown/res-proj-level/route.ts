import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().execute('sp_GetAll_Res_Proj_Level');
    const levels = result.recordset ?? [];
    return NextResponse.json({ levels });
  } catch (err) {
    console.error('Error fetching research project levels:', err);
    return NextResponse.json(
      { error: 'Failed to fetch research project levels' },
      { status: 500 }
    );
  }
}

