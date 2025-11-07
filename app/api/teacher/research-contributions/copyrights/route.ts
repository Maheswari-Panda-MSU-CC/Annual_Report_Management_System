import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all copyright records for a teacher
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
      .execute('sp_GetCopyrightByTid')

    const copyrights = result.recordset || []

    return NextResponse.json({
      success: true,
      copyrights,
    })
  } catch (err: any) {
    console.error('Error fetching copyright records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch copyright records' },
      { status: 500 }
    )
  }
}

// POST - Insert new copyright record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, copyright } = body

    if (!teacherId || !copyright) {
      return NextResponse.json(
        { success: false, error: 'teacherId and copyright are required' },
        { status: 400 }
      )
    }

    if (!copyright.Title || !copyright.RefNo) {
      return NextResponse.json(
        { success: false, error: 'Title and Reference Number are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Tid', sql.Int, teacherId)
    req.input('Title', sql.VarChar(500), copyright.Title)
    req.input('RefNo', sql.NVarChar(100), copyright.RefNo)
    req.input('PublicationDate', sql.DateTime, copyright.PublicationDate ? new Date(copyright.PublicationDate) : null)
    req.input('Link', sql.NVarChar(500), copyright.Link || null)
    req.input('doc', sql.NVarChar(100), copyright.doc || null)

    await req.execute('sp_InsertCopyright')

    return NextResponse.json({ success: true, message: 'Copyright record added successfully' })
  } catch (err: any) {
    console.error('Error adding copyright record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add copyright record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing copyright record
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { copyrightId, teacherId, copyright } = body

    if (!copyrightId || !teacherId || !copyright) {
      return NextResponse.json(
        { success: false, error: 'copyrightId, teacherId, and copyright are required' },
        { status: 400 }
      )
    }

    if (!copyright.Title || !copyright.RefNo) {
      return NextResponse.json(
        { success: false, error: 'Title and Reference Number are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Id', sql.Int, copyrightId)
    req.input('Tid', sql.Int, teacherId)
    req.input('Title', sql.VarChar(500), copyright.Title)
    req.input('RefNo', sql.NVarChar(100), copyright.RefNo)
    req.input('PublicationDate', sql.DateTime, copyright.PublicationDate ? new Date(copyright.PublicationDate) : null)
    req.input('Link', sql.NVarChar(500), copyright.Link || null)
    req.input('doc', sql.NVarChar(100), copyright.doc || null)

    await req.execute('sp_UpdateCopyright')

    return NextResponse.json({ success: true, message: 'Copyright record updated successfully' })
  } catch (err: any) {
    console.error('Error updating copyright record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update copyright record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete copyright record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const copyrightId = parseInt(searchParams.get('copyrightId') || '', 10)

    if (isNaN(copyrightId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing copyrightId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Id', sql.Int, copyrightId)

    await req.execute('sp_DeleteCopyright')

    return NextResponse.json({ success: true, message: 'Copyright record deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting copyright record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete copyright record' },
      { status: 500 }
    )
  }
}

