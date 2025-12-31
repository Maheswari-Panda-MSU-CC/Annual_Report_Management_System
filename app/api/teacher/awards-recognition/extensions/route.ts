import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all Extension Activities for a teacher
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
      .execute('sp_GetExtensionActivitiesByTid')

    const extensionActivities = result.recordset || []

    return NextResponse.json({
      success: true,
      extensionActivities,
    })
  } catch (err: any) {
    console.error('Error fetching Extension Activities:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Extension Activities' },
      { status: 500 }
    )
  }
}

// POST - Insert new Extension Activity
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { extensionAct } = body
    const teacherId = user.role_id

    if (!teacherId || !extensionAct) {
      return NextResponse.json(
        { success: false, error: 'teacherId and extensionAct are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!extensionAct.names || !extensionAct.place || !extensionAct.date || !extensionAct.name_of_activity || !extensionAct.sponsered || !extensionAct.level) {
      return NextResponse.json(
        { success: false, error: 'Names, Place, Date, Name of Activity, Sponsored, and Level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('names', sql.NVarChar(100), extensionAct.names)
    req.input('place', sql.NVarChar(150), extensionAct.place)
    req.input('date', sql.Date, extensionAct.date ? new Date(extensionAct.date) : null)
    req.input('name_of_activity', sql.NVarChar(150), extensionAct.name_of_activity)
    req.input('Image', sql.NVarChar(500), extensionAct.Image || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('sponsered', sql.Int, extensionAct.sponsered)
    req.input('level', sql.Int, extensionAct.level)

    await req.execute('sp_InsertExtension_Act')

    return NextResponse.json({ success: true, message: 'Extension Activity added successfully' })
  } catch (err: any) {
    console.error('Error adding Extension Activity:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Extension Activity' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Extension Activity
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { extensionActId, extensionAct } = body
    const teacherId = user.role_id

    if (!extensionActId || !teacherId || !extensionAct) {
      return NextResponse.json(
        { success: false, error: 'extensionActId, teacherId, and extensionAct are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!extensionAct.names || !extensionAct.place || !extensionAct.date || !extensionAct.name_of_activity || !extensionAct.sponsered || !extensionAct.level) {
      return NextResponse.json(
        { success: false, error: 'Names, Place, Date, Name of Activity, Sponsored, and Level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, extensionActId)
    req.input('tid', sql.Int, teacherId)
    req.input('names', sql.NVarChar(100), extensionAct.names)
    req.input('place', sql.NVarChar(150), extensionAct.place)
    req.input('date', sql.Date, extensionAct.date ? new Date(extensionAct.date) : null)
    req.input('name_of_activity', sql.NVarChar(150), extensionAct.name_of_activity)
    req.input('Image', sql.NVarChar(500), extensionAct.Image || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('sponsered', sql.Int, extensionAct.sponsered)
    req.input('level', sql.Int, extensionAct.level)

    await req.execute('sp_UpdateExtension_Act')

    return NextResponse.json({ success: true, message: 'Extension Activity updated successfully' })
  } catch (err: any) {
    console.error('Error updating Extension Activity:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Extension Activity' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Extension Activity
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    let extensionActId = parseInt(searchParams.get('extensionActId') || '', 10)
    let docPath: string | null = null

    // Try to get extensionActId and docPath from request body (preferred method)
    try {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.extensionActId) {
                const bodyExtensionActId = parseInt(String(body.extensionActId), 10)
                if (!isNaN(bodyExtensionActId)) extensionActId = bodyExtensionActId
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
          console.warn('[DELETE Extension Activity] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      console.warn('[DELETE Extension Activity] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for doc (backward compatibility)
    if (!docPath) {
      const queryDoc = searchParams.get('doc') || searchParams.get('Image') || searchParams.get('supporting_doc')
      if (queryDoc) docPath = queryDoc
    }

    if (isNaN(extensionActId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing extensionActId' },
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
        
        console.log(`[DELETE Extension Activity] Attempting to delete S3 document: ${docPath}`)
        const s3DeleteResult = await deleteFromS3(docPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Extension Activity] ✓ S3 document deleted: ${docPath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Extension Activity] ⚠ S3 document not found (acceptable): ${docPath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Extension Activity] ✗ Failed to delete S3 document: ${docPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Extension Activity] Error deleting S3 document:', s3Error)
      }
    } else if (docPath && docPath.trim()) {
      // Doc path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Extension Activity] Invalid S3 path format (not starting with 'upload/'): ${docPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const req = pool.request()
    req.input('id', sql.Int, extensionActId)
    await req.execute('sp_DeleteExtension_Act')
    console.log(`[DELETE Extension Activity] ✓ Database record deleted: id=${extensionActId}`)
    
    // Step 3: Return success response with S3 deletion status
    if (s3DeleteSuccess || !docPath || !docPath.trim() || !docPath.startsWith('upload/')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Extension Activity and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      return NextResponse.json({ 
        success: true, 
        message: 'Extension Activity deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('Error deleting Extension Activity:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Extension Activity' },
      { status: 500 }
    )
  }
}

