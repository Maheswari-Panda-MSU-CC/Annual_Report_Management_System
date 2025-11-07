import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_Collaborations_Type')
    const collaborationsTypes = result.recordset ?? []
    return NextResponse.json({ collaborationsTypes })
  } catch (err) {
    console.error('Error fetching collaborations types:', err)
    return NextResponse.json(
      { error: 'Failed to fetch collaborations types' },
      { status: 500 }
    )
  }
}

