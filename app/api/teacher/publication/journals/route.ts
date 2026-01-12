import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all journals for a teacher
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
      .execute('sp_Get_Teacher_Journals_ByTid')

    const journals = result.recordset || []

    // No caching - always return fresh data from database
    const response = NextResponse.json({
      success: true,
      journals,
    })
    // Explicitly disable all caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    return response
  } catch (err: any) {
    console.error('Error fetching journals:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch journals' },
      { status: 500 }
    )
  }
}

// POST - Insert new journal
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, journal } = body

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

    if (!journal) {
      return NextResponse.json(
        { success: false, error: 'Journal data is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!journal.title || !journal.authors || !journal.author_type || !journal.level || !journal.type) {
      return NextResponse.json(
        { success: false, error: 'Title, authors, author type, level, and type are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('tid', sql.Int, teacherId)
    req.input('authors', sql.NVarChar(sql.MAX), journal.authors)
    req.input('author_num', sql.Int, journal.author_num || null)
    req.input('title', sql.NVarChar(sql.MAX), journal.title)
    req.input('isbn', sql.NVarChar(50), journal.isbn || null)
    req.input('journal_name', sql.NVarChar(sql.MAX), journal.journal_name || null)
    req.input('volume_num', sql.Int, journal.volume_num || null)
    req.input('page_num', sql.VarChar(50), journal.page_num || null)
    req.input('month_year', sql.Date, journal.month_year || null)
    req.input('author_type', sql.Int, journal.author_type)
    req.input('level', sql.Int, journal.level)
    req.input('peer_reviewed', sql.Bit, journal.peer_reviewed ?? false)
    req.input('h_index', sql.Numeric(10, 4), journal.h_index || null)
    req.input('impact_factor', sql.Numeric(10, 4), journal.impact_factor || null)
    req.input('in_scopus', sql.Bit, journal.in_scopus ?? false)
    req.input('submit_date', sql.DateTime, journal.submit_date || new Date())
    req.input('paid', sql.Bit, journal.paid ?? false)
    req.input('issn', sql.NVarChar(sql.MAX), journal.issn || null)
    req.input('type', sql.Int, journal.type)
    req.input('Image', sql.VarChar(1000), journal.Image || null)
    req.input('in_ugc', sql.Bit, journal.in_ugc ?? false)
    req.input('in_clarivate', sql.Bit, journal.in_clarivate ?? false)
    req.input('DOI', sql.NVarChar(sql.MAX), journal.DOI || null)
    req.input('in_oldUGCList', sql.Bit, journal.in_oldUGCList ?? false)

    const result = await req.execute('sp_Insert_Teacher_Journal')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Journal', insertedId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded (with correct recordId)
    if (journal.Image && typeof journal.Image === 'string' && journal.Image.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (journal.Image.startsWith('upload/')) {
        const pathWithoutUpload = journal.Image.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct recordId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, insertedId).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Journal added successfully',
    })
  } catch (err: any) {
    console.error('Error adding journal:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add journal' },
      { status: 500 }
    )
  }
}

// PATCH - Update journal
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { journalId, teacherId: bodyTeacherId, journal } = body

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

    if (!journalId || !journal) {
      return NextResponse.json(
        { success: false, error: 'journalId and journal are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!journal.title || !journal.authors || !journal.author_type || !journal.level || !journal.type) {
      return NextResponse.json(
        { success: false, error: 'Title, authors, author type, level, and type are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('id', sql.Int, journalId)
    req.input('tid', sql.Int, teacherId)
    req.input('authors', sql.NVarChar(sql.MAX), journal.authors)
    req.input('author_num', sql.Int, journal.author_num || null)
    req.input('title', sql.NVarChar(sql.MAX), journal.title)
    req.input('isbn', sql.NVarChar(50), journal.isbn || null)
    req.input('journal_name', sql.NVarChar(sql.MAX), journal.journal_name || null)
    req.input('volume_num', sql.Int, journal.volume_num || null)
    req.input('page_num', sql.VarChar(50), journal.page_num || null)
    req.input('month_year', sql.Date, journal.month_year || null)
    req.input('author_type', sql.Int, journal.author_type)
    req.input('level', sql.Int, journal.level)
    req.input('peer_reviewed', sql.Bit, journal.peer_reviewed ?? false)
    req.input('h_index', sql.Numeric(10, 4), journal.h_index || null)
    req.input('impact_factor', sql.Numeric(10, 4), journal.impact_factor || null)
    req.input('in_scopus', sql.Bit, journal.in_scopus ?? false)
    req.input('submit_date', sql.DateTime, journal.submit_date || new Date())
    req.input('paid', sql.Bit, journal.paid ?? false)
    req.input('issn', sql.NVarChar(sql.MAX), journal.issn || null)
    req.input('type', sql.Int, journal.type)
    req.input('Image', sql.VarChar(1000), journal.Image || null)
    req.input('in_ugc', sql.Bit, journal.in_ugc ?? false)
    req.input('in_clarivate', sql.Bit, journal.in_clarivate ?? false)
    req.input('DOI', sql.NVarChar(sql.MAX), journal.DOI || null)
    req.input('in_oldUGCList', sql.Bit, journal.in_oldUGCList ?? false)

    await req.execute('sp_Update_Teacher_Journal')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Journal', journalId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded/updated (with correct journalId)
    if (journal.Image && typeof journal.Image === 'string' && journal.Image.startsWith('upload/')) {
      // Extract entity name from virtual path
      let entityName = 'S3_Document';
      if (journal.Image.startsWith('upload/')) {
        const pathWithoutUpload = journal.Image.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct journalId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, journalId).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Journal updated successfully',
    })
  } catch (err: any) {
    console.error('Error updating journal:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update journal' },
      { status: 500 }
    )
  }
}

// DELETE - Delete journal
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

    // Get journalId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let journalId = parseInt(searchParams.get('journalId') || '', 10)
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
              if (body.journalId) {
                const bodyJournalId = parseInt(String(body.journalId), 10)
                if (!isNaN(bodyJournalId)) journalId = bodyJournalId
              }
              if (body.image && typeof body.image === 'string') {
                imagePath = body.image.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Journal] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Journal] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for image (backward compatibility)
    if (!imagePath) {
      const queryImage = searchParams.get('image')
      if (queryImage) imagePath = queryImage
    }

    if (isNaN(journalId)) {
      return NextResponse.json(
        { success: false, error: 'journalId is required' },
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
        
        console.log(`[DELETE Journal] Attempting to delete S3 document: ${imagePath}`)
        const s3DeleteResult = await deleteFromS3(imagePath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Journal] ✓ S3 document deleted: ${imagePath}`)
          
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
          logActivityFromRequest(request, user, 'S3_DELETE', entityName, journalId).catch(() => {})
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Journal] ⚠ S3 document not found (acceptable): ${imagePath}`)
            
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
            logActivityFromRequest(request, user, 'S3_DELETE', entityName, journalId).catch(() => {})
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Journal] ✗ Failed to delete S3 document: ${imagePath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Journal] Error deleting S3 document:', s3Error)
      }
    } else if (imagePath && imagePath.trim()) {
      // Image path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Journal] Invalid S3 path format (not starting with 'upload/'): ${imagePath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const deleteReq = pool.request()
    deleteReq.input('id', sql.Int, journalId)
    
    await deleteReq.execute('sp_Delete_Teacher_Journal')
    console.log(`[DELETE Journal] ✓ Database record deleted: journalId=${journalId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Journal', journalId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !imagePath || !imagePath.trim() || !imagePath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Journal and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Journal deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('[DELETE Journal] Error deleting journal:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete journal' },
      { status: 500 }
    )
  }
}

