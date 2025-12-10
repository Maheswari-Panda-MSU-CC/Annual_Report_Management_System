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
  abbri:string
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
    return `${teacherInfo.abbri} ${teacherInfo.fname} ${teacherInfo.mname} ${teacherInfo.lname}`
  }
  return "Abbreviation FirstName MiddleName LastName"
}

function generateCertificateHTML(data: CertificateData): string {
  const { teacherInfo, selectedArticles, selectedPapers, salutation } = data
  const currentDate = new Date().toLocaleDateString("en-GB")

  // Get base URL for images - use absolute URL for Puppeteer
  const baseUrl = 'http://localhost:3000'
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
    
    .table-container {
      width: 100%;
      margin-bottom: 16px;
      overflow: hidden;
    }
    
    #certificate-content table {
      table-layout: fixed !important;
      width: 100% !important;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    
    #certificate-content table td,
    #certificate-content table th {
      overflow-wrap: break-word !important;
      word-break: break-word !important;
      hyphens: auto;
      border: 1px solid #d1d5db;
      padding: 6px 8px;
      text-align: left;
      font-size: 10px;
      line-height: 1.3;
      vertical-align: top;
      max-width: 0;
      overflow: hidden;
    }
    
    #certificate-content table th {
      background-color: #f9fafb;
      font-weight: 600;
      white-space: normal !important;
      word-wrap: break-word !important;
      text-align: center;
      font-size: 9px;
      padding: 8px 6px;
    }
    
    #certificate-content table tbody td {
      font-size: 9px;
    }
    
    #certificate-content table tbody tr:nth-child(even) {
      background-color: #fafafa;
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
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 600;
      white-space: nowrap !important;
      line-height: 1.1;
      text-transform: uppercase;
      letter-spacing: 0.3px;
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
        margin: 0;
      }
      
      #certificate-content {
        padding: 10mm;
        max-width: 100%;
      }
      
      #certificate-content table {
        page-break-inside: auto;
      }
      
      #certificate-content table tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      #certificate-content table thead {
        display: table-header-group;
      }
      
      #certificate-content table tfoot {
        display: table-footer-group;
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
        The Maharaja Sayajirao University of Baroda
      </h1>

      <h2 class="text-xl font-semibold text-blue-600 mb-4 border-b-2 pb-2">
        PUBLICATION CERTIFICATE
      </h2>
    </div>

    <!-- Supervisor Information -->
    <div class="mb-4">
      <p class="text-base text-gray-700">
        <span class="font-bold text-gray-900">Name of Ph.D. Supervisor:</span> 
        <span class="font-bold text-xl text-blue-700" style="margin-left: 8px;">${salutation}</span>
      </p>
    </div>

    <!-- Published Articles Section -->
    ${selectedArticles.length > 0 ? `
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
        Published Articles/Papers in Journals
      </h3>
      <div class="table-container">
        <table style="width: 100%; table-layout: fixed;">
          <thead>
            <tr>
              <th style="width: 4%;">Sr No.</th>
              <th style="width: 11%;">Author(s)</th>
              <th style="width: 16%;">Paper Title</th>
              <th style="width: 16%;">Journal Name & ISSN & Volume No.</th>
              <th style="width: 7%;">Published Year</th>
              <th style="width: 11%;">DOI</th>
              <th style="width: 18%;">Index in Scopus/UGC CARE/Clarivate</th>
              <th style="width: 16%;">Document Submitted?</th>
            </tr>
          </thead>
          <tbody>
            ${selectedArticles.map((publication) => `
            <tr>
              <td style="text-align: center; white-space: nowrap;">${publication.srNo}</td>
              <td style="word-wrap: break-word;">${escapeHtml(publication.authors)}</td>
              <td style="word-wrap: break-word;">${escapeHtml(publication.paperTitle)}</td>
              <td style="word-wrap: break-word;">${escapeHtml(publication.journalNameISSNVolume)}</td>
              <td style="text-align: center; white-space: nowrap;">${escapeHtml(publication.publishedYear)}</td>
              <td style="word-wrap: break-word; font-size: 9px;">
                ${publication.doi ? `<span style="word-break: break-all;">${escapeHtml(publication.doi)}</span>` : "-"}
              </td>
              <td style="word-wrap: break-word;">${escapeHtml(publication.indexing)}</td>
              <td style="text-align: center; padding: 4px 6px;">
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
      <div class="table-container">
        <table style="width: 100%; table-layout: fixed;">
          <thead>
            <tr>
              <th style="width: 4%;">Sr No.</th>
              <th style="width: 14%;">Authors</th>
              <th style="width: 18%;">Paper Title</th>
              <th style="width: 16%;">Paper Theme</th>
              <th style="width: 16%;">Organising Body</th>
              <th style="width: 16%;">Date of Publication</th>
              <th style="width: 16%;">Documents Submitted?</th>
            </tr>
          </thead>
          <tbody>
            ${selectedPapers.map((publication) => `
            <tr>
              <td style="text-align: center; white-space: nowrap;">${publication.srNo}</td>
              <td style="word-wrap: break-word;">${escapeHtml(publication.authors)}</td>
              <td style="word-wrap: break-word;">${escapeHtml(publication.paperTitle)}</td>
              <td style="word-wrap: break-word;">${escapeHtml(publication.paperTheme)}</td>
              <td style="word-wrap: break-word;">${escapeHtml(publication.organisingBody)}</td>
              <td style="text-align: center; word-wrap: break-word;">${escapeHtml(publication.dateOfPublication)}</td>
              <td style="text-align: center; padding: 4px 6px;">
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
    <div class="flex justify-end" style="margin-top: 48px;">
      <div class="text-right">
        <p class="text-sm font-medium text-gray-700" style="margin-bottom: 64px;">${salutation}</p>
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

