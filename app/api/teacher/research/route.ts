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
      .input('tid', sql.Int, teacherId)
      .execute('sp_GetResearchProjectsByTeacherId') 

      const researchProjects = Array.isArray(result.recordset) ? result.recordset : []

    return new Response(JSON.stringify({ researchProjects }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error fetching research projects:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch research projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Add new research project
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, project } = body

    if (!teacherId || !project) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId and project are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate required fields
    if (!project.title || !project.funding_agency || !project.proj_nature || !project.status || !project.start_date) {
      return new Response(JSON.stringify({ success: false, error: 'Title, funding agency, project nature, status, and start date are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('tid', sql.Int, teacherId)
    req.input('title', sql.NVarChar(500), project.title)
    req.input('funding_agency', sql.Int, project.funding_agency)
    req.input('grant_sanctioned', sql.Numeric(15, 0), project.grant_sanctioned || null)
    req.input('grant_received', sql.Numeric(15, 0), project.grant_received || null)
    req.input('proj_nature', sql.Int, project.proj_nature)
    req.input('duration', sql.Int, project.duration || null)
    req.input('status', sql.Int, project.status)
    req.input('start_date', sql.Date, project.start_date)
    req.input('Pdf', sql.VarChar(500), project.Pdf || null)
    req.input('grant_sealed', sql.Bit, project.grant_sealed ?? false)
    req.input('proj_level', sql.Int, project.proj_level || null)
    req.input('grant_year', sql.Int, project.grant_year || null)

    await req.execute('sp_InsertResearchProject_T')
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Research project added successfully',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Error adding research project:', err)
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to add research project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Update existing research project
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, projectId, project } = body

    if (!teacherId || !projectId || !project) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId, projectId, and project are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate required fields
    if (!project.title || !project.funding_agency || !project.proj_nature || !project.status || !project.start_date) {
      return new Response(JSON.stringify({ success: false, error: 'Title, funding agency, project nature, status, and start date are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('projid', sql.Int, projectId)
    req.input('tid', sql.Int, teacherId)
    req.input('title', sql.NVarChar(500), project.title)
    req.input('funding_agency', sql.Int, project.funding_agency)
    req.input('grant_sanctioned', sql.Numeric(15, 0), project.grant_sanctioned || null)
    req.input('grant_received', sql.Numeric(15, 0), project.grant_received || null)
    req.input('proj_nature', sql.Int, project.proj_nature)
    req.input('duration', sql.Int, project.duration || null)
    req.input('status', sql.Int, project.status)
    req.input('start_date', sql.Date, project.start_date)
    req.input('Pdf', sql.VarChar(500), project.Pdf || null)
    req.input('grant_sealed', sql.Bit, project.grant_sealed ?? false)
    req.input('proj_level', sql.Int, project.proj_level || null)
    req.input('grant_year', sql.Int, project.grant_year || null)

    await req.execute('sp_UpdateResearchProject_T')
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Research project updated successfully',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Error updating research project:', err)
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to update research project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Delete research project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = parseInt(searchParams.get('projectId') || '', 10)

    if (isNaN(projectId)) {
      return new Response(JSON.stringify({ success: false, error: 'projectId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('projid', sql.Int, projectId)

    await req.execute('sp_DeleteResearchProject_T')
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Research project deleted successfully',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Error deleting research project:', err)
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to delete research project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}