import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_Contri_Parti_GetAll')
    const participantTypes = result.recordset ?? []
    return NextResponse.json({ participantTypes })
  } catch (err) {
    console.error('Error fetching participant types:', err)
    return NextResponse.json(
      { error: 'Failed to fetch participant types' },
      { status: 500 }
    )
  }
}

