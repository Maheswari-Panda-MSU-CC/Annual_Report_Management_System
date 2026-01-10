import { NextRequest, NextResponse } from "next/server"
import { writeFile, readFile, unlink } from "fs/promises"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import { isS3Configured, uploadToS3, getSignedUrl, deleteFromS3, downloadFromS3 } from "@/lib/s3-service"
import type { FilePatternMetadata } from "@/lib/s3-service"
import { authenticateRequest } from "@/lib/api-auth"
import { logActivityFromRequest } from "@/lib/activity-log"

const MAX_PROFILE_IMAGE_SIZE = 1 * 1024 * 1024 // 1MB
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/jpg"]
const PROFILE_IMAGE_DIR = join(process.cwd(), "public", "profile-images")

// Ensure local directory exists
if (!existsSync(PROFILE_IMAGE_DIR)) {
  mkdirSync(PROFILE_IMAGE_DIR, { recursive: true })
}

// Helpers
function getFileNameFromPath(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null
  const fileName = imagePath.split("/").pop()
  if (!fileName) return null
  // basic traversal guard
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) return null
  return fileName
}

function buildApiUrl(request: NextRequest, imagePath: string) {
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const host = request.headers.get("host") || "localhost:3000"
  const baseUrl = `${protocol}://${host}`
  return `${baseUrl}/api/teacher/profile/image?path=${encodeURIComponent(imagePath)}`
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get("path")
    const download = searchParams.get("download") === "true" // Check if this is a download request
    const fileName = getFileNameFromPath(imagePath)
    if (!fileName) {
      return NextResponse.json({ success: false, error: "Image path is required" }, { status: 400 })
    }

    const localFilePath = join(PROFILE_IMAGE_DIR, fileName)

    // Handle local file
    if (existsSync(localFilePath)) {
      const fileBuffer = await readFile(localFilePath)
      const mimeType = "image/jpeg"
      const headers: Record<string, string> = {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=0, must-revalidate",
      }
      
      // Add download header if this is a download request
      if (download) {
        headers["Content-Disposition"] = `attachment; filename="${fileName}"`
      }
      
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers,
      })
    }

    // Handle S3 file - download directly from S3 (no CORS issues)
    if (isS3Configured() && imagePath?.startsWith("upload/")) {
      try {
        // For downloads, fetch from S3 server-side and stream to client
        if (download) {
          const downloadResult = await downloadFromS3(imagePath)
          
          if (downloadResult.success && downloadResult.buffer) {
            const contentType = downloadResult.contentType || "image/jpeg"
            return new NextResponse(new Uint8Array(downloadResult.buffer), {
              status: 200,
              headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Cache-Control": "public, max-age=0, must-revalidate",
              },
            })
          } else {
            return NextResponse.json({ success: false, error: downloadResult.message || "Failed to download from S3" }, { status: 500 })
          }
        } else {
          // For viewing, return presigned URL (redirect)
          // getSignedUrl now checks file existence internally
          const signed = await getSignedUrl(imagePath)
          if (signed.success && signed.url) {
            return NextResponse.redirect(signed.url)
          } else {
            // File doesn't exist in S3, return 404
            return NextResponse.json({ success: false, error: signed.message || "Image not found in S3" }, { status: 404 })
          }
        }
      } catch (err) {
        console.error("Error getting S3 file:", err)
        return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed to fetch from S3" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 })
  } catch (error: any) {
    console.error("Error in GET /api/teacher/profile/image:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch image" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const contentType = request.headers.get("content-type") || ""

    // JSON body: get URL for existing path
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}))
      const imagePath = body?.path as string | undefined
      const fileName = getFileNameFromPath(imagePath)
      if (!fileName) {
        return NextResponse.json({ success: false, error: "Image path is required" }, { status: 400 })
      }

      const localFilePath = join(PROFILE_IMAGE_DIR, fileName)
      if (existsSync(localFilePath)) {
        return NextResponse.json({
          success: true,
          url: buildApiUrl(request, imagePath!),
          path: imagePath,
          timestamp: Date.now(),
        })
      }

      if (isS3Configured() && imagePath?.startsWith("upload/")) {
        try {
          // getSignedUrl now checks file existence internally
          const signed = await getSignedUrl(imagePath)
          if (signed.success && signed.url) {
            return NextResponse.json({ success: true, url: signed.url, path: imagePath })
          } else {
            // File doesn't exist in S3
            return NextResponse.json({ success: false, error: signed.message || "Image not found in S3" }, { status: 404 })
          }
        } catch (err) {
          console.error("Error getting S3 URL:", err)
          return NextResponse.json({ success: false, error: "Failed to get S3 URL" }, { status: 500 })
        }
      }

      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 })
    }

    // FormData: upload
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const userEmail = formData.get("email") as string | null
    const uploadToS3Flag = formData.get("uploadToS3") === "true"

    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    if (!userEmail) return NextResponse.json({ success: false, error: "User email is required" }, { status: 400 })

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Only JPG or JPEG images are allowed" }, { status: 400 })
    }
    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      return NextResponse.json({ success: false, error: "Image size must be less than 1MB" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    if (!["jpg", "jpeg"].includes(ext)) {
      return NextResponse.json({ success: false, error: "Only JPG or JPEG file extensions are allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${userEmail}.${ext}`
    const filePath = join(PROFILE_IMAGE_DIR, fileName)

    // Remove existing local files for this user
    try {
      const existingJpg = join(PROFILE_IMAGE_DIR, `${userEmail}.jpg`)
      const existingJpeg = join(PROFILE_IMAGE_DIR, `${userEmail}.jpeg`)
      if (existsSync(existingJpg)) await unlink(existingJpg)
      if (existsSync(existingJpeg)) await unlink(existingJpeg)
    } catch {
      // ignore
    }

    // Always use upload/Profile/email.extension format for database
    // This ensures consistency whether stored in S3 or locally
    let databasePath = `upload/Profile/${fileName}`
    let uploadedToS3 = false
    let uploadError: string | undefined = undefined

    if (uploadToS3Flag && isS3Configured()) {
      // Upload to S3
      try {
        const metadata: FilePatternMetadata = {
          patternType: 2,
          email: userEmail,
          folderName: "Profile",
          fileExtension: `.${ext}`,
        }
        const uploadResult = await uploadToS3(buffer, metadata, file.type)
        
        if (uploadResult.success) {
          // S3 upload successful - use S3 virtual path
          databasePath = uploadResult.virtualPath
          uploadedToS3 = true
          
          // Delete local file only after confirmed S3 upload success
          if (existsSync(filePath)) {
            try {
              await unlink(filePath)
            } catch (unlinkErr) {
              console.warn("Failed to delete local file after S3 upload:", unlinkErr)
              // Don't fail the request if cleanup fails
            }
          }
        } else {
          // S3 upload failed - save locally as fallback
          uploadError = uploadResult.message
          await writeFile(filePath, buffer)
          // Keep databasePath as upload/Profile/email.extension (local storage)
        }
      } catch (err) {
        console.error("S3 upload error, saving locally:", err)
        uploadError = err instanceof Error ? err.message : "S3 upload failed"
        // Fallback to local storage
        await writeFile(filePath, buffer)
        // Keep databasePath as upload/Profile/email.extension (local storage)
      }
    } else {
      // Save locally (either S3 not configured or uploadToS3Flag is false)
      await writeFile(filePath, buffer)
      
      if (uploadToS3Flag && !isS3Configured()) {
        uploadError = "S3 is not configured. Image saved locally."
      }
      // databasePath already set to upload/Profile/email.extension format
    }

    let timestamp: number | undefined
    if (existsSync(filePath)) {
      try {
        const stats = await import("fs/promises").then(fs => fs.stat(filePath))
        timestamp = stats.mtime.getTime()
      } catch {
        // ignore
      }
    }

    // Log activity if upload was successful (non-blocking)
    if (uploadedToS3 || databasePath) {
      const { user } = authResult
      // Use S3_Profile format when uploaded to S3, otherwise use Profile_Image
      const entityName = uploadedToS3 ? 'S3_Profile' : 'Profile_Image';
      logActivityFromRequest(request, user, 'UPLOAD', entityName, null).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      path: databasePath, // Always in format: upload/Profile/email.extension
      fileName,
      fileSize: file.size,
      fileType: file.type,
      uploadedToS3,
      error: uploadError,
      timestamp,
    })
  } catch (error: any) {
    console.error("Error in POST /api/teacher/profile/image:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to process request" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get("path")

    if (!imagePath) {
      return NextResponse.json({ success: false, error: "Image path is required" }, { status: 400 })
    }

    // If it's an S3 path, delete from S3
    if (isS3Configured() && imagePath.startsWith("upload/")) {
      const deleteResult = await deleteFromS3(imagePath)
      
      if (deleteResult.success) {
        // Log activity (non-blocking)
        const { user } = authResult
        // Extract entity name from S3 path: upload/Profile/email.jpg -> S3_Profile
        let entityName = 'S3_Profile';
        if (imagePath.startsWith('upload/')) {
          entityName = 'S3_' + imagePath
        }
        logActivityFromRequest(request, user, 'DELETE', entityName, null).catch(() => {});
        
        return NextResponse.json({ 
          success: true, 
          message: "Image deleted from S3 successfully" 
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: deleteResult.message 
        }, { status: 500 })
      }
    }

    // If it's a local path, delete from local storage
    const fileName = getFileNameFromPath(imagePath)
    if (fileName) {
      const localFilePath = join(PROFILE_IMAGE_DIR, fileName)
      if (existsSync(localFilePath)) {
        try {
          await unlink(localFilePath)
          
          // Log activity (non-blocking)
          const { user } = authResult
          logActivityFromRequest(request, user, 'DELETE', 'Profile_Image', null).catch(() => {});
          
          return NextResponse.json({ 
            success: true, 
            message: "Image deleted from local storage successfully" 
          })
        } catch (unlinkError) {
          console.error("Error deleting local file:", unlinkError)
          return NextResponse.json({ 
            success: false, 
            error: "Failed to delete local file" 
          }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: "Image not found" 
    }, { status: 404 })
  } catch (error: any) {
    console.error("Error in DELETE /api/teacher/profile/image:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to delete image" 
    }, { status: 500 })
  }
}

