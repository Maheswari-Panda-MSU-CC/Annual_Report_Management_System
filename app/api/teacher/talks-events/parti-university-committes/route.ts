import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all University Committee Participation for a teacher
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
      .execute('sp_Get_Parti_Commi_ByTid')

    const universityCommittees = result.recordset || []

    return NextResponse.json({
      success: true,
      universityCommittees,
    })
  } catch (err: any) {
    console.error('Error fetching University Committee Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch University Committee Participation' },
      { status: 500 }
    )
  }
}

// POST - Insert new University Committee Participation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, partiCommi } = body

    if (!teacherId || !partiCommi) {
      return NextResponse.json(
        { success: false, error: 'teacherId and partiCommi are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!partiCommi.name || !partiCommi.committee_name || !partiCommi.level || !partiCommi.participated_as || !partiCommi.submit_date) {
      return NextResponse.json(
        { success: false, error: 'Name, Committee Name, Level, Participated As, and Submit Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), partiCommi.name)
    req.input('committee_name', sql.NVarChar(500), partiCommi.committee_name)
    req.input('level', sql.Int, partiCommi.level)
    req.input('participated_as', sql.NVarChar(100), partiCommi.participated_as)
    req.input('submit_date', sql.Date, partiCommi.submit_date ? new Date(partiCommi.submit_date) : null)
    req.input('supporting_doc', sql.VarChar(500), partiCommi.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('BOS', sql.Bit, partiCommi.BOS || false)
    req.input('FB', sql.Bit, partiCommi.FB || false)
    req.input('CDC', sql.Bit, partiCommi.CDC || false)
    req.input('year_name', sql.Int, partiCommi.year_name || new Date().getFullYear())

    await req.execute('sp_Insert_Parti_Commi')

    return NextResponse.json({ success: true, message: 'University Committee Participation added successfully' })
  } catch (err: any) {
    console.error('Error adding University Committee Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add University Committee Participation' },
      { status: 500 }
    )
  }
}

// PUT - Update existing University Committee Participation
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { partiCommiId, teacherId, partiCommi } = body

    if (!partiCommiId || !teacherId || !partiCommi) {
      return NextResponse.json(
        { success: false, error: 'partiCommiId, teacherId, and partiCommi are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!partiCommi.name || !partiCommi.committee_name || !partiCommi.level || !partiCommi.participated_as || !partiCommi.submit_date) {
      return NextResponse.json(
        { success: false, error: 'Name, Committee Name, Level, Participated As, and Submit Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, partiCommiId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), partiCommi.name)
    req.input('committee_name', sql.NVarChar(500), partiCommi.committee_name)
    req.input('level', sql.Int, partiCommi.level)
    req.input('participated_as', sql.NVarChar(100), partiCommi.participated_as)
    req.input('submit_date', sql.Date, partiCommi.submit_date ? new Date(partiCommi.submit_date) : null)
    req.input('supporting_doc', sql.VarChar(500), partiCommi.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('BOS', sql.Bit, partiCommi.BOS || false)
    req.input('FB', sql.Bit, partiCommi.FB || false)
    req.input('CDC', sql.Bit, partiCommi.CDC || false)
    req.input('year_name', sql.Int, partiCommi.year_name || new Date().getFullYear())

    await req.execute('sp_Update_Parti_Commi')

    return NextResponse.json({ success: true, message: 'University Committee Participation updated successfully' })
  } catch (err: any) {
    console.error('Error updating University Committee Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update University Committee Participation' },
      { status: 500 }
    )
  }
}

// DELETE - Delete University Committee Participation
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const partiCommiId = parseInt(searchParams.get('partiCommiId') || '', 10)

    if (isNaN(partiCommiId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing partiCommiId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, partiCommiId)

    await req.execute('sp_Delete_Parti_Commi')

    return NextResponse.json({ success: true, message: 'University Committee Participation deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting University Committee Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete University Committee Participation' },
      { status: 500 }
    )
  }
}

