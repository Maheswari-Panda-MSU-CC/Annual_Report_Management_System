import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_Get_All_Parti_Commi_Level')
    const committeeLevels = result.recordset ?? []
    return NextResponse.json({ committeeLevels })
  } catch (err) {
    console.error('Error fetching committee levels:', err)
    return NextResponse.json(
      { error: 'Failed to fetch committee levels' },
      { status: 500 }
    )
  }
}

