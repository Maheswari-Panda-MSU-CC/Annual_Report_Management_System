import { NextRequest, NextResponse } from "next/server"
import sql from "mssql"
import { connectToDatabase } from "@/lib/db"
import { authenticateRequest } from "@/lib/api-auth"
import { logActivityFromRequest } from "@/lib/activity-log"

// Update only the Image field for Graduation/Education entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error
    const { user } = authResult

    const body = await request.json()
    const { Image } = body
    const teacherId = user.role_id

    const { id: idParam } = await params
    const gid = parseInt(idParam, 10)

    if (!teacherId || !gid) {
      return NextResponse.json(
        { success: false, error: 'teacherId and id (gid) are required' },
        { status: 400 }
      )
    }

    const pool = await connectToDatabase()
    const req = pool.request()

    req.input('gid', sql.Int, gid)
    req.input('tid', sql.Int, teacherId)
    req.input('Image', sql.VarChar(1000), Image || null)

    await req.execute('sp_Update_Grad_Details_Document')

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'UPDATE', 'Graduation_Document', gid).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
    })
  } catch (err: any) {
    console.error('Error updating graduation document:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update document' },
      { status: 500 }
    )
  }
}

