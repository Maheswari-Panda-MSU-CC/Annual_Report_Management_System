import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all academic research visits for a teacher
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
      .execute('sp_GetAll_Academic_Research_Visit_ByTid')

    const visits = result.recordset || []

    return NextResponse.json({
      success: true,
      visits,
    })
  } catch (err: any) {
    console.error('Error fetching academic research visits:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch academic research visits' },
      { status: 500 }
    )
  }
}

// POST - Insert new academic research visit
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, visit } = body

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

    if (!visit) {
      return NextResponse.json(
        { success: false, error: 'Visit data is required' },
        { status: 400 }
      )
    }

    if (!visit.Institute_visited || !visit.duration || !visit.role || !visit.date) {
      return NextResponse.json(
        { success: false, error: 'Institute visited, duration, role, and date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('Institute_visited', sql.NVarChar(500), visit.Institute_visited)
    req.input('duration', sql.Int, visit.duration)
    req.input('role', sql.Int, visit.role)
    req.input('Sponsored_by', sql.NVarChar(500), visit.Sponsored_by || null)
    req.input('remarks', sql.NVarChar(500), visit.remarks || null)
    req.input('date', sql.Date, visit.date ? new Date(visit.date) : null)
    req.input('doc', sql.VarChar(100), visit.doc || null)

    await req.execute('sp_Insert_Academic_Research_Visit')

    return NextResponse.json({ success: true, message: 'Academic research visit added successfully' })
  } catch (err: any) {
    console.error('Error adding academic research visit:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add academic research visit' },
      { status: 500 }
    )
  }
}

// PUT - Update existing academic research visit
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { visitId, teacherId: bodyTeacherId, visit } = body

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

    if (!visitId || !visit) {
      return NextResponse.json(
        { success: false, error: 'visitId and visit are required' },
        { status: 400 }
      )
    }

    if (!visit.Institute_visited || !visit.duration || !visit.role || !visit.date) {
      return NextResponse.json(
        { success: false, error: 'Institute visited, duration, role, and date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, visitId)
    req.input('tid', sql.Int, teacherId)
    req.input('Institute_visited', sql.NVarChar(500), visit.Institute_visited)
    req.input('duration', sql.Int, visit.duration)
    req.input('role', sql.Int, visit.role)
    req.input('Sponsored_by', sql.NVarChar(500), visit.Sponsored_by || null)
    req.input('remarks', sql.NVarChar(500), visit.remarks || null)
    req.input('date', sql.Date, visit.date ? new Date(visit.date) : null)
    req.input('doc', sql.VarChar(100), visit.doc || null)

    await req.execute('sp_Update_Academic_Research_Visit')

    return NextResponse.json({ success: true, message: 'Academic research visit updated successfully' })
  } catch (err: any) {
    console.error('Error updating academic research visit:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update academic research visit' },
      { status: 500 }
    )
  }
}

// DELETE - Delete academic research visit
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

    // Get visitId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let visitId = parseInt(searchParams.get('visitId') || '', 10)
    let docPath: string | null = null

    // Try to get doc and visitId from request body (preferred method)
    try {
      // Check if request has body content
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.visitId) {
                const bodyVisitId = parseInt(String(body.visitId), 10)
                if (!isNaN(bodyVisitId)) visitId = bodyVisitId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Visit] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Visit] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(visitId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing visitId' },
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
        
        console.log(`[DELETE Visit] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Visit] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Visit] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Visit] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Visit] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Visit] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, visitId)
    await req.execute('sp_Delete_Academic_Research_Visit_ById')
    console.log(`[DELETE Visit] ✓ Database record deleted: id=${visitId}`)
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Academic research visit record and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Academic research visit record deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting academic research visit:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete academic research visit' },
      { status: 500 }
    )
  }
}

