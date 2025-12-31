import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all collaborations for a teacher
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
      .execute('sp_GetCollaborations_ByTeacherId')

    const collaborations = result.recordset || []

    return NextResponse.json({
      success: true,
      collaborations,
    })
  } catch (err: any) {
    console.error('Error fetching collaborations:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch collaborations' },
      { status: 500 }
    )
  }
}

// POST - Insert new collaboration
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, collaboration } = body

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

    if (!collaboration) {
      return NextResponse.json(
        { success: false, error: 'Collaboration data is required' },
        { status: 400 }
      )
    }

    if (!collaboration.collaborating_inst || !collaboration.category) {
      return NextResponse.json(
        { success: false, error: 'Collaborating Institute and Category are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('deptid', sql.Int, null)
    req.input('collaborating_inst', sql.NVarChar(200), collaboration.collaborating_inst)
    req.input('address', sql.NVarChar(200), collaboration.address || null)
    req.input('details', sql.NVarChar(sql.MAX), collaboration.details || null)
    req.input('duration', sql.Int, collaboration.duration || null)
    req.input('beneficiary_num', sql.Int, collaboration.beneficiary_num || null)
    req.input('level', sql.Int, collaboration.level || null)
    req.input('type', sql.Int, collaboration.type || null)
    req.input('MOU_signed', sql.Bit, collaboration.MOU_signed !== undefined ? collaboration.MOU_signed : null)
    req.input('signing_date', sql.Date, collaboration.signing_date ? new Date(collaboration.signing_date) : null)
    req.input('submit_date', sql.DateTime, new Date())
    req.input('fid', sql.Int, null)
    req.input('tid', sql.Int, teacherId)
    req.input('category', sql.NVarChar(50), collaboration.category)
    req.input('collab_name', sql.NVarChar(200), collaboration.collab_name || null)
    req.input('categoryrb', sql.Bit, collaboration.categoryrb !== undefined ? collaboration.categoryrb : null)
    req.input('collab_rank', sql.NVarChar(50), collaboration.collab_rank || null)
    req.input('collab_outcome', sql.Int, collaboration.collab_outcome || null)
    req.input('collab_status', sql.NVarChar(50), collaboration.collab_status || null)
    req.input('starting_date', sql.Date, collaboration.starting_date ? new Date(collaboration.starting_date) : null)
    req.input('doc', sql.VarChar(100), collaboration.doc || null)

    await req.execute('sp_Insert_Collaboration')

    return NextResponse.json({ success: true, message: 'Collaboration added successfully' })
  } catch (err: any) {
    console.error('Error adding collaboration:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add collaboration' },
      { status: 500 }
    )
  }
}

// PUT - Update existing collaboration
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { collaborationId, teacherId: bodyTeacherId, collaboration } = body

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

    if (!collaborationId || !collaboration) {
      return NextResponse.json(
        { success: false, error: 'collaborationId and collaboration are required' },
        { status: 400 }
      )
    }

    if (!collaboration.collaborating_inst || !collaboration.category) {
      return NextResponse.json(
        { success: false, error: 'Collaborating Institute and Category are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, collaborationId)
    req.input('deptid', sql.Int, null)
    req.input('collaborating_inst', sql.NVarChar(200), collaboration.collaborating_inst)
    req.input('address', sql.NVarChar(200), collaboration.address || null)
    req.input('details', sql.NVarChar(sql.MAX), collaboration.details || null)
    req.input('duration', sql.Int, collaboration.duration || null)
    req.input('beneficiary_num', sql.Int, collaboration.beneficiary_num || null)
    req.input('level', sql.Int, collaboration.level || null)
    req.input('type', sql.Int, collaboration.type || null)
    req.input('MOU_signed', sql.Bit, collaboration.MOU_signed !== undefined ? collaboration.MOU_signed : null)
    req.input('signing_date', sql.Date, collaboration.signing_date ? new Date(collaboration.signing_date) : null)
    req.input('submit_date', sql.DateTime, new Date())
    req.input('fid', sql.Int, null)
    req.input('tid', sql.Int, teacherId)
    req.input('category', sql.NVarChar(50), collaboration.category)
    req.input('collab_name', sql.NVarChar(200), collaboration.collab_name || null)
    req.input('categoryrb', sql.Bit, collaboration.categoryrb !== undefined ? collaboration.categoryrb : null)
    req.input('collab_rank', sql.NVarChar(50), collaboration.collab_rank || null)
    req.input('collab_outcome', sql.Int, collaboration.collab_outcome || null)
    req.input('collab_status', sql.NVarChar(50), collaboration.collab_status || null)
    req.input('starting_date', sql.Date, collaboration.starting_date ? new Date(collaboration.starting_date) : null)
    req.input('doc', sql.VarChar(100), collaboration.doc || null)

    await req.execute('sp_Update_Collaboration')

    return NextResponse.json({ success: true, message: 'Collaboration updated successfully' })
  } catch (err: any) {
    console.error('Error updating collaboration:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update collaboration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete collaboration
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

    // Get collaborationId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let collaborationId = parseInt(searchParams.get('collaborationId') || '', 10)
    let docPath: string | null = null

    // Try to get doc and collaborationId from request body (preferred method)
    try {
      // Check if request has body content
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.collaborationId) {
                const bodyCollaborationId = parseInt(String(body.collaborationId), 10)
                if (!isNaN(bodyCollaborationId)) collaborationId = bodyCollaborationId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Collaboration] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Collaboration] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(collaborationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing collaborationId' },
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
        
        console.log(`[DELETE Collaboration] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Collaboration] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Collaboration] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Collaboration] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Collaboration] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Collaboration] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, collaborationId)
    await req.execute('sp_Delete_Collaboration')
    console.log(`[DELETE Collaboration] ✓ Database record deleted: id=${collaborationId}`)
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Collaboration record and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Collaboration record deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting collaboration:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete collaboration' },
      { status: 500 }
    )
  }
}

