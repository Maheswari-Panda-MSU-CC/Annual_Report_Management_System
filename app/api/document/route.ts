import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "assets", "demo_document.pdf")
  const fileBuffer = await fs.readFile(filePath)

  const response = new NextResponse(fileBuffer)

  response.headers.set("Content-Type", "application/pdf")
  response.headers.set("Content-Disposition", 'inline; filename="demo_document.pdf"')

  return response
}
