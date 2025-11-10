import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all Academic Bodies Participation for a teacher
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
      .execute('sp_GetByTid_Parti_Acads')

    const academicBodiesParticipation = result.recordset || []

    return NextResponse.json({
      success: true,
      academicBodiesParticipation,
    })
  } catch (err: any) {
    console.error('Error fetching Academic Bodies Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Academic Bodies Participation' },
      { status: 500 }
    )
  }
}

// POST - Insert new Academic Bodies Participation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, partiAcads } = body

    if (!teacherId || !partiAcads) {
      return NextResponse.json(
        { success: false, error: 'teacherId and partiAcads are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!partiAcads.name || !partiAcads.acad_body || !partiAcads.place || !partiAcads.participated_as || !partiAcads.submit_date) {
      return NextResponse.json(
        { success: false, error: 'Name, Academic Body, Place, Participated As, and Submit Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), partiAcads.name)
    req.input('acad_body', sql.NVarChar(500), partiAcads.acad_body)
    req.input('place', sql.NVarChar(150), partiAcads.place)
    req.input('participated_as', sql.NVarChar(100), partiAcads.participated_as)
    req.input('submit_date', sql.Date, partiAcads.submit_date ? new Date(partiAcads.submit_date) : null)
    req.input('supporting_doc', sql.VarChar(500), partiAcads.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('year_name', sql.Int, partiAcads.year_name || new Date().getFullYear())

    await req.execute('sp_Insert_Parti_Acads')

    return NextResponse.json({ success: true, message: 'Academic Bodies Participation added successfully' })
  } catch (err: any) {
    console.error('Error adding Academic Bodies Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Academic Bodies Participation' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Academic Bodies Participation
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { partiAcadsId, teacherId, partiAcads } = body

    if (!partiAcadsId || !teacherId || !partiAcads) {
      return NextResponse.json(
        { success: false, error: 'partiAcadsId, teacherId, and partiAcads are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!partiAcads.name || !partiAcads.acad_body || !partiAcads.place || !partiAcads.participated_as || !partiAcads.submit_date) {
      return NextResponse.json(
        { success: false, error: 'Name, Academic Body, Place, Participated As, and Submit Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, partiAcadsId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(100), partiAcads.name)
    req.input('acad_body', sql.NVarChar(500), partiAcads.acad_body)
    req.input('place', sql.NVarChar(150), partiAcads.place)
    req.input('participated_as', sql.NVarChar(100), partiAcads.participated_as)
    req.input('submit_date', sql.Date, partiAcads.submit_date ? new Date(partiAcads.submit_date) : null)
    req.input('supporting_doc', sql.VarChar(500), partiAcads.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('year_name', sql.Int, partiAcads.year_name || new Date().getFullYear())

    await req.execute('sp_Update_Parti_Acads')

    return NextResponse.json({ success: true, message: 'Academic Bodies Participation updated successfully' })
  } catch (err: any) {
    console.error('Error updating Academic Bodies Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Academic Bodies Participation' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Academic Bodies Participation
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const partiAcadsId = parseInt(searchParams.get('partiAcadsId') || '', 10)

    if (isNaN(partiAcadsId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing partiAcadsId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, partiAcadsId)

    await req.execute('sp_Delete_Parti_Acads')

    return NextResponse.json({ success: true, message: 'Academic Bodies Participation deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting Academic Bodies Participation:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Academic Bodies Participation' },
      { status: 500 }
    )
  }
}

