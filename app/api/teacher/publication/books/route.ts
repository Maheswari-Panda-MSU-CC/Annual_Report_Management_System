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
      .input('tid', sql.Int, teacherId)
      .execute('sp_Get_Book_Pub_ByTeacherId')

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

    await req.execute('sp_Insert_Book_Pub')

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
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { bookId, teacherId, book } = body

    if (!bookId || !teacherId || !book) {
      return NextResponse.json(
        { success: false, error: 'bookId, teacherId, and book are required' },
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
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = parseInt(searchParams.get('bookId') || '', 10)

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: 'bookId is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('bid', sql.Int, bookId)

    await req.execute('sp_Delete_Book_Pub')

    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully',
    })
  } catch (err: any) {
    console.error('Error deleting book:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}

