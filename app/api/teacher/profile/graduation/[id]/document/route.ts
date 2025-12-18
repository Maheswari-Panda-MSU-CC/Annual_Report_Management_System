import { NextResponse } from "next/server"
import sql from "mssql"
import { connectToDatabase } from "@/lib/db"

// Update only the Image field for Graduation/Education entry
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { teacherId, Image } = body

    const gid = parseInt(params.id, 10)

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

