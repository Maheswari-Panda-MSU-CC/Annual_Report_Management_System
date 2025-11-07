import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all PhD student records for a teacher
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
      .execute('sp_Phd_Student_Details_getByTeacherId')

    const phdStudents = result.recordset || []

    return NextResponse.json({
      success: true,
      phdStudents,
    })
  } catch (err: any) {
    console.error('Error fetching PhD student records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch PhD student records' },
      { status: 500 }
    )
  }
}

// POST - Insert new PhD student record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, phdStudent } = body

    if (!teacherId || !phdStudent) {
      return NextResponse.json(
        { success: false, error: 'teacherId and phdStudent are required' },
        { status: 400 }
      )
    }

    if (!phdStudent.regno || !phdStudent.name || !phdStudent.start_date || !phdStudent.topic || !phdStudent.status) {
      return NextResponse.json(
        { success: false, error: 'Registration Number, Name, Start Date, Topic, and Status are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('regno', sql.VarChar(500), phdStudent.regno)
    req.input('name', sql.VarChar(500), phdStudent.name)
    req.input('start_date', sql.Date, phdStudent.start_date ? new Date(phdStudent.start_date) : null)
    req.input('topic', sql.VarChar(5000), phdStudent.topic)
    req.input('status', sql.Int, phdStudent.status)
    req.input('year_of_completion', sql.Int, phdStudent.year_of_completion || null)
    req.input('doc', sql.VarChar(500), phdStudent.doc || null)

    await req.execute('sp_Phd_Student_Details_insert')

    return NextResponse.json({ success: true, message: 'PhD student record added successfully' })
  } catch (err: any) {
    console.error('Error adding PhD student record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add PhD student record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing PhD student record
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { phdStudentId, teacherId, phdStudent } = body

    if (!phdStudentId || !teacherId || !phdStudent) {
      return NextResponse.json(
        { success: false, error: 'phdStudentId, teacherId, and phdStudent are required' },
        { status: 400 }
      )
    }

    if (!phdStudent.regno || !phdStudent.name || !phdStudent.start_date || !phdStudent.topic || !phdStudent.status) {
      return NextResponse.json(
        { success: false, error: 'Registration Number, Name, Start Date, Topic, and Status are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, phdStudentId)
    req.input('tid', sql.Int, teacherId)
    req.input('regno', sql.VarChar(500), phdStudent.regno)
    req.input('name', sql.VarChar(500), phdStudent.name)
    req.input('start_date', sql.Date, phdStudent.start_date ? new Date(phdStudent.start_date) : null)
    req.input('topic', sql.VarChar(5000), phdStudent.topic)
    req.input('status', sql.Int, phdStudent.status)
    req.input('year_of_completion', sql.Int, phdStudent.year_of_completion || null)
    req.input('doc', sql.VarChar(500), phdStudent.doc || null)

    await req.execute('sp_Phd_Student_Details_update')

    return NextResponse.json({ success: true, message: 'PhD student record updated successfully' })
  } catch (err: any) {
    console.error('Error updating PhD student record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update PhD student record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete PhD student record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phdStudentId = parseInt(searchParams.get('phdStudentId') || '', 10)

    if (isNaN(phdStudentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing phdStudentId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, phdStudentId)

    await req.execute('sp_Phd_Student_Details_delete')

    return NextResponse.json({ success: true, message: 'PhD student record deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting PhD student record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete PhD student record' },
      { status: 500 }
    )
  }
}

