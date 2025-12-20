import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';

// Add new Experience entry (single row)
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await req.json();
    const { teacherId: bodyTeacherId, experience } = body as { teacherId: number; experience: any };

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Invalid teacherId' }, { status: 400 })
    }
    if (bodyTeacherId && bodyTeacherId !== teacherId) {
      return NextResponse.json({ success: false, error: 'Forbidden - User ID mismatch' }, { status: 403 })
    }

    if (!experience) {
      return NextResponse.json({ success: false, error: 'Experience is required' }, { status: 400 });
    }

    // Validate required fields
    if (!experience.Employeer || !experience.Start_Date || !experience.Nature || !experience.UG_PG) {
      return NextResponse.json({ success: false, error: 'Employeer, Start_Date, Nature, and UG_PG are required' }, { status: 400 });
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

    return NextResponse.json({ success: true, message: 'Experience added successfully', data: result });
  } catch (error) {
    console.error('Experience POST error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Update single Experience entry by Id (for row-level updates)
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await req.json();
    const { teacherId: bodyTeacherId, experience } = body as { teacherId: number; experience: any };

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Invalid teacherId' }, { status: 400 })
    }
    if (bodyTeacherId && bodyTeacherId !== teacherId) {
      return NextResponse.json({ success: false, error: 'Forbidden - User ID mismatch' }, { status: 403 })
    }

    if (!experience || !experience.Id) {
      return NextResponse.json({ success: false, error: 'experience and experience.Id are required' }, { status: 400 });
    }

    // Validate required fields
    if (!experience.Employeer || !experience.Start_Date || !experience.Nature || !experience.UG_PG) {
      return NextResponse.json({ success: false, error: 'Employeer, Start_Date, Nature, and UG_PG are required' }, { status: 400 });
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

    return NextResponse.json({ success: true, message: 'Experience updated successfully' });
  } catch (error) {
    console.error('Experience PATCH error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Delete one Experience row by Id
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(req.url);
    const teacherIdParam = parseInt(searchParams.get('teacherId') || '0', 10);
    const id = parseInt(searchParams.get('id') || '0', 10);

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Invalid teacherId' }, { status: 400 })
    }
    if (teacherIdParam && teacherIdParam !== teacherId) {
      return NextResponse.json({ success: false, error: 'Forbidden - User ID mismatch' }, { status: 403 })
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    request.input('Id', sql.Int, id);

    // TODO: update to actual stored procedure name
    await request.execute('sp_Delete_Teacher_Experience');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Experience DELETE error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}


