import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = await connectToDatabase();
    // Assuming there's a stored procedure for event student body levels
    // If not, we'll need to use a generic level stored procedure or create one
    // For now, using a common pattern - adjust the SP name if different
    const result = await pool.request().execute('sp_GetAll_Events_Stud_Body_Level');
    const levels = result.recordset ?? [];
    
    // Map to consistent format { id, name }
    const mappedLevels = levels.map((item: any) => ({
      id:  item.id,
      name: item.name,
    }));
    
    return NextResponse.json({ levels: mappedLevels });
  } catch (err) {
    console.error('Error fetching event student body levels:', err);
    return NextResponse.json(
      { error: 'Failed to fetch event student body levels' },
      { status: 500 }
    );
  }
}

