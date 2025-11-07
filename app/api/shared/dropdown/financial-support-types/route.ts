import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_Get_All_Financial_Support_Types')
    const financialSupportTypes = result.recordset ?? []
    return NextResponse.json({ financialSupportTypes })
  } catch (err) {
    console.error('Error fetching financial support types:', err)
    return NextResponse.json(
      { error: 'Failed to fetch financial support types' },
      { status: 500 }
    )
  }
}

