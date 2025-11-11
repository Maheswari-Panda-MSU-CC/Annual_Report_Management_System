import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all books for a teacher
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10)

    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing teacherId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const result = await pool
      .request()
      .input('Tid', sql.Int, teacherId)
      .execute('Get_Library_Books_ByTid')

    const books = result.recordset || []

    return NextResponse.json({
      success: true,
      books,
    })
  } catch (err: any) {
    console.error('Error fetching books:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

// POST - Insert new book
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, book } = body

    if (!teacherId || !book) {
      return NextResponse.json(
        { success: false, error: 'teacherId and book are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!book.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Tid', sql.Int, teacherId)
    req.input('Title', sql.NVarChar(sql.MAX), book.title || null)
    req.input('Authors', sql.NVarChar(sql.MAX), book.authors || null)
    req.input('ISBN', sql.NVarChar(1000), book.isbn || null)
    req.input('Book_Category', sql.NVarChar(30), book.book_category || null)
    req.input('Publisher_Name', sql.NVarChar(3000), book.publisher_name || null)
    req.input('Publishing_Level', sql.Int, book.publishing_level || null)
    req.input('Book_Type', sql.Int, book.book_type || null)
    req.input('Author_Type', sql.Int, book.author_type || null)
    req.input('Edition', sql.NVarChar(10), book.edition || null)
    req.input('Volume', sql.NVarChar(10), book.volume || null)
    req.input('Ebook', sql.NVarChar(1000), book.ebook || null)
    req.input('DigitalMedia', sql.NVarChar(300), book.digital_media || null)
    req.input('ApproxPrice', sql.Decimal(8, 3), book.approx_price || null)
    req.input('Currency', sql.NVarChar(5), book.currency || null)
    req.input('PublicationDate', sql.Date, book.publication_date ? new Date(book.publication_date) : null)
    req.input('Proposed_AY', sql.NVarChar(20), book.proposed_ay || null)
    req.input('CreatedBy', sql.Int, teacherId)

    await req.execute('sp_Insert_Lib_Book')

    return NextResponse.json({ success: true, message: 'Book added successfully' })
  } catch (err: any) {
    console.error('Error adding book:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add book' },
      { status: 500 }
    )
  }
}

// PUT - Update existing book
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { bookId, teacherId, book } = body

    if (!bookId || !teacherId || !book) {
      return NextResponse.json(
        { success: false, error: 'bookId, teacherId, and book are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!book.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Id', sql.Int, bookId)
    req.input('Tid', sql.Int, teacherId)
    req.input('Title', sql.NVarChar(sql.MAX), book.title || null)
    req.input('Authors', sql.NVarChar(sql.MAX), book.authors || null)
    req.input('ISBN', sql.NVarChar(1000), book.isbn || null)
    req.input('Book_Category', sql.NVarChar(30), book.book_category || null)
    req.input('Publisher_Name', sql.NVarChar(3000), book.publisher_name || null)
    req.input('Publishing_Level', sql.Int, book.publishing_level || null)
    req.input('Book_Type', sql.Int, book.book_type || null)
    req.input('Author_Type', sql.Int, book.author_type || null)
    req.input('Edition', sql.NVarChar(10), book.edition || null)
    req.input('Volume', sql.NVarChar(10), book.volume || null)
    req.input('Ebook', sql.NVarChar(1000), book.ebook || null)
    req.input('DigitalMedia', sql.NVarChar(300), book.digital_media || null)
    req.input('ApproxPrice', sql.Decimal(8, 3), book.approx_price || null)
    req.input('Currency', sql.NVarChar(5), book.currency || null)
    req.input('PublicationDate', sql.Date, book.publication_date ? new Date(book.publication_date) : null)
    req.input('Proposed_AY', sql.NVarChar(20), book.proposed_ay || null)
    req.input('ModifiedBy', sql.Int, teacherId)

    await req.execute('sp_Update_Lib_Book')

    return NextResponse.json({ success: true, message: 'Book updated successfully' })
  } catch (err: any) {
    console.error('Error updating book:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update book' },
      { status: 500 }
    )
  }
}

// DELETE - Delete book
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = parseInt(searchParams.get('bookId') || '', 10)

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing bookId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Id', sql.Int, bookId)

    await req.execute('sp_Delete_Lib_Book')

    return NextResponse.json({ success: true, message: 'Book deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting book:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}

