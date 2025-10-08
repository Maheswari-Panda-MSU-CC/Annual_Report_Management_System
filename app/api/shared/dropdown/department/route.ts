import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

// GET /api/shared/dropdown/department?fid=123
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get('fid');

    if (!fidParam) {
      return NextResponse.json(
        { error: 'Missing required query parameter: fid' },
        { status: 400 }
      );
    }

    const fid = Number(fidParam);
    if (Number.isNaN(fid)) {
      return NextResponse.json(
        { error: 'Invalid fid. It must be a number.' },
        { status: 400 }
      );
    }

    const pool = await connectToDatabase();

    // Execute the stored procedure with @Fid input
    const result = await pool
      .request()
      .input('Fid', sql.Int, fid)
      .execute('sp_GetDepartmentsByFacultyId');

    const departments = result.recordset ?? [];

    return NextResponse.json({ departments });
  } catch (err) {
    console.error('Error fetching departments:', err);
    return NextResponse.json(
      { error: 'Failed to fetch department data' },
      { status: 500 }
    );
  }
}

// Note: legacy GET without fid has been removed in favor of fid-based fetching

