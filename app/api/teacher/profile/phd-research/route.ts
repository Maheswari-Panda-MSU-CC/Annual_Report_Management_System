import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';

// Add new Post-Doctoral Research entry (single row)
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { research } = body as { research: any };
    const teacherId = user.role_id;

    if (!teacherId || !research) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId and research are required' }), { status: 400 });
    }

    // Validate required fields
    if (!research.Institute || !research.Start_Date || !research.End_Date) {
      return new Response(JSON.stringify({ success: false, error: 'Institute, Start_Date, and End_Date are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    
    request.input('Tid', sql.Int, teacherId);
    request.input('Institute', sql.VarChar(500), research.Institute);
    request.input('Start_Date', sql.Date, research.Start_Date);
    request.input('End_Date', sql.Date, research.End_Date);
    request.input('SponsoredBy', sql.VarChar(500), research.SponsoredBy ?? '');
    request.input('QS_THE', sql.VarChar(50), research.QS_THE ?? '');
    request.input('doc', sql.VarChar(100), research.doc ?? '');

    const result = await request.execute('sp_Insert_Post_Doctoral_Exp'); // TODO: update to actual stored procedure name

    return Response.json({ success: true, message: 'Post-doctoral research added successfully', data: result });
  } catch (error) {
    console.error('Post-Doc POST error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Update single Post-Doctoral Research entry by Id (for row-level updates)
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { research } = body as { research: any };
    const teacherId = user.role_id;

    if (!teacherId || !research || !research.Id) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId, research, and research.Id are required' }), { status: 400 });
    }

    // Validate required fields
    if (!research.Institute || !research.Start_Date || !research.End_Date) {
      return new Response(JSON.stringify({ success: false, error: 'Institute, Start_Date, and End_Date are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    
    request.input('Id', sql.Int, research.Id);
    request.input('Tid', sql.Int, teacherId);
    request.input('Institute', sql.VarChar(500), research.Institute);
    request.input('Start_Date', sql.Date, research.Start_Date);
    request.input('End_Date', sql.Date, research.End_Date);
    request.input('SponsoredBy', sql.VarChar(500), research.SponsoredBy ?? '');
    request.input('QS_THE', sql.VarChar(50), research.QS_THE ?? '');
    request.input('doc', sql.VarChar(100), research.doc ?? '');

    await request.execute('sp_Update_Post_Doctoral_Exp');

    return Response.json({ success: true, message: 'Post-doctoral research updated successfully' });
  } catch (error) {
    console.error('Post-Doc PATCH error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Delete one research row by Id
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(req.url);
    const teacherId = user.role_id;
    const id = parseInt(searchParams.get('id') || '0', 10);

    if (!teacherId || !id) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId and id are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();
    request.input('Id', sql.Int, id);

    // TODO: update to actual stored procedure name
    await request.execute('sp_Delete_Post_Doctoral_Exp');

    return Response.json({ success: true });
  } catch (error) {
    console.error('PhD Research DELETE error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}


