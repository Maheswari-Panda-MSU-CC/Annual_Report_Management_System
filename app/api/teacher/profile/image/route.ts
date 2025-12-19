import { NextRequest, NextResponse } from "next/server"
import { writeFile, readFile, unlink } from "fs/promises"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import { isS3Configured, uploadToS3, getSignedUrl } from "@/lib/s3-service"
import type { FilePatternMetadata } from "@/lib/s3-service"

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
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get("path")
    const fileName = getFileNameFromPath(imagePath)
    if (!fileName) {
      return NextResponse.json({ success: false, error: "Image path is required" }, { status: 400 })
    }

    const localFilePath = join(PROFILE_IMAGE_DIR, fileName)

    if (existsSync(localFilePath)) {
      const fileBuffer = await readFile(localFilePath)
      const mimeType = "image/jpeg"
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      })
    }

    // Fallback to S3 if configured and virtual path looks valid
    if (isS3Configured() && imagePath?.startsWith("upload/")) {
      try {
        const signed = await getSignedUrl(imagePath)
        if (signed.success && signed.url) {
          return NextResponse.redirect(signed.url)
        }
      } catch (err) {
        console.error("Error getting S3 URL:", err)
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
          const signed = await getSignedUrl(imagePath)
          if (signed.success && signed.url) {
            return NextResponse.json({ success: true, url: signed.url, path: imagePath })
          }
        } catch (err) {
          console.error("Error getting S3 URL:", err)
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

    let databasePath = `upload/Profile/${fileName}`

    if (uploadToS3Flag && isS3Configured()) {
      try {
        const metadata: FilePatternMetadata = {
          patternType: 2,
          email: userEmail,
          folderName: "Profile",
          fileExtension: `.${ext}`,
        }
        const uploadResult = await uploadToS3(buffer, metadata, file.type)
        if (uploadResult.success) {
          databasePath = uploadResult.virtualPath
          // clean local if exists
          if (existsSync(filePath)) await unlink(filePath)
        } else {
          // fallback to local
          await writeFile(filePath, buffer)
        }
      } catch (err) {
        console.error("S3 upload error, saving locally:", err)
        await writeFile(filePath, buffer)
      }
    } else {
      await writeFile(filePath, buffer)
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

    return NextResponse.json({
      success: true,
      path: databasePath,
      fileName,
      fileSize: file.size,
      fileType: file.type,
      uploadedToS3: uploadToS3Flag && isS3Configured(),
      timestamp,
    })
  } catch (error: any) {
    console.error("Error in POST /api/teacher/profile/image:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to process request" }, { status: 500 })
  }
}

