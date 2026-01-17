import { connectToDatabase } from '@/lib/db';
import { cachedJsonResponse } from '@/lib/api-cache';
import sql from 'mssql';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { logActivityFromRequest } from '@/lib/activity-log';

// GET - Fetch all events for a department
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
      .execute('sp_GetEventsByDepartmentId');

    const events = result.recordset || [];

    // Cache for 2 minutes (120 seconds)
    return cachedJsonResponse({ events }, 120);
  } catch (err) {
    console.error('Error fetching department events:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch department events' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST - Insert new event
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

    if (!data.ename || data.ename.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Event name is required" 
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
    requestObj.input('ename', sql.NVarChar(450), data.ename.trim());
    requestObj.input('description', sql.NVarChar(sql.MAX), data.description?.trim() || null);
    requestObj.input('date', sql.DateTime, data.date ? new Date(data.date) : null);
    requestObj.input('place', sql.NVarChar(150), data.place?.trim() || null);
    requestObj.input('fid', sql.NVarChar(200),  null);
    requestObj.input('Image', sql.VarChar(500), data.Image || null);
    requestObj.input('Type_Prog', sql.VarChar(500), data.Type_Prog?.trim() || null);
    requestObj.input('Level_Prog', sql.VarChar(100), data.Level_Prog?.trim() || null);
    requestObj.input('Spo_Name', sql.VarChar(500), data.Spo_Name?.trim() || null);
    requestObj.input('Spo_Level', sql.VarChar(100), data.Spo_Level?.trim() || null);
    requestObj.input('No_Participant', sql.BigInt, data.No_Participant ? BigInt(data.No_Participant) : null);
    requestObj.input('no_of_days', sql.Int, data.no_of_days || null);
    requestObj.input('speaker_name', sql.VarChar(1000), data.speaker_name?.trim() || null);

    const result = await requestObj.execute('sp_InsertEvent');
    const insertedId = result.recordset?.[0]?.eid || result.recordset?.[0]?.id || result.returnValue || null;

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Department_Events', insertedId).catch(() => {});
    
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
      message: "Event added successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Insert error:", error);
    
    let errorMessage = "Failed to add event";
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

// PUT/PATCH - Update event
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const data = await request.json();

    // Validation
    if (!data.eid || isNaN(data.eid)) {
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

    if (!data.ename || data.ename.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Event name is required" 
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

    requestObj.input('eid', sql.Int, data.eid);
    requestObj.input('deptid', sql.Int, data.deptid);
    requestObj.input('ename', sql.NVarChar(450), data.ename.trim());
    requestObj.input('description', sql.NVarChar(sql.MAX), data.description?.trim() || null);
    requestObj.input('date', sql.DateTime, data.date ? new Date(data.date) : null);
    requestObj.input('place', sql.NVarChar(150), data.place?.trim() || null);
    requestObj.input('fid', sql.NVarChar(200), null);
    requestObj.input('Image', sql.VarChar(500), data.Image || null);
    requestObj.input('Type_Prog', sql.VarChar(500), data.Type_Prog?.trim() || null);
    requestObj.input('Level_Prog', sql.VarChar(100), data.Level_Prog?.trim() || null);
    requestObj.input('Spo_Name', sql.VarChar(500), data.Spo_Name?.trim() || null);
    requestObj.input('Spo_Level', sql.VarChar(100), data.Spo_Level?.trim() || null);
    requestObj.input('No_Participant', sql.BigInt, data.No_Participant ? BigInt(data.No_Participant) : null);
    requestObj.input('no_of_days', sql.Int, data.no_of_days || null);
    requestObj.input('speaker_name', sql.VarChar(1000), data.speaker_name?.trim() || null);

    await requestObj.execute('sp_UpdateEvent');

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Department_Events', data.eid).catch(() => {});
    
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
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, data.eid).catch(() => {});
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Event updated successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Update error:", error);
    
    let errorMessage = "Failed to update event";
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

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const eid = parseInt(searchParams.get('eid') || '', 10);
    const deptId = parseInt(searchParams.get('deptId') || '', 10);

    if (isNaN(eid)) {
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
        
        console.log(`[DELETE Department Event] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Department Event] ✓ S3 document deleted: ${docPath}`)
          
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
          logActivityFromRequest(request, user, 'S3_DELETE', entityName, eid).catch(() => {})
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Department Event] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Department Event] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Department Event] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Department Event] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 3: Delete database record
    const requestObj = pool.request();
    requestObj.input('eid', sql.Int, eid);

    await requestObj.execute('sp_DeleteEvent');

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Department_Events', eid).catch(() => {});

    // Return response with S3 deletion status
    const response: any = {
      success: true,
      message: "Event deleted successfully"
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
    
    let errorMessage = "Failed to delete event";
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

