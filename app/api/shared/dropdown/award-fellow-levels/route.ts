import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_Get_Awards_Fellows_Level')
    const awardFellowLevels = result.recordset ?? []
    return NextResponse.json({ awardFellowLevels })
  } catch (err) {
    console.error('Error fetching award fellow levels:', err)
    return NextResponse.json(
      { error: 'Failed to fetch award fellow levels' },
      { status: 500 }
    )
  }
}

