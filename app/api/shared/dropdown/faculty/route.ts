import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    // Connect to SQL Server
    const pool = await connectToDatabase();

    // Execute the stored procedure
    const result = await pool.request().execute('sp_GetAll_Faculty');

    // Extract the recordset
    const faculties = result.recordset ?? [];

    // Return JSON response
    return NextResponse.json({ faculties });

  } catch (err) {
    console.error('Error fetching faculties:', err);
    return NextResponse.json(
      { error: 'Failed to fetch faculty data' },
      { status: 500 }
    );
  }
}
