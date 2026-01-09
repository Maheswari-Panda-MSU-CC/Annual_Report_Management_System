import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all financial support records for a teacher
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
      .execute('sp_GetByTid_Financial_Support')

    const financialSupports = result.recordset || []

    return NextResponse.json({
      success: true,
      financialSupports,
    })
  } catch (err: any) {
    console.error('Error fetching financial support records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch financial support records' },
      { status: 500 }
    )
  }
}

// POST - Insert new financial support record
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, financialSupport } = body

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

    if (!financialSupport) {
      return NextResponse.json(
        { success: false, error: 'Financial support data is required' },
        { status: 400 }
      )
    }

    if (!financialSupport.name || !financialSupport.type || !financialSupport.support || !financialSupport.grant_received || !financialSupport.date) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Supporting Agency, Grant Received, and Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), financialSupport.name)
    req.input('type', sql.Int, financialSupport.type)
    req.input('support', sql.VarChar(500), financialSupport.support)
    req.input('grant_received', sql.Numeric(15, 0), financialSupport.grant_received)
    req.input('details', sql.VarChar(500), financialSupport.details || null)
    req.input('purpose', sql.VarChar(500), financialSupport.purpose || null)
    req.input('date', sql.Date, financialSupport.date ? new Date(financialSupport.date) : null)
    req.input('doc', sql.VarChar(100), financialSupport.doc || null)

    const result = await req.execute('sp_Insert_Financial_Support')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Financial_Support', insertedId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Financial support record added successfully' })
  } catch (err: any) {
    console.error('Error adding financial support record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add financial support record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing financial support record
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { financialSupportId, teacherId: bodyTeacherId, financialSupport } = body

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

    if (!financialSupportId || !financialSupport) {
      return NextResponse.json(
        { success: false, error: 'financialSupportId and financialSupport are required' },
        { status: 400 }
      )
    }

    if (!financialSupport.name || !financialSupport.type || !financialSupport.support || !financialSupport.grant_received || !financialSupport.date) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Supporting Agency, Grant Received, and Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, financialSupportId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), financialSupport.name)
    req.input('type', sql.Int, financialSupport.type)
    req.input('support', sql.VarChar(500), financialSupport.support)
    req.input('grant_received', sql.Numeric(15, 0), financialSupport.grant_received)
    req.input('details', sql.VarChar(500), financialSupport.details || null)
    req.input('purpose', sql.VarChar(500), financialSupport.purpose || null)
    req.input('date', sql.Date, financialSupport.date ? new Date(financialSupport.date) : null)
    req.input('doc', sql.VarChar(100), financialSupport.doc || null)

    await req.execute('sp_Update_Financial_Support')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Financial_Support', financialSupportId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Financial support record updated successfully' })
  } catch (err: any) {
    console.error('Error updating financial support record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update financial support record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete financial support record
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

    // Get financialSupportId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let financialSupportId = parseInt(searchParams.get('financialSupportId') || '', 10)
    let docPath: string | null = null

    // Try to get doc and financialSupportId from request body (preferred method)
    try {
      // Check if request has body content
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.financialSupportId) {
                const bodyFinancialSupportId = parseInt(String(body.financialSupportId), 10)
                if (!isNaN(bodyFinancialSupportId)) financialSupportId = bodyFinancialSupportId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Financial Support] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Financial Support] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(financialSupportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing financialSupportId' },
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
        
        console.log(`[DELETE Financial Support] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Financial Support] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Financial Support] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Financial Support] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Financial Support] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Financial Support] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, financialSupportId)
    await req.execute('sp_Delete_Financial_Support')
    console.log(`[DELETE Financial Support] ✓ Database record deleted: id=${financialSupportId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Financial_Support', financialSupportId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Financial support record and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Financial support record deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting financial support record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete financial support record' },
      { status: 500 }
    )
  }
}

