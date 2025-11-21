import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface JournalArticle {
  id: number
  type: "article"
  srNo: number
  authors: string
  paperTitle: string
  journalNameISSNVolume: string
  publishedYear: string
  doi: string
  indexing: string
  documentSubmitted: string
  level: string
  levelId: number | null
}

interface PaperPresented {
  id: number
  type: "paper"
  srNo: number
  authors: string
  paperTitle: string
  paperTheme: string
  organisingBody: string
  dateOfPublication: string
  documentsSubmitted: string
  level: string
  levelId: number | null
}

interface TeacherInfo {
  fname: string
  mname: string
  lname: string
}

interface CertificateData {
  teacherInfo: TeacherInfo | null
  selectedArticles: JournalArticle[]
  selectedPapers: PaperPresented[]
  salutation: string
}

function getSalutation(teacherInfo: TeacherInfo | null, userName?: string): string {
  if (teacherInfo) {
    const parts = [teacherInfo.fname, teacherInfo.mname, teacherInfo.lname].filter(Boolean)
    if (parts.length > 0) {
      return `Dr. ${parts.join(" ")}`
    }
  }
  if (userName) {
    if (userName.toLowerCase().includes("dr.") || userName.toLowerCase().includes("prof.")) {
      return userName
    }
    return `Dr. ${userName}`
  }
  return "Dr. FirstName MiddleName LastName"
}

