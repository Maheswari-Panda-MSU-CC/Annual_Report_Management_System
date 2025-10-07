import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    // Connect to SQL Server
    const pool = await connectToDatabase();

    // Execute the stored procedure
    const result = await pool.request().execute('sp_GetAllDegreeTypes');

    // Extract the recordset
    const degreeTypes = result.recordset ?? [];

    // Return JSON response
    return NextResponse.json({ degreeTypes });

  } catch (err) {
    console.error('Error fetching degreeTypes:', err);
    return NextResponse.json(
      { error: 'Failed to fetch degreeTypes data' },
      { status: 500 }
    );
  }
}
