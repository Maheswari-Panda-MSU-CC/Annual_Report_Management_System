import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_Collaborations_Level')
    const collaborationsLevels = result.recordset ?? []
    return NextResponse.json({ collaborationsLevels })
  } catch (err) {
    console.error('Error fetching collaborations levels:', err)
    return NextResponse.json(
      { error: 'Failed to fetch collaborations levels' },
      { status: 500 }
    )
  }
}

