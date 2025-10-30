import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10)

    if (isNaN(teacherId)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing teacherId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const pool = await connectToDatabase()

    const result = await pool
      .request()
      .input('TeacherId', sql.Int, teacherId)
      .execute('sp_GetTeacherResearchIndices') 

    const researchIndexes = result.recordset?.[0] ?? {}

    return new Response(JSON.stringify({ researchIndexes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error fetching research indices:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch research indices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
