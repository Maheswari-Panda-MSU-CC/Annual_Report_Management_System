import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_Refresher_Course_Type')
    const refresherTypes = result.recordset ?? []
    return NextResponse.json({ refresherTypes })
  } catch (err) {
    console.error('Error fetching refresher types:', err)
    return NextResponse.json(
      { error: 'Failed to fetch refresher types' },
      { status: 500 }
    )
  }
}

