import puppeteer from 'puppeteer'
import { generateCVHTMLSingleColumn } from './cv-html-single-column'
import type { CVTemplate } from './cv-template-styles'
import type { CVData } from '@/types/cv-data'

/**
 * Generate PDF from CV data using Puppeteer
 * This provides server-side PDF generation that matches the preview exactly
 */
export async function generateCVPDF(
  cvData: CVData,
  template: CVTemplate,
  selectedSections: string[],
  sessionCookie?: string,
): Promise<Buffer> {
  if (!cvData.personal) {
    throw new Error('Personal information is required')
  }

  // Generate single-column HTML matching the preview exactly
  // Pass session cookie to handle authenticated image URLs
  const html = await generateCVHTMLSingleColumn(cvData, template, selectedSections, sessionCookie)

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

    // Set viewport to A4 size (accounting for margins)
    // A4: 210mm x 297mm, with 10mm margins = 190mm x 277mm content area
    // At 96 DPI: 1mm = 3.7795px
    const contentWidth = 190 * 3.7795 // ~718px
    const contentHeight = 277 * 3.7795 // ~1047px
    
    await page.setViewport({
      width: Math.ceil(contentWidth),
      height: Math.ceil(contentHeight),
      deviceScaleFactor: 2, // Higher quality
    })

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })
    
    // Wait a bit for styles to apply
    await new Promise(resolve => setTimeout(resolve, 500))

    // Wait for any images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve // Continue even if image fails
            setTimeout(resolve, 2000) // Timeout after 2 seconds
          })
        })
      )
    })

    // Generate PDF with proper settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Essential for colors and backgrounds
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      preferCSSPageSize: false, // Use A4 format
      displayHeaderFooter: false,
      scale: 1.0, // Full scale
    })

    await browser.close()

    // Convert Buffer to Uint8Array for NextResponse compatibility
    return Buffer.from(pdfBuffer as unknown as ArrayBuffer)
  } catch (error) {
    await browser.close()
    throw error
  }
}

