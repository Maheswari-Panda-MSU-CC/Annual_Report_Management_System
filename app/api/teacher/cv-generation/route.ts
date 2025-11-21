import { NextResponse } from "next/server"
import { generateCVHTML } from "@/app/api/teacher/cv-generation/cv-html-generator"
import { generateWordDocument } from "@/app/api/teacher/cv-generation/cv-word-generator"
import { generateCVPDF } from "@/app/api/teacher/cv-generation/cv-pdf-puppeteer"
import { type CVTemplate } from "@/app/api/teacher/cv-generation/cv-template-styles"

interface CVGenerationRequest {
  cvData: {
    personal: {
      name: string
      designation: string
      department: string
      institution: string
      email: string
      phone: string
      address: string
      dateOfBirth: string
      nationality: string
      orcid: string
    } | null
    education: any[]
    postdoc: any[]
    experience: any[]
    research: any[]
    patents: any[]
    econtent: any[]
    consultancy: any[]
    collaborations: any[]
    phdguidance: any[]
    books: any[]
    papers: any[]
    articles: any[]
    awards: any[]
    talks: any[]
    academic_contribution: any[]
    academic_participation: any[]
    committees: any[]
    performance: any[]
    extension: any[]
    orientation: any[]
  }
  template: CVTemplate
  format: "pdf" | "word"
  selectedSections: string[]
}


export async function POST(request: Request) {
  try {
    const body: CVGenerationRequest = await request.json()

    const { cvData, template, format, selectedSections } = body

    // Validate input
    if (!cvData || !cvData.personal) {
      return NextResponse.json(
        { error: "Personal information is required" },
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

    if (format === "word") {
      // Generate Word document using the generator with current data and template
      const buffer = await generateWordDocument(cvData, template, selectedSections)

      // Return the buffer as response
      return new NextResponse(buffer as any, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="CV_${cvData.personal.name.replace(/\s+/g, "_")}_${template}_${new Date().toISOString().split("T")[0]}.docx"`,
        },
      })
    } else {
      // Generate PDF using server-side Puppeteer (replaces old client-side generation)
      const pdfBuffer = await generateCVPDF(cvData, template, selectedSections)

      // Return PDF as response
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

