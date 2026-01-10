import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

// GET - Fetch all magazines for a teacher
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
      .input('Tid', sql.Int, teacherId)
      .execute('Get_Library_Magazines_ByTid')

    const magazines = result.recordset || []

    return NextResponse.json({
      success: true,
      magazines,
    })
  } catch (err: any) {
    console.error('Error fetching magazines:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch magazines' },
      { status: 500 }
    )
  }
}

// POST - Insert new magazine
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { magazine } = body
    const teacherId = user.role_id

    if (!teacherId || !magazine) {
      return NextResponse.json(
        { success: false, error: 'teacherId and magazine are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!magazine.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Tid', sql.Int, teacherId)
    req.input('Title', sql.NVarChar(500), magazine.title || null)
    req.input('Mode', sql.NVarChar(20), magazine.mode || null)
    req.input('Category', sql.NVarChar(50), magazine.category || null)
    req.input('IsAdditionalAttachment', sql.Bit, magazine.is_additional_attachment ?? null)
    req.input('AdditionalAttachment', sql.NVarChar(500), magazine.additional_attachment || null)
    req.input('PublicationDate', sql.Date, magazine.publication_date ? new Date(magazine.publication_date) : null)
    req.input('PublishingAgency', sql.NVarChar(500), magazine.publishing_agency || null)
    req.input('Volume', sql.NVarChar(10), magazine.volume || null)
    req.input('NoOfIssuePerYr', sql.Int, magazine.no_of_issue_per_yr || null)
    req.input('Price', sql.Decimal(8, 3), magazine.price || null)
    req.input('Currency', sql.NVarChar(5), magazine.currency || null)
    req.input('CreatedBy', sql.Int, teacherId)

    const result = await req.execute('sp_Insert_Lib_Magazine')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Recommendation_Magazine', insertedId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Magazine added successfully' })
  } catch (err: any) {
    console.error('Error adding magazine:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add magazine' },
      { status: 500 }
    )
  }
}

// PUT - Update existing magazine
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { magazineId, magazine } = body
    const teacherId = user.role_id

    if (!magazineId || !teacherId || !magazine) {
      return NextResponse.json(
        { success: false, error: 'magazineId, teacherId, and magazine are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!magazine.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Id', sql.Int, magazineId)
    req.input('Title', sql.NVarChar(500), magazine.title || null)
    req.input('Mode', sql.NVarChar(20), magazine.mode || null)
    req.input('Category', sql.NVarChar(50), magazine.category || null)
    req.input('IsAdditionalAttachment', sql.Bit, magazine.is_additional_attachment ?? null)
    req.input('AdditionalAttachment', sql.NVarChar(500), magazine.additional_attachment || null)
    req.input('PublicationDate', sql.Date, magazine.publication_date ? new Date(magazine.publication_date) : null)
    req.input('PublishingAgency', sql.NVarChar(500), magazine.publishing_agency || null)
    req.input('Volume', sql.NVarChar(10), magazine.volume || null)
    req.input('NoOfIssuePerYr', sql.Int, magazine.no_of_issue_per_yr || null)
    req.input('Price', sql.Decimal(8, 3), magazine.price || null)
    req.input('Currency', sql.NVarChar(5), magazine.currency || null)
    req.input('ModifiedBy', sql.Int, teacherId)

    await req.execute('sp_Update_Lib_Magazine')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Recommendation_Magazine', magazineId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Magazine updated successfully' })
  } catch (err: any) {
    console.error('Error updating magazine:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update magazine' },
      { status: 500 }
    )
  }
}

// DELETE - Delete magazine
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const magazineId = parseInt(searchParams.get('magazineId') || '', 10)

    if (isNaN(magazineId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing magazineId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Id', sql.Int, magazineId)

    await req.execute('sp_Delete_Lib_Magazine')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Recommendation_Magazine', magazineId).catch(() => {})

    return NextResponse.json({ success: true, message: 'Magazine deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting magazine:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete magazine' },
      { status: 500 }
    )
  }
}

