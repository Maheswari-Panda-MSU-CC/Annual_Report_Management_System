import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all Academic Contributions for a teacher
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
      .execute('sp_Contri_Acads_GetByTeacherId')

    const academicContributions = result.recordset || []

    return NextResponse.json({
      success: true,
      academicContributions,
    })
  } catch (err: any) {
    console.error('Error fetching Academic Contributions:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Academic Contributions' },
      { status: 500 }
    )
  }
}

// POST - Insert new Academic Contribution
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { academicContri } = body
    const teacherId = user.role_id

    if (!teacherId || !academicContri) {
      return NextResponse.json(
        { success: false, error: 'teacherId and academicContri are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!academicContri.name || !academicContri.programme || !academicContri.date || !academicContri.participated_as) {
      return NextResponse.json(
        { success: false, error: 'Name, Programme, Date, and Participated As are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('name', sql.NVarChar(150), academicContri.name)
    req.input('tid', sql.Int, teacherId)
    req.input('programme', sql.Int, academicContri.programme)
    req.input('place', sql.NVarChar(150), academicContri.place || null)
    req.input('date', sql.Date, academicContri.date ? new Date(academicContri.date) : null)
    req.input('participated_as', sql.Int, academicContri.participated_as)
    req.input('supporting_doc', sql.VarChar(500), academicContri.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('year_name', sql.Int, academicContri.year_name || new Date().getFullYear())

    await req.execute('sp_Insert_Contri_Acads')

    return NextResponse.json({ success: true, message: 'Academic Contribution added successfully' })
  } catch (err: any) {
    console.error('Error adding Academic Contribution:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Academic Contribution' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Academic Contribution
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { academicContriId, academicContri } = body
    const teacherId = user.role_id

    if (!academicContriId || !teacherId || !academicContri) {
      return NextResponse.json(
        { success: false, error: 'academicContriId, teacherId, and academicContri are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!academicContri.name || !academicContri.programme || !academicContri.date || !academicContri.participated_as) {
      return NextResponse.json(
        { success: false, error: 'Name, Programme, Date, and Participated As are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, academicContriId)
    req.input('name', sql.NVarChar(150), academicContri.name)
    req.input('tid', sql.Int, teacherId)
    req.input('programme', sql.Int, academicContri.programme)
    req.input('place', sql.NVarChar(150), academicContri.place || null)
    req.input('date', sql.Date, academicContri.date ? new Date(academicContri.date) : null)
    req.input('participated_as', sql.Int, academicContri.participated_as)
    req.input('supporting_doc', sql.VarChar(500), academicContri.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('year_name', sql.Int, academicContri.year_name || new Date().getFullYear())

    await req.execute('sp_Update_Contri_Acads')

    return NextResponse.json({ success: true, message: 'Academic Contribution updated successfully' })
  } catch (err: any) {
    console.error('Error updating Academic Contribution:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Academic Contribution' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Academic Contribution
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    let academicContriId = parseInt(searchParams.get('academicContriId') || '', 10)
    let docPath: string | null = null

    // Try to get academicContriId and docPath from request body (preferred method)
    try {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.academicContriId) {
                const bodyAcademicContriId = parseInt(String(body.academicContriId), 10)
                if (!isNaN(bodyAcademicContriId)) academicContriId = bodyAcademicContriId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              } else if (body.supporting_doc && typeof body.supporting_doc === 'string') {
                docPath = body.supporting_doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          console.warn('[DELETE Academic Contribution] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      console.warn('[DELETE Academic Contribution] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc') || searchParams.get('supporting_doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(academicContriId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing academicContriId' },
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
        
        console.log(`[DELETE Academic Contribution] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Academic Contribution] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Academic Contribution] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Academic Contribution] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Academic Contribution] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Academic Contribution] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, academicContriId)
    await req.execute('sp_Delete_Contri_Acads')
    console.log(`[DELETE Academic Contribution] ✓ Database record deleted: id=${academicContriId}`)
    
    // Step 3: Return success response with S3 deletion status
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Academic Contribution and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      return NextResponse.json({ 
        success: true, 
        message: 'Academic Contribution deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting Academic Contribution:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Academic Contribution' },
      { status: 500 }
    )
  }
}

