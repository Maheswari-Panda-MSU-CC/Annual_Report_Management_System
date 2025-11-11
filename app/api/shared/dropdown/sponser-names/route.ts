import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_sponsered_name')
    const sponserNames = result.recordset ?? []
    return NextResponse.json({ sponserNames })
  } catch (err) {
    console.error('Error fetching sponser names:', err)
    return NextResponse.json(
      { error: 'Failed to fetch sponser names' },
      { status: 500 }
    )
  }
}

