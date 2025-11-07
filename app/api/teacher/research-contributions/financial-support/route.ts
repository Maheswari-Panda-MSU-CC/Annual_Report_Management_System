import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all financial support records for a teacher
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
      .execute('sp_GetByTid_Financial_Support')

    const financialSupports = result.recordset || []

    return NextResponse.json({
      success: true,
      financialSupports,
    })
  } catch (err: any) {
    console.error('Error fetching financial support records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch financial support records' },
      { status: 500 }
    )
  }
}

// POST - Insert new financial support record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, financialSupport } = body

    if (!teacherId || !financialSupport) {
      return NextResponse.json(
        { success: false, error: 'teacherId and financialSupport are required' },
        { status: 400 }
      )
    }

    if (!financialSupport.name || !financialSupport.type || !financialSupport.support || !financialSupport.grant_received || !financialSupport.date) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Supporting Agency, Grant Received, and Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), financialSupport.name)
    req.input('type', sql.Int, financialSupport.type)
    req.input('support', sql.VarChar(500), financialSupport.support)
    req.input('grant_received', sql.Numeric(15, 0), financialSupport.grant_received)
    req.input('details', sql.VarChar(500), financialSupport.details || null)
    req.input('purpose', sql.VarChar(500), financialSupport.purpose || null)
    req.input('date', sql.Date, financialSupport.date ? new Date(financialSupport.date) : null)
    req.input('doc', sql.VarChar(100), financialSupport.doc || null)

    await req.execute('sp_Insert_Financial_Support')

    return NextResponse.json({ success: true, message: 'Financial support record added successfully' })
  } catch (err: any) {
    console.error('Error adding financial support record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add financial support record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing financial support record
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { financialSupportId, teacherId, financialSupport } = body

    if (!financialSupportId || !teacherId || !financialSupport) {
      return NextResponse.json(
        { success: false, error: 'financialSupportId, teacherId, and financialSupport are required' },
        { status: 400 }
      )
    }

    if (!financialSupport.name || !financialSupport.type || !financialSupport.support || !financialSupport.grant_received || !financialSupport.date) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Supporting Agency, Grant Received, and Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, financialSupportId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), financialSupport.name)
    req.input('type', sql.Int, financialSupport.type)
    req.input('support', sql.VarChar(500), financialSupport.support)
    req.input('grant_received', sql.Numeric(15, 0), financialSupport.grant_received)
    req.input('details', sql.VarChar(500), financialSupport.details || null)
    req.input('purpose', sql.VarChar(500), financialSupport.purpose || null)
    req.input('date', sql.Date, financialSupport.date ? new Date(financialSupport.date) : null)
    req.input('doc', sql.VarChar(100), financialSupport.doc || null)

    await req.execute('sp_Update_Financial_Support')

    return NextResponse.json({ success: true, message: 'Financial support record updated successfully' })
  } catch (err: any) {
    console.error('Error updating financial support record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update financial support record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete financial support record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const financialSupportId = parseInt(searchParams.get('financialSupportId') || '', 10)

    if (isNaN(financialSupportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing financialSupportId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, financialSupportId)

    await req.execute('sp_Delete_Financial_Support')

    return NextResponse.json({ success: true, message: 'Financial support record deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting financial support record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete financial support record' },
      { status: 500 }
    )
  }
}

