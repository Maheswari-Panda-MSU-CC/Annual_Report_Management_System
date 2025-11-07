import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_Collaborations_Outcome')
    const collaborationsOutcomes = result.recordset ?? []
    return NextResponse.json({ collaborationsOutcomes })
  } catch (err) {
    console.error('Error fetching collaborations outcomes:', err)
    return NextResponse.json(
      { error: 'Failed to fetch collaborations outcomes' },
      { status: 500 }
    )
  }
}

