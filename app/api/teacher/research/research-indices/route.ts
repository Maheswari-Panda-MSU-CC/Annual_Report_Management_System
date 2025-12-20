import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10)

    if (isNaN(teacherId)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing teacherId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (user.role_id !== teacherId) {
      return new Response(JSON.stringify({ error: 'Forbidden - User ID mismatch' }), {
        status: 403,
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

// Update research indices
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { hIndex, i10Index, citations, orcidId, researcherId } = body
    const teacherId = user.role_id

    if (!teacherId) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('TeacherId', sql.Int, teacherId)
    req.input('H_INDEX', sql.Int, hIndex ?? 0)
    req.input('i10_INDEX', sql.Int, i10Index ?? 0)
    req.input('CITIATIONS', sql.Int, citations ?? 0)
    req.input('ORCHID_ID', sql.VarChar(100), orcidId || '')
    req.input('RESEARCHER_ID', sql.VarChar(100), researcherId || '')

    await req.execute('sp_UpdateTeacherResearchIndices')
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Research indices updated successfully',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Error updating research indices:', err)
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to update research indices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}