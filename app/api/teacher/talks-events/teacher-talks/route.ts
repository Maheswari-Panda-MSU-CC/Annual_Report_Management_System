import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all Teacher Talks for a teacher
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
      .execute('sp_GetTeacherTalksByTid')

    const teacherTalks = result.recordset || []

    return NextResponse.json({
      success: true,
      teacherTalks,
    })
  } catch (err: any) {
    console.error('Error fetching Teacher Talks:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Teacher Talks' },
      { status: 500 }
    )
  }
}

// POST - Insert new Teacher Talk
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherTalk } = body
    const teacherId = user.role_id

    if (!teacherId || !teacherTalk) {
      return NextResponse.json(
        { success: false, error: 'teacherId and teacherTalk are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!teacherTalk.name || !teacherTalk.programme || !teacherTalk.place || !teacherTalk.date || !teacherTalk.title || !teacherTalk.participated_as) {
      return NextResponse.json(
        { success: false, error: 'Name, Programme, Place, Date, Title, and Participated As are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(sql.MAX), teacherTalk.name)
    req.input('programme', sql.Int, teacherTalk.programme)
    req.input('place', sql.NVarChar(1000), teacherTalk.place)
    req.input('date', sql.Date, teacherTalk.date ? new Date(teacherTalk.date) : null)
    req.input('title', sql.NVarChar(sql.MAX), teacherTalk.title)
    req.input('participated_as', sql.Int, teacherTalk.participated_as)
    req.input('Image', sql.NVarChar(500), teacherTalk.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_InsertTeacherTalk')

    return NextResponse.json({ success: true, message: 'Teacher Talk added successfully' })
  } catch (err: any) {
    console.error('Error adding Teacher Talk:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Teacher Talk' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Teacher Talk
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherTalkId, teacherTalk } = body
    const teacherId = user.role_id

    if (!teacherTalkId || !teacherId || !teacherTalk) {
      return NextResponse.json(
        { success: false, error: 'teacherTalkId, teacherId, and teacherTalk are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!teacherTalk.name || !teacherTalk.programme || !teacherTalk.place || !teacherTalk.date || !teacherTalk.title || !teacherTalk.participated_as) {
      return NextResponse.json(
        { success: false, error: 'Name, Programme, Place, Date, Title, and Participated As are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, teacherTalkId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.NVarChar(sql.MAX), teacherTalk.name)
    req.input('programme', sql.Int, teacherTalk.programme)
    req.input('place', sql.NVarChar(1000), teacherTalk.place)
    req.input('date', sql.Date, teacherTalk.date ? new Date(teacherTalk.date) : null)
    req.input('title', sql.NVarChar(sql.MAX), teacherTalk.title)
    req.input('participated_as', sql.Int, teacherTalk.participated_as)
    req.input('Image', sql.NVarChar(500), teacherTalk.Image || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_UpdateTeacherTalk')

    return NextResponse.json({ success: true, message: 'Teacher Talk updated successfully' })
  } catch (err: any) {
    console.error('Error updating Teacher Talk:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Teacher Talk' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Teacher Talk
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    const teacherTalkId = parseInt(searchParams.get('teacherTalkId') || '', 10)

    if (isNaN(teacherTalkId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing teacherTalkId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, teacherTalkId)

    await req.execute('sp_DeleteTeacherTalk')

    return NextResponse.json({ success: true, message: 'Teacher Talk deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting Teacher Talk:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Teacher Talk' },
      { status: 500 }
    )
  }
}

