import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    // Connect to SQL Server
    const pool = await connectToDatabase();

    // Execute the stored procedure
    const result = await pool.request().execute('sp_GetAllDepartments');

    // Extract the recordset
    const departments = result.recordset ?? [];

    // Return JSON response
    return NextResponse.json({ departments });

  } catch (err) {
    console.error('Error fetching departments:', err);
    return NextResponse.json(
      { error: 'Failed to fetch department data' },
      { status: 500 }
    );
  }
}