function generateCertificateHTML(data: CertificateData): string {
  const { teacherInfo, selectedArticles, selectedPapers, salutation } = data
  const currentDate = new Date().toLocaleDateString("en-GB")

  // Get base URL for images - use absolute URL for Puppeteer
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                  'http://localhost:3000'
  const logoUrl = `${baseUrl}/images/msu-logo.png`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Publication Certificate</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      background: #ffffff;
      color: #1f2937;
      padding: 20px;
      line-height: 1.6;
    }
    
    #certificate-content {
      position: relative;
      margin: 0 auto;
      max-width: 210mm;
      width: 100%;
      background-color: #ffffff;
      overflow: visible;
      padding: 20px;
    }
    
    #certificate-content table {
      table-layout: fixed !important;
      width: 100% !important;
      border-collapse: collapse;
    }
    
    #certificate-content table td,
    #certificate-content table th {
      overflow-wrap: break-word !important;
      word-break: break-word !important;
      hyphens: auto;
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      text-align: left;
      font-size: 11px;
    }
    
    #certificate-content table th {
      background-color: #f9fafb;
      font-weight: 600;
    }
    
    .text-center {
      text-align: center;
    }
    
    .mb-6 {
      margin-bottom: 24px;
    }
    
    .mb-4 {
      margin-bottom: 16px;
    }
    
    .mb-3 {
      margin-bottom: 12px;
    }
    
    .mb-2 {
      margin-bottom: 8px;
    }
    
    .font-bold {
      font-weight: 700;
    }
    
    .font-semibold {
      font-weight: 600;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .text-gray-800 {
      color: #1f2937;
    }
    
    .text-gray-700 {
      color: #374151;
    }
    
    .text-blue-600 {
      color: #2563eb;
    }
    
    .border-b {
      border-bottom: 1px solid #d1d5db;
    }
    
    .border-b-2 {
      border-bottom: 2px solid #e5e7eb;
    }
    
    .pb-2 {
      padding-bottom: 8px;
    }
    
    .flex {
      display: flex;
    }
    
    .justify-center {
      justify-content: center;
    }
    
    .justify-end {
      justify-content: flex-end;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-xs {
      font-size: 11px;
    }
    
    .text-sm {
      font-size: 12px;
    }
    
    .text-base {
      font-size: 14px;
    }
    
    .text-lg {
      font-size: 16px;
    }
    
    .text-xl {
      font-size: 18px;
    }
    
    .text-2xl {
      font-size: 24px;
    }
    
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    
    .badge-default {
      background-color: #3b82f6;
      color: #ffffff;
    }
    
    .badge-destructive {
      background-color: #ef4444;
      color: #ffffff;
    }
    
    .break-all {
      word-break: break-all;
    }
    
    .logo-img {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      #certificate-content {
        padding: 10mm;
      }
      
      @page {
        size: A4;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div id="certificate-content">
    <!-- Header -->
    <div class="text-center mb-6">
      <!-- University Logo -->
      <div class="flex justify-center mb-3">
        <img src="${logoUrl}" alt="MSU Baroda Logo" class="logo-img" />
      </div>

      <h1 class="text-2xl font-bold text-gray-800 mb-2">
        MAHARAJA SAIYAJIRAO UNIVERSITY OF BARODA
      </h1>

      <h2 class="text-xl font-semibold text-blue-600 mb-4 border-b-2 pb-2">
        PUBLICATION CERTIFICATE
      </h2>
    </div>

    <!-- Supervisor Information -->
    <div class="mb-4">
      <p class="text-base font-medium text-gray-700">
        <span class="font-semibold">Name of Ph.D. Supervisor:</span> ${salutation}
      </p>
    </div>

    <!-- Published Articles Section -->
    ${selectedArticles.length > 0 ? `
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
        Published Articles/Papers in Journals
      </h3>
      <div style="width: 100%; overflow: visible;">
        <table style="width: 100%; table-layout: fixed;">
          <thead>
            <tr>
              <th style="width: 5%; white-space: nowrap;">Sr No.</th>
              <th style="width: 12%; white-space: normal; word-wrap: break-word;">Author(s)</th>
              <th style="width: 18%; white-space: normal; word-wrap: break-word;">Paper Title</th>
              <th style="width: 18%; white-space: normal; word-wrap: break-word;">Journal Name & ISSN & Volume No.</th>
              <th style="width: 8%; white-space: nowrap;">Published Year</th>
              <th style="width: 12%; white-space: normal; word-wrap: break-word;">DOI</th>
              <th style="width: 15%; white-space: normal; word-wrap: break-word;">Index in Scopus/UGC CARE/Clarivate</th>
              <th style="width: 12%; white-space: normal; word-wrap: break-word;">Document Submitted?</th>
            </tr>
          </thead>
          <tbody>
            ${selectedArticles.map((publication) => `
            <tr>
              <td style="white-space: nowrap; width: 5%;">${publication.srNo}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 12%;">${escapeHtml(publication.authors)}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 18%;">${escapeHtml(publication.paperTitle)}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 18%;">${escapeHtml(publication.journalNameISSNVolume)}</td>
              <td style="white-space: nowrap; width: 8%;">${escapeHtml(publication.publishedYear)}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 12%;">
                ${publication.doi ? `<span class="break-all">${escapeHtml(publication.doi)}</span>` : "-"}
              </td>
              <td style="white-space: normal; word-wrap: break-word; width: 15%;">${escapeHtml(publication.indexing)}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 12%;">
                <span class="badge ${publication.documentSubmitted === "Submitted" ? "badge-default" : "badge-destructive"}">
                  ${escapeHtml(publication.documentSubmitted)}
                </span>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ` : ''}

    <!-- Papers Presented Section -->
    ${selectedPapers.length > 0 ? `
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
        Papers Presented in Conference/Symposia/Seminar
      </h3>
      <div style="width: 100%; overflow: visible;">
        <table style="width: 100%; table-layout: fixed;">
          <thead>
            <tr>
              <th style="width: 5%; white-space: nowrap;">Sr No.</th>
              <th style="width: 15%; white-space: normal; word-wrap: break-word;">Authors</th>
              <th style="width: 20%; white-space: normal; word-wrap: break-word;">Paper Title</th>
              <th style="width: 18%; white-space: normal; word-wrap: break-word;">Paper Theme</th>
              <th style="width: 18%; white-space: normal; word-wrap: break-word;">Organising Body</th>
              <th style="width: 12%; white-space: normal; word-wrap: break-word;">Date of Publication</th>
              <th style="width: 12%; white-space: normal; word-wrap: break-word;">Documents Submitted?</th>
            </tr>
          </thead>
          <tbody>
            ${selectedPapers.map((publication) => `
            <tr>
              <td style="white-space: nowrap; width: 5%;">${publication.srNo}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 15%;">${escapeHtml(publication.authors)}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 20%;">${escapeHtml(publication.paperTitle)}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 18%;">${escapeHtml(publication.paperTheme)}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 18%;">${escapeHtml(publication.organisingBody)}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 12%;">${escapeHtml(publication.dateOfPublication)}</td>
              <td style="white-space: normal; word-wrap: break-word; width: 12%;">
                <span class="badge ${publication.documentsSubmitted === "Submitted" ? "badge-default" : "badge-destructive"}">
                  ${escapeHtml(publication.documentsSubmitted)}
                </span>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ` : ''}

    <!-- Declaration -->
    <div class="mb-6">
      <p class="text-sm text-gray-700">
        I Undersign, agree that all submitted information in above format is true as per my knowledge and belief.
      </p>
    </div>

    <!-- Signature -->
    <div class="flex justify-end">
      <div class="text-right">
        <p class="text-sm font-medium text-gray-700 mb-6">${salutation}</p>
        <div style="border-bottom: 1px solid #9ca3af; width: 192px; margin-bottom: 8px;"></div>
        <p class="text-xs text-gray-500">Signature</p>
      </div>
    </div>

    <!-- Date -->
    <div style="margin-top: 24px; text-align: right;">
      <p class="text-sm text-gray-600">Date: ${currentDate}</p>
    </div>
  </div>
</body>
</html>
  `
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherInfo, selectedArticles, selectedPapers, userName } = body

    if (!selectedArticles || !selectedPapers) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }

    if (selectedArticles.length === 0 && selectedPapers.length === 0) {
      return NextResponse.json(
        { error: 'No publications selected' },
        { status: 400 }
      )
    }

    const salutation = getSalutation(teacherInfo, userName)
    const certificateData: CertificateData = {
      teacherInfo,
      selectedArticles,
      selectedPapers,
      salutation,
    }

    // Generate HTML
    const html = generateCertificateHTML(certificateData)

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    })

    try {
      const page = await browser.newPage()

      // Set viewport to A4 size
      await page.setViewport({
        width: 794, // A4 width in pixels at 96 DPI (210mm * 3.7795)
        height: 1123, // A4 height in pixels at 96 DPI (297mm * 3.7795)
      })

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      })

      // Wait for images to load
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images).map((img) => {
            if (img.complete) return Promise.resolve()
            return new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = resolve // Continue even if image fails
              setTimeout(resolve, 2000) // Timeout after 2 seconds
            })
          })
        )
      })

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
      })

      await browser.close()

      // Return PDF as response
      // Convert Buffer to Uint8Array for NextResponse compatibility
      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Publication_Certificate_${Date.now()}.pdf"`,
        },
      })
    } catch (error) {
      await browser.close()
      throw error
    }
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

