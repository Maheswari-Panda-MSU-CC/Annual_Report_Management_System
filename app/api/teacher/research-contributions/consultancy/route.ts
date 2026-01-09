import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all consultancy records for a teacher
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
      .input('Tid', sql.Int, teacherId)
      .execute('sp_GetConsultancyByTeacher')

    const consultancies = result.recordset || []

    return NextResponse.json({
      success: true,
      consultancies,
    })
  } catch (err: any) {
    console.error('Error fetching consultancy records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch consultancy records' },
      { status: 500 }
    )
  }
}

// POST - Insert new consultancy record
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, consultancy } = body

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

    if (!consultancy) {
      return NextResponse.json(
        { success: false, error: 'Consultancy data is required' },
        { status: 400 }
      )
    }

    if (!consultancy.name || !consultancy.collaborating_inst || !consultancy.address || !consultancy.Start_Date) {
      return NextResponse.json(
        { success: false, error: 'Name, Collaborating Institute, Address, and Start Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('deptid', sql.Int, null)
    req.input('name', sql.NVarChar(sql.MAX), consultancy.name)
    req.input('collaborating_inst', sql.NVarChar(250), consultancy.collaborating_inst)
    req.input('address', sql.NVarChar(250), consultancy.address)
    req.input('duration', sql.Int, consultancy.duration || null)
    req.input('amount', sql.NVarChar(50), consultancy.amount || null)
    req.input('submit_date', sql.Date, consultancy.submit_date ? new Date(consultancy.submit_date) : new Date())
    req.input('fid', sql.Int, null)
    req.input('Tid', sql.Int, teacherId)
    req.input('Start_Date', sql.Date, new Date(consultancy.Start_Date))
    req.input('outcome', sql.VarChar(1000), consultancy.outcome || null)
    req.input('doc', sql.VarChar(1000), consultancy.doc || null)

    const result = await req.execute('sp_InsertConsultancy')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Consultancy', insertedId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Consultancy record added successfully' })
  } catch (err: any) {
    console.error('Error adding consultancy record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add consultancy record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing consultancy record
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { consultancyId, teacherId: bodyTeacherId, consultancy } = body

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

    if (!consultancyId || !consultancy) {
      return NextResponse.json(
        { success: false, error: 'consultancyId and consultancy are required' },
        { status: 400 }
      )
    }

    if (!consultancy.name || !consultancy.collaborating_inst || !consultancy.address || !consultancy.Start_Date) {
      return NextResponse.json(
        { success: false, error: 'Name, Collaborating Institute, Address, and Start Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, consultancyId)
    req.input('deptid', sql.Int, null)
    req.input('name', sql.NVarChar(sql.MAX), consultancy.name)
    req.input('collaborating_inst', sql.NVarChar(250), consultancy.collaborating_inst)
    req.input('address', sql.NVarChar(250), consultancy.address)
    req.input('duration', sql.Int, consultancy.duration || null)
    req.input('amount', sql.NVarChar(50), consultancy.amount || null)
    req.input('submit_date', sql.Date, consultancy.submit_date ? new Date(consultancy.submit_date) : new Date())
    req.input('fid', sql.Int, null)
    req.input('Tid', sql.Int, teacherId)
    req.input('Start_Date', sql.Date, new Date(consultancy.Start_Date))
    req.input('outcome', sql.VarChar(1000), consultancy.outcome || null)
    req.input('doc', sql.VarChar(1000), consultancy.doc || null)

    await req.execute('sp_UpdateConsultancy')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Consultancy', consultancyId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Consultancy record updated successfully' })
  } catch (err: any) {
    console.error('Error updating consultancy record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update consultancy record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete consultancy record
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

    // Get consultancyId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let consultancyId = parseInt(searchParams.get('consultancyId') || '', 10)
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
              if (body.consultancyId) {
                const bodyConsultancyId = parseInt(String(body.consultancyId), 10)
                if (!isNaN(bodyConsultancyId)) consultancyId = bodyConsultancyId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Consultancy] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Consultancy] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(consultancyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing consultancyId' },
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
        
        console.log(`[DELETE Consultancy] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Consultancy] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Consultancy] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Consultancy] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Consultancy] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Consultancy] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, consultancyId)
    await req.execute('sp_DeleteConsultancy')
    console.log(`[DELETE Consultancy] ✓ Database record deleted: consultancyId=${consultancyId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Consultancy', consultancyId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Consultancy record and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Consultancy record deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('[DELETE Consultancy] Error deleting consultancy record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete consultancy record' },
      { status: 500 }
    )
  }
}

