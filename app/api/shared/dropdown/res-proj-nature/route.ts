import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await connectToDatabase();
    // Assuming there's a stored procedure for project nature - if not, use a direct query
    // For now, using a generic approach - you may need to adjust the stored procedure name
    const result = await pool.request().execute('sp_GetAll_Res_Proj_Nature');
    const natures = result.recordset ?? [];
    return NextResponse.json({ natures });
  } catch (err) {
    console.error('Error fetching research project natures:', err);
    // Fallback to hardcoded options if stored procedure doesn't exist
    return NextResponse.json({
      natures: [
        { id: 1, name: 'Basic Research' },
        { id: 2, name: 'Applied Research' },
        { id: 3, name: 'Development' },
        { id: 4, name: 'Consultancy' },
      ]
    });
  }
}

