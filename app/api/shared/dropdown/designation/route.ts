import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type')?.toLowerCase();

    if (!type || (type !== 'permanent' && type !== 'temporary')) {
      return NextResponse.json(
        { error: 'Invalid or missing type parameter. Use ?type=permanent or ?type=temporary.' },
        { status: 400 }
      );
    }

    const pool = await connectToDatabase();

    // Decide which SP to call based on type
    const spName =
      type === 'permanent'
        ? 'sp_Get_All_perma_desig'
        : 'sp_GetAllTenureDesig';

    const result = await pool.request().execute(spName);
    const designations = result.recordset ?? [];

    return NextResponse.json({ type, designations });
  } catch (err) {
    console.error('Error fetching designations:', err);
    return NextResponse.json(
      { error: 'Failed to fetch designation data' },
      { status: 500 }
    );
  }
}
