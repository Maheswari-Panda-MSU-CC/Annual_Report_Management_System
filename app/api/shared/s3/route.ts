import { NextRequest, NextResponse } from "next/server"

/**
 * Dummy S3 Upload API Route
 * Returns a demo URL for the uploaded document
 * In production, this would upload to actual S3 and return the real URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileType, fileSize } = body

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "File name is required" },
        { status: 400 }
      )
    }

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate a dummy S3 URL
    // In production, this would be the actual S3 URL
    const dummyS3Url = `http://localhost:3000/assets/demo_document.pdf`

    // For demo purposes, we'll use the local uploaded file URL
    // In production, replace this with actual S3 URL
    const documentUrl = `/uploaded-document/${fileName}`

    return NextResponse.json({
      success: true,
      url: dummyS3Url, // Return dummy S3 URL as specified
      localUrl: documentUrl, // Also return local URL for immediate preview
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

