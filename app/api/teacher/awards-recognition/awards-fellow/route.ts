import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all Awards/Fellows records for a teacher
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
      .execute('sp_GetByTeacherId_Awards_Fellows')

    const awardsFellows = result.recordset || []

    return NextResponse.json({
      success: true,
      awardsFellows,
    })
  } catch (err: any) {
    console.error('Error fetching Awards/Fellows:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Awards/Fellows' },
      { status: 500 }
    )
  }
}

// POST - Insert new Awards/Fellows record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, awardsFellow } = body

    if (!teacherId || !awardsFellow) {
      return NextResponse.json(
        { success: false, error: 'teacherId and awardsFellow are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!awardsFellow.name || !awardsFellow.organization || !awardsFellow.date_of_award || !awardsFellow.level) {
      return NextResponse.json(
        { success: false, error: 'Name, Organization, Date of Award, and Level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(500), awardsFellow.name)
    req.input('details', sql.NVarChar(500), awardsFellow.details || '')
    req.input('organization', sql.NVarChar(500), awardsFellow.organization)
    req.input('address', sql.NVarChar(500), awardsFellow.address || '')
    req.input('date_of_award', sql.Date, awardsFellow.date_of_award ? new Date(awardsFellow.date_of_award) : null)
    req.input('level', sql.Int, awardsFellow.level)
    req.input('Image', sql.NVarChar(500), awardsFellow.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_Insert_Awards_Fellows')

    return NextResponse.json({ success: true, message: 'Awards/Fellows added successfully' })
  } catch (err: any) {
    console.error('Error adding Awards/Fellows:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Awards/Fellows' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Awards/Fellows record
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { awardsFellowId, teacherId, awardsFellow } = body

    if (!awardsFellowId || !teacherId || !awardsFellow) {
      return NextResponse.json(
        { success: false, error: 'awardsFellowId, teacherId, and awardsFellow are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!awardsFellow.name || !awardsFellow.organization || !awardsFellow.date_of_award || !awardsFellow.level) {
      return NextResponse.json(
        { success: false, error: 'Name, Organization, Date of Award, and Level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, awardsFellowId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(500), awardsFellow.name)
    req.input('details', sql.NVarChar(500), awardsFellow.details || '')
    req.input('organization', sql.NVarChar(500), awardsFellow.organization)
    req.input('address', sql.NVarChar(500), awardsFellow.address || '')
    req.input('date_of_award', sql.Date, awardsFellow.date_of_award ? new Date(awardsFellow.date_of_award) : null)
    req.input('level', sql.Int, awardsFellow.level)
    req.input('Image', sql.NVarChar(500), awardsFellow.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_Update_Awards_Fellows')

    return NextResponse.json({ success: true, message: 'Awards/Fellows updated successfully' })
  } catch (err: any) {
    console.error('Error updating Awards/Fellows:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Awards/Fellows' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Awards/Fellows record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const awardsFellowId = parseInt(searchParams.get('awardsFellowId') || '', 10)

    if (isNaN(awardsFellowId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing awardsFellowId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, awardsFellowId)

    await req.execute('sp_Delete_Awards_Fellows')

    return NextResponse.json({ success: true, message: 'Awards/Fellows deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting Awards/Fellows:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Awards/Fellows' },
      { status: 500 }
    )
  }
}

