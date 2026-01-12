import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all JRF/SRF records for a teacher
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const queryTeacherId = searchParams.get('teacherId')
    if (queryTeacherId && parseInt(queryTeacherId, 10) !== user.role_id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - User ID mismatch' },
        { status: 403 }
      )
    }

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacherId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const result = await pool
      .request()
      .input('tid', sql.Int, teacherId)
      .execute('Get_JRF_SRF_By_TeacherId')

    const jrfSrfs = result.recordset || []

    return NextResponse.json({
      success: true,
      jrfSrfs,
    })
  } catch (err: any) {
    console.error('Error fetching JRF/SRF records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch JRF/SRF records' },
      { status: 500 }
    )
  }
}

// POST - Insert new JRF/SRF record
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, jrfSrf } = body

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacherId' },
        { status: 400 }
      )
    }

    if (bodyTeacherId && bodyTeacherId !== teacherId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - User ID mismatch' },
        { status: 403 }
      )
    }

    if (!jrfSrf) {
      return NextResponse.json(
        { success: false, error: 'JRF/SRF data is required' },
        { status: 400 }
      )
    }

    if (!jrfSrf.name || !jrfSrf.type || !jrfSrf.title || !jrfSrf.duration) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Title, and Duration are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), jrfSrf.name)
    req.input('type', sql.Int, jrfSrf.type)
    req.input('title', sql.VarChar(500), jrfSrf.title)
    req.input('duration', sql.Int, jrfSrf.duration)
    req.input('stipend', sql.Numeric(15, 0), jrfSrf.stipend || null)
    req.input('date', sql.Date, jrfSrf.date ? new Date(jrfSrf.date) : null)
    req.input('doc', sql.VarChar(100), jrfSrf.doc || null)

    const result = await req.execute('sp_InsertJRF_SRF')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'JRF_SRF', insertedId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded (with correct recordId)
    if (jrfSrf.doc && typeof jrfSrf.doc === 'string' && jrfSrf.doc.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (jrfSrf.doc.startsWith('upload/')) {
        const pathWithoutUpload = jrfSrf.doc.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct recordId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, insertedId).catch(() => {})
    }

    return NextResponse.json({ success: true, message: 'JRF/SRF record added successfully' })
  } catch (err: any) {
    console.error('Error adding JRF/SRF record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add JRF/SRF record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing JRF/SRF record
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { jrfSrfId, teacherId: bodyTeacherId, jrfSrf } = body

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacherId' },
        { status: 400 }
      )
    }

    if (bodyTeacherId && bodyTeacherId !== teacherId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - User ID mismatch' },
        { status: 403 }
      )
    }

    if (!jrfSrfId || !jrfSrf) {
      return NextResponse.json(
        { success: false, error: 'jrfSrfId and jrfSrf are required' },
        { status: 400 }
      )
    }

    if (!jrfSrf.name || !jrfSrf.type || !jrfSrf.title || !jrfSrf.duration) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Title, and Duration are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, jrfSrfId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), jrfSrf.name)
    req.input('type', sql.Int, jrfSrf.type)
    req.input('title', sql.VarChar(500), jrfSrf.title)
    req.input('duration', sql.Int, jrfSrf.duration)
    req.input('stipend', sql.Numeric(15, 0), jrfSrf.stipend || null)
    req.input('date', sql.Date, jrfSrf.date ? new Date(jrfSrf.date) : null)
    req.input('doc', sql.VarChar(100), jrfSrf.doc || null)

    await req.execute('sp_UpdateJRF_SRF')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'JRF_SRF', jrfSrfId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded/updated (with correct recordId)
    if (jrfSrf.doc && typeof jrfSrf.doc === 'string' && jrfSrf.doc.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (jrfSrf.doc.startsWith('upload/')) {
        const pathWithoutUpload = jrfSrf.doc.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct recordId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, jrfSrfId).catch(() => {})
    }

    return NextResponse.json({ success: true, message: 'JRF/SRF record updated successfully' })
  } catch (err: any) {
    console.error('Error updating JRF/SRF record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update JRF/SRF record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete JRF/SRF record
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const teacherId = user.role_id
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacherId' },
        { status: 400 }
      )
    }

    // Get jrfSrfId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let jrfSrfId = parseInt(searchParams.get('jrfSrfId') || '', 10)
    let docPath: string | null = null

    // Try to get doc and jrfSrfId from request body (preferred method)
    try {
      // Check if request has body content
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.jrfSrfId) {
                const bodyJrfSrfId = parseInt(String(body.jrfSrfId), 10)
                if (!isNaN(bodyJrfSrfId)) jrfSrfId = bodyJrfSrfId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE JRF/SRF] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE JRF/SRF] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(jrfSrfId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing jrfSrfId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    
    // Step 1: Delete S3 document if doc exists and is a valid S3 path
    let s3DeleteSuccess = false
    let s3DeleteMessage = 'No document to delete'
    
    if (docPath && typeof docPath === 'string' && docPath.trim() && docPath.startsWith('upload/')) {
      try {
        const { deleteFromS3 } = await import('@/lib/s3-service')
        
        console.log(`[DELETE JRF/SRF] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE JRF/SRF] ✓ S3 document deleted: ${docPath}`)
          
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
          logActivityFromRequest(request, user, 'S3_DELETE', entityName, jrfSrfId).catch(() => {})
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE JRF/SRF] ⚠ S3 document not found (acceptable): ${docPath}`)
            
            // Still log S3_DELETE activity even if file was already deleted (non-blocking)
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
            logActivityFromRequest(request, user, 'S3_DELETE', entityName, jrfSrfId).catch(() => {})
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE JRF/SRF] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE JRF/SRF] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE JRF/SRF] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, jrfSrfId)
    await req.execute('sp_DeleteJRF_SRF')
    console.log(`[DELETE JRF/SRF] ✓ Database record deleted: id=${jrfSrfId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'JRF_SRF', jrfSrfId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'JRF/SRF record and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'JRF/SRF record deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting JRF/SRF record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete JRF/SRF record' },
      { status: 500 }
    )
  }
}

