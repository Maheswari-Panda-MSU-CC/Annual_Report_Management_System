import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';

// Add new Education/Graduation entry (single row)
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await req.json();
    const { teacherId: bodyTeacherId, education } = body as { teacherId: number; education: any };

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Invalid teacherId' }, { status: 400 })
    }
    if (bodyTeacherId && bodyTeacherId !== teacherId) {
      return NextResponse.json({ success: false, error: 'Forbidden - User ID mismatch' }, { status: 403 })
    }

    if (!education) {
      return NextResponse.json({ success: false, error: 'education is required' }, { status: 400 });
    }

    // Validate required fields
    if (!education.degree_type || !education.university_name || !education.year_of_passing) {
      return NextResponse.json({ success: false, error: 'degree_type, university_name, and year_of_passing are required' }, { status: 400 });
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

    return NextResponse.json({ success: true, message: 'Education details added successfully', data: result });
  } catch (error) {
    console.error('Education POST error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Update single Education/Graduation entry by gid (for row-level updates)
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await req.json();
    const { teacherId: bodyTeacherId, education } = body as { teacherId: number; education: any };

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Invalid teacherId' }, { status: 400 })
    }
    if (bodyTeacherId && bodyTeacherId !== teacherId) {
      return NextResponse.json({ success: false, error: 'Forbidden - User ID mismatch' }, { status: 403 })
    }

    if (!education || !education.gid) {
      return NextResponse.json({ success: false, error: 'education and education.gid are required' }, { status: 400 });
    }

    // Validate required fields
    if (!education.degree_type || !education.university_name || !education.year_of_passing) {
      return NextResponse.json({ success: false, error: 'degree_type, university_name, and year_of_passing are required' }, { status: 400 });
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

    return NextResponse.json({ success: true, message: 'Education details updated successfully' });
  } catch (error) {
    console.error('Education PATCH error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Delete one Education row by gid
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(req.url);
    const teacherIdParam = parseInt(searchParams.get('teacherId') || '0', 10);
    const gid = parseInt(searchParams.get('gid') || '0', 10);
    let docPath: string | null = searchParams.get('doc') || null;

    // Try to get doc from request body (preferred method)
    // Accept both 'doc' and 'Image' field names for compatibility
    try {
      const contentType = req.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await req.text();
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText);
            // Check for both 'doc' and 'Image' field names
            if (body && typeof body === 'object') {
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null;
              } else if (body.Image && typeof body.Image === 'string') {
                docPath = body.Image.trim() || null;
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Education] Could not parse JSON body:', parseError);
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Education] Could not read request body, using query params:', bodyError);
    }

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Invalid teacherId' }, { status: 400 })
    }
    if (teacherIdParam && teacherIdParam !== teacherId) {
      return NextResponse.json({ success: false, error: 'Forbidden - User ID mismatch' }, { status: 403 })
    }

    if (!gid) {
      return NextResponse.json({ success: false, error: 'gid is required' }, { status: 400 });
    }

    const pool = await connectToDatabase();
    
    // Step 1: Get document path from database before deleting
    if (!docPath) {
      try {
        const getRequest = pool.request();
        getRequest.input('gid', sql.Int, gid);
        const getResult = await getRequest.execute('sp_Get_Grad_Details_By_Id');
        if (getResult.recordset && getResult.recordset.length > 0) {
          docPath = getResult.recordset[0].Image || null;
        }
      } catch (getError) {
        console.warn('[DELETE Education] Could not fetch document path:', getError);
      }
    }
    
    // Step 2: Delete S3 document if doc exists and is a valid S3 path
    let s3DeleteSuccess = false
    let s3DeleteMessage = 'No document to delete'
    
    if (docPath && typeof docPath === 'string' && docPath.trim() && docPath.startsWith('upload/')) {
      try {
        const { deleteFromS3 } = await import('@/lib/s3-service')
        
        console.log(`[DELETE Education] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Education] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Education] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Education] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Education] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Education] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 3: Delete database record
    const request = pool.request();
    request.input('gid', sql.Int, gid);
    await request.execute('sp_Delete_Grad_Details');
    console.log(`[DELETE Education] ✓ Database record deleted: gid=${gid}`)
    
    // Step 4: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Education record and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Education record deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (error) {
    console.error('Education DELETE error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

