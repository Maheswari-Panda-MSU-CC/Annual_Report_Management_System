import { connectToDatabase } from '@/lib/db';
import { cachedJsonResponse } from '@/lib/api-cache';
import sql from 'mssql';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { logActivityFromRequest } from '@/lib/activity-log';

// GET - Fetch all student academic activities for a department
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const deptId = parseInt(searchParams.get('deptId') || '', 10);

    if (isNaN(deptId)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing deptId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user's dept_id matches the requested deptId
    if (user.dept_id !== deptId) {
      return new Response(JSON.stringify({ error: 'Forbidden - Department ID mismatch' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();

    const result = await pool
      .request()
      .input('deptid', sql.Int, deptId)
      .execute('sp_GetByDeptId_Student_Acad_Act');

    const activities = result.recordset || [];

    // Cache for 2 minutes (120 seconds)
    return cachedJsonResponse({ activities }, 120);
  } catch (err) {
    console.error('Error fetching student academic activities:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch student academic activities' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST - Insert new student academic activity
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const data = await request.json();

    // Validation
    if (!data.deptid || isNaN(data.deptid)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Department ID is required and must be valid" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user's dept_id matches the requested deptId
    if (user.dept_id !== data.deptid) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Forbidden - Department ID mismatch" 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.activity || data.activity.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Activity is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.date) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Activity date is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();
    const requestObj = pool.request();

    requestObj.input('deptid', sql.Int, data.deptid);
    requestObj.input('activity', sql.NVarChar(sql.MAX), data.activity.trim());
    requestObj.input('date', sql.Date, data.date ? new Date(data.date) : null);
    requestObj.input('place', sql.NVarChar(150), data.place?.trim() || null);
    requestObj.input('participatants_num', sql.Int, data.participatants_num || null);
    requestObj.input('fid', sql.Int, data.fid || null);
    requestObj.input('Image', sql.VarChar(500), data.Image || null);
    requestObj.input('no_of_days', sql.Int, data.no_of_days || null);
    requestObj.input('speaker_name', sql.VarChar(1000), data.speaker_name?.trim() || null);

    const result = await requestObj.execute('sp_Insert_Student_Acad_Act');
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null;

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Student_Acad_Act', insertedId).catch(() => {});
    
    // Log S3_UPLOAD activity if document was uploaded (with correct recordId)
    const docPath = data.Image || null;
    if (docPath && typeof docPath === 'string' && docPath.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (docPath.startsWith('upload/')) {
        const pathWithoutUpload = docPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct recordId (non-blocking)
      debugger
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, insertedId).catch(() => {});
      debugger
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Student academic activity added successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Insert error:", error);
    
    let errorMessage = "Failed to add student academic activity";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes("PRIMARY KEY") || error.message.includes("UNIQUE")) {
        errorMessage = "A record with this information already exists";
        statusCode = 409;
      } else if (error.message.includes("FOREIGN KEY") || error.message.includes("constraint")) {
        errorMessage = "Invalid reference: One or more selected values are not valid";
        statusCode = 400;
      } else if (error.message.includes("NULL") || error.message.includes("required")) {
        errorMessage = "Required fields are missing: " + error.message;
        statusCode = 400;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT/PATCH - Update student academic activity
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const data = await request.json();

    // Validation
    if (!data.id || isNaN(data.id)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Activity ID is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.deptid || isNaN(data.deptid)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Department ID is required and must be valid" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user's dept_id matches the requested deptId
    if (user.dept_id !== data.deptid) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Forbidden - Department ID mismatch" 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.activity || data.activity.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Activity is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.date) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Activity date is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();
    
    // Extract _s3Uploaded flag before passing to stored procedure
    const s3Uploaded = data._s3Uploaded;
    debugger
    delete data._s3Uploaded; // Remove from data before passing to SP
    
    const requestObj = pool.request();

    requestObj.input('id', sql.Int, data.id);
    requestObj.input('deptid', sql.Int, data.deptid);
    requestObj.input('activity', sql.NVarChar(sql.MAX), data.activity.trim());
    requestObj.input('date', sql.Date, data.date ? new Date(data.date) : null);
    requestObj.input('place', sql.NVarChar(150), data.place?.trim() || null);
    requestObj.input('participatants_num', sql.Int, data.participatants_num || null);
    requestObj.input('fid', sql.Int, data.fid || null);
    requestObj.input('Image', sql.VarChar(500), data.Image || null);
    requestObj.input('no_of_days', sql.Int, data.no_of_days || null);
    requestObj.input('speaker_name', sql.VarChar(1000), data.speaker_name?.trim() || null);

    await requestObj.execute('sp_Update_Student_Acad_Act');

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Student_Acad_Act', data.id).catch(() => {});
    
    // Log S3_UPLOAD activity ONLY if document was actually uploaded (not just updated without upload)
    // Check the _s3Uploaded flag to determine if a new upload happened
    const wasUploaded = s3Uploaded === true;
    const docPath = data.Image || null;
    
    if (wasUploaded && docPath && typeof docPath === 'string' && docPath.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (docPath.startsWith('upload/')) {
        const pathWithoutUpload = docPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      debugger
      // Log S3_UPLOAD activity with the correct recordId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, data.id).catch(() => {});
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Student academic activity updated successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Update error:", error);
    
    let errorMessage = "Failed to update student academic activity";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes("PRIMARY KEY") || error.message.includes("UNIQUE")) {
        errorMessage = "A record with this information already exists";
        statusCode = 409;
      } else if (error.message.includes("FOREIGN KEY") || error.message.includes("constraint")) {
        errorMessage = "Invalid reference: One or more selected values are not valid";
        statusCode = 400;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE - Delete student academic activity
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '', 10);
    const deptId = parseInt(searchParams.get('deptId') || '', 10);

    if (isNaN(id)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Activity ID is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (isNaN(deptId)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Department ID is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user's dept_id matches the requested deptId
    if (user.dept_id !== deptId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Forbidden - Department ID mismatch" 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();

    // Step 1: Get document path from database before deletion
    let docPath: string | null = null
    const body = await request.json().catch(() => ({}))
    
    if (body.doc && typeof body.doc === 'string' && body.doc.trim()) {
      docPath = body.doc.trim()
    } else {
      // Try to get from query params
      const queryDoc = searchParams.get('doc')
      if (queryDoc) docPath = queryDoc
    }

    // Step 2: Delete S3 document if doc exists and is a valid S3 path
    let s3DeleteSuccess = false
    let s3DeleteMessage = 'No document to delete'
    
    if (docPath && typeof docPath === 'string' && docPath.trim() && docPath.startsWith('upload/')) {
      try {
        const { deleteFromS3 } = await import('@/lib/s3-service')
        
        console.log(`[DELETE Student Academic Activity] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Student Academic Activity] ✓ S3 document deleted: ${docPath}`)
          
          // Log S3_DELETE activity (non-blocking)
          let entityName = 'S3_Document';
          if (docPath.startsWith('upload/')) {
            const pathWithoutUpload = docPath.substring(7);
            const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
            if (lastSlashIndex > 0) {
              const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
              entityName = 'S3_' + folderPath.replace(/\//g, '_');
            } else {
              entityName = 'S3_' + pathWithoutUpload.split('/')[0];
            }
          }
          logActivityFromRequest(request, user, 'S3_DELETE', entityName, id).catch(() => {})
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Student Academic Activity] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Student Academic Activity] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Student Academic Activity] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Student Academic Activity] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 3: Delete database record
    const requestObj = pool.request();
    requestObj.input('id', sql.Int, id);

    await requestObj.execute('sp_Delete_Student_Acad_Act');

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Student_Acad_Act', id).catch(() => {});

    // Return response with S3 deletion status
    const response: any = {
      success: true,
      message: "Student academic activity deleted successfully"
    }

    if (docPath && docPath.trim()) {
      response.s3DeleteMessage = s3DeleteMessage
      if (!s3DeleteSuccess) {
        response.warning = `Activity deleted from database, but S3 document deletion had issues: ${s3DeleteMessage}`
      }
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Delete error:", error);
    
    let errorMessage = "Failed to delete student academic activity";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes("FOREIGN KEY") || error.message.includes("constraint")) {
        errorMessage = "Cannot delete: This record is referenced by other records";
        statusCode = 400;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

