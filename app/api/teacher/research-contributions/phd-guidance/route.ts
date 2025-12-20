import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all PhD student records for a teacher
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
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, phdStudent } = body

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

    if (!phdStudent) {
      return NextResponse.json(
        { success: false, error: 'phdStudent data is required' },
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
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { phdStudentId, teacherId: bodyTeacherId, phdStudent } = body

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

    if (!phdStudentId || !phdStudent) {
      return NextResponse.json(
        { success: false, error: 'phdStudentId and phdStudent are required' },
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

