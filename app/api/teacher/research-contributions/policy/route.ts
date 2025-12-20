import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all policy documents for a teacher
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
      .execute('sp_GetPolicy_DocumentDevelopedByTeacherId')

    const policies = result.recordset || []

    return NextResponse.json({
      success: true,
      policies,
    })
  } catch (err: any) {
    console.error('Error fetching policy documents:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch policy documents' },
      { status: 500 }
    )
  }
}

// POST - Insert new policy document
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, policy } = body

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

    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'Policy data is required' },
        { status: 400 }
      )
    }

    if (!policy.title || !policy.level || !policy.organisation || !policy.date) {
      return NextResponse.json(
        { success: false, error: 'Title, Level, Organisation, and Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('tid', sql.Int, teacherId)
    req.input('Title', sql.VarChar(200), policy.title)
    req.input('Level', sql.NVarChar(100), policy.level)
    req.input('Organisation', sql.NVarChar(200), policy.organisation)
    req.input('Date', sql.Date, new Date(policy.date))
    req.input('Doc', sql.NVarChar(100), policy.doc || null)

    await req.execute('sp_InsertPolicy_DocumentDeveloped')

    return NextResponse.json({ success: true, message: 'Policy document added successfully' })
  } catch (err: any) {
    console.error('Error adding policy document:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add policy document' },
      { status: 500 }
    )
  }
}

// PUT - Update existing policy document
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { policyId, teacherId: bodyTeacherId, policy } = body

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

    if (!policyId || !policy) {
      return NextResponse.json(
        { success: false, error: 'policyId and policy are required' },
        { status: 400 }
      )
    }

    if (!policy.title || !policy.level || !policy.organisation || !policy.date) {
      return NextResponse.json(
        { success: false, error: 'Title, Level, Organisation, and Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Id', sql.Int, policyId)
    req.input('tid', sql.Int, teacherId)
    req.input('Title', sql.VarChar(200), policy.title)
    req.input('Level', sql.NVarChar(100), policy.level)
    req.input('Organisation', sql.NVarChar(200), policy.organisation)
    req.input('Date', sql.Date, new Date(policy.date))
    req.input('Doc', sql.NVarChar(100), policy.doc || null)

    await req.execute('sp_UpdatePolicy_DocumentDeveloped')

    return NextResponse.json({ success: true, message: 'Policy document updated successfully' })
  } catch (err: any) {
    console.error('Error updating policy document:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update policy document' },
      { status: 500 }
    )
  }
}

// DELETE - Delete policy document
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
    const policyId = parseInt(searchParams.get('policyId') || '', 10)

    if (isNaN(policyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing policyId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Id', sql.Int, policyId)

    await req.execute('sp_DeletePolicy_DocumentDeveloped')

    return NextResponse.json({ success: true, message: 'Policy document deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting policy document:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete policy document' },
      { status: 500 }
    )
  }
}

