import { NextResponse } from "next/server"
import sql from "mssql"
import { connectToDatabase } from "@/lib/db"

// Update only the document field for Post-Doctoral Research entry
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { teacherId, doc } = body

    const id = parseInt(params.id, 10)

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

