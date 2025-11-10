import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_Contri_prog')
    const programmes = result.recordset ?? []
    return NextResponse.json({ programmes })
  } catch (err) {
    console.error('Error fetching academic programmes:', err)
    return NextResponse.json(
      { error: 'Failed to fetch academic programmes' },
      { status: 500 }
    )
  }
}

