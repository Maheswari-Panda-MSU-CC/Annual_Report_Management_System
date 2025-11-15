import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

const UPLOAD_DIR = join(process.cwd(), "public", "uploaded-document")

/**
 * Dummy S3 Upload API Route
 * Reads file from /public/uploaded-document/ and returns a demo S3 URL
 * In production, this would upload to actual S3 and return the real URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName } = body

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "File name is required" },
        { status: 400 }
      )
    }

    // Read file from local folder
    const filePath = join(UPLOAD_DIR, fileName)
    let fileBuffer: Buffer
    let fileType: string
    let fileSize: number

    try {
      fileBuffer = await readFile(filePath)
      fileSize = fileBuffer.length
      
      // Determine file type from extension
      const extension = fileName.split(".").pop()?.toLowerCase()
      const mimeTypes: Record<string, string> = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
      }
      fileType = mimeTypes[extension || ""] || "application/pdf"
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: `File not found: ${fileName}` },
        { status: 404 }
      )
    }

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate a dummy S3 URL
    // In production, this would upload fileBuffer to actual S3 and return the real URL
    const dummyS3Url = `http://localhost:3000/assets/dummy_document.pdf`

    return NextResponse.json({
      success: true,
      url: dummyS3Url, // Return dummy S3 URL as specified
      fileName: fileName,
      fileType: fileType,
      fileSize: fileSize,
      message: "File uploaded to S3 successfully (demo)",
    })
  } catch (error: any) {
    console.error("Error in S3 upload:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload to S3" },
      { status: 500 }
    )
  }
}

