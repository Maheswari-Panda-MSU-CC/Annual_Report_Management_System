import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all Refresher Course details for a teacher
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10)
    const year = parseInt(searchParams.get('year') || '', 10)

    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing teacherId' },
        { status: 400 }
      )
    }

    // Default to current academic year if not provided
    const academicYear = isNaN(year) ? new Date().getFullYear() : year

    const pool = await connectToDatabase()
    const result = await pool
      .request()
      .input('tid', sql.Int, teacherId)
      .input('year', sql.Int, academicYear)
      .execute('sp_GetRefresherCourseDetailsByTid')

    const refresherDetails = result.recordset || []

    return NextResponse.json({
      success: true,
      refresherDetails,
    })
  } catch (err: any) {
    console.error('Error fetching Refresher Course details:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch Refresher Course details' },
      { status: 500 }
    )
  }
}

// POST - Insert new Refresher Course detail
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, refresherDetail } = body

    if (!teacherId || !refresherDetail) {
      return NextResponse.json(
        { success: false, error: 'teacherId and refresherDetail are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!refresherDetail.name || !refresherDetail.refresher_type || !refresherDetail.startdate) {
      return NextResponse.json(
        { success: false, error: 'Name, Refresher Type, and Start Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('name', sql.NVarChar(500), refresherDetail.name)
    req.input('refresher_type', sql.Int, refresherDetail.refresher_type)
    req.input('startdate', sql.Date, refresherDetail.startdate ? new Date(refresherDetail.startdate) : null)
    req.input('enddate', sql.Date, refresherDetail.enddate ? new Date(refresherDetail.enddate) : null)
    req.input('university', sql.NVarChar(200), refresherDetail.university && refresherDetail.university.trim() !== "" ? refresherDetail.university.trim() : null)
    req.input('institute', sql.NVarChar(200), refresherDetail.institute && refresherDetail.institute.trim() !== "" ? refresherDetail.institute.trim() : null)
    req.input('department', sql.NVarChar(200), refresherDetail.department && refresherDetail.department.trim() !== "" ? refresherDetail.department.trim() : null)
    req.input('centre', sql.NChar(200), refresherDetail.centre && refresherDetail.centre.trim() !== "" ? refresherDetail.centre.trim() : null)
    req.input('tid', sql.Int, teacherId)
    req.input('supporting_doc', sql.VarChar(500), refresherDetail.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_InsertRefresher_Detail')

    return NextResponse.json({ success: true, message: 'Refresher Course detail added successfully' })
  } catch (err: any) {
    console.error('Error adding Refresher Course detail:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add Refresher Course detail' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Refresher Course detail
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { refresherDetailId, teacherId, refresherDetail } = body

    if (!refresherDetailId || !teacherId || !refresherDetail) {
      return NextResponse.json(
        { success: false, error: 'refresherDetailId, teacherId, and refresherDetail are required' },
        { status: 400 }
      )
    }

    // Validation
    if (!refresherDetail.name || !refresherDetail.refresher_type || !refresherDetail.startdate) {
      return NextResponse.json(
        { success: false, error: 'Name, Refresher Type, and Start Date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    
    req.input('Id', sql.Int, refresherDetailId)
    req.input('name', sql.NVarChar(500), refresherDetail.name)
    req.input('refresher_type', sql.Int, refresherDetail.refresher_type)
    req.input('startdate', sql.Date, refresherDetail.startdate ? new Date(refresherDetail.startdate) : null)
    req.input('enddate', sql.Date, refresherDetail.enddate ? new Date(refresherDetail.enddate) : null)
    req.input('university', sql.NVarChar(200), refresherDetail.university && refresherDetail.university.trim() !== "" ? refresherDetail.university.trim() : null)
    req.input('institute', sql.NVarChar(200), refresherDetail.institute && refresherDetail.institute.trim() !== "" ? refresherDetail.institute.trim() : null)
    req.input('department', sql.NVarChar(200), refresherDetail.department && refresherDetail.department.trim() !== "" ? refresherDetail.department.trim() : null)
    req.input('centre', sql.NChar(200), refresherDetail.centre && refresherDetail.centre.trim() !== "" ? refresherDetail.centre.trim() : null)
    req.input('tid', sql.Int, teacherId)
    req.input('supporting_doc', sql.VarChar(500), refresherDetail.supporting_doc || 'http://localhost:3000/assets/demo_document.pdf')

    await req.execute('sp_UpdateRefresher_Detail')

    return NextResponse.json({ success: true, message: 'Refresher Course detail updated successfully' })
  } catch (err: any) {
    console.error('Error updating Refresher Course detail:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Refresher Course detail' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Refresher Course detail
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const refresherDetailId = parseInt(searchParams.get('refresherDetailId') || '', 10)

    if (isNaN(refresherDetailId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing refresherDetailId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()
    req.input('Id', sql.Int, refresherDetailId)

    await req.execute('sp_DeleteRefresher_Detail')

    return NextResponse.json({ success: true, message: 'Refresher Course detail deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting Refresher Course detail:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete Refresher Course detail' },
      { status: 500 }
    )
  }
}

