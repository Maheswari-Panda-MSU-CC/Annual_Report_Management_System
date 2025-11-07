import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all collaborations for a teacher
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
      .execute('sp_GetCollaborations_ByTeacherId')

    const collaborations = result.recordset || []

    return NextResponse.json({
      success: true,
      collaborations,
    })
  } catch (err: any) {
    console.error('Error fetching collaborations:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch collaborations' },
      { status: 500 }
    )
  }
}

// POST - Insert new collaboration
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, collaboration } = body

    if (!teacherId || !collaboration) {
      return NextResponse.json(
        { success: false, error: 'teacherId and collaboration are required' },
        { status: 400 }
      )
    }

    if (!collaboration.collaborating_inst || !collaboration.category) {
      return NextResponse.json(
        { success: false, error: 'Collaborating Institute and Category are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('deptid', sql.Int, null)
    req.input('collaborating_inst', sql.NVarChar(200), collaboration.collaborating_inst)
    req.input('address', sql.NVarChar(200), collaboration.address || null)
    req.input('details', sql.NVarChar(sql.MAX), collaboration.details || null)
    req.input('duration', sql.Int, collaboration.duration || null)
    req.input('beneficiary_num', sql.Int, collaboration.beneficiary_num || null)
    req.input('level', sql.Int, collaboration.level || null)
    req.input('type', sql.Int, collaboration.type || null)
    req.input('MOU_signed', sql.Bit, collaboration.MOU_signed !== undefined ? collaboration.MOU_signed : null)
    req.input('signing_date', sql.Date, collaboration.signing_date ? new Date(collaboration.signing_date) : null)
    req.input('submit_date', sql.DateTime, new Date())
    req.input('fid', sql.Int, null)
    req.input('tid', sql.Int, teacherId)
    req.input('category', sql.NVarChar(50), collaboration.category)
    req.input('collab_name', sql.NVarChar(200), collaboration.collab_name || null)
    req.input('categoryrb', sql.Bit, collaboration.categoryrb !== undefined ? collaboration.categoryrb : null)
    req.input('collab_rank', sql.NVarChar(50), collaboration.collab_rank || null)
    req.input('collab_outcome', sql.Int, collaboration.collab_outcome || null)
    req.input('collab_status', sql.NVarChar(50), collaboration.collab_status || null)
    req.input('starting_date', sql.Date, collaboration.starting_date ? new Date(collaboration.starting_date) : null)
    req.input('doc', sql.VarChar(100), collaboration.doc || null)

    await req.execute('sp_Insert_Collaboration')

    return NextResponse.json({ success: true, message: 'Collaboration added successfully' })
  } catch (err: any) {
    console.error('Error adding collaboration:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add collaboration' },
      { status: 500 }
    )
  }
}

// PUT - Update existing collaboration
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { collaborationId, teacherId, collaboration } = body

    if (!collaborationId || !teacherId || !collaboration) {
      return NextResponse.json(
        { success: false, error: 'collaborationId, teacherId, and collaboration are required' },
        { status: 400 }
      )
    }

    if (!collaboration.collaborating_inst || !collaboration.category) {
      return NextResponse.json(
        { success: false, error: 'Collaborating Institute and Category are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, collaborationId)
    req.input('deptid', sql.Int, null)
    req.input('collaborating_inst', sql.NVarChar(200), collaboration.collaborating_inst)
    req.input('address', sql.NVarChar(200), collaboration.address || null)
    req.input('details', sql.NVarChar(sql.MAX), collaboration.details || null)
    req.input('duration', sql.Int, collaboration.duration || null)
    req.input('beneficiary_num', sql.Int, collaboration.beneficiary_num || null)
    req.input('level', sql.Int, collaboration.level || null)
    req.input('type', sql.Int, collaboration.type || null)
    req.input('MOU_signed', sql.Bit, collaboration.MOU_signed !== undefined ? collaboration.MOU_signed : null)
    req.input('signing_date', sql.Date, collaboration.signing_date ? new Date(collaboration.signing_date) : null)
    req.input('submit_date', sql.DateTime, new Date())
    req.input('fid', sql.Int, null)
    req.input('tid', sql.Int, teacherId)
    req.input('category', sql.NVarChar(50), collaboration.category)
    req.input('collab_name', sql.NVarChar(200), collaboration.collab_name || null)
    req.input('categoryrb', sql.Bit, collaboration.categoryrb !== undefined ? collaboration.categoryrb : null)
    req.input('collab_rank', sql.NVarChar(50), collaboration.collab_rank || null)
    req.input('collab_outcome', sql.Int, collaboration.collab_outcome || null)
    req.input('collab_status', sql.NVarChar(50), collaboration.collab_status || null)
    req.input('starting_date', sql.Date, collaboration.starting_date ? new Date(collaboration.starting_date) : null)
    req.input('doc', sql.VarChar(100), collaboration.doc || null)

    await req.execute('sp_Update_Collaboration')

    return NextResponse.json({ success: true, message: 'Collaboration updated successfully' })
  } catch (err: any) {
    console.error('Error updating collaboration:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update collaboration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete collaboration
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const collaborationId = parseInt(searchParams.get('collaborationId') || '', 10)

    if (isNaN(collaborationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing collaborationId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, collaborationId)

    await req.execute('sp_Delete_Collaboration')

    return NextResponse.json({ success: true, message: 'Collaboration deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting collaboration:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete collaboration' },
      { status: 500 }
    )
  }
}

