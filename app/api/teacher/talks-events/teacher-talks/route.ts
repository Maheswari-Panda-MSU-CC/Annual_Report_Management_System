import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all Teacher Talks for a teacher
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
      .execute('sp_GetTeacherTalksByTid')

    const teacherTalks = result.recordset || []

    return NextResponse.json({
      success: true,
      teacherTalks,
    })
  } catch (err: any) {
    console.error('Error fetching Teacher Talks:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Teacher Talks' },
      { status: 500 }
    )
  }
}

// POST - Insert new Teacher Talk
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherTalk } = body
    const teacherId = user.role_id

    if (!teacherId || !teacherTalk) {
      return NextResponse.json(
        { success: false, error: 'teacherId and teacherTalk are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!teacherTalk.name || !teacherTalk.programme || !teacherTalk.place || !teacherTalk.date || !teacherTalk.title || !teacherTalk.participated_as) {
      return NextResponse.json(
        { success: false, error: 'Name, Programme, Place, Date, Title, and Participated As are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(sql.MAX), teacherTalk.name)
    req.input('programme', sql.Int, teacherTalk.programme)
    req.input('place', sql.NVarChar(1000), teacherTalk.place)
    req.input('date', sql.Date, teacherTalk.date ? new Date(teacherTalk.date) : null)
    req.input('title', sql.NVarChar(sql.MAX), teacherTalk.title)
    req.input('participated_as', sql.Int, teacherTalk.participated_as)
    req.input('Image', sql.NVarChar(500), teacherTalk.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_InsertTeacherTalk')

    return NextResponse.json({ success: true, message: 'Teacher Talk added successfully' })
  } catch (err: any) {
    console.error('Error adding Teacher Talk:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Teacher Talk' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Teacher Talk
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherTalkId, teacherTalk } = body
    const teacherId = user.role_id

    if (!teacherTalkId || !teacherId || !teacherTalk) {
      return NextResponse.json(
        { success: false, error: 'teacherTalkId, teacherId, and teacherTalk are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!teacherTalk.name || !teacherTalk.programme || !teacherTalk.place || !teacherTalk.date || !teacherTalk.title || !teacherTalk.participated_as) {
      return NextResponse.json(
        { success: false, error: 'Name, Programme, Place, Date, Title, and Participated As are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, teacherTalkId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(sql.MAX), teacherTalk.name)
    req.input('programme', sql.Int, teacherTalk.programme)
    req.input('place', sql.NVarChar(1000), teacherTalk.place)
    req.input('date', sql.Date, teacherTalk.date ? new Date(teacherTalk.date) : null)
    req.input('title', sql.NVarChar(sql.MAX), teacherTalk.title)
    req.input('participated_as', sql.Int, teacherTalk.participated_as)
    req.input('Image', sql.NVarChar(500), teacherTalk.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_UpdateTeacherTalk')

    return NextResponse.json({ success: true, message: 'Teacher Talk updated successfully' })
  } catch (err: any) {
    console.error('Error updating Teacher Talk:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Teacher Talk' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Teacher Talk
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    let teacherTalkId = parseInt(searchParams.get('teacherTalkId') || '', 10)
    let docPath: string | null = null

    // Try to get teacherTalkId and docPath from request body (preferred method)
    try {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.teacherTalkId) {
                const bodyTeacherTalkId = parseInt(String(body.teacherTalkId), 10)
                if (!isNaN(bodyTeacherTalkId)) teacherTalkId = bodyTeacherTalkId
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
          console.warn('[DELETE Teacher Talk] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      console.warn('[DELETE Teacher Talk] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc') || searchParams.get('Image') || searchParams.get('supporting_doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(teacherTalkId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing teacherTalkId' },
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
        
        console.log(`[DELETE Teacher Talk] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Teacher Talk] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Teacher Talk] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Teacher Talk] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Teacher Talk] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Teacher Talk] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, teacherTalkId)
    await req.execute('sp_DeleteTeacherTalk')
    console.log(`[DELETE Teacher Talk] ✓ Database record deleted: id=${teacherTalkId}`)
    
    // Step 3: Return success response with S3 deletion status
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Teacher Talk and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      return NextResponse.json({ 
        success: true, 
        message: 'Teacher Talk deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting Teacher Talk:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Teacher Talk' },
      { status: 500 }
    )
  }
}

