import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

// Add new Education/Graduation entry (single row)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, education } = body as { teacherId: number; education: any };

    if (!teacherId || !education) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId and education are required' }), { status: 400 });
    }

    // Validate required fields
    if (!education.degree_type || !education.university_name || !education.year_of_passing) {
      return new Response(JSON.stringify({ success: false, error: 'degree_type, university_name, and year_of_passing are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    
    request.input('tid', sql.Int, teacherId);
    request.input('degree_type', sql.Int, education.degree_type);
    request.input('university_name', sql.NVarChar(200), education.university_name);
    request.input('state', sql.NVarChar(50), education.state ?? '');
    request.input('year_of_passing', sql.Date, education.year_of_passing);
    request.input('Image', sql.VarChar(500), education.Image ?? null);
    request.input('QS_Ranking', sql.VarChar(500), education.QS_Ranking ?? null);
    request.input('subject', sql.NVarChar(100), education.subject ?? null);

    const result = await request.execute('sp_Insert_Grad_Details'); // TODO: update to actual stored procedure name

    return Response.json({ success: true, message: 'Education details added successfully', data: result });
  } catch (error) {
    console.error('Education POST error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Update single Education/Graduation entry by gid (for row-level updates)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, education } = body as { teacherId: number; education: any };

    if (!teacherId || !education || !education.gid) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId, education, and education.gid are required' }), { status: 400 });
    }

    // Validate required fields
    if (!education.degree_type || !education.university_name || !education.year_of_passing) {
      return new Response(JSON.stringify({ success: false, error: 'degree_type, university_name, and year_of_passing are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    
    request.input('gid', sql.Int, education.gid);
    request.input('tid', sql.Int, teacherId);
    request.input('degree_type', sql.Int, education.degree_type);
    request.input('university_name', sql.NVarChar(200), education.university_name);
    request.input('state', sql.NVarChar(50), education.state ?? '');
    request.input('year_of_passing', sql.Date, education.year_of_passing);
    request.input('Image', sql.VarChar(500), education.Image ?? null);
    request.input('QS_Ranking', sql.VarChar(500), education.QS_Ranking ?? null);
    request.input('subject', sql.NVarChar(100), education.subject ?? null);

    await request.execute('sp_Update_Grad_Details');

    return Response.json({ success: true, message: 'Education details updated successfully' });
  } catch (error) {
    console.error('Education PATCH error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Delete one Education row by gid
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = parseInt(searchParams.get('teacherId') || '0', 10);
    const gid = parseInt(searchParams.get('gid') || '0', 10);

    if (!teacherId || !gid) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId and gid are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    request.input('gid', sql.Int, gid);

    // TODO: update to actual stored procedure name
    await request.execute('sp_Delete_Grad_Details');

    return Response.json({ success: true });
  } catch (error) {
    console.error('Education DELETE error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

