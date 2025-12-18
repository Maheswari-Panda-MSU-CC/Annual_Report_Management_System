import { NextRequest, NextResponse } from "next/server"
import { writeFile, unlink, readFile } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"
import { uploadToS3, isS3Configured, getSignedUrl } from "@/lib/s3-service"
import type { FilePatternMetadata } from "@/lib/s3-service"

// Profile image constants
const MAX_PROFILE_IMAGE_SIZE = 1 * 1024 * 1024 // 1MB
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/jpg"]
const PROFILE_IMAGE_DIR = join(process.cwd(), "public", "profile-images")

// Ensure profile-images directory exists
if (!existsSync(PROFILE_IMAGE_DIR)) {
  mkdirSync(PROFILE_IMAGE_DIR, { recursive: true })
}

/**
 * Get profile image file
 * GET /api/teacher/profile/image?path={imagePath}
 * 
 * Returns the image file for a profile image stored in the database
 * The path parameter should be the database path: upload/Profile/{emailId}.{extension}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get("path")

    if (!imagePath) {
      return NextResponse.json(
        { success: false, error: "Image path is required" },
        { status: 400 }
      )
    }

    // Extract filename from database path
    // Database path format: upload/Profile/{emailId}.{extension} (S3 Pattern 2)
    let fileName = imagePath.split("/").pop()

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "Invalid image path" },
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

    // Check if file exists locally
    const localFilePath = join(PROFILE_IMAGE_DIR, fileName)

    if (existsSync(localFilePath)) {
      // Read file and return it
      const fileBuffer = await readFile(localFilePath)
      const mimeType = "image/jpeg"

      // Return file with appropriate headers
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "public, max-age=3600",
        },
      })
    } else {
      // File doesn't exist locally - check S3
      if (isS3Configured() && imagePath.startsWith("upload/")) {
        try {
          const signedUrlResult = await getSignedUrl(imagePath)
          if (signedUrlResult.success && signedUrlResult.url) {
            // Redirect to S3 presigned URL
            return NextResponse.redirect(signedUrlResult.url)
          }
        } catch (s3Error) {
          console.error("Error getting S3 presigned URL:", s3Error)
        }
      }
      
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error("Error serving profile image:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to serve profile image" },
      { status: 500 }
    )
  }
}

/**
 * Upload profile image OR Get profile image URL
 * POST /api/teacher/profile/image
 * 
 * If FormData (file, emailId): Uploads image and returns database path
 * If JSON body ({ path: "..." }): Returns full URL for the image
 * 
 * Database path format: upload/Profile/{emailId}.{extension} (S3 Pattern 2 compatible)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if this is a file upload (FormData) or URL request (JSON)
    const contentType = request.headers.get("content-type") || ""
    
    // Try to parse as JSON first (for URL requests)
    if (contentType.includes("application/json")) {
      try {
        const body = await request.json()
        const { path: imagePath } = body

        if (!imagePath) {
          return NextResponse.json(
            { success: false, error: "Image path is required" },
            { status: 400 }
          )
        }

        // Extract filename from database path
        let fileName = imagePath.split("/").pop()

        if (!fileName) {
          return NextResponse.json(
            { success: false, error: "Invalid image path" },
            { status: 400 }
          )
        }

        // Get base URL from request
        const protocol = request.headers.get("x-forwarded-proto") || "http"
        const host = request.headers.get("host") || "localhost:3000"
        const baseUrl = `${protocol}://${host}`

        // Check if file exists locally
        const localFilePath = join(PROFILE_IMAGE_DIR, fileName)
        
        if (existsSync(localFilePath)) {
          // For local storage, return the API route URL
          const apiUrl = `${baseUrl}/api/teacher/profile/image?path=${encodeURIComponent(imagePath)}`
          
          return NextResponse.json({
            success: true,
            url: apiUrl,
            path: imagePath,
          })
        } else {
          // Check S3 for the image
          if (isS3Configured() && imagePath.startsWith("upload/")) {
            try {
              const signedUrlResult = await getSignedUrl(imagePath)
              if (signedUrlResult.success && signedUrlResult.url) {
                return NextResponse.json({
                  success: true,
                  url: signedUrlResult.url,
                  path: imagePath,
                })
              }
            } catch (s3Error) {
              console.error("Error getting S3 presigned URL:", s3Error)
            }
          }
          
          return NextResponse.json(
            { success: false, error: "Image not found" },
            { status: 404 }
          )
        }
      } catch (jsonError) {
        // If JSON parsing fails, fall through to FormData handling
        console.log("JSON parsing failed, trying FormData")
      }
    }
    
    // Otherwise, handle as file upload (FormData)
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userEmail = formData.get("email") as string // Get email from auth
    const uploadToS3Flag = formData.get("uploadToS3") === "true" // Flag to upload to S3

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      )
    }

    // Validate file type - only JPG/JPEG
    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only JPG or JPEG images are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (max 1MB)
    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image size must be less than 1MB" },
        { status: 400 }
      )
    }

    // Get file extension (normalize to lowercase)
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    if (fileExtension !== "jpg" && fileExtension !== "jpeg") {
      return NextResponse.json(
        { success: false, error: "Only JPG or JPEG file extensions are allowed" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Use actual email for filename (S3 Pattern 2 uses email directly)
    const fileName = `${userEmail}.${fileExtension}`
    const filePath = join(PROFILE_IMAGE_DIR, fileName)

    // Delete existing profile image for this user if it exists (both local and S3)
    try {
      // Check for both .jpg and .jpeg extensions locally
      const existingJpg = join(PROFILE_IMAGE_DIR, `${userEmail}.jpg`)
      const existingJpeg = join(PROFILE_IMAGE_DIR, `${userEmail}.jpeg`)
      
      if (existsSync(existingJpg)) {
        await unlink(existingJpg)
      }
      if (existsSync(existingJpeg)) {
        await unlink(existingJpeg)
      }
    } catch (error) {
      // Ignore errors if file doesn't exist
      console.log("No existing local profile image to delete")
    }

    let databasePath = `upload/Profile/${fileName}`

    // If uploadToS3 flag is true, upload to S3
    if (uploadToS3Flag && isS3Configured()) {
      try {
        // Build Pattern 2 metadata for profile image
        const metadata: FilePatternMetadata = {
          patternType: 2,
          email: userEmail,
          folderName: "Profile",
          fileExtension: `.${fileExtension}`,
        }

        // Upload to S3
        const s3Result = await uploadToS3(buffer, metadata, file.type)

        if (s3Result.success) {
          databasePath = s3Result.virtualPath

          // Delete local file after successful S3 upload
          try {
            if (existsSync(filePath)) {
              await unlink(filePath)
            }
          } catch (deleteError) {
            console.warn("Failed to delete local file after S3 upload:", deleteError)
            // Don't fail the request if local deletion fails
          }
        } else {
          // If S3 upload fails, fall back to local storage
          console.warn("S3 upload failed, saving locally:", s3Result.message)
          await writeFile(filePath, buffer)
        }
      } catch (s3Error: any) {
        console.error("S3 upload error:", s3Error)
        // Fall back to local storage
        await writeFile(filePath, buffer)
      }
    } else {
      // Save locally (temporary storage until S3 upload on save)
      await writeFile(filePath, buffer)
    }

    return NextResponse.json({
      success: true,
      path: databasePath,
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type,
      uploadedToS3: uploadToS3Flag && isS3Configured(),
    })
  } catch (error: any) {
    console.error("Error in POST /api/teacher/profile/image:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    )
  }
}

