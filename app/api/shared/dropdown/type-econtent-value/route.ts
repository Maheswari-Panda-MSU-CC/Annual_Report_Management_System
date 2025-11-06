import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_getall_type_econtent_value')
    const typeEcontentValues = result.recordset ?? []
    return NextResponse.json({ typeEcontentValues })
  } catch (err) {
    console.error('Error fetching type econtent values:', err)
    return NextResponse.json(
      { error: 'Failed to fetch type econtent values' },
      { status: 500 }
    )
  }
}

