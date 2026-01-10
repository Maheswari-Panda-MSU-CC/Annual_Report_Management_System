import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all Performance Teacher records for a teacher
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10)

    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing teacherId' },
        { status: 400 }
      )
    }

    if (user.role_id !== teacherId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - User ID mismatch' },
        { status: 403 }
      )
    }

    const pool = await connectToDatabase()
    const result = await pool
      .request()
      .input('tid', sql.Int, teacherId)
      .execute('sp_Get_Perf_Teacher_By_Tid')

    const performanceTeacher = result.recordset || []

    return NextResponse.json({
      success: true,
      performanceTeacher,
    })
  } catch (err: any) {
    console.error('Error fetching Performance Teacher:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Performance Teacher' },
      { status: 500 }
    )
  }
}

// POST - Insert new Performance Teacher record
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { perfTeacher } = body
    const teacherId = user.role_id

    if (!teacherId || !perfTeacher) {
      return NextResponse.json(
        { success: false, error: 'teacherId and perfTeacher are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!perfTeacher.name || !perfTeacher.place || !perfTeacher.date || !perfTeacher.perf_nature) {
      return NextResponse.json(
        { success: false, error: 'Name, Place, Date, and Nature of Performance are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), perfTeacher.name)
    req.input('place', sql.NVarChar(150), perfTeacher.place)
    req.input('date', sql.Date, perfTeacher.date ? new Date(perfTeacher.date) : null)
    req.input('perf_nature', sql.NVarChar(250), perfTeacher.perf_nature)
    req.input('Image', sql.VarChar(500), perfTeacher.Image || 'http://localhost:3000/assets/demo_document.pdf')

    const result = await req.execute('sp_Insert_Perf_Teacher')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'PerformanceTeacher', insertedId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Performance Teacher added successfully' })
  } catch (err: any) {
    console.error('Error adding Performance Teacher:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Performance Teacher' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Performance Teacher record
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { perfTeacherId, perfTeacher } = body
    const teacherId = user.role_id

    if (!perfTeacherId || !teacherId || !perfTeacher) {
      return NextResponse.json(
        { success: false, error: 'perfTeacherId, teacherId, and perfTeacher are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!perfTeacher.name || !perfTeacher.place || !perfTeacher.date || !perfTeacher.perf_nature) {
      return NextResponse.json(
        { success: false, error: 'Name, Place, Date, and Nature of Performance are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, perfTeacherId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), perfTeacher.name)
    req.input('place', sql.NVarChar(150), perfTeacher.place)
    req.input('date', sql.Date, perfTeacher.date ? new Date(perfTeacher.date) : null)
    req.input('perf_nature', sql.NVarChar(250), perfTeacher.perf_nature)
    req.input('Image', sql.VarChar(500), perfTeacher.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_Update_Perf_Teacher')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'PerformanceTeacher', perfTeacherId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Performance Teacher updated successfully' })
  } catch (err: any) {
    console.error('Error updating Performance Teacher:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Performance Teacher' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Performance Teacher record
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    let perfTeacherId = parseInt(searchParams.get('perfTeacherId') || '', 10)
    let docPath: string | null = null

    // Try to get perfTeacherId and docPath from request body (preferred method)
    try {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.perfTeacherId) {
                const bodyPerfTeacherId = parseInt(String(body.perfTeacherId), 10)
                if (!isNaN(bodyPerfTeacherId)) perfTeacherId = bodyPerfTeacherId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              } else if (body.Image && typeof body.Image === 'string') {
                docPath = body.Image.trim() || null
              } else if (body.supporting_doc && typeof body.supporting_doc === 'string') {
                docPath = body.supporting_doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          console.warn('[DELETE Performance Teacher] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      console.warn('[DELETE Performance Teacher] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc') || searchParams.get('Image') || searchParams.get('supporting_doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(perfTeacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing perfTeacherId' },
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
        
        console.log(`[DELETE Performance Teacher] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Performance Teacher] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Performance Teacher] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Performance Teacher] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Performance Teacher] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Performance Teacher] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, perfTeacherId)
    await req.execute('sp_Delete_Perf_Teacher')
    console.log(`[DELETE Performance Teacher] ✓ Database record deleted: id=${perfTeacherId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'PerformanceTeacher', perfTeacherId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Performance Teacher and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      return NextResponse.json({ 
        success: true, 
        message: 'Performance Teacher deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting Performance Teacher:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Performance Teacher' },
      { status: 500 }
    )
  }
}

