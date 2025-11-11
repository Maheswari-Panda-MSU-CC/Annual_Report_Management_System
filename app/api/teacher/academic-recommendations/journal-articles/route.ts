import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all journal articles for a teacher
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
      .execute('sp_Lib_Journals_GetByTeacherId')

    const journals = result.recordset || []

    return NextResponse.json({
      success: true,
      journals,
    })
  } catch (err: any) {
    console.error('Error fetching journal articles:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch journal articles' },
      { status: 500 }
    )
  }
}

// POST - Insert new journal article
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

    // Validation
    if (!journal.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Tid', sql.Int, teacherId)
    req.input('Title', sql.NVarChar(1000), journal.title || null)
    req.input('ISSN', sql.NVarChar(100), journal.issn || null)
    req.input('eISSN', sql.NVarChar(100), journal.eISSN || null)
    req.input('PublisherName', sql.NVarChar(1000), journal.publisherName || null)
    req.input('volume_num', sql.Int, journal.volume_num || null)
    req.input('level', sql.Int, journal.level || null)
    req.input('peer_reviewed', sql.Bit, journal.peer_reviewed ?? null)
    req.input('h_index', sql.Numeric(10, 4), journal.h_index || null)
    req.input('impact_factor', sql.Numeric(10, 4), journal.impact_factor || null)
    req.input('in_scopus', sql.Bit, journal.in_scopus ?? null)
    req.input('type', sql.Int, journal.type || null)
    req.input('in_ugc', sql.Bit, journal.in_ugc ?? null)
    req.input('in_clarivate', sql.Bit, journal.in_clarivate ?? null)
    req.input('DOI', sql.NVarChar(sql.MAX), journal.doi || null)
    req.input('in_oldUGCList', sql.Bit, journal.in_oldUGCList ?? null)
    req.input('NoofIssuePerYr', sql.TinyInt, journal.noofIssuePerYr || null)
    req.input('Price', sql.Decimal(10, 4), journal.price || null)
    req.input('Currency', sql.NVarChar(8), journal.currency || null)
    req.input('CreatedBy', sql.Int, teacherId)

    await req.execute('sp_Lib_Journals_Insert')

    return NextResponse.json({ success: true, message: 'Journal article added successfully' })
  } catch (err: any) {
    console.error('Error adding journal article:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add journal article' },
      { status: 500 }
    )
  }
}

// PUT - Update existing journal article
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { journalId, teacherId, journal } = body

    if (!journalId || !teacherId || !journal) {
      return NextResponse.json(
        { success: false, error: 'journalId, teacherId, and journal are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!journal.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Id', sql.Int, journalId)
    req.input('Tid', sql.Int, teacherId)
    req.input('Title', sql.NVarChar(1000), journal.title || null)
    req.input('ISSN', sql.NVarChar(100), journal.issn || null)
    req.input('eISSN', sql.NVarChar(100), journal.eISSN || null)
    req.input('PublisherName', sql.NVarChar(1000), journal.publisherName || null)
    req.input('volume_num', sql.Int, journal.volume_num || null)
    req.input('level', sql.Int, journal.level || null)
    req.input('peer_reviewed', sql.Bit, journal.peer_reviewed ?? null)
    req.input('h_index', sql.Numeric(10, 4), journal.h_index || null)
    req.input('impact_factor', sql.Numeric(10, 4), journal.impact_factor || null)
    req.input('in_scopus', sql.Bit, journal.in_scopus ?? null)
    req.input('type', sql.Int, journal.type || null)
    req.input('in_ugc', sql.Bit, journal.in_ugc ?? null)
    req.input('in_clarivate', sql.Bit, journal.in_clarivate ?? null)
    req.input('DOI', sql.NVarChar(sql.MAX), journal.doi || null)
    req.input('in_oldUGCList', sql.Bit, journal.in_oldUGCList ?? null)
    req.input('NoofIssuePerYr', sql.TinyInt, journal.noofIssuePerYr || null)
    req.input('Price', sql.Decimal(10, 4), journal.price || null)
    req.input('Currency', sql.NVarChar(8), journal.currency || null)
    req.input('ModifiedBy', sql.Int, teacherId)

    await req.execute('sp_Lib_Journals_Update')

    return NextResponse.json({ success: true, message: 'Journal article updated successfully' })
  } catch (err: any) {
    console.error('Error updating journal article:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update journal article' },
      { status: 500 }
    )
  }
}

// DELETE - Delete journal article
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const journalId = parseInt(searchParams.get('journalId') || '', 10)

    if (isNaN(journalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing journalId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Id', sql.Int, journalId)

    await req.execute('sp_Lib_Journals_Delete')

    return NextResponse.json({ success: true, message: 'Journal article deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting journal article:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete journal article' },
      { status: 500 }
    )
  }
}

