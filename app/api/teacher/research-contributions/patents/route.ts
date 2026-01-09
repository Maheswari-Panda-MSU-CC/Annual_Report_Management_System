import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all patents for a teacher
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
      .execute('sp_GetPatents_ByTeacherId')

    const patents = result.recordset || []

    return NextResponse.json({
      success: true,
      patents,
    })
  } catch (err: any) {
    console.error('Error fetching patents:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch patents' },
      { status: 500 }
    )
  }
}

// POST - Insert new patent
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, patent } = body

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

    if (!patent) {
      return NextResponse.json(
        { success: false, error: 'Patent data is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!patent.title || !patent.level || !patent.status || !patent.date) {
      return NextResponse.json(
        { success: false, error: 'Title, level, status, and date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('title', sql.VarChar(500), patent.title)
    req.input('level', sql.Int, patent.level)
    req.input('status', sql.Int, patent.status)
    req.input('doc', sql.VarChar(500), patent.doc || null)
    req.input('date', sql.DateTime, new Date(patent.date))
    req.input('tid', sql.Int, teacherId)
    req.input('Tech_Licence', sql.VarChar(500), patent.Tech_Licence || null)
    req.input('Earnings_Generate', sql.BigInt, patent.Earnings_Generate || null)
    req.input('PatentApplicationNo', sql.VarChar(50), patent.PatentApplicationNo || null)

    const result = await req.execute('sp_Insert_Patent')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Patent', insertedId).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Patent added successfully',
    })
  } catch (err: any) {
    console.error('Error adding patent:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add patent' },
      { status: 500 }
    )
  }
}

// PUT - Update patent
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { patentId, teacherId: bodyTeacherId, patent } = body

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

    if (!patentId || !patent) {
      return NextResponse.json(
        { success: false, error: 'patentId and patent are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!patent.title || !patent.level || !patent.status || !patent.date) {
      return NextResponse.json(
        { success: false, error: 'Title, level, status, and date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('Pid', sql.Int, patentId)
    req.input('title', sql.VarChar(500), patent.title)
    req.input('level', sql.Int, patent.level)
    req.input('status', sql.Int, patent.status)
    req.input('doc', sql.VarChar(500), patent.doc || null)
    req.input('date', sql.DateTime, new Date(patent.date))
    req.input('tid', sql.Int, teacherId)
    req.input('Tech_Licence', sql.VarChar(500), patent.Tech_Licence || null)
    req.input('Earnings_Generate', sql.BigInt, patent.Earnings_Generate || null)
    req.input('PatentApplicationNo', sql.VarChar(50), patent.PatentApplicationNo || null)

    await req.execute('sp_Update_Patent')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Patent', patentId).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Patent updated successfully',
    })
  } catch (err: any) {
    console.error('Error updating patent:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update patent' },
      { status: 500 }
    )
  }
}

// DELETE - Delete patent
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

    // Get patentId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let patentId = parseInt(searchParams.get('patentId') || '', 10)
    let docPath: string | null = null

    // Try to get doc from request body (preferred method)
    try {
      // Check if request has body content
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.patentId) {
                const bodyPatentId = parseInt(String(body.patentId), 10)
                if (!isNaN(bodyPatentId)) patentId = bodyPatentId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Patent] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Patent] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(patentId)) {
      return NextResponse.json(
        { success: false, error: 'patentId is required' },
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
        
        console.log(`[DELETE Patent] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Patent] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Patent] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Patent] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Patent] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Patent] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    try {
      const req = pool.request()
      req.input('Pid', sql.Int, patentId)
      await req.execute('sp_Delete_Patent')
      console.log(`[DELETE Patent] ✓ Database record deleted: patentId=${patentId}`)
    } catch (spError: any) {
      // If stored procedure doesn't exist, use direct SQL delete
      if (spError.message?.includes('sp_Delete_Patent')) {
        await pool.request()
          .input('Pid', sql.Int, patentId)
          .query('DELETE FROM Patents WHERE Pid = @Pid')
        console.log(`[DELETE Patent] ✓ Database record deleted (direct SQL): patentId=${patentId}`)
      } else {
        throw spError
      }
    }
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Patent', patentId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Patent and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Patent deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('[DELETE Patent] Error deleting patent:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete patent' },
      { status: 500 }
    )
  }
}

