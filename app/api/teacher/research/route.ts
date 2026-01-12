import { connectToDatabase } from '@/lib/db'
import { cachedJsonResponse } from '@/lib/api-cache'
import sql from 'mssql'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { logActivityFromRequest } from '@/lib/activity-log'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const queryTeacherId = searchParams.get('teacherId')
    if (queryTeacherId && parseInt(queryTeacherId, 10) !== user.role_id) {
      return NextResponse.json(
        { error: 'Forbidden - User ID mismatch' },
        { status: 403 }
      )
    }

    const teacherId = user.role_id

    if (!teacherId) {
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

    // Cache for 3 minutes (180 seconds)
    return cachedJsonResponse({ researchProjects }, 180)
  } catch (err) {
    console.error('Error fetching research projects:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch research projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Add new research project
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, project } = body

    const teacherId = user.role_id

    if (!teacherId || !project) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId and project are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (bodyTeacherId && bodyTeacherId !== teacherId) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden - User ID mismatch' }), {
        status: 403,
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

    const result = await req.execute('sp_InsertResearchProject_T')
    const insertedId = result.recordset?.[0]?.id || result.returnValue || null

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Research_Project', insertedId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded (with correct recordId)
    // This ensures we have the correct entityId instead of the temporary timestamp used during upload
    if (project.Pdf && typeof project.Pdf === 'string' && project.Pdf.startsWith('upload/')) {
      // Extract entity name from virtual path
      // Format: upload/Category/SubCategory/filename.ext
      // Entity name: S3_Category_SubCategory
      let entityName = 'S3_Document';
      if (project.Pdf.startsWith('upload/')) {
        const pathWithoutUpload = project.Pdf.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          // Extract folder path (everything before the filename)
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          // Replace slashes with underscores and add S3_ prefix
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          // No subfolder, just use the folder name
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct recordId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, insertedId).catch(() => {})
    }
    
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
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { teacherId: bodyTeacherId, projectId, project } = body

    const teacherId = user.role_id

    if (!teacherId || !projectId || !project) {
      return new Response(JSON.stringify({ success: false, error: 'teacherId, projectId, and project are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (bodyTeacherId && bodyTeacherId !== teacherId) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden - User ID mismatch' }), {
        status: 403,
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

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Research_Project', projectId).catch(() => {})
    
    // Log S3_UPLOAD activity if document was uploaded/updated (with correct projectId)
    // This ensures we have the correct entityId instead of any temporary timestamp used during upload
    if (project.Pdf && typeof project.Pdf === 'string' && project.Pdf.startsWith('upload/')) {
      // Extract entity name from virtual path
      // Format: upload/Category/SubCategory/filename.ext
      // Entity name: S3_Category_SubCategory
      let entityName = 'S3_Document';
      if (project.Pdf.startsWith('upload/')) {
        const pathWithoutUpload = project.Pdf.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          // Extract folder path (everything before the filename)
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          // Replace slashes with underscores and add S3_ prefix
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          // No subfolder, just use the folder name
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Log S3_UPLOAD activity with the correct projectId (non-blocking)
      logActivityFromRequest(request, user, 'S3_UPLOAD', entityName, projectId).catch(() => {})
    }
    
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
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    // Get projectId from query params (backward compatibility)
    const { searchParams } = new URL(request.url)
    let projectId = parseInt(searchParams.get('projectId') || '', 10)
    let pdfPath: string | null = null

    // Try to get pdf from request body (preferred method)
    try {
      // Check if request has body content
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const bodyText = await request.text()
          if (bodyText && bodyText.trim()) {
            const body = JSON.parse(bodyText)
            if (body) {
              if (body.projectId) {
                const bodyProjectId = parseInt(String(body.projectId), 10)
                if (!isNaN(bodyProjectId)) projectId = bodyProjectId
              }
              if (body.pdf && typeof body.pdf === 'string') {
                pdfPath = body.pdf.trim() || null
              }
            }
          }
        } catch (parseError) {
          // JSON parse failed, continue with query params
          console.warn('[DELETE Research] Could not parse JSON body:', parseError)
        }
      }
    } catch (bodyError) {
      // Body reading failed, continue with query params only
      console.warn('[DELETE Research] Could not read request body, using query params:', bodyError)
    }

    // Fallback: try query param for pdf (backward compatibility)
    if (!pdfPath) {
      const queryPdf = searchParams.get('pdf')
      if (queryPdf) pdfPath = queryPdf
    }

    if (isNaN(projectId)) {
      return new Response(JSON.stringify({ success: false, error: 'projectId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const pool = await connectToDatabase()
    
    // Step 1: Delete S3 document if Pdf exists and is a valid S3 path
    let s3DeleteSuccess = false
    let s3DeleteMessage = 'No document to delete'
    
    if (pdfPath && typeof pdfPath === 'string' && pdfPath.trim() && pdfPath.startsWith('upload/')) {
      try {
        const { deleteFromS3 } = await import('@/lib/s3-service')
        
        console.log(`[DELETE Research] Attempting to delete S3 document: ${pdfPath}`)
        const s3DeleteResult = await deleteFromS3(pdfPath.trim())
        
        if (s3DeleteResult.success) {
          s3DeleteSuccess = true
          s3DeleteMessage = 'S3 document deleted successfully'
          console.log(`[DELETE Research] ✓ S3 document deleted: ${pdfPath}`)
          
          // Log S3_DELETE activity (non-blocking)
          // Extract entity name from virtual path
          let entityName = 'S3_Document';
          if (pdfPath.startsWith('upload/')) {
            const pathWithoutUpload = pdfPath.substring(7); // Remove 'upload/'
            const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
            
            if (lastSlashIndex > 0) {
              // Extract folder path (everything before the filename)
              const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
              // Replace slashes with underscores and add S3_ prefix
              entityName = 'S3_' + folderPath.replace(/\//g, '_');
            } else {
              // No subfolder, just use the folder name
              entityName = 'S3_' + pathWithoutUpload.split('/')[0];
            }
          }
          
          // Log S3_DELETE activity with the projectId as entityId (non-blocking)
          logActivityFromRequest(request, user, 'S3_DELETE', entityName, projectId).catch(() => {})
        } else {
          // Check if file doesn't exist (acceptable scenario)
          if (s3DeleteResult.message?.toLowerCase().includes('not found') || 
              s3DeleteResult.message?.toLowerCase().includes('object not found')) {
            s3DeleteSuccess = true // Consider this success - file already gone
            s3DeleteMessage = 'S3 document not found (may have been already deleted)'
            console.log(`[DELETE Research] ⚠ S3 document not found (acceptable): ${pdfPath}`)
            
            // Still log S3_DELETE activity even if file was already deleted (non-blocking)
            let entityName = 'S3_Document';
            if (pdfPath.startsWith('upload/')) {
              const pathWithoutUpload = pdfPath.substring(7);
              const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
              if (lastSlashIndex > 0) {
                const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
                entityName = 'S3_' + folderPath.replace(/\//g, '_');
              } else {
                entityName = 'S3_' + pathWithoutUpload.split('/')[0];
              }
            }
            logActivityFromRequest(request, user, 'S3_DELETE', entityName, projectId).catch(() => {})
          } else {
            s3DeleteSuccess = false
            s3DeleteMessage = s3DeleteResult.message || 'Failed to delete S3 document'
            console.error(`[DELETE Research] ✗ Failed to delete S3 document: ${pdfPath}`, s3DeleteResult.message)
          }
        }
      } catch (s3Error: any) {
        s3DeleteSuccess = false
        s3DeleteMessage = s3Error.message || 'Error deleting S3 document'
        console.error('[DELETE Research] Error deleting S3 document:', s3Error)
      }
    } else if (pdfPath && pdfPath.trim()) {
      // Pdf path exists but is not a valid S3 path - log warning but continue
      console.warn(`[DELETE Research] Invalid S3 path format (not starting with 'upload/'): ${pdfPath}`)
      s3DeleteMessage = 'Invalid document path format (not an S3 path)'
    }

    // Step 2: Delete database record
    const deleteReq = pool.request()
    deleteReq.input('projid', sql.Int, projectId)
    
    await deleteReq.execute('sp_DeleteResearchProject_T')
    console.log(`[DELETE Research] ✓ Database record deleted: projectId=${projectId}`)
    
    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'DELETE', 'Research_Project', projectId).catch(() => {})
    
    // Step 3: Return success response with S3 deletion status
    // Database deletion succeeded - that's the primary operation
    // S3 deletion failure is logged but doesn't block the operation
    if (s3DeleteSuccess || !pdfPath || !pdfPath.trim() || !pdfPath.startsWith('upload/')) {
      // Success if: S3 deleted successfully OR no S3 file to delete OR invalid path
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Research project and document deleted successfully',
        s3DeleteMessage,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      // Database deleted but S3 deletion failed
      // Still return success but include warning
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Research project deleted from database',
        warning: `S3 document deletion failed: ${s3DeleteMessage}`,
        s3DeleteMessage,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (err: any) {
    console.error('[DELETE Research] Error deleting research project:', err)
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to delete research project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}