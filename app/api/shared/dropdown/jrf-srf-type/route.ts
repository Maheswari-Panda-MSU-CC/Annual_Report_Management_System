import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_JRF_SRF_Types')
    const jrfSrfTypes = result.recordset ?? []
    return NextResponse.json({ jrfSrfTypes })
  } catch (err) {
    console.error('Error fetching JRF/SRF types:', err)
    return NextResponse.json(
      { error: 'Failed to fetch JRF/SRF types' },
      { status: 500 }
    )
  }
}

