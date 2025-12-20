import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

// GET - Fetch all tech reports for a teacher
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
      .input('TId', sql.Int, teacherId)
      .execute('sp_Lib_TechReport_GetByTId')

    const techReports = result.recordset || []

    return NextResponse.json({
      success: true,
      techReports,
    })
  } catch (err: any) {
    console.error('Error fetching tech reports:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch tech reports' },
      { status: 500 }
    )
  }
}

// POST - Insert new tech report
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { techReport } = body
    const teacherId = user.role_id

    if (!teacherId || !techReport) {
      return NextResponse.json(
        { success: false, error: 'teacherId and techReport are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!techReport.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('TId', sql.Int, teacherId)
    req.input('Title', sql.NVarChar(200), techReport.title || null)
    req.input('Subject', sql.NVarChar(100), techReport.subject || null)
    req.input('PublisherName', sql.NVarChar(200), techReport.publisher_name || null)
    req.input('PublicationDate', sql.Date, techReport.publication_date ? new Date(techReport.publication_date) : null)
    req.input('NoOfIssuePerYear', sql.Int, techReport.no_of_issue_per_year || null)
    req.input('Price', sql.Decimal(8, 3), techReport.price || null)
    req.input('Currency', sql.NVarChar(5), techReport.currency || null)
    req.input('CreatedBy', sql.Int, teacherId)

    await req.execute('sp_Lib_TechReport_Insert')

    return NextResponse.json({ success: true, message: 'Tech report added successfully' })
  } catch (err: any) {
    console.error('Error adding tech report:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add tech report' },
      { status: 500 }
    )
  }
}

// PUT - Update existing tech report
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { techReportId, techReport } = body
    const teacherId = user.role_id

    if (!techReportId || !teacherId || !techReport) {
      return NextResponse.json(
        { success: false, error: 'techReportId, teacherId, and techReport are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!techReport.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Id', sql.Int, techReportId)
    req.input('TId', sql.Int, teacherId)
    req.input('Title', sql.NVarChar(200), techReport.title || null)
    req.input('Subject', sql.NVarChar(100), techReport.subject || null)
    req.input('PublisherName', sql.NVarChar(200), techReport.publisher_name || null)
    req.input('PublicationDate', sql.Date, techReport.publication_date ? new Date(techReport.publication_date) : null)
    req.input('NoOfIssuePerYear', sql.Int, techReport.no_of_issue_per_year || null)
    req.input('Price', sql.Decimal(8, 3), techReport.price || null)
    req.input('Currency', sql.NVarChar(5), techReport.currency || null)
    req.input('ModifiedBy', sql.Int, teacherId)

    await req.execute('sp_Lib_TechReport_Update')

    return NextResponse.json({ success: true, message: 'Tech report updated successfully' })
  } catch (err: any) {
    console.error('Error updating tech report:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update tech report' },
      { status: 500 }
    )
  }
}

// DELETE - Delete tech report
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    const techReportId = parseInt(searchParams.get('techReportId') || '', 10)

    if (isNaN(techReportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing techReportId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Id', sql.Int, techReportId)

    await req.execute('sp_Lib_TechReport_Delete')

    return NextResponse.json({ success: true, message: 'Tech report deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting tech report:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete tech report' },
      { status: 500 }
    )
  }
}

