import { NextResponse } from "next/server"
import { generateWordDocument } from "@/app/api/teacher/cv-generation/cv-word-generator"
import { generateCVPDF } from "@/app/api/teacher/cv-generation/cv-pdf-puppeteer"
import { type CVTemplate } from "@/app/api/teacher/cv-generation/cv-template-styles"
import { fetchCVDataFromDB } from "@/app/api/teacher/cv-generation/fetch-cv-data"
import { cachedJsonResponse } from '@/lib/api-cache'

interface CVGenerationRequest {
  teacherId: number
  template: CVTemplate
  format: "pdf" | "word"
  selectedSections: string[]
}

/**
 * GET /api/teacher/cv-generation
 * Fetches all CV data for a teacher using sp_GetTeacherCVData stored procedure
 * Used for preview on the CV generation page
 * 
 * Query Parameters:
 * - teacherId: Teacher ID (required)
 * - sections: Comma-separated list of section IDs to include (optional, defaults to all)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10)
    const sectionsParam = searchParams.get('sections') || ''

    if (isNaN(teacherId) || teacherId === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing teacherId' },
        { status: 400 }
      )
    }

    // Parse sections if provided, otherwise include all sections
    const requestedSections = sectionsParam 
      ? sectionsParam.split(',').map(s => s.trim())
      : [
          'education', 'postdoc', 'experience', 'research', 'patents', 'econtent',
          'consultancy', 'collaborations', 'phdguidance', 'books', 'papers',
          'reviews','monographs',
          'articles', 'orientation', 'academic_contribution', 'academic_participation',
          'committees', 'performance', 'awards', 'extension', 'talks'
        ]

    // Fetch CV data using shared function
    const cvData = await fetchCVDataFromDB(teacherId, requestedSections)

    // Cache for 5 minutes (300 seconds) - CV data doesn't change frequently
    return cachedJsonResponse(cvData, 300)
  } catch (err: any) {
    console.error('Error fetching CV data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch CV data', message: err.message },
      { status: 500 }
    )
  }
}


export async function POST(request: Request) {
  try {
    const body: CVGenerationRequest = await request.json()

    const { teacherId, template, format, selectedSections } = body

    // Validate input
    if (!teacherId || teacherId === 0) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 },
      )
    }

    if (!template || !["academic", "professional", "modern", "classic"].includes(template)) {
      return NextResponse.json(
        { error: "Invalid template. Must be one of: academic, professional, modern, classic" },
        { status: 400 },
      )
    }

    if (!format || !["pdf", "word"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be 'pdf' or 'word'" },
        { status: 400 },
      )
    }

    if (!selectedSections || selectedSections.length === 0) {
      return NextResponse.json(
        { error: "At least one section must be selected" },
        { status: 400 },
      )
    }

    // Fetch CV data directly from database using stored procedure
    const cvData = await fetchCVDataFromDB(teacherId, selectedSections)

    // Validate that personal data exists
    if (!cvData || !cvData.personal) {
      return NextResponse.json(
        { error: "Personal information is required. Please ensure the teacher profile is complete." },
        { status: 400 },
      )
    }

    // Generate document
    if (format === "word") {
      const buffer = await generateWordDocument(cvData, template, selectedSections)

      return new NextResponse(buffer as any, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="CV_${cvData.personal.name.replace(/\s+/g, "_")}_${template}_${new Date().toISOString().split("T")[0]}.docx"`,
        },
      })
    } else {
      const pdfBuffer = await generateCVPDF(cvData, template, selectedSections)

      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="CV_${cvData.personal.name.replace(/\s+/g, "_")}_${template}_${new Date().toISOString().split("T")[0]}.pdf"`,
        },
      })
    }
  } catch (error: any) {
    console.error("CV generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate CV",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

