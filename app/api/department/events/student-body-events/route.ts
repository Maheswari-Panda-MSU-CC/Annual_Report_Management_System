import { connectToDatabase } from '@/lib/db';
import { cachedJsonResponse } from '@/lib/api-cache';
import sql from 'mssql';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { logActivityFromRequest } from '@/lib/activity-log';

// GET - Fetch all student body events for a department
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
      .execute('sp_GetEvents_Stud_BodyByDeptId');

    const events = result.recordset || [];

    // Cache for 2 minutes (120 seconds)
    return cachedJsonResponse({ events }, 120);
  } catch (err) {
    console.error('Error fetching student body events:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch student body events' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST - Insert new student body event
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

    if (!data.title || data.title.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Title is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.date) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Event date is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();
    const requestObj = pool.request();

    requestObj.input('deptid', sql.Int, data.deptid);
    requestObj.input('title', sql.NVarChar(150), data.title.trim());
    requestObj.input('date', sql.Date, data.date ? new Date(data.date) : null);
    requestObj.input('place', sql.NVarChar(150), data.place?.trim() || null);
    // Handle level: convert 0, empty string, undefined to null; otherwise convert to number
    const levelValue = (data.level && data.level !== "" && data.level !== 0 && !isNaN(Number(data.level))) 
      ? Number(data.level) 
      : null;
    requestObj.input('level', sql.Int, levelValue);
    requestObj.input('participants_num', sql.Int, data.participants_num || null);
    requestObj.input('fid', sql.Int, data.fid || null);
    requestObj.input('Image', sql.VarChar(500), data.Image || null);
    requestObj.input('days', sql.Int, data.days || null);
    requestObj.input('speaker_name', sql.VarChar(1000), data.speaker_name?.trim() || null);

    const result = await requestObj.execute('sp_InsertEvents_Stud_Body');
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null;

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Events_Stud_Body', insertedId).catch(() => {});
    
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
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, insertedId).catch(() => {});
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Student body event added successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Insert error:", error);
    
    let errorMessage = "Failed to add student body event";
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

// PUT/PATCH - Update student body event
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
        error: "Event ID is required" 
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

    if (!data.title || data.title.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Title is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.date) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Event date is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();
    
    // Extract _s3Uploaded flag before passing to stored procedure
    const s3Uploaded = data._s3Uploaded;
    delete data._s3Uploaded; // Remove from data before passing to SP
    
    const requestObj = pool.request();

    requestObj.input('id', sql.Int, data.id);
    requestObj.input('deptid', sql.Int, data.deptid);
    requestObj.input('title', sql.NVarChar(150), data.title.trim());
    requestObj.input('date', sql.Date, data.date ? new Date(data.date) : null);
    requestObj.input('place', sql.NVarChar(150), data.place?.trim() || null);
    // Handle level: convert 0, empty string, undefined to null; otherwise convert to number
    const levelValue = (data.level && data.level !== "" && data.level !== 0 && !isNaN(Number(data.level))) 
      ? Number(data.level) 
      : null;
    requestObj.input('level', sql.Int, levelValue);
    requestObj.input('participants_num', sql.Int, data.participants_num || null);
    requestObj.input('fid', sql.Int, data.fid || null);
    requestObj.input('Image', sql.VarChar(500), data.Image || null);
    requestObj.input('days', sql.Int, data.days || null);
    requestObj.input('speaker_name', sql.VarChar(1000), data.speaker_name?.trim() || null);

    await requestObj.execute('sp_UpdateEvents_Stud_Body');

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Events_Stud_Body', data.id).catch(() => {});
    
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
      
      // Log S3_UPLOAD activity with the correct recordId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, data.id).catch(() => {});
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Student body event updated successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Update error:", error);
    
    let errorMessage = "Failed to update student body event";
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

// DELETE - Delete student body event
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
        error: "Event ID is required" 
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
        
        console.log(`[DELETE Student Body Event] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Student Body Event] ✓ S3 document deleted: ${docPath}`)
          
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
            console.log(`[DELETE Student Body Event] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Student Body Event] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Student Body Event] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Student Body Event] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 3: Delete database record
    const requestObj = pool.request();
    requestObj.input('id', sql.Int, id);

    await requestObj.execute('sp_DeleteEvents_Stud_Body');

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Events_Stud_Body', id).catch(() => {});

    // Return response with S3 deletion status
    const response: any = {
      success: true,
      message: "Student body event deleted successfully"
    }

    if (docPath && docPath.trim()) {
      response.s3DeleteMessage = s3DeleteMessage
      if (!s3DeleteSuccess) {
        response.warning = `Event deleted from database, but S3 document deletion had issues: ${s3DeleteMessage}`
      }
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Delete error:", error);
    
    let errorMessage = "Failed to delete student body event";
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

