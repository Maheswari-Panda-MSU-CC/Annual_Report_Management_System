import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await connectToDatabase()
    const result = await pool.request().execute('sp_GetAll_Acad_Research_Role')
    const academicVisitRoles = result.recordset ?? []
    return NextResponse.json({ academicVisitRoles })
  } catch (err) {
    console.error('Error fetching academic visit roles:', err)
    return NextResponse.json(
      { error: 'Failed to fetch academic visit roles' },
      { status: 500 }
    )
  }
}

