import { NextRequest, NextResponse } from "next/server"
import { writeFile, unlink, readdir, readFile } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"

const UPLOAD_DIR = join(process.cwd(), "public", "uploaded-document")

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Helper to get MIME type from file extension
function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  }
  return mimeTypes[ext || ""] || "application/octet-stream"
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type - only jpg, png, pdf
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPG, PNG, and PDF (1 page) files are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (1MB max)
    const maxSize = 1 * 1024 * 1024 // 1MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 1MB limit. Maximum allowed size is 1MB." },
        { status: 400 }
      )
    }

    // Delete existing files in the directory (only one file at a time)
    try {
      const existingFiles = await readdir(UPLOAD_DIR)
      for (const existingFile of existingFiles) {
        await unlink(join(UPLOAD_DIR, existingFile))
      }
    } catch (error) {
      // Directory might be empty, ignore error
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const fileName = `document_${timestamp}.${fileExtension}`
    const filePath = join(UPLOAD_DIR, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicUrl = `/uploaded-document/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload file" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "File name is required" },
        { status: 400 }
      )
    }

    // Security: Prevent directory traversal attacks
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      return NextResponse.json(
        { success: false, error: "Invalid file name" },
        { status: 400 }
      )
    }

    const filePath = join(UPLOAD_DIR, fileName)

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await readFile(filePath)
    const mimeType = getMimeType(fileName)

    // Return file with appropriate headers
    // Convert Buffer to Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error: any) {
    console.error("Error serving file:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to serve file" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Delete all files in the uploaded-document directory
    try {
      const existingFiles = await readdir(UPLOAD_DIR)
      for (const existingFile of existingFiles) {
        await unlink(join(UPLOAD_DIR, existingFile))
      }
      return NextResponse.json({
        success: true,
        message: "All files deleted successfully",
      })
    } catch (error: any) {
      // If directory doesn't exist or is empty, that's fine
      return NextResponse.json({
        success: true,
        message: "No files to delete",
      })
    }
  } catch (error: any) {
    console.error("Error deleting files:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete files" },
      { status: 500 }
    )
  }
}

