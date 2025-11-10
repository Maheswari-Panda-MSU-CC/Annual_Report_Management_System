import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAllTeacherTalksParti')
    const talksParticipantTypes = result.recordset ?? []
    return NextResponse.json({ talksParticipantTypes })
  } catch (err) {
    console.error('Error fetching talks participant types:', err)
    return NextResponse.json(
      { error: 'Failed to fetch talks participant types' },
      { status: 500 }
    )
  }
}

