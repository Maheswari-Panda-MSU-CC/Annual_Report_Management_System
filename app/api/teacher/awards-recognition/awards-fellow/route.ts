import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all Awards/Fellows records for a teacher
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
      .execute('sp_GetByTeacherId_Awards_Fellows')

    const awardsFellows = result.recordset || []

    return NextResponse.json({
      success: true,
      awardsFellows,
    })
  } catch (err: any) {
    console.error('Error fetching Awards/Fellows:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Awards/Fellows' },
      { status: 500 }
    )
  }
}

// POST - Insert new Awards/Fellows record
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { awardsFellow } = body
    const teacherId = user.role_id

    if (!teacherId || !awardsFellow) {
      return NextResponse.json(
        { success: false, error: 'teacherId and awardsFellow are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!awardsFellow.name || !awardsFellow.organization || !awardsFellow.date_of_award || !awardsFellow.level) {
      return NextResponse.json(
        { success: false, error: 'Name, Organization, Date of Award, and Level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(500), awardsFellow.name)
    req.input('details', sql.NVarChar(500), awardsFellow.details || '')
    req.input('organization', sql.NVarChar(500), awardsFellow.organization)
    req.input('address', sql.NVarChar(500), awardsFellow.address || '')
    req.input('date_of_award', sql.Date, awardsFellow.date_of_award ? new Date(awardsFellow.date_of_award) : null)
    req.input('level', sql.Int, awardsFellow.level)
    req.input('Image', sql.NVarChar(500), awardsFellow.Image || 'http://localhost:3000/assets/demo_document.pdf')

    const result = await req.execute('sp_Insert_Awards_Fellows')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'AwardsFellow', insertedId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Awards/Fellows added successfully' })
  } catch (err: any) {
    console.error('Error adding Awards/Fellows:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Awards/Fellows' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Awards/Fellows record
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { awardsFellowId, awardsFellow } = body
    const teacherId = user.role_id

    if (!awardsFellowId || !teacherId || !awardsFellow) {
      return NextResponse.json(
        { success: false, error: 'awardsFellowId, teacherId, and awardsFellow are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!awardsFellow.name || !awardsFellow.organization || !awardsFellow.date_of_award || !awardsFellow.level) {
      return NextResponse.json(
        { success: false, error: 'Name, Organization, Date of Award, and Level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, awardsFellowId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(500), awardsFellow.name)
    req.input('details', sql.NVarChar(500), awardsFellow.details || '')
    req.input('organization', sql.NVarChar(500), awardsFellow.organization)
    req.input('address', sql.NVarChar(500), awardsFellow.address || '')
    req.input('date_of_award', sql.Date, awardsFellow.date_of_award ? new Date(awardsFellow.date_of_award) : null)
    req.input('level', sql.Int, awardsFellow.level)
    req.input('Image', sql.NVarChar(500), awardsFellow.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_Update_Awards_Fellows')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'AwardsFellow', awardsFellowId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Awards/Fellows updated successfully' })
  } catch (err: any) {
    console.error('Error updating Awards/Fellows:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Awards/Fellows' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Awards/Fellows record
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    let awardsFellowId = parseInt(searchParams.get('awardsFellowId') || '', 10)
    let docPath: string | null = null

    // Try to get awardsFellowId and docPath from request body (preferred method)
    try {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.awardsFellowId) {
                const bodyAwardsFellowId = parseInt(String(body.awardsFellowId), 10)
                if (!isNaN(bodyAwardsFellowId)) awardsFellowId = bodyAwardsFellowId
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
          console.warn('[DELETE Awards/Fellows] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      console.warn('[DELETE Awards/Fellows] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc') || searchParams.get('Image') || searchParams.get('supporting_doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(awardsFellowId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing awardsFellowId' },
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
        
        console.log(`[DELETE Awards/Fellows] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Awards/Fellows] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Awards/Fellows] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Awards/Fellows] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Awards/Fellows] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Awards/Fellows] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, awardsFellowId)
    await req.execute('sp_Delete_Awards_Fellows')
    console.log(`[DELETE Awards/Fellows] ✓ Database record deleted: id=${awardsFellowId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'AwardsFellow', awardsFellowId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Awards/Fellows and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      return NextResponse.json({ 
        success: true, 
        message: 'Awards/Fellows deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting Awards/Fellows:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Awards/Fellows' },
      { status: 500 }
    )
  }
}

