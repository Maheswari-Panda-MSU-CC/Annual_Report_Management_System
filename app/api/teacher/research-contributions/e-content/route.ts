import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all e-content for a teacher
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
      .execute('sp_get_e_content_by_tid')

    const eContent = result.recordset || []

    return NextResponse.json({
      success: true,
      eContent,
    })
  } catch (err: any) {
    console.error('Error fetching e-content:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch e-content' },
      { status: 500 }
    )
  }
}

// POST - Insert new e-content
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, eContent } = body

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

    if (!eContent) {
      return NextResponse.json(
        { success: false, error: 'eContent data is required' },
        { status: 400 }
      )
    }

    if (!eContent.title || !eContent.Brief_Details || !eContent.Quadrant || !eContent.Publishing_date || !eContent.Publishing_Authorities) {
      return NextResponse.json(
        { success: false, error: 'Title, Brief Details, Quadrant, Publishing Date, and Publishing Authorities are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('tid', sql.Int, teacherId)
    req.input('title', sql.VarChar(500), eContent.title)
    req.input('Brief_Details', sql.VarChar(500), eContent.Brief_Details)
    req.input('Quadrant', sql.Int, eContent.Quadrant)
    req.input('Publishing_date', sql.Date, new Date(eContent.Publishing_date))
    req.input('Publishing_Authorities', sql.VarChar(500), eContent.Publishing_Authorities)
    req.input('link', sql.NVarChar(500), eContent.link || null)
    req.input('type_econtent', sql.Int, eContent.type_econtent || null)
    req.input('e_content_type', sql.Int, eContent.e_content_type || null)
    req.input('doc', sql.VarChar(100), eContent.doc || null)

    await req.execute('sp_insert_e_content')

    return NextResponse.json({ success: true, message: 'E-Content added successfully' })
  } catch (err: any) {
    console.error('Error adding e-content:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add e-content' },
      { status: 500 }
    )
  }
}

// PUT - Update existing e-content
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { eContentId, teacherId: bodyTeacherId, eContent } = body

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

    if (!eContentId || !eContent) {
      return NextResponse.json(
        { success: false, error: 'eContentId and eContent are required' },
        { status: 400 }
      )
    }

    if (!eContent.title || !eContent.Brief_Details || !eContent.Quadrant || !eContent.Publishing_date || !eContent.Publishing_Authorities) {
      return NextResponse.json(
        { success: false, error: 'Title, Brief Details, Quadrant, Publishing Date, and Publishing Authorities are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Eid', sql.Int, eContentId)
    req.input('tid', sql.Int, teacherId)
    req.input('title', sql.VarChar(500), eContent.title)
    req.input('Brief_Details', sql.VarChar(500), eContent.Brief_Details)
    req.input('Quadrant', sql.Int, eContent.Quadrant)
    req.input('Publishing_date', sql.Date, new Date(eContent.Publishing_date))
    req.input('Publishing_Authorities', sql.VarChar(500), eContent.Publishing_Authorities)
    req.input('link', sql.NVarChar(500), eContent.link || null)
    req.input('type_econtent', sql.Int, eContent.type_econtent || null)
    req.input('e_content_type', sql.Int, eContent.e_content_type || null)
    req.input('doc', sql.VarChar(100), eContent.doc || null)

    await req.execute('sp_update_e_content')

    return NextResponse.json({ success: true, message: 'E-Content updated successfully' })
  } catch (err: any) {
    console.error('Error updating e-content:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update e-content' },
      { status: 500 }
    )
  }
}

// DELETE - Delete e-content
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
    const eContentId = parseInt(searchParams.get('eContentId') || '', 10)

    if (isNaN(eContentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing eContentId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Eid', sql.Int, eContentId)

    await req.execute('sp_delete_e_content')

    return NextResponse.json({ success: true, message: 'E-Content deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting e-content:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete e-content' },
      { status: 500 }
    )
  }
}

