import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all journals for a teacher
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
      .execute('sp_Get_Teacher_Journals_ByTid')

    const journals = result.recordset || []

    return NextResponse.json({
      success: true,
      journals,
    })
  } catch (err: any) {
    console.error('Error fetching journals:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch journals' },
      { status: 500 }
    )
  }
}

// POST - Insert new journal
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, journal } = body

    if (!teacherId || !journal) {
      return NextResponse.json(
        { success: false, error: 'teacherId and journal are required' },
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

    await req.execute('sp_Insert_Teacher_Journal')

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
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { journalId, teacherId, journal } = body

    if (!journalId || !teacherId || !journal) {
      return NextResponse.json(
        { success: false, error: 'journalId, teacherId, and journal are required' },
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
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const journalId = parseInt(searchParams.get('journalId') || '', 10)

    if (isNaN(journalId)) {
      return NextResponse.json(
        { success: false, error: 'journalId is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('id', sql.Int, journalId)

    await req.execute('sp_Delete_Teacher_Journal')

    return NextResponse.json({
      success: true,
      message: 'Journal deleted successfully',
    })
  } catch (err: any) {
    console.error('Error deleting journal:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete journal' },
      { status: 500 }
    )
  }
}

