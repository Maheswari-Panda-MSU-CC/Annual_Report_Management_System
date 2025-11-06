import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all consultancy records for a teacher
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
      .execute('sp_GetConsultancyByTeacher')

    const consultancies = result.recordset || []

    return NextResponse.json({
      success: true,
      consultancies,
    })
  } catch (err: any) {
    console.error('Error fetching consultancy records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch consultancy records' },
      { status: 500 }
    )
  }
}

// POST - Insert new consultancy record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, consultancy } = body

    if (!teacherId || !consultancy) {
      return NextResponse.json(
        { success: false, error: 'teacherId and consultancy are required' },
        { status: 400 }
      )
    }

    if (!consultancy.name || !consultancy.collaborating_inst || !consultancy.address || !consultancy.Start_Date) {
      return NextResponse.json(
        { success: false, error: 'Name, Collaborating Institute, Address, and Start Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('deptid', sql.Int, null)
    req.input('name', sql.NVarChar(sql.MAX), consultancy.name)
    req.input('collaborating_inst', sql.NVarChar(250), consultancy.collaborating_inst)
    req.input('address', sql.NVarChar(250), consultancy.address)
    req.input('duration', sql.Int, consultancy.duration || null)
    req.input('amount', sql.NVarChar(50), consultancy.amount || null)
    req.input('submit_date', sql.Date, consultancy.submit_date ? new Date(consultancy.submit_date) : new Date())
    req.input('fid', sql.Int, null)
    req.input('Tid', sql.Int, teacherId)
    req.input('Start_Date', sql.Date, new Date(consultancy.Start_Date))
    req.input('outcome', sql.VarChar(1000), consultancy.outcome || null)
    req.input('doc', sql.VarChar(1000), consultancy.doc || null)

    await req.execute('sp_InsertConsultancy')

    return NextResponse.json({ success: true, message: 'Consultancy record added successfully' })
  } catch (err: any) {
    console.error('Error adding consultancy record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add consultancy record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing consultancy record
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { consultancyId, teacherId, consultancy } = body

    if (!consultancyId || !teacherId || !consultancy) {
      return NextResponse.json(
        { success: false, error: 'consultancyId, teacherId, and consultancy are required' },
        { status: 400 }
      )
    }

    if (!consultancy.name || !consultancy.collaborating_inst || !consultancy.address || !consultancy.Start_Date) {
      return NextResponse.json(
        { success: false, error: 'Name, Collaborating Institute, Address, and Start Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, consultancyId)
    req.input('deptid', sql.Int, null)
    req.input('name', sql.NVarChar(sql.MAX), consultancy.name)
    req.input('collaborating_inst', sql.NVarChar(250), consultancy.collaborating_inst)
    req.input('address', sql.NVarChar(250), consultancy.address)
    req.input('duration', sql.Int, consultancy.duration || null)
    req.input('amount', sql.NVarChar(50), consultancy.amount || null)
    req.input('submit_date', sql.Date, consultancy.submit_date ? new Date(consultancy.submit_date) : new Date())
    req.input('fid', sql.Int, null)
    req.input('Tid', sql.Int, teacherId)
    req.input('Start_Date', sql.Date, new Date(consultancy.Start_Date))
    req.input('outcome', sql.VarChar(1000), consultancy.outcome || null)
    req.input('doc', sql.VarChar(1000), consultancy.doc || null)

    await req.execute('sp_UpdateConsultancy')

    return NextResponse.json({ success: true, message: 'Consultancy record updated successfully' })
  } catch (err: any) {
    console.error('Error updating consultancy record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update consultancy record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete consultancy record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const consultancyId = parseInt(searchParams.get('consultancyId') || '', 10)

    if (isNaN(consultancyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing consultancyId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, consultancyId)

    await req.execute('sp_DeleteConsultancy')

    return NextResponse.json({ success: true, message: 'Consultancy record deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting consultancy record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete consultancy record' },
      { status: 500 }
    )
  }
}

