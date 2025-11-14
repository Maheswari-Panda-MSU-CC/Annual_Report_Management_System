import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

// Add new Experience entry (single row)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, experience } = body as { teacherId: number; experience: any };

    if (!teacherId || !experience) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId and experience are required' }), { status: 400 });
    }

    // Validate required fields
    if (!experience.Employeer || !experience.Start_Date || !experience.Nature || !experience.UG_PG) {
      return new Response(JSON.stringify({ success: false, error: 'Employeer, Start_Date, Nature, and UG_PG are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    
    request.input('Tid', sql.Int, teacherId);
    request.input('Employeer', sql.NVarChar(500), experience.Employeer);
    request.input('Start_Date', sql.Date, experience.Start_Date);
    request.input('End_Date', sql.Date, experience.currente ? null : (experience.End_Date ?? null));
    request.input('Nature', sql.VarChar(500), experience.Nature);
    request.input('UG_PG', sql.VarChar(10), experience.UG_PG);
    request.input('upload', sql.VarChar(100), experience.upload ?? null);
    request.input('currente', sql.Bit, experience.currente ?? false);
    request.input('desig', sql.NVarChar(100), experience.desig ?? null);

    const result = await request.execute('sp_Insert_Teacher_Experience'); // TODO: update to actual stored procedure name

    return Response.json({ success: true, message: 'Experience added successfully', data: result });
  } catch (error) {
    console.error('Experience POST error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Update single Experience entry by Id (for row-level updates)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, experience } = body as { teacherId: number; experience: any };

    if (!teacherId || !experience || !experience.Id) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId, experience, and experience.Id are required' }), { status: 400 });
    }

    // Validate required fields
    if (!experience.Employeer || !experience.Start_Date || !experience.Nature || !experience.UG_PG) {
      return new Response(JSON.stringify({ success: false, error: 'Employeer, Start_Date, Nature, and UG_PG are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    
    request.input('Id', sql.Int, experience.Id);
    request.input('Tid', sql.Int, teacherId);
    request.input('Employeer', sql.NVarChar(500), experience.Employeer);
    request.input('Start_Date', sql.Date, experience.Start_Date);
    request.input('End_Date', sql.Date, experience.currente===1 ? null : (experience.End_Date ?? null));
    request.input('Nature', sql.VarChar(500), experience.Nature);
    request.input('UG_PG', sql.VarChar(10), experience.UG_PG);
    request.input('upload', sql.VarChar(100), experience.upload ?? null);
    request.input('currente', sql.Bit, experience.currente ?? 0);
    request.input('desig', sql.NVarChar(100), experience.desig ?? null);

    await request.execute('sp_Update_Teacher_Experience');

    return Response.json({ success: true, message: 'Experience updated successfully' });
  } catch (error) {
    console.error('Experience PATCH error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Delete one Experience row by Id
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = parseInt(searchParams.get('teacherId') || '0', 10);
    const id = parseInt(searchParams.get('id') || '0', 10);

    if (!teacherId || !id) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId and id are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    request.input('Id', sql.Int, id);

    // TODO: update to actual stored procedure name
    await request.execute('sp_Delete_Teacher_Experience');

    return Response.json({ success: true });
  } catch (error) {
    console.error('Experience DELETE error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}


