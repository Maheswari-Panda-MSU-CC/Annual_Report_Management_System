import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_Res_Proj_Other_Details_Status')
    const phdGuidanceStatuses = result.recordset ?? []
    return NextResponse.json({ phdGuidanceStatuses })
  } catch (err) {
    console.error('Error fetching PhD guidance statuses:', err)
    return NextResponse.json(
      { error: 'Failed to fetch PhD guidance statuses' },
      { status: 500 }
    )
  }
}

