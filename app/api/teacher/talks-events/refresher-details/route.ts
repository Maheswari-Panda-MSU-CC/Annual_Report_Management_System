import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all Refresher Course details for a teacher
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10)
    const year = parseInt(searchParams.get('year') || '', 10)

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

    // Default to current academic year if not provided
    const academicYear = isNaN(year) ? new Date().getFullYear() : year

    const pool = await connectToDatabase()
    const result = await pool
      .request()
      .input('tid', sql.Int, teacherId)
      .input('year', sql.Int, null) // ✅ CHANGE TO NULL FOR NO YEAR bounded output
      .execute('sp_GetRefresherCourseDetailsByTid')

    const refresherDetails = result.recordset || []

    return NextResponse.json({
      success: true,
      refresherDetails,
    })
  } catch (err: any) {
    console.error('Error fetching Refresher Course details:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Refresher Course details' },
      { status: 500 }
    )
  }
}

// POST - Insert new Refresher Course detail
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { refresherDetail } = body
    const teacherId = user.role_id

    if (!teacherId || !refresherDetail) {
      return NextResponse.json(
        { success: false, error: 'teacherId and refresherDetail are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!refresherDetail.name || !refresherDetail.refresher_type || !refresherDetail.startdate) {
      return NextResponse.json(
        { success: false, error: 'Name, Refresher Type, and Start Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('name', sql.NVarChar(500), refresherDetail.name)
    req.input('refresher_type', sql.Int, refresherDetail.refresher_type)
    req.input('startdate', sql.Date, refresherDetail.startdate ? new Date(refresherDetail.startdate) : null)
    req.input('enddate', sql.Date, refresherDetail.enddate ? new Date(refresherDetail.enddate) : null)
    req.input('university', sql.NVarChar(200), refresherDetail.university && refresherDetail.university.trim() !== "" ? refresherDetail.university.trim() : null)
    req.input('institute', sql.NVarChar(200), refresherDetail.institute && refresherDetail.institute.trim() !== "" ? refresherDetail.institute.trim() : null)
    req.input('department', sql.NVarChar(200), refresherDetail.department && refresherDetail.department.trim() !== "" ? refresherDetail.department.trim() : null)
    req.input('centre', sql.NChar(200), refresherDetail.centre && refresherDetail.centre.trim() !== "" ? refresherDetail.centre.trim() : null)
    req.input('tid', sql.Int, teacherId)
    req.input('supporting_doc', sql.VarChar(500), refresherDetail.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_InsertRefresher_Detail')

    return NextResponse.json({ success: true, message: 'Refresher Course detail added successfully' })
  } catch (err: any) {
    console.error('Error adding Refresher Course detail:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Refresher Course detail' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Refresher Course detail
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { refresherDetailId, refresherDetail } = body
    const teacherId = user.role_id

    if (!refresherDetailId || !teacherId || !refresherDetail) {
      return NextResponse.json(
        { success: false, error: 'refresherDetailId, teacherId, and refresherDetail are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!refresherDetail.name || !refresherDetail.refresher_type || !refresherDetail.startdate) {
      return NextResponse.json(
        { success: false, error: 'Name, Refresher Type, and Start Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Id', sql.Int, refresherDetailId)
    req.input('name', sql.NVarChar(500), refresherDetail.name)
    req.input('refresher_type', sql.Int, refresherDetail.refresher_type)
    req.input('startdate', sql.Date, refresherDetail.startdate ? new Date(refresherDetail.startdate) : null)
    req.input('enddate', sql.Date, refresherDetail.enddate ? new Date(refresherDetail.enddate) : null)
    req.input('university', sql.NVarChar(200), refresherDetail.university && refresherDetail.university.trim() !== "" ? refresherDetail.university.trim() : null)
    req.input('institute', sql.NVarChar(200), refresherDetail.institute && refresherDetail.institute.trim() !== "" ? refresherDetail.institute.trim() : null)
    req.input('department', sql.NVarChar(200), refresherDetail.department && refresherDetail.department.trim() !== "" ? refresherDetail.department.trim() : null)
    req.input('centre', sql.NChar(200), refresherDetail.centre && refresherDetail.centre.trim() !== "" ? refresherDetail.centre.trim() : null)
    req.input('tid', sql.Int, teacherId)
    req.input('supporting_doc', sql.VarChar(500), refresherDetail.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_UpdateRefresher_Detail')

    return NextResponse.json({ success: true, message: 'Refresher Course detail updated successfully' })
  } catch (err: any) {
    console.error('Error updating Refresher Course detail:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Refresher Course detail' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Refresher Course detail
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    let refresherDetailId = parseInt(searchParams.get('refresherDetailId') || '', 10)
    let docPath: string | null = null

    // Try to get refresherDetailId and docPath from request body (preferred method)
    try {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.refresherDetailId) {
                const bodyRefresherDetailId = parseInt(String(body.refresherDetailId), 10)
                if (!isNaN(bodyRefresherDetailId)) refresherDetailId = bodyRefresherDetailId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              } else if (body.supporting_doc && typeof body.supporting_doc === 'string') {
                docPath = body.supporting_doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          console.warn('[DELETE Refresher] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      console.warn('[DELETE Refresher] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc') || searchParams.get('supporting_doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(refresherDetailId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing refresherDetailId' },
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
        
        console.log(`[DELETE Refresher] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Refresher] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Refresher] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Refresher] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Refresher] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Refresher] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('Id', sql.Int, refresherDetailId)
    await req.execute('sp_DeleteRefresher_Detail')
    console.log(`[DELETE Refresher] ✓ Database record deleted: id=${refresherDetailId}`)
    
    // Step 3: Return success response with S3 deletion status
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Refresher Course detail and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      return NextResponse.json({ 
        success: true, 
        message: 'Refresher Course detail deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting Refresher Course detail:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Refresher Course detail' },
      { status: 500 }
    )
  }
}

