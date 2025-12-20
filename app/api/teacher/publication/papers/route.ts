import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all papers for a teacher
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
      .execute('sp_GetPaperPresentedByTeacherId')

    const papers = result.recordset || []

    // No caching - always return fresh data from database
    const response = NextResponse.json({
      success: true,
      papers,
    })
    // Explicitly disable all caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    return response
  } catch (err: any) {
    console.error('Error fetching papers:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch papers' },
      { status: 500 }
    )
  }
}

// POST - Insert new paper
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, paper } = body

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

    if (!paper) {
      return NextResponse.json(
        { success: false, error: 'Paper data is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!paper.title_of_paper || !paper.authors || !paper.level) {
      return NextResponse.json(
        { success: false, error: 'Title of paper, authors, and level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('tid', sql.Int, teacherId)
    req.input('theme', sql.NVarChar(sql.MAX), paper.theme || null)
    req.input('organising_body', sql.NVarChar(sql.MAX), paper.organising_body || null)
    req.input('place', sql.NVarChar(4000), paper.place || null)
    req.input('date', sql.Date, paper.date || null)
    req.input('title_of_paper', sql.NVarChar(sql.MAX), paper.title_of_paper)
    req.input('level', sql.Int, paper.level)
    req.input('authors', sql.NVarChar(sql.MAX), paper.authors)
    req.input('Image', sql.VarChar(1000), paper.Image || null)
    req.input('mode', sql.VarChar(500), paper.mode || null)

    const result = await req.execute('sp_InsertPaperPresented')
    const recordId = result.recordset[0].RecordId

    return NextResponse.json({
      success: true,
      message: 'Paper added successfully',
      record_id: recordId,
    })
  } catch (err: any) {
    console.error('Error adding paper:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add paper' },
      { status: 500 }
    )
  }
}

// PATCH - Update paper
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { paperId, teacherId: bodyTeacherId, paper } = body

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

    if (!paperId || !paper) {
      return NextResponse.json(
        { success: false, error: 'paperId and paper are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!paper.title_of_paper || !paper.authors || !paper.level) {
      return NextResponse.json(
        { success: false, error: 'Title of paper, authors, and level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('papid', sql.Int, paperId)
    req.input('tid', sql.Int, teacherId)
    req.input('theme', sql.NVarChar(sql.MAX), paper.theme || null)
    req.input('organising_body', sql.NVarChar(sql.MAX), paper.organising_body || null)
    req.input('place', sql.NVarChar(4000), paper.place || null)
    req.input('date', sql.Date, paper.date || null)
    req.input('title_of_paper', sql.NVarChar(sql.MAX), paper.title_of_paper)
    req.input('level', sql.Int, paper.level)
    req.input('authors', sql.NVarChar(sql.MAX), paper.authors)
    req.input('Image', sql.VarChar(1000), paper.Image || null)
    req.input('mode', sql.VarChar(500), paper.mode || null)

    await req.execute('sp_UpdatePaperPresented')

    return NextResponse.json({
      success: true,
      message: 'Paper updated successfully',
    })
  } catch (err: any) {
    console.error('Error updating paper:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update paper' },
      { status: 500 }
    )
  }
}

// DELETE - Delete paper
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paperId = parseInt(searchParams.get('paperId') || '', 10)

    if (isNaN(paperId)) {
      return NextResponse.json(
        { success: false, error: 'paperId is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('papid', sql.Int, paperId)

    await req.execute('sp_DeletePaperPresented')

    return NextResponse.json({
      success: true,
      message: 'Paper deleted successfully',
    })
  } catch (err: any) {
    console.error('Error deleting paper:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete paper' },
      { status: 500 }
    )
  }
}

