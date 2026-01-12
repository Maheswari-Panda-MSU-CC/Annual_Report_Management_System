import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all PhD student records for a teacher
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
      .execute('sp_Phd_Student_Details_getByTeacherId')

    const phdStudents = result.recordset || []

    return NextResponse.json({
      success: true,
      phdStudents,
    })
  } catch (err: any) {
    console.error('Error fetching PhD student records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch PhD student records' },
      { status: 500 }
    )
  }
}

// POST - Insert new PhD student record
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, phdStudent } = body

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

    if (!phdStudent) {
      return NextResponse.json(
        { success: false, error: 'phdStudent data is required' },
        { status: 400 }
      )
    }

    if (!phdStudent.regno || !phdStudent.name || !phdStudent.start_date || !phdStudent.topic || !phdStudent.status) {
      return NextResponse.json(
        { success: false, error: 'Registration Number, Name, Start Date, Topic, and Status are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('regno', sql.VarChar(500), phdStudent.regno)
    req.input('name', sql.VarChar(500), phdStudent.name)
    req.input('start_date', sql.Date, phdStudent.start_date ? new Date(phdStudent.start_date) : null)
    req.input('topic', sql.VarChar(5000), phdStudent.topic)
    req.input('status', sql.Int, phdStudent.status)
    req.input('year_of_completion', sql.Int, phdStudent.year_of_completion || null)
    req.input('doc', sql.VarChar(500), phdStudent.doc || null)

    const result = await req.execute('sp_Phd_Student_Details_insert')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'PhD_Guidance', insertedId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded (with correct recordId)
    if (phdStudent.doc && typeof phdStudent.doc === 'string' && phdStudent.doc.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (phdStudent.doc.startsWith('upload/')) {
        const pathWithoutUpload = phdStudent.doc.substring(7); // Remove 'upload/'
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

    return NextResponse.json({ success: true, message: 'PhD student record added successfully' })
  } catch (err: any) {
    console.error('Error adding PhD student record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add PhD student record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing PhD student record
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { phdStudentId, teacherId: bodyTeacherId, phdStudent } = body

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

    if (!phdStudentId || !phdStudent) {
      return NextResponse.json(
        { success: false, error: 'phdStudentId and phdStudent are required' },
        { status: 400 }
      )
    }

    if (!phdStudent.regno || !phdStudent.name || !phdStudent.start_date || !phdStudent.topic || !phdStudent.status) {
      return NextResponse.json(
        { success: false, error: 'Registration Number, Name, Start Date, Topic, and Status are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, phdStudentId)
    req.input('tid', sql.Int, teacherId)
    req.input('regno', sql.VarChar(500), phdStudent.regno)
    req.input('name', sql.VarChar(500), phdStudent.name)
    req.input('start_date', sql.Date, phdStudent.start_date ? new Date(phdStudent.start_date) : null)
    req.input('topic', sql.VarChar(5000), phdStudent.topic)
    req.input('status', sql.Int, phdStudent.status)
    req.input('year_of_completion', sql.Int, phdStudent.year_of_completion || null)
    req.input('doc', sql.VarChar(500), phdStudent.doc || null)

    await req.execute('sp_Phd_Student_Details_update')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'PhD_Guidance', phdStudentId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded/updated (with correct recordId)
    if (phdStudent.doc && typeof phdStudent.doc === 'string' && phdStudent.doc.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (phdStudent.doc.startsWith('upload/')) {
        const pathWithoutUpload = phdStudent.doc.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct recordId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, phdStudentId).catch(() => {})
    }

    return NextResponse.json({ success: true, message: 'PhD student record updated successfully' })
  } catch (err: any) {
    console.error('Error updating PhD student record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update PhD student record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete PhD student record
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

    // Get phdStudentId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let phdStudentId = parseInt(searchParams.get('phdStudentId') || '', 10)
    let docPath: string | null = null

    // Try to get doc and phdStudentId from request body (preferred method)
    try {
      // Check if request has body content
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.phdStudentId) {
                const bodyPhdStudentId = parseInt(String(body.phdStudentId), 10)
                if (!isNaN(bodyPhdStudentId)) phdStudentId = bodyPhdStudentId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE PhD Guidance] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE PhD Guidance] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(phdStudentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing phdStudentId' },
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
        
        console.log(`[DELETE PhD Guidance] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE PhD Guidance] ✓ S3 document deleted: ${docPath}`)
          
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
          logActivityFromRequest(request, user, 'S3_DELETE', entityName, phdStudentId).catch(() => {})
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE PhD Guidance] ⚠ S3 document not found (acceptable): ${docPath}`)
            
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
            logActivityFromRequest(request, user, 'S3_DELETE', entityName, phdStudentId).catch(() => {})
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE PhD Guidance] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE PhD Guidance] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE PhD Guidance] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, phdStudentId)
    await req.execute('sp_Phd_Student_Details_delete')
    console.log(`[DELETE PhD Guidance] ✓ Database record deleted: id=${phdStudentId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'PhD_Guidance', phdStudentId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'PhD student record and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'PhD student record deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting PhD student record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete PhD student record' },
      { status: 500 }
    )
  }
}

