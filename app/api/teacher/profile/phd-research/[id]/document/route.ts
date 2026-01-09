import { NextRequest, NextResponse } from "next/server"
import sql from "mssql"
import { connectToDatabase } from "@/lib/db"
import { authenticateRequest } from "@/lib/api-auth"
import { logActivityFromRequest } from "@/lib/activity-log"

// Update only the document field for Post-Doctoral Research entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { doc } = body
    const teacherId = user.role_id

    const { id: idParam } = await params
    const id = parseInt(idParam, 10)

    if (!teacherId || !id) {
      return NextResponse.json(
        { success: false, error: 'teacherId and id are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('Id', sql.Int, id)
    req.input('Tid', sql.Int, teacherId)
    req.input('doc', sql.VarChar(1000), doc || null)

    await req.execute('sp_Update_Post_Doctoral_Exp_Document')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'PhD_Research_Document', id).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
    })
  } catch (err: any) {
    console.error('Error updating PhD research document:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update document' },
      { status: 500 }
    )
  }
}

