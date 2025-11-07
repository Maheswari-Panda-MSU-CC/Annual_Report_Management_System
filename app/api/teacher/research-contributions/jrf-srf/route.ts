import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all JRF/SRF records for a teacher
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
      .execute('Get_JRF_SRF_By_TeacherId')

    const jrfSrfs = result.recordset || []

    return NextResponse.json({
      success: true,
      jrfSrfs,
    })
  } catch (err: any) {
    console.error('Error fetching JRF/SRF records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch JRF/SRF records' },
      { status: 500 }
    )
  }
}

// POST - Insert new JRF/SRF record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, jrfSrf } = body

    if (!teacherId || !jrfSrf) {
      return NextResponse.json(
        { success: false, error: 'teacherId and jrfSrf are required' },
        { status: 400 }
      )
    }

    if (!jrfSrf.name || !jrfSrf.type || !jrfSrf.title || !jrfSrf.duration) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Title, and Duration are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), jrfSrf.name)
    req.input('type', sql.Int, jrfSrf.type)
    req.input('title', sql.VarChar(500), jrfSrf.title)
    req.input('duration', sql.Int, jrfSrf.duration)
    req.input('stipend', sql.Numeric(15, 0), jrfSrf.stipend || null)
    req.input('date', sql.Date, jrfSrf.date ? new Date(jrfSrf.date) : null)
    req.input('doc', sql.VarChar(100), jrfSrf.doc || null)

    await req.execute('sp_InsertJRF_SRF')

    return NextResponse.json({ success: true, message: 'JRF/SRF record added successfully' })
  } catch (err: any) {
    console.error('Error adding JRF/SRF record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add JRF/SRF record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing JRF/SRF record
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { jrfSrfId, teacherId, jrfSrf } = body

    if (!jrfSrfId || !teacherId || !jrfSrf) {
      return NextResponse.json(
        { success: false, error: 'jrfSrfId, teacherId, and jrfSrf are required' },
        { status: 400 }
      )
    }

    if (!jrfSrf.name || !jrfSrf.type || !jrfSrf.title || !jrfSrf.duration) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Title, and Duration are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, jrfSrfId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), jrfSrf.name)
    req.input('type', sql.Int, jrfSrf.type)
    req.input('title', sql.VarChar(500), jrfSrf.title)
    req.input('duration', sql.Int, jrfSrf.duration)
    req.input('stipend', sql.Numeric(15, 0), jrfSrf.stipend || null)
    req.input('date', sql.Date, jrfSrf.date ? new Date(jrfSrf.date) : null)
    req.input('doc', sql.VarChar(100), jrfSrf.doc || null)

    await req.execute('sp_UpdateJRF_SRF')

    return NextResponse.json({ success: true, message: 'JRF/SRF record updated successfully' })
  } catch (err: any) {
    console.error('Error updating JRF/SRF record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update JRF/SRF record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete JRF/SRF record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jrfSrfId = parseInt(searchParams.get('jrfSrfId') || '', 10)

    if (isNaN(jrfSrfId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing jrfSrfId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, jrfSrfId)

    await req.execute('sp_DeleteJRF_SRF')

    return NextResponse.json({ success: true, message: 'JRF/SRF record deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting JRF/SRF record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete JRF/SRF record' },
      { status: 500 }
    )
  }
}

