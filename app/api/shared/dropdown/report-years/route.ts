import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_Report_Year_GetAll')
    const reportYears = result.recordset ?? []
    return NextResponse.json({ reportYears })
  } catch (err) {
    console.error('Error fetching report years:', err)
    return NextResponse.json(
      { error: 'Failed to fetch report years' },
      { status: 500 }
    )
  }
}

