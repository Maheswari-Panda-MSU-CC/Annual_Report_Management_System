import { NextRequest, NextResponse } from "next/server"
import { writeFile, unlink, readdir } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"

const UPLOAD_DIR = join(process.cwd(), "public", "uploaded-document")

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true })
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

