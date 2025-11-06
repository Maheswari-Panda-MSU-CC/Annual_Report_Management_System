import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_e_content_type')
    const eContentTypes = result.recordset ?? []
    return NextResponse.json({ eContentTypes })
  } catch (err) {
    console.error('Error fetching e-content types:', err)
    return NextResponse.json(
      { error: 'Failed to fetch e-content types' },
      { status: 500 }
    )
  }
}

