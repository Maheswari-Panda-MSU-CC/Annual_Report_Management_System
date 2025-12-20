import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all JRF/SRF records for a teacher
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
      .execute('Get_JRF_SRF_By_TeacherId')

    const jrfSrfs = result.recordset || []

    return NextResponse.json({
      success: true,
      jrfSrfs,
    })
  } catch (err: any) {
    console.error('Error fetching JRF/SRF records:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch JRF/SRF records' },
      { status: 500 }
    )
  }
}

// POST - Insert new JRF/SRF record
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, jrfSrf } = body

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

    if (!jrfSrf) {
      return NextResponse.json(
        { success: false, error: 'JRF/SRF data is required' },
        { status: 400 }
      )
    }

    if (!jrfSrf.name || !jrfSrf.type || !jrfSrf.title || !jrfSrf.duration) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Title, and Duration are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), jrfSrf.name)
    req.input('type', sql.Int, jrfSrf.type)
    req.input('title', sql.VarChar(500), jrfSrf.title)
    req.input('duration', sql.Int, jrfSrf.duration)
    req.input('stipend', sql.Numeric(15, 0), jrfSrf.stipend || null)
    req.input('date', sql.Date, jrfSrf.date ? new Date(jrfSrf.date) : null)
    req.input('doc', sql.VarChar(100), jrfSrf.doc || null)

    await req.execute('sp_InsertJRF_SRF')

    return NextResponse.json({ success: true, message: 'JRF/SRF record added successfully' })
  } catch (err: any) {
    console.error('Error adding JRF/SRF record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add JRF/SRF record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing JRF/SRF record
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { jrfSrfId, teacherId: bodyTeacherId, jrfSrf } = body

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

    if (!jrfSrfId || !jrfSrf) {
      return NextResponse.json(
        { success: false, error: 'jrfSrfId and jrfSrf are required' },
        { status: 400 }
      )
    }

    if (!jrfSrf.name || !jrfSrf.type || !jrfSrf.title || !jrfSrf.duration) {
      return NextResponse.json(
        { success: false, error: 'Name, Type, Title, and Duration are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, jrfSrfId)
    req.input('tid', sql.Int, teacherId)
    req.input('name', sql.VarChar(500), jrfSrf.name)
    req.input('type', sql.Int, jrfSrf.type)
    req.input('title', sql.VarChar(500), jrfSrf.title)
    req.input('duration', sql.Int, jrfSrf.duration)
    req.input('stipend', sql.Numeric(15, 0), jrfSrf.stipend || null)
    req.input('date', sql.Date, jrfSrf.date ? new Date(jrfSrf.date) : null)
    req.input('doc', sql.VarChar(100), jrfSrf.doc || null)

    await req.execute('sp_UpdateJRF_SRF')

    return NextResponse.json({ success: true, message: 'JRF/SRF record updated successfully' })
  } catch (err: any) {
    console.error('Error updating JRF/SRF record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update JRF/SRF record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete JRF/SRF record
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
    const jrfSrfId = parseInt(searchParams.get('jrfSrfId') || '', 10)

    if (isNaN(jrfSrfId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing jrfSrfId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, jrfSrfId)

    await req.execute('sp_DeleteJRF_SRF')

    return NextResponse.json({ success: true, message: 'JRF/SRF record deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting JRF/SRF record:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete JRF/SRF record' },
      { status: 500 }
    )
  }
}

