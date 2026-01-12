import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all papers for a teacher
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
      .execute('sp_GetPaperPresentedByTeacherId')

    const papers = result.recordset || []

    // No caching - always return fresh data from database
    const response = NextResponse.json({
      success: true,
      papers,
    })
    // Explicitly disable all caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    return response
  } catch (err: any) {
    console.error('Error fetching papers:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch papers' },
      { status: 500 }
    )
  }
}

// POST - Insert new paper
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, paper } = body

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

    if (!paper) {
      return NextResponse.json(
        { success: false, error: 'Paper data is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!paper.title_of_paper || !paper.authors || !paper.level) {
      return NextResponse.json(
        { success: false, error: 'Title of paper, authors, and level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('tid', sql.Int, teacherId)
    req.input('theme', sql.NVarChar(sql.MAX), paper.theme || null)
    req.input('organising_body', sql.NVarChar(sql.MAX), paper.organising_body || null)
    req.input('place', sql.NVarChar(4000), paper.place || null)
    req.input('date', sql.Date, paper.date || null)
    req.input('title_of_paper', sql.NVarChar(sql.MAX), paper.title_of_paper)
    req.input('level', sql.Int, paper.level)
    req.input('authors', sql.NVarChar(sql.MAX), paper.authors)
    req.input('Image', sql.VarChar(1000), paper.Image || null)
    req.input('mode', sql.VarChar(500), paper.mode || null)

    const result = await req.execute('sp_InsertPaperPresented')

    const recordId =  result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Paper', recordId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded (with correct recordId)
    if (paper.Image && typeof paper.Image === 'string' && paper.Image.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (paper.Image.startsWith('upload/')) {
        const pathWithoutUpload = paper.Image.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct recordId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, recordId).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Paper added successfully',
      record_id: recordId,
    })
  } catch (err: any) {
    console.error('Error adding paper:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add paper' },
      { status: 500 }
    )
  }
}

// PATCH - Update paper
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { paperId, teacherId: bodyTeacherId, paper } = body

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

    if (!paperId || !paper) {
      return NextResponse.json(
        { success: false, error: 'paperId and paper are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!paper.title_of_paper || !paper.authors || !paper.level) {
      return NextResponse.json(
        { success: false, error: 'Title of paper, authors, and level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('papid', sql.Int, paperId)
    req.input('tid', sql.Int, teacherId)
    req.input('theme', sql.NVarChar(sql.MAX), paper.theme || null)
    req.input('organising_body', sql.NVarChar(sql.MAX), paper.organising_body || null)
    req.input('place', sql.NVarChar(4000), paper.place || null)
    req.input('date', sql.Date, paper.date || null)
    req.input('title_of_paper', sql.NVarChar(sql.MAX), paper.title_of_paper)
    req.input('level', sql.Int, paper.level)
    req.input('authors', sql.NVarChar(sql.MAX), paper.authors)
    req.input('Image', sql.VarChar(1000), paper.Image || null)
    req.input('mode', sql.VarChar(500), paper.mode || null)

    await req.execute('sp_UpdatePaperPresented')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Paper', paperId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded/updated (with correct paperId)
    if (paper.Image && typeof paper.Image === 'string' && paper.Image.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (paper.Image.startsWith('upload/')) {
        const pathWithoutUpload = paper.Image.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct paperId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, paperId).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Paper updated successfully',
    })
  } catch (err: any) {
    console.error('Error updating paper:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update paper' },
      { status: 500 }
    )
  }
}

// DELETE - Delete paper
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    // Get paperId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let paperId = parseInt(searchParams.get('paperId') || '', 10)
    let imagePath: string | null = null

    // Try to get image from request body (preferred method)
    try {
      // Check if request has body content
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.paperId) {
                const bodyPaperId = parseInt(String(body.paperId), 10)
                if (!isNaN(bodyPaperId)) paperId = bodyPaperId
              }
              if (body.image && typeof body.image === 'string') {
                imagePath = body.image.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Paper] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Paper] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for image (backward compatibility)
    if (!imagePath) {
      const queryImage = searchParams.get('image')
      if (queryImage) imagePath = queryImage
    }

    if (isNaN(paperId)) {
      return NextResponse.json(
        { success: false, error: 'paperId is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    
    // Step 1: Delete S3 document if Image exists and is a valid S3 path
    let s3DeleteSuccess = false
    let s3DeleteMessage = 'No document to delete'
    
    if (imagePath && typeof imagePath === 'string' && imagePath.trim() && imagePath.startsWith('upload/')) {
      try {
        const { deleteFromS3 } = await import('@/lib/s3-service')
        
        console.log(`[DELETE Paper] Attempting to delete S3 document: ${imagePath}`)
        const s3DeleteResult = await deleteFromS3(imagePath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Paper] ✓ S3 document deleted: ${imagePath}`)
          
          // Log S3_DELETE activity (non-blocking)
          let entityName = 'S3_Document';
          if (imagePath.startsWith('upload/')) {
            const pathWithoutUpload = imagePath.substring(7);
            const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
            if (lastSlashIndex > 0) {
              const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
              entityName = 'S3_' + folderPath.replace(/\//g, '_');
            } else {
              entityName = 'S3_' + pathWithoutUpload.split('/')[0];
            }
          }
          logActivityFromRequest(request, user, 'S3_DELETE', entityName, paperId).catch(() => {})
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Paper] ⚠ S3 document not found (acceptable): ${imagePath}`)
            
            // Still log S3_DELETE activity even if file was already deleted (non-blocking)
            let entityName = 'S3_Document';
            if (imagePath.startsWith('upload/')) {
              const pathWithoutUpload = imagePath.substring(7);
              const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
              if (lastSlashIndex > 0) {
                const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
                entityName = 'S3_' + folderPath.replace(/\//g, '_');
              } else {
                entityName = 'S3_' + pathWithoutUpload.split('/')[0];
              }
            }
            logActivityFromRequest(request, user, 'S3_DELETE', entityName, paperId).catch(() => {})
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Paper] ✗ Failed to delete S3 document: ${imagePath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Paper] Error deleting S3 document:', s3Error)
      }
    } else if (imagePath && imagePath.trim()) {
      // Image path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Paper] Invalid S3 path format (not starting with 'upload/'): ${imagePath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const deleteReq = pool.request()
    deleteReq.input('papid', sql.Int, paperId)
    
    await deleteReq.execute('sp_DeletePaperPresented')
    console.log(`[DELETE Paper] ✓ Database record deleted: paperId=${paperId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Paper', paperId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !imagePath || !imagePath.trim() || !imagePath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Paper and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Paper deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('[DELETE Paper] Error deleting paper:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete paper' },
      { status: 500 }
    )
  }
}

