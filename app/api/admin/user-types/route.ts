import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET() {
  try {
    const pool = await connectToDatabase()

    // Example: user types table
    const result = await pool
      .request()
      .execute('sp_GetAll_User_Types');

    return NextResponse.json(result.recordset)
  } catch (error) {
    console.error('Error fetching user types:', error)
    return NextResponse.json({ error: 'Failed to fetch user types' }, { status: 500 })
  }
}
