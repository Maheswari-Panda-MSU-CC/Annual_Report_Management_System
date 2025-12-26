import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all policy documents for a teacher
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
      .execute('sp_GetPolicy_DocumentDevelopedByTeacherId')

    const policies = result.recordset || []

    return NextResponse.json({
      success: true,
      policies,
    })
  } catch (err: any) {
    console.error('Error fetching policy documents:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch policy documents' },
      { status: 500 }
    )
  }
}

// POST - Insert new policy document
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, policy } = body

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

    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'Policy data is required' },
        { status: 400 }
      )
    }

    if (!policy.title || !policy.level || !policy.organisation || !policy.date) {
      return NextResponse.json(
        { success: false, error: 'Title, Level, Organisation, and Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('tid', sql.Int, teacherId)
    req.input('Title', sql.VarChar(200), policy.title)
    req.input('Level', sql.NVarChar(100), policy.level)
    req.input('Organisation', sql.NVarChar(200), policy.organisation)
    req.input('Date', sql.Date, new Date(policy.date))
    req.input('Doc', sql.NVarChar(100), policy.doc || null)

    await req.execute('sp_InsertPolicy_DocumentDeveloped')

    return NextResponse.json({ success: true, message: 'Policy document added successfully' })
  } catch (err: any) {
    console.error('Error adding policy document:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add policy document' },
      { status: 500 }
    )
  }
}

// PUT - Update existing policy document
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { policyId, teacherId: bodyTeacherId, policy } = body

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

    if (!policyId || !policy) {
      return NextResponse.json(
        { success: false, error: 'policyId and policy are required' },
        { status: 400 }
      )
    }

    if (!policy.title || !policy.level || !policy.organisation || !policy.date) {
      return NextResponse.json(
        { success: false, error: 'Title, Level, Organisation, and Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Id', sql.Int, policyId)
    req.input('tid', sql.Int, teacherId)
    req.input('Title', sql.VarChar(200), policy.title)
    req.input('Level', sql.NVarChar(100), policy.level)
    req.input('Organisation', sql.NVarChar(200), policy.organisation)
    req.input('Date', sql.Date, new Date(policy.date))
    req.input('Doc', sql.NVarChar(100), policy.doc || null)

    await req.execute('sp_UpdatePolicy_DocumentDeveloped')

    return NextResponse.json({ success: true, message: 'Policy document updated successfully' })
  } catch (err: any) {
    console.error('Error updating policy document:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update policy document' },
      { status: 500 }
    )
  }
}

// DELETE - Delete policy document
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

    // Get policyId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let policyId = parseInt(searchParams.get('policyId') || '', 10)
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
              if (body.policyId) {
                const bodyPolicyId = parseInt(String(body.policyId), 10)
                if (!isNaN(bodyPolicyId)) policyId = bodyPolicyId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Policy] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Policy] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(policyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing policyId' },
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
        
        console.log(`[DELETE Policy] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Policy] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Policy] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Policy] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Policy] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Policy] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('Id', sql.Int, policyId)
    await req.execute('sp_DeletePolicy_DocumentDeveloped')
    console.log(`[DELETE Policy] ✓ Database record deleted: policyId=${policyId}`)
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Policy document and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Policy document deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('[DELETE Policy] Error deleting policy document:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete policy document' },
      { status: 500 }
    )
  }
}

