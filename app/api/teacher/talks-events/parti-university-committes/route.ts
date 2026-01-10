import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all University Committee Participation for a teacher
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
      .execute('sp_Get_Parti_Commi_ByTid')

    const universityCommittees = result.recordset || []

    return NextResponse.json({
      success: true,
      universityCommittees,
    })
  } catch (err: any) {
    console.error('Error fetching University Committee Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch University Committee Participation' },
      { status: 500 }
    )
  }
}

// POST - Insert new University Committee Participation
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { partiCommi } = body
    const teacherId = user.role_id

    if (!teacherId || !partiCommi) {
      return NextResponse.json(
        { success: false, error: 'teacherId and partiCommi are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!partiCommi.name || !partiCommi.committee_name || !partiCommi.level || !partiCommi.participated_as || !partiCommi.submit_date) {
      return NextResponse.json(
        { success: false, error: 'Name, Committee Name, Level, Participated As, and Submit Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), partiCommi.name)
    req.input('committee_name', sql.NVarChar(500), partiCommi.committee_name)
    req.input('level', sql.Int, partiCommi.level)
    req.input('participated_as', sql.NVarChar(100), partiCommi.participated_as)
    req.input('submit_date', sql.Date, partiCommi.submit_date ? new Date(partiCommi.submit_date) : null)
    req.input('supporting_doc', sql.VarChar(500), partiCommi.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('BOS', sql.Bit, partiCommi.BOS || false)
    req.input('FB', sql.Bit, partiCommi.FB || false)
    req.input('CDC', sql.Bit, partiCommi.CDC || false)
    req.input('year_name', sql.Int, partiCommi.year_name || new Date().getFullYear())

    const result = await req.execute('sp_Insert_Parti_Commi')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'UniversityCommittee', insertedId).catch(() => {})

    return NextResponse.json({ success: true, message: 'University Committee Participation added successfully' })
  } catch (err: any) {
    console.error('Error adding University Committee Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add University Committee Participation' },
      { status: 500 }
    )
  }
}

// PUT - Update existing University Committee Participation
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { partiCommiId, partiCommi } = body
    const teacherId = user.role_id

    if (!partiCommiId || !teacherId || !partiCommi) {
      return NextResponse.json(
        { success: false, error: 'partiCommiId, teacherId, and partiCommi are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!partiCommi.name || !partiCommi.committee_name || !partiCommi.level || !partiCommi.participated_as || !partiCommi.submit_date) {
      return NextResponse.json(
        { success: false, error: 'Name, Committee Name, Level, Participated As, and Submit Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, partiCommiId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), partiCommi.name)
    req.input('committee_name', sql.NVarChar(500), partiCommi.committee_name)
    req.input('level', sql.Int, partiCommi.level)
    req.input('participated_as', sql.NVarChar(100), partiCommi.participated_as)
    req.input('submit_date', sql.Date, partiCommi.submit_date ? new Date(partiCommi.submit_date) : null)
    req.input('supporting_doc', sql.VarChar(500), partiCommi.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('BOS', sql.Bit, partiCommi.BOS || false)
    req.input('FB', sql.Bit, partiCommi.FB || false)
    req.input('CDC', sql.Bit, partiCommi.CDC || false)
    req.input('year_name', sql.Int, partiCommi.year_name || new Date().getFullYear())

    await req.execute('sp_Update_Parti_Commi')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'UniversityCommittee', partiCommiId).catch(() => {})

    return NextResponse.json({ success: true, message: 'University Committee Participation updated successfully' })
  } catch (err: any) {
    console.error('Error updating University Committee Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update University Committee Participation' },
      { status: 500 }
    )
  }
}

// DELETE - Delete University Committee Participation
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    let partiCommiId = parseInt(searchParams.get('partiCommiId') || '', 10)
    let docPath: string | null = null

    // Try to get partiCommiId and docPath from request body (preferred method)
    try {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.partiCommiId) {
                const bodyPartiCommiId = parseInt(String(body.partiCommiId), 10)
                if (!isNaN(bodyPartiCommiId)) partiCommiId = bodyPartiCommiId
              }
              if (body.doc && typeof body.doc === 'string') {
                docPath = body.doc.trim() || null
              } else if (body.supporting_doc && typeof body.supporting_doc === 'string') {
                docPath = body.supporting_doc.trim() || null
              }
            }
          }
        } catch (parseError) {
          console.warn('[DELETE University Committee] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      console.warn('[DELETE University Committee] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc') || searchParams.get('supporting_doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(partiCommiId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing partiCommiId' },
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
        
        console.log(`[DELETE University Committee] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE University Committee] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE University Committee] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE University Committee] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE University Committee] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE University Committee] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, partiCommiId)
    await req.execute('sp_Delete_Parti_Commi')
    console.log(`[DELETE University Committee] ✓ Database record deleted: id=${partiCommiId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'UniversityCommittee', partiCommiId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      return NextResponse.json({ 
        success: true, 
        message: 'University Committee Participation and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      return NextResponse.json({ 
        success: true, 
        message: 'University Committee Participation deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting University Committee Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete University Committee Participation' },
      { status: 500 }
    )
  }
}

