import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextResponse } from 'next/server'

// GET - Fetch all patents for a teacher
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10)

    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing teacherId' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const result = await pool
      .request()
      .input('tid', sql.Int, teacherId)
      .execute('sp_GetPatents_ByTeacherId')

    const patents = result.recordset || []

    return NextResponse.json({
      success: true,
      patents,
    })
  } catch (err: any) {
    console.error('Error fetching patents:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch patents' },
      { status: 500 }
    )
  }
}

// POST - Insert new patent
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, patent } = body

    if (!teacherId || !patent) {
      return NextResponse.json(
        { success: false, error: 'teacherId and patent are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!patent.title || !patent.level || !patent.status || !patent.date) {
      return NextResponse.json(
        { success: false, error: 'Title, level, status, and date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('title', sql.VarChar(500), patent.title)
    req.input('level', sql.Int, patent.level)
    req.input('status', sql.Int, patent.status)
    req.input('doc', sql.VarChar(500), patent.doc || null)
    req.input('date', sql.DateTime, new Date(patent.date))
    req.input('tid', sql.Int, teacherId)
    req.input('Tech_Licence', sql.VarChar(500), patent.Tech_Licence || null)
    req.input('Earnings_Generate', sql.BigInt, patent.Earnings_Generate || null)
    req.input('PatentApplicationNo', sql.VarChar(50), patent.PatentApplicationNo || null)

    await req.execute('sp_Insert_Patent')

    return NextResponse.json({
      success: true,
      message: 'Patent added successfully',
    })
  } catch (err: any) {
    console.error('Error adding patent:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add patent' },
      { status: 500 }
    )
  }
}

// PUT - Update patent
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { patentId, teacherId, patent } = body

    if (!patentId || !teacherId || !patent) {
      return NextResponse.json(
        { success: false, error: 'patentId, teacherId, and patent are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!patent.title || !patent.level || !patent.status || !patent.date) {
      return NextResponse.json(
        { success: false, error: 'Title, level, status, and date are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('Pid', sql.Int, patentId)
    req.input('title', sql.VarChar(500), patent.title)
    req.input('level', sql.Int, patent.level)
    req.input('status', sql.Int, patent.status)
    req.input('doc', sql.VarChar(500), patent.doc || null)
    req.input('date', sql.DateTime, new Date(patent.date))
    req.input('tid', sql.Int, teacherId)
    req.input('Tech_Licence', sql.VarChar(500), patent.Tech_Licence || null)
    req.input('Earnings_Generate', sql.BigInt, patent.Earnings_Generate || null)
    req.input('PatentApplicationNo', sql.VarChar(50), patent.PatentApplicationNo || null)

    await req.execute('sp_Update_Patent')

    return NextResponse.json({
      success: true,
      message: 'Patent updated successfully',
    })
  } catch (err: any) {
    console.error('Error updating patent:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update patent' },
      { status: 500 }
    )
  }
}

// DELETE - Delete patent
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patentId = parseInt(searchParams.get('patentId') || '', 10)

    if (isNaN(patentId)) {
      return NextResponse.json(
        { success: false, error: 'patentId is required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    
    // Try to use stored procedure first, fallback to direct SQL if it doesn't exist
    try {
      const req = pool.request()
      req.input('Pid', sql.Int, patentId)
      await req.execute('sp_Delete_Patent')
    } catch (spError: any) {
      // If stored procedure doesn't exist, use direct SQL delete
      if (spError.message?.includes('sp_Delete_Patent')) {
        await pool.request()
          .input('Pid', sql.Int, patentId)
          .query('DELETE FROM Patents WHERE Pid = @Pid')
      } else {
        throw spError
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Patent deleted successfully',
    })
  } catch (err: any) {
    console.error('Error deleting patent:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete patent' },
      { status: 500 }
    )
  }
}

