import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all Academic Bodies Participation for a teacher
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
      .execute('sp_GetByTid_Parti_Acads')

    const academicBodiesParticipation = result.recordset || []

    return NextResponse.json({
      success: true,
      academicBodiesParticipation,
    })
  } catch (err: any) {
    console.error('Error fetching Academic Bodies Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Academic Bodies Participation' },
      { status: 500 }
    )
  }
}

// POST - Insert new Academic Bodies Participation
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { partiAcads } = body
    const teacherId = user.role_id

    if (!teacherId || !partiAcads) {
      return NextResponse.json(
        { success: false, error: 'teacherId and partiAcads are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!partiAcads.name || !partiAcads.acad_body || !partiAcads.place || !partiAcads.participated_as || !partiAcads.submit_date) {
      return NextResponse.json(
        { success: false, error: 'Name, Academic Body, Place, Participated As, and Submit Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), partiAcads.name)
    req.input('acad_body', sql.NVarChar(500), partiAcads.acad_body)
    req.input('place', sql.NVarChar(150), partiAcads.place)
    req.input('participated_as', sql.NVarChar(100), partiAcads.participated_as)
    req.input('submit_date', sql.Date, partiAcads.submit_date ? new Date(partiAcads.submit_date) : null)
    req.input('supporting_doc', sql.VarChar(500), partiAcads.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('year_name', sql.Int, partiAcads.year_name || new Date().getFullYear())

    const result = await req.execute('sp_Insert_Parti_Acads')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'AcademicBody', insertedId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Academic Bodies Participation added successfully' })
  } catch (err: any) {
    console.error('Error adding Academic Bodies Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Academic Bodies Participation' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Academic Bodies Participation
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { partiAcadsId, partiAcads } = body
    const teacherId = user.role_id

    if (!partiAcadsId || !teacherId || !partiAcads) {
      return NextResponse.json(
        { success: false, error: 'partiAcadsId, teacherId, and partiAcads are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!partiAcads.name || !partiAcads.acad_body || !partiAcads.place || !partiAcads.participated_as || !partiAcads.submit_date) {
      return NextResponse.json(
        { success: false, error: 'Name, Academic Body, Place, Participated As, and Submit Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, partiAcadsId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), partiAcads.name)
    req.input('acad_body', sql.NVarChar(500), partiAcads.acad_body)
    req.input('place', sql.NVarChar(150), partiAcads.place)
    req.input('participated_as', sql.NVarChar(100), partiAcads.participated_as)
    req.input('submit_date', sql.Date, partiAcads.submit_date ? new Date(partiAcads.submit_date) : null)
    req.input('supporting_doc', sql.VarChar(500), partiAcads.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('year_name', sql.Int, partiAcads.year_name || new Date().getFullYear())

    await req.execute('sp_Update_Parti_Acads')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'AcademicBody', partiAcadsId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Academic Bodies Participation updated successfully' })
  } catch (err: any) {
    console.error('Error updating Academic Bodies Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Academic Bodies Participation' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Academic Bodies Participation
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    let partiAcadsId = parseInt(searchParams.get('partiAcadsId') || '', 10)
    let docPath: string | null = null

    // Try to get partiAcadsId and docPath from request body (preferred method)
    try {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.partiAcadsId) {
                const bodyPartiAcadsId = parseInt(String(body.partiAcadsId), 10)
                if (!isNaN(bodyPartiAcadsId)) partiAcadsId = bodyPartiAcadsId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              } else if (body.supporting_doc && typeof body.supporting_doc === 'string') {
                docPath = body.supporting_doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          console.warn('[DELETE Academic Bodies] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      console.warn('[DELETE Academic Bodies] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc') || searchParams.get('supporting_doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(partiAcadsId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing partiAcadsId' },
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
        
        console.log(`[DELETE Academic Bodies] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Academic Bodies] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Academic Bodies] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Academic Bodies] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Academic Bodies] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Academic Bodies] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, partiAcadsId)
    await req.execute('sp_Delete_Parti_Acads')
    console.log(`[DELETE Academic Bodies] ✓ Database record deleted: id=${partiAcadsId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'AcademicBody', partiAcadsId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Academic Bodies Participation and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      return NextResponse.json({ 
        success: true, 
        message: 'Academic Bodies Participation deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting Academic Bodies Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Academic Bodies Participation' },
      { status: 500 }
    )
  }
}

