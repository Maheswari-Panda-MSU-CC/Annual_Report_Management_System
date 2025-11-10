import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_teacher_talks_prog')
    const talksProgrammeTypes = result.recordset ?? []
    return NextResponse.json({ talksProgrammeTypes })
  } catch (err) {
    console.error('Error fetching talks programme types:', err)
    return NextResponse.json(
      { error: 'Failed to fetch talks programme types' },
      { status: 500 }
    )
  }
}

