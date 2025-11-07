import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all academic research visits for a teacher
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
      .execute('sp_GetAll_Academic_Research_Visit_ByTid')

    const visits = result.recordset || []

    return NextResponse.json({
      success: true,
      visits,
    })
  } catch (err: any) {
    console.error('Error fetching academic research visits:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch academic research visits' },
      { status: 500 }
    )
  }
}

// POST - Insert new academic research visit
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, visit } = body

    if (!teacherId || !visit) {
      return NextResponse.json(
        { success: false, error: 'teacherId and visit are required' },
        { status: 400 }
      )
    }

    if (!visit.Institute_visited || !visit.duration || !visit.role || !visit.date) {
      return NextResponse.json(
        { success: false, error: 'Institute visited, duration, role, and date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('Institute_visited', sql.NVarChar(500), visit.Institute_visited)
    req.input('duration', sql.Int, visit.duration)
    req.input('role', sql.Int, visit.role)
    req.input('Sponsored_by', sql.NVarChar(500), visit.Sponsored_by || null)
    req.input('remarks', sql.NVarChar(500), visit.remarks || null)
    req.input('date', sql.Date, visit.date ? new Date(visit.date) : null)
    req.input('doc', sql.VarChar(100), visit.doc || null)

    await req.execute('sp_Insert_Academic_Research_Visit')

    return NextResponse.json({ success: true, message: 'Academic research visit added successfully' })
  } catch (err: any) {
    console.error('Error adding academic research visit:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add academic research visit' },
      { status: 500 }
    )
  }
}

// PUT - Update existing academic research visit
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { visitId, teacherId, visit } = body

    if (!visitId || !teacherId || !visit) {
      return NextResponse.json(
        { success: false, error: 'visitId, teacherId, and visit are required' },
        { status: 400 }
      )
    }

    if (!visit.Institute_visited || !visit.duration || !visit.role || !visit.date) {
      return NextResponse.json(
        { success: false, error: 'Institute visited, duration, role, and date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, visitId)
    req.input('tid', sql.Int, teacherId)
    req.input('Institute_visited', sql.NVarChar(500), visit.Institute_visited)
    req.input('duration', sql.Int, visit.duration)
    req.input('role', sql.Int, visit.role)
    req.input('Sponsored_by', sql.NVarChar(500), visit.Sponsored_by || null)
    req.input('remarks', sql.NVarChar(500), visit.remarks || null)
    req.input('date', sql.Date, visit.date ? new Date(visit.date) : null)
    req.input('doc', sql.VarChar(100), visit.doc || null)

    await req.execute('sp_Update_Academic_Research_Visit')

    return NextResponse.json({ success: true, message: 'Academic research visit updated successfully' })
  } catch (err: any) {
    console.error('Error updating academic research visit:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update academic research visit' },
      { status: 500 }
    )
  }
}

// DELETE - Delete academic research visit
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visitId = parseInt(searchParams.get('visitId') || '', 10)

    if (isNaN(visitId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing visitId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, visitId)

    await req.execute('sp_Delete_Academic_Research_Visit_ById')

    return NextResponse.json({ success: true, message: 'Academic research visit deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting academic research visit:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete academic research visit' },
      { status: 500 }
    )
  }
}

