import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all books for a teacher
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
      .execute('sp_Get_Book_Pub_ByTeacherId')

    const books = result.recordset || []

    // No caching - always return fresh data from database
    const response = NextResponse.json({
      success: true,
      books,
    })
    // Explicitly disable all caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    return response
  } catch (err: any) {
    console.error('Error fetching books:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

// POST - Insert new book
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, book } = body

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

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book data is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!book.title || !book.authors || !book.publishing_level || !book.book_type || !book.author_type) {
      return NextResponse.json(
        { success: false, error: 'Title, authors, publishing level, book type, and author type are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('tid', sql.Int, teacherId)
    req.input('title', sql.NVarChar(sql.MAX), book.title)
    req.input('isbn', sql.NVarChar(1000), book.isbn || null)
    req.input('cha', sql.NChar(1000), book.cha || null)
    req.input('publisher_name', sql.NVarChar(3000), book.publisher_name || null)
    req.input('submit_date', sql.Date, book.submit_date || null)
    req.input('place', sql.NVarChar(4000), book.place || null)
    req.input('paid', sql.Bit, book.paid ?? false)
    req.input('edited', sql.Bit, book.edited ?? false)
    req.input('chap_count', sql.Int, book.chap_count || null)
    req.input('authors', sql.NVarChar(sql.MAX), book.authors)
    req.input('publishing_level', sql.Int, book.publishing_level)
    req.input('book_type', sql.Int, book.book_type)
    req.input('author_type', sql.Int, book.author_type)
    req.input('Image', sql.VarChar(1000), book.Image || null)

    const result = await req.execute('sp_Insert_Book_Pub')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Book', insertedId).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Book added successfully',
    })
  } catch (err: any) {
    console.error('Error adding book:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add book' },
      { status: 500 }
    )
  }
}

// PATCH - Update book
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { bookId, teacherId: bodyTeacherId, book } = body

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

    if (!bookId || !book) {
      return NextResponse.json(
        { success: false, error: 'bookId and book are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!book.title || !book.authors || !book.publishing_level || !book.book_type || !book.author_type) {
      return NextResponse.json(
        { success: false, error: 'Title, authors, publishing level, book type, and author type are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('bid', sql.Int, bookId)
    req.input('tid', sql.Int, teacherId)
    req.input('title', sql.NVarChar(sql.MAX), book.title)
    req.input('isbn', sql.NVarChar(1000), book.isbn || null)
    req.input('cha', sql.NChar(1000), book.cha || null)
    req.input('publisher_name', sql.NVarChar(3000), book.publisher_name || null)
    req.input('submit_date', sql.Date, book.submit_date || null)
    req.input('place', sql.NVarChar(4000), book.place || null)
    req.input('paid', sql.Bit, book.paid ?? false)
    req.input('edited', sql.Bit, book.edited ?? false)
    req.input('chap_count', sql.Int, book.chap_count || null)
    req.input('authors', sql.NVarChar(sql.MAX), book.authors)
    req.input('publishing_level', sql.Int, book.publishing_level)
    req.input('book_type', sql.Int, book.book_type)
    req.input('author_type', sql.Int, book.author_type)
    req.input('Image', sql.VarChar(1000), book.Image || null)

    await req.execute('sp_Update_Book_Pub')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Book', bookId).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Book updated successfully',
    })
  } catch (err: any) {
    console.error('Error updating book:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update book' },
      { status: 500 }
    )
  }
}

// DELETE - Delete book
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

    // Get bookId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let bookId = parseInt(searchParams.get('bookId') || '', 10)
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
              if (body.bookId) {
                const bodyBookId = parseInt(String(body.bookId), 10)
                if (!isNaN(bodyBookId)) bookId = bodyBookId
              }
              if (body.image && typeof body.image === 'string') {
                imagePath = body.image.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Book] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Book] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for image (backward compatibility)
    if (!imagePath) {
      const queryImage = searchParams.get('image')
      if (queryImage) imagePath = queryImage
    }

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: 'bookId is required' },
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
        
        console.log(`[DELETE Book] Attempting to delete S3 document: ${imagePath}`)
        const s3DeleteResult = await deleteFromS3(imagePath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Book] ✓ S3 document deleted: ${imagePath}`)
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Book] ⚠ S3 document not found (acceptable): ${imagePath}`)
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Book] ✗ Failed to delete S3 document: ${imagePath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Book] Error deleting S3 document:', s3Error)
      }
    } else if (imagePath && imagePath.trim()) {
      // Image path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Book] Invalid S3 path format (not starting with 'upload/'): ${imagePath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const deleteReq = pool.request()
    deleteReq.input('bid', sql.Int, bookId)
    
    await deleteReq.execute('sp_Delete_Book_Pub')
    console.log(`[DELETE Book] ✓ Database record deleted: bookId=${bookId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Book', bookId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !imagePath || !imagePath.trim() || !imagePath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return NextResponse.json({ 
        success: true, 
        message: 'Book and document deleted successfully',
        s3DeleteMessage,
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return NextResponse.json({ 
        success: true, 
        message: 'Book deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      })
    }
  } catch (err: any) {
    console.error('[DELETE Book] Error deleting book:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}

