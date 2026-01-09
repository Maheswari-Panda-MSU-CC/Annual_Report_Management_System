import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { logActivityFromRequest } from '@/lib/activity-log';

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
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(req, user, 'CREATE', 'Post_Doctoral_Research', insertedId).catch(() => {});

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

    // Log activity (non-blocking)
    logActivityFromRequest(req, user, 'UPDATE', 'Post_Doctoral_Research', research.Id).catch(() => {});

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
    let docPath: string | null = searchParams.get('doc') || null;

    // Try to get doc from request body (preferred method)
    try {
      const contentType = req.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await req.text();
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText);
            if (body && body.doc && typeof body.doc === 'string') {
              docPath = body.doc.trim() || null;
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE PhD Research] Could not parse JSON body:', parseError);
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE PhD Research] Could not read request body, using query params:', bodyError);
    }

    if (!teacherId || !id) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId and id are required' }), { status: 400 });
    }

    const pool = await connectToDatabase();
    
    // Step 1: Get document path from database before deleting
    if (!docPath) {
      try {
        const getRequest = pool.request();
        getRequest.input('Id', sql.Int, id);
        const getResult = await getRequest.execute('sp_Get_Post_Doctoral_Exp_By_Id');
        if (getResult.recordset && getResult.recordset.length > 0) {
          docPath = getResult.recordset[0].doc || null;
        }
      } catch (getError) {
        console.warn('[DELETE PhD Research] Could not fetch document path:', getError);
      }
    }
    
    // Step 2: Delete S3 document if doc exists and is a valid S3 path
    let s3DeleteSuccess = false
    let s3DeleteMessage = 'No document to delete'
    
    if (docPath && typeof docPath === 'string' && docPath.trim() && docPath.startsWith('upload/')) {
      try {
        const { deleteFromS3 } = await import('@/lib/s3-service')
        
        console.log(`[DELETE PhD Research] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE PhD Research] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE PhD Research] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE PhD Research] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE PhD Research] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE PhD Research] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 3: Delete database record
    const request = pool.request();
    request.input('Id', sql.Int, id);
    await request.execute('sp_Delete_Post_Doctoral_Exp');
    console.log(`[DELETE PhD Research] ✓ Database record deleted: id=${id}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(req, user, 'DELETE', 'Post_Doctoral_Research', id).catch(() => {});
    
    // Step 4: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return Response.json({ 
        success: true, 
        message: 'Post-doctoral research record and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return Response.json({ 
        success: true, 
        message: 'Post-doctoral research record deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (error) {
    console.error('PhD Research DELETE error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}


