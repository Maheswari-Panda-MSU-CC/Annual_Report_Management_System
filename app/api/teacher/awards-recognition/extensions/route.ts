import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all Extension Activities for a teacher
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
      .execute('sp_GetExtensionActivitiesByTid')

    const extensionActivities = result.recordset || []

    return NextResponse.json({
      success: true,
      extensionActivities,
    })
  } catch (err: any) {
    console.error('Error fetching Extension Activities:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Extension Activities' },
      { status: 500 }
    )
  }
}

// POST - Insert new Extension Activity
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { extensionAct } = body
    const teacherId = user.role_id

    if (!teacherId || !extensionAct) {
      return NextResponse.json(
        { success: false, error: 'teacherId and extensionAct are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!extensionAct.names || !extensionAct.place || !extensionAct.date || !extensionAct.name_of_activity || !extensionAct.sponsered || !extensionAct.level) {
      return NextResponse.json(
        { success: false, error: 'Names, Place, Date, Name of Activity, Sponsored, and Level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('tid', sql.Int, teacherId)
    req.input('names', sql.NVarChar(100), extensionAct.names)
    req.input('place', sql.NVarChar(150), extensionAct.place)
    req.input('date', sql.Date, extensionAct.date ? new Date(extensionAct.date) : null)
    req.input('name_of_activity', sql.NVarChar(150), extensionAct.name_of_activity)
    req.input('Image', sql.NVarChar(500), extensionAct.Image || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('sponsered', sql.Int, extensionAct.sponsered)
    req.input('level', sql.Int, extensionAct.level)

    await req.execute('sp_InsertExtension_Act')

    return NextResponse.json({ success: true, message: 'Extension Activity added successfully' })
  } catch (err: any) {
    console.error('Error adding Extension Activity:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Extension Activity' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Extension Activity
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { extensionActId, extensionAct } = body
    const teacherId = user.role_id

    if (!extensionActId || !teacherId || !extensionAct) {
      return NextResponse.json(
        { success: false, error: 'extensionActId, teacherId, and extensionAct are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!extensionAct.names || !extensionAct.place || !extensionAct.date || !extensionAct.name_of_activity || !extensionAct.sponsered || !extensionAct.level) {
      return NextResponse.json(
        { success: false, error: 'Names, Place, Date, Name of Activity, Sponsored, and Level are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('id', sql.Int, extensionActId)
    req.input('tid', sql.Int, teacherId)
    req.input('names', sql.NVarChar(100), extensionAct.names)
    req.input('place', sql.NVarChar(150), extensionAct.place)
    req.input('date', sql.Date, extensionAct.date ? new Date(extensionAct.date) : null)
    req.input('name_of_activity', sql.NVarChar(150), extensionAct.name_of_activity)
    req.input('Image', sql.NVarChar(500), extensionAct.Image || 'http://localhost:3000/assets/demo_document.pdf')
    req.input('sponsered', sql.Int, extensionAct.sponsered)
    req.input('level', sql.Int, extensionAct.level)

    await req.execute('sp_UpdateExtension_Act')

    return NextResponse.json({ success: true, message: 'Extension Activity updated successfully' })
  } catch (err: any) {
    console.error('Error updating Extension Activity:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Extension Activity' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Extension Activity
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    const extensionActId = parseInt(searchParams.get('extensionActId') || '', 10)

    if (isNaN(extensionActId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing extensionActId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('id', sql.Int, extensionActId)

    await req.execute('sp_DeleteExtension_Act')

    return NextResponse.json({ success: true, message: 'Extension Activity deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting Extension Activity:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Extension Activity' },
      { status: 500 }
    )
  }
}

