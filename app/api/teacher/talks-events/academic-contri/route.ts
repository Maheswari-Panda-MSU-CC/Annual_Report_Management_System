import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all Academic Contributions for a teacher
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10)

    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing teacherId' },
        { status: 400 }
      )
    }

    if (user.role_id !== teacherId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - User ID mismatch' },
        { status: 403 }
      )
    }

    const pool = await connectToDatabase()
    const result = await pool
      .request()
      .input('tid', sql.Int, teacherId)
      .execute('sp_Contri_Acads_GetByTeacherId')

    const academicContributions = result.recordset || []

    return NextResponse.json({
      success: true,
      academicContributions,
    })
  } catch (err: any) {
    console.error('Error fetching Academic Contributions:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Academic Contributions' },
      { status: 500 }
    )
  }
}

// POST - Insert new Academic Contribution
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { academicContri } = body
    const teacherId = user.role_id

    if (!teacherId || !academicContri) {
      return NextResponse.json(
        { success: false, error: 'teacherId and academicContri are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!academicContri.name || !academicContri.programme || !academicContri.date || !academicContri.participated_as) {
      return NextResponse.json(
        { success: false, error: 'Name, Programme, Date, and Participated As are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('name', sql.NVarChar(150), academicContri.name)
    req.input('tid', sql.Int, teacherId)
    req.input('programme', sql.Int, academicContri.programme)
    req.input('place', sql.NVarChar(150), academicContri.place || null)
    req.input('date', sql.Date, academicContri.date ? new Date(academicContri.date) : null)
    req.input('participated_as', sql.Int, academicContri.participated_as)
    req.input('supporting_doc', sql.VarChar(500), academicContri.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('year_name', sql.Int, academicContri.year_name || new Date().getFullYear())

    await req.execute('sp_Insert_Contri_Acads')

    return NextResponse.json({ success: true, message: 'Academic Contribution added successfully' })
  } catch (err: any) {
    console.error('Error adding Academic Contribution:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Academic Contribution' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Academic Contribution
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { academicContriId, academicContri } = body
    const teacherId = user.role_id

    if (!academicContriId || !teacherId || !academicContri) {
      return NextResponse.json(
        { success: false, error: 'academicContriId, teacherId, and academicContri are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!academicContri.name || !academicContri.programme || !academicContri.date || !academicContri.participated_as) {
      return NextResponse.json(
        { success: false, error: 'Name, Programme, Date, and Participated As are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, academicContriId)
    req.input('name', sql.NVarChar(150), academicContri.name)
    req.input('tid', sql.Int, teacherId)
    req.input('programme', sql.Int, academicContri.programme)
    req.input('place', sql.NVarChar(150), academicContri.place || null)
    req.input('date', sql.Date, academicContri.date ? new Date(academicContri.date) : null)
    req.input('participated_as', sql.Int, academicContri.participated_as)
    req.input('supporting_doc', sql.VarChar(500), academicContri.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('year_name', sql.Int, academicContri.year_name || new Date().getFullYear())

    await req.execute('sp_Update_Contri_Acads')

    return NextResponse.json({ success: true, message: 'Academic Contribution updated successfully' })
  } catch (err: any) {
    console.error('Error updating Academic Contribution:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Academic Contribution' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Academic Contribution
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    const academicContriId = parseInt(searchParams.get('academicContriId') || '', 10)

    if (isNaN(academicContriId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing academicContriId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, academicContriId)

    await req.execute('sp_Delete_Contri_Acads')

    return NextResponse.json({ success: true, message: 'Academic Contribution deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting Academic Contribution:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Academic Contribution' },
      { status: 500 }
    )
  }
}

