import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all Performance Teacher records for a teacher
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
      .execute('sp_Get_Perf_Teacher_By_Tid')

    const performanceTeacher = result.recordset || []

    return NextResponse.json({
      success: true,
      performanceTeacher,
    })
  } catch (err: any) {
    console.error('Error fetching Performance Teacher:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Performance Teacher' },
      { status: 500 }
    )
  }
}

// POST - Insert new Performance Teacher record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, perfTeacher } = body

    if (!teacherId || !perfTeacher) {
      return NextResponse.json(
        { success: false, error: 'teacherId and perfTeacher are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!perfTeacher.name || !perfTeacher.place || !perfTeacher.date || !perfTeacher.perf_nature) {
      return NextResponse.json(
        { success: false, error: 'Name, Place, Date, and Nature of Performance are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), perfTeacher.name)
    req.input('place', sql.NVarChar(150), perfTeacher.place)
    req.input('date', sql.Date, perfTeacher.date ? new Date(perfTeacher.date) : null)
    req.input('perf_nature', sql.NVarChar(250), perfTeacher.perf_nature)
    req.input('Image', sql.VarChar(500), perfTeacher.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_Insert_Perf_Teacher')

    return NextResponse.json({ success: true, message: 'Performance Teacher added successfully' })
  } catch (err: any) {
    console.error('Error adding Performance Teacher:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Performance Teacher' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Performance Teacher record
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { perfTeacherId, teacherId, perfTeacher } = body

    if (!perfTeacherId || !teacherId || !perfTeacher) {
      return NextResponse.json(
        { success: false, error: 'perfTeacherId, teacherId, and perfTeacher are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!perfTeacher.name || !perfTeacher.place || !perfTeacher.date || !perfTeacher.perf_nature) {
      return NextResponse.json(
        { success: false, error: 'Name, Place, Date, and Nature of Performance are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, perfTeacherId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), perfTeacher.name)
    req.input('place', sql.NVarChar(150), perfTeacher.place)
    req.input('date', sql.Date, perfTeacher.date ? new Date(perfTeacher.date) : null)
    req.input('perf_nature', sql.NVarChar(250), perfTeacher.perf_nature)
    req.input('Image', sql.VarChar(500), perfTeacher.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_Update_Perf_Teacher')

    return NextResponse.json({ success: true, message: 'Performance Teacher updated successfully' })
  } catch (err: any) {
    console.error('Error updating Performance Teacher:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Performance Teacher' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Performance Teacher record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const perfTeacherId = parseInt(searchParams.get('perfTeacherId') || '', 10)

    if (isNaN(perfTeacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing perfTeacherId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, perfTeacherId)

    await req.execute('sp_Delete_Perf_Teacher')

    return NextResponse.json({ success: true, message: 'Performance Teacher deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting Performance Teacher:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Performance Teacher' },
      { status: 500 }
    )
  }
}

