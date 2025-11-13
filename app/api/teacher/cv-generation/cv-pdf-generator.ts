import jsPDF from "jspdf"
import html2canvas from "html2canvas"

/**
 * Browser Print Method - Alternative PDF generation using window.print()
 * This method uses the browser's native print functionality to generate PDF
 * It's more reliable for very long CVs and doesn't have canvas size limitations
 * It targets the element by ID and opens a print dialog
 */
export function generatePDFUsingBrowserPrint(elementId: string = "cv-preview-content"): void {
  const cvContentElement = document.getElementById(elementId) as HTMLElement
  
  if (!cvContentElement) {
    throw new Error(`Element with id "${elementId}" not found. Please ensure the preview is visible.`)
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    throw new Error("Failed to open print window. Please allow popups for this site.")
  }

  // Clone the element with all its styles
  const clonedElement = cvContentElement.cloneNode(true) as HTMLElement

  // CRITICAL: Remove all height constraints from cloned element and all children
  // This ensures ALL content is visible in print, not just what's in the viewport
  function removeHeightConstraints(element: HTMLElement): void {
    // Remove height constraints from this element
    element.style.maxHeight = 'none'
    element.style.height = 'auto'
    element.style.overflow = 'visible'
    element.style.overflowY = 'visible'
    element.style.overflowX = 'visible'
    
    // Also remove from computed styles if they exist
    const computed = window.getComputedStyle(element)
    if (computed.maxHeight && computed.maxHeight !== 'none') {
      element.style.maxHeight = 'none'
    }
    if (computed.overflow === 'hidden' || computed.overflow === 'auto' || computed.overflow === 'scroll') {
      element.style.overflow = 'visible'
    }
    if (computed.overflowY === 'hidden' || computed.overflowY === 'auto' || computed.overflowY === 'scroll') {
      element.style.overflowY = 'visible'
    }
    
    // Recursively remove from all children
    const children = element.children
    for (let i = 0; i < children.length; i++) {
      removeHeightConstraints(children[i] as HTMLElement)
    }
    
    // Also check querySelectorAll for nested elements
    const allDescendants = element.querySelectorAll('*')
    allDescendants.forEach((child) => {
      const el = child as HTMLElement
      if (el) {
        el.style.maxHeight = 'none'
        el.style.height = 'auto'
        el.style.overflow = 'visible'
        el.style.overflowY = 'visible'
        el.style.overflowX = 'visible'
      }
    })
  }

  // Remove all height constraints from cloned element
  removeHeightConstraints(clonedElement)

  // Get all computed styles from the original element and apply them
  const computedStyles = window.getComputedStyle(cvContentElement)
  
  // Extract all stylesheets from the current document
  let allStyles = ''
  try {
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i]
      try {
        if (sheet.cssRules) {
          for (let j = 0; j < sheet.cssRules.length; j++) {
            allStyles += sheet.cssRules[j].cssText + '\n'
          }
        }
      } catch (e) {
        // Cross-origin stylesheets will throw, skip them
        console.warn('Could not access stylesheet:', e)
      }
    }
  } catch (e) {
    console.warn('Error extracting styles:', e)
  }

  // Create print-optimized HTML with all styles preserved
  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - Print</title>
        <style>
          /* Base print styles */
          @page {
            size: A4;
            margin: 15mm;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: ${computedStyles.fontFamily || 'Arial, sans-serif'};
            background: white;
            color: #000;
            margin: 0;
            padding: 0;
            width: 100%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          #print-content {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Preserve all original styles */
          ${allStyles}
          
          /* Print-specific styles */
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            
            #print-content {
              margin: 0;
              padding: 0;
              width: 100%;
              max-width: 100%;
              overflow: visible !important;
              overflow-y: visible !important;
              overflow-x: visible !important;
              height: auto !important;
              min-height: auto !important;
              max-height: none !important;
              display: block !important;
            }
            
            /* CRITICAL: Ensure ALL content is visible - remove ALL height constraints */
            *,
            *::before,
            *::after {
              overflow: visible !important;
              overflow-y: visible !important;
              overflow-x: visible !important;
              max-height: none !important;
              height: auto !important;
            }
            
            /* Specifically target common container classes that might have height limits */
            [class*="max-h"],
            [class*="overflow"],
            [style*="max-height"],
            [style*="overflow"] {
              max-height: none !important;
              height: auto !important;
              overflow: visible !important;
              overflow-y: visible !important;
              overflow-x: visible !important;
            }
            
            /* Ensure flex containers don't limit height */
            [class*="flex"],
            [style*="display: flex"],
            [style*="display:flex"] {
              min-height: auto !important;
              max-height: none !important;
              height: auto !important;
            }
            
            /* Hide elements that shouldn't print */
            .no-print,
            button,
            .print-hide {
              display: none !important;
            }
            
            /* Ensure proper page breaks */
            .page-break {
              page-break-after: always;
            }
            
            .avoid-break {
              page-break-inside: avoid;
            }
          }
          
          /* Screen preview styles */
          @media screen {
            body {
              padding: 20px;
              background: #f5f5f5;
            }
            
            #print-content {
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              margin: 0 auto;
              max-width: 210mm;
            }
          }
        </style>
      </head>
      <body>
        <div id="print-content">
          ${clonedElement.outerHTML}
        </div>
        <script>
          // Wait for content to load, then trigger print
          window.onload = function() {
            // Remove any remaining height constraints after styles load
            setTimeout(function() {
              const printContent = document.getElementById('print-content');
              if (printContent) {
                // Force remove all height constraints
                printContent.style.maxHeight = 'none';
                printContent.style.height = 'auto';
                printContent.style.overflow = 'visible';
                printContent.style.overflowY = 'visible';
                
                // Remove from all children
                const allElements = printContent.querySelectorAll('*');
                allElements.forEach(function(el) {
                  const htmlEl = el;
                  htmlEl.style.maxHeight = 'none';
                  htmlEl.style.height = 'auto';
                  htmlEl.style.overflow = 'visible';
                  htmlEl.style.overflowY = 'visible';
                });
                
                // Log content height for debugging
                console.log('Print content full height:', printContent.scrollHeight, 'px');
                console.log('Print content visible height:', printContent.clientHeight, 'px');
              }
              
              // Additional delay to ensure all styles are applied and content is rendered
              setTimeout(function() {
                window.print();
              }, 200);
            }, 300);
          };
          
          // Close window after printing (if supported)
          window.onafterprint = function() {
            setTimeout(function() {
              window.close();
            }, 100);
          };
        </script>
      </body>
    </html>
  `

  // Write the HTML to the print window
  printWindow.document.open()
  printWindow.document.write(printHTML)
  printWindow.document.close()
  
  // Focus the window (helps with some browsers)
  printWindow.focus()
}

/**
 * Generate PDF from HTML element using html2canvas for pixel-perfect rendering
 * This ensures the PDF matches the on-screen preview exactly
 * Removes debug info and ensures clean export
 */
export async function generatePDFFromElement(
  element: HTMLElement,
  filename: string = "CV.pdf"
): Promise<void> {
  try {
    // The element passed should be the CV component itself (with shadow-lg and rounded-lg)
    // This ensures we capture exactly what's shown in the preview without extra padding
    const cvComponent = element
    
    // Ensure we have a valid element
    if (!cvComponent || !(cvComponent instanceof HTMLElement)) {
      throw new Error("Invalid CV component element for PDF generation")
    }
    
    // Wait for images to load
    const images = cvComponent.querySelectorAll("img")
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(null)
            } else {
              img.onload = () => resolve(null)
              img.onerror = () => resolve(null) // Continue even if image fails
            }
          })
      )
    )

    // Wait a bit for any dynamic content to render and ensure layout is stable
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Scroll the component into view to ensure it's fully rendered
    cvComponent.scrollIntoView({ behavior: "instant", block: "start" })
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Get the bounding rectangle for accurate dimensions
    const rect = cvComponent.getBoundingClientRect()
    
    // CRITICAL: Store all original styles before modifications
    const originalStyles = {
      width: cvComponent.style.width,
      maxWidth: cvComponent.style.maxWidth,
      maxHeight: cvComponent.style.maxHeight,
      height: cvComponent.style.height,
      overflow: cvComponent.style.overflow,
      overflowY: cvComponent.style.overflowY,
      overflowX: cvComponent.style.overflowX,
      position: cvComponent.style.position,
    }
    
    // Also check parent containers for max-height constraints and remove them
    const parentElementsToRestore: Array<{ 
      element: HTMLElement
      styles: { maxHeight: string; overflow: string; overflowY: string; height: string; position: string }
    }> = []
    
    // Remove constraints from ALL parent elements up to body
    let parentElement = cvComponent.parentElement
    while (parentElement && parentElement !== document.body) {
      const parentEl = parentElement as HTMLElement
      const parentStyle = window.getComputedStyle(parentEl)
      
      // Store original styles
      const originalParentStyles = {
        maxHeight: parentEl.style.maxHeight || '',
        overflow: parentEl.style.overflow || '',
        overflowY: parentEl.style.overflowY || '',
        height: parentEl.style.height || '',
        position: parentEl.style.position || '',
      }
      
      // Check if this parent has constraints that need removal
      const hasMaxHeight = parentStyle.maxHeight && parentStyle.maxHeight !== 'none'
      const hasOverflow = parentStyle.overflow === 'hidden' || parentStyle.overflow === 'auto' || parentStyle.overflow === 'scroll'
      const hasOverflowY = parentStyle.overflowY === 'hidden' || parentStyle.overflowY === 'auto' || parentStyle.overflowY === 'scroll'
      
      if (hasMaxHeight || hasOverflow || hasOverflowY) {
        parentElementsToRestore.push({
          element: parentEl,
          styles: originalParentStyles
        })
        
        // Remove ALL constraints
        parentEl.style.maxHeight = 'none'
        parentEl.style.height = 'auto'
        parentEl.style.overflow = 'visible'
        parentEl.style.overflowY = 'visible'
        parentEl.style.overflowX = 'visible'
        // Ensure parent doesn't clip content
        if (parentStyle.position === 'relative' || parentStyle.position === 'absolute') {
          parentEl.style.position = 'static'
        }
      }
      
      parentElement = parentElement.parentElement
    }
    
    // Now remove constraints from the CV component itself
    cvComponent.style.maxHeight = 'none'
    cvComponent.style.height = 'auto'
    cvComponent.style.overflow = 'visible'
    cvComponent.style.overflowY = 'visible'
    cvComponent.style.overflowX = 'visible'
    // Ensure width is preserved but not constrained
    if (!cvComponent.style.width) {
      const computedWidth = window.getComputedStyle(cvComponent).width
      cvComponent.style.width = computedWidth
    }
    cvComponent.style.maxWidth = 'none'
    
    // Force multiple reflows to ensure layout is fully updated
    await new Promise((resolve) => setTimeout(resolve, 300))
    cvComponent.offsetHeight // Force reflow
    await new Promise((resolve) => setTimeout(resolve, 200))
    
    // CRITICAL: Recalculate dimensions after removing ALL constraints
    // Use scrollHeight to get the FULL content height, not just visible
    const fullComponentWidth = cvComponent.scrollWidth || cvComponent.offsetWidth || cvComponent.clientWidth || rect.width
    let fullComponentHeight = cvComponent.scrollHeight || cvComponent.offsetHeight || cvComponent.clientHeight || rect.height
    
    // Double-check by finding the actual bottom-most element
    const allChildren = cvComponent.querySelectorAll('*')
    let maxBottom = 0
    const componentRect = cvComponent.getBoundingClientRect()
    
    allChildren.forEach((child) => {
      const el = child as HTMLElement
      if (el.offsetParent !== null) { // Only visible elements
        const childRect = el.getBoundingClientRect()
        // Calculate position relative to component top
        const relativeTop = childRect.top - componentRect.top + cvComponent.scrollTop
        const relativeBottom = relativeTop + childRect.height
        maxBottom = Math.max(maxBottom, relativeBottom)
      }
    })
    
    // Also check the component's own bottom
    const componentBottom = componentRect.height + cvComponent.scrollTop
    
    // Use the maximum of all calculations to ensure we capture everything
    fullComponentHeight = Math.max(fullComponentHeight, maxBottom, componentBottom)
    
    // Ensure we have valid dimensions
    if (fullComponentWidth === 0 || fullComponentHeight === 0) {
      throw new Error("CV component has no dimensions. Please ensure the preview is visible.")
    }
    
    console.log(`Component dimensions after removing constraints:`)
    console.log(`  Width: ${fullComponentWidth}px`)
    console.log(`  Height: ${fullComponentHeight}px (scrollHeight: ${cvComponent.scrollHeight}px, maxBottom: ${maxBottom}px)`)

    // Get computed styles to check for any padding/margins
    const computedStyle = window.getComputedStyle(cvComponent)
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0
    const marginLeft = parseFloat(computedStyle.marginLeft) || 0
    const marginRight = parseFloat(computedStyle.marginRight) || 0
    
    // Get border widths if any
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0
    const borderRight = parseFloat(computedStyle.borderRightWidth) || 0
    
    // Calculate actual content width (excluding padding/margins/borders)
    const actualContentWidth = fullComponentWidth - paddingLeft - paddingRight - marginLeft - marginRight - borderLeft - borderRight
    
    console.log(`Component dimensions: ${fullComponentWidth}x${fullComponentHeight}px`)
    console.log(`Padding: ${paddingLeft}px left, ${paddingRight}px right`)
    console.log(`Margins: ${marginLeft}px left, ${marginRight}px right`)
    console.log(`Borders: ${borderLeft}px left, ${borderRight}px right`)
    console.log(`Actual content width: ${actualContentWidth}px`)

    // CRITICAL: Ensure element is scrolled to top before capture
    cvComponent.scrollTop = 0
    await new Promise((resolve) => setTimeout(resolve, 150))
    
    // CRITICAL: html2canvas has browser limits (typically 32,767px per dimension at scale 2)
    // For very long CVs, we need to capture in chunks and stitch together
    const maxCanvasHeightPx = 30000 // Safe limit below browser max (32,767px at scale 2)
    const scale = 2
    const maxElementHeightPx = Math.floor(maxCanvasHeightPx / scale) // Divide by scale to get actual element height
    const needsChunking = fullComponentHeight > maxElementHeightPx
    
    let canvas: HTMLCanvasElement
    
    if (needsChunking) {
      console.log(`⚠️ CV is very long (${fullComponentHeight}px). Capturing in chunks to avoid browser limits...`)
      console.log(`Max element height per chunk: ${maxElementHeightPx}px`)
      
      // Calculate number of chunks needed with small overlap to avoid gaps
      const overlapPx = 100 // Overlap to ensure no gaps between chunks
      const chunkHeight = maxElementHeightPx - overlapPx
      const numChunks = Math.ceil(fullComponentHeight / chunkHeight)
      console.log(`Will capture in ${numChunks} chunks of ~${chunkHeight}px each (with ${overlapPx}px overlap)`)
      
      // Create a master canvas to combine all chunks
      const masterCanvas = document.createElement("canvas")
      masterCanvas.width = fullComponentWidth * scale
      masterCanvas.height = fullComponentHeight * scale
      const masterCtx = masterCanvas.getContext("2d")
      
      if (!masterCtx) {
        throw new Error("Failed to create master canvas context")
      }
      
      // Fill with white background
      masterCtx.fillStyle = "#ffffff"
      masterCtx.fillRect(0, 0, masterCanvas.width, masterCanvas.height)
      
      // Capture each chunk by temporarily positioning the element
      for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
        const chunkStartY = chunkIndex * chunkHeight
        const chunkEndY = Math.min(chunkStartY + maxElementHeightPx, fullComponentHeight)
        const actualChunkHeight = chunkEndY - chunkStartY
        
        console.log(`Capturing chunk ${chunkIndex + 1}/${numChunks}: y=${chunkStartY}px to ${chunkEndY}px (${actualChunkHeight}px tall)`)
        
        // Temporarily adjust the element's position to show the chunk
        const originalTransform = cvComponent.style.transform
        const originalPosition = cvComponent.style.position
        const originalTop = cvComponent.style.top
        
        // Use transform to shift the element up so the chunk is visible
        cvComponent.style.position = 'relative'
        cvComponent.style.transform = `translateY(-${chunkStartY}px)`
        
        await new Promise((resolve) => setTimeout(resolve, 200)) // Wait for transform
        
        // Capture this chunk - html2canvas will capture what's visible
        const chunkCanvas = await html2canvas(cvComponent, {
          scale: scale,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: fullComponentWidth,
          height: Math.min(maxElementHeightPx, fullComponentHeight - chunkStartY),
          windowWidth: fullComponentWidth,
          windowHeight: Math.min(maxElementHeightPx, fullComponentHeight - chunkStartY),
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          allowTaint: false,
          foreignObjectRendering: false,
          removeContainer: false,
          onclone: (clonedDoc, element) => {
            const clonedElement = element as HTMLElement
            if (clonedElement) {
              clonedElement.style.margin = '0'
              clonedElement.style.padding = '0'
              clonedElement.style.maxWidth = 'none'
              clonedElement.style.maxHeight = 'none'
              clonedElement.style.width = '100%'
              clonedElement.style.overflow = 'visible'
              clonedElement.style.boxSizing = 'border-box'
            }
          },
        })
        
        // Restore original transform
        cvComponent.style.transform = originalTransform
        cvComponent.style.position = originalPosition
        cvComponent.style.top = originalTop
        
        // Draw this chunk onto the master canvas at the correct position
        const destY = chunkStartY * scale
        const sourceHeight = Math.min(chunkCanvas.height, (fullComponentHeight - chunkStartY) * scale)
        masterCtx.drawImage(chunkCanvas, 0, 0, chunkCanvas.width, sourceHeight, 0, destY, chunkCanvas.width, sourceHeight)
        
        console.log(`✓ Chunk ${chunkIndex + 1} captured (${chunkCanvas.width}x${chunkCanvas.height}px) and added to master canvas at y=${destY}px`)
      }
      
      canvas = masterCanvas
      console.log(`✓ All ${numChunks} chunks captured. Master canvas: ${canvas.width}x${canvas.height}px`)
    } else {
      // Normal capture for shorter CVs - CRITICAL: Don't constrain height/width
      console.log(`CV height (${fullComponentHeight}px) is within limits. Capturing in single pass...`)
      
      // Ensure element is at top before capture
      cvComponent.scrollTop = 0
      await new Promise((resolve) => setTimeout(resolve, 100))
      
      canvas = await html2canvas(cvComponent, {
        scale: scale, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        logging: false, // Disable console logging
        backgroundColor: "#ffffff",
        // CRITICAL: Don't specify width/height constraints - let html2canvas capture full content
        // width: fullComponentWidth,
        // height: fullComponentHeight,
        // windowWidth: fullComponentWidth,
        // windowHeight: fullComponentHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0, // Start from top
        allowTaint: false,
        foreignObjectRendering: false, // Disable for better compatibility
        removeContainer: false, // Keep container to maintain layout
      onclone: (clonedDoc, element) => {
        // CRITICAL: Remove ALL height and overflow constraints from cloned element and all parents
        const clonedElement = element as HTMLElement
        if (clonedElement) {
          // Remove all height constraints
          clonedElement.style.maxHeight = 'none'
          clonedElement.style.height = 'auto'
          clonedElement.style.overflow = 'visible'
          clonedElement.style.overflowY = 'visible'
          clonedElement.style.overflowX = 'visible'
          clonedElement.style.maxWidth = 'none'
          clonedElement.style.boxSizing = 'border-box'
        }
        
        // Remove constraints from ALL parent elements in the cloned document
        let parent = clonedElement?.parentElement
        while (parent && parent !== clonedDoc.body) {
          const parentEl = parent as HTMLElement
          parentEl.style.maxHeight = 'none'
          parentEl.style.height = 'auto'
          parentEl.style.overflow = 'visible'
          parentEl.style.overflowY = 'visible'
          parentEl.style.overflowX = 'visible'
          parent = parent.parentElement
        }
        
        // Also remove constraints from all descendants to ensure full content is visible
        const allDescendants = clonedElement?.querySelectorAll('*') || []
        allDescendants.forEach((child) => {
          const el = child as HTMLElement
          if (el) {
            // Remove overflow constraints that might clip content
            // Use the cloned document's window for computed styles
            try {
              const clonedWindow = clonedDoc.defaultView || (clonedDoc as any).parentWindow
              if (clonedWindow) {
                const computed = clonedWindow.getComputedStyle(el)
                if (computed.maxHeight && computed.maxHeight !== 'none') {
                  el.style.maxHeight = 'none'
                }
                if (computed.overflow === 'hidden' || computed.overflow === 'auto' || computed.overflow === 'scroll') {
                  el.style.overflow = 'visible'
                }
                if (computed.overflowY === 'hidden' || computed.overflowY === 'auto' || computed.overflowY === 'scroll') {
                  el.style.overflowY = 'visible'
                }
              } else {
                // Fallback: just remove common constraint styles
                el.style.maxHeight = 'none'
                if (el.style.overflow && el.style.overflow !== 'visible') {
                  el.style.overflow = 'visible'
                }
                if (el.style.overflowY && el.style.overflowY !== 'visible') {
                  el.style.overflowY = 'visible'
                }
              }
            } catch (e) {
              // If we can't access computed styles, just remove inline styles
              el.style.maxHeight = 'none'
              el.style.overflow = 'visible'
              el.style.overflowY = 'visible'
            }
          }
        })
      },
      ignoreElements: (element) => {
        // Ignore any debug elements or unnecessary wrappers
        return element.classList?.contains('debug') || false
      },
      })
    }

    // Restore original styles
    cvComponent.style.width = originalStyles.width
    cvComponent.style.maxWidth = originalStyles.maxWidth
    cvComponent.style.maxHeight = originalStyles.maxHeight
    cvComponent.style.height = originalStyles.height
    cvComponent.style.overflow = originalStyles.overflow
    cvComponent.style.overflowY = originalStyles.overflowY
    cvComponent.style.overflowX = originalStyles.overflowX
    cvComponent.style.position = originalStyles.position
    
    // Restore parent container styles
    parentElementsToRestore.forEach(({ element, styles }) => {
      element.style.maxHeight = styles.maxHeight
      element.style.overflow = styles.overflow
      element.style.overflowY = styles.overflowY
      element.style.height = styles.height
      element.style.position = styles.position
    })

    // Validate canvas was created successfully
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Failed to capture CV content as canvas")
    }
    
    console.log(`Canvas captured: ${canvas.width}x${canvas.height}px`)
    console.log(`Expected height: ${fullComponentHeight}px (at scale 2: ${fullComponentHeight * 2}px)`)
    
    // CRITICAL: Verify canvas captured full height
    // html2canvas might limit canvas size, so we need to check
    const expectedCanvasHeight = fullComponentHeight * scale
    const heightDifference = Math.abs(canvas.height - expectedCanvasHeight)
    const heightDifferencePercent = (heightDifference / expectedCanvasHeight) * 100
    
    if (heightDifferencePercent > 5) { // More than 5% difference
      console.warn(`⚠️ Canvas height mismatch! Expected: ${expectedCanvasHeight}px, Got: ${canvas.height}px (${heightDifferencePercent.toFixed(1)}% difference)`)
      console.warn(`This might indicate content was cut off. Canvas may have hit browser limits.`)
      
      // Try to get actual content height from the captured canvas
      // Check if there's actual content at the bottom
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Sample bottom 100px of canvas to see if there's content
        const bottomSample = ctx.getImageData(0, Math.max(0, canvas.height - 100), canvas.width, Math.min(100, canvas.height))
        const bottomData = bottomSample.data
        let hasBottomContent = false
        for (let i = 0; i < bottomData.length; i += 4) {
          const r = bottomData[i]
          const g = bottomData[i + 1]
          const b = bottomData[i + 2]
          if (r < 250 || g < 250 || b < 250) {
            hasBottomContent = true
            break
          }
        }
        
        if (!hasBottomContent && canvas.height < expectedCanvasHeight) {
          console.error(`❌ Canvas appears to be cut off! Bottom section is blank.`)
          console.error(`Canvas height: ${canvas.height}px, Expected: ${expectedCanvasHeight}px`)
          throw new Error(`PDF generation failed: Content was cut off. Canvas height (${canvas.height}px) is less than expected (${expectedCanvasHeight}px). This may be due to browser canvas size limits.`)
        }
      }
    } else {
      console.log(`✓ Canvas height matches expected height (difference: ${heightDifferencePercent.toFixed(1)}%)`)
    }

    // Check if canvas has content (not just blank/white)
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height))
      const data = imageData.data
      let hasContent = false
      
      // Check if there are any non-white pixels in a sample
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        // If pixel is not white (or very close to white), we have content
        if (r < 250 || g < 250 || b < 250) {
          hasContent = true
          break
        }
      }
      
      if (!hasContent) {
        console.warn("Canvas appears to be blank. This might indicate the CV component is not visible.")
      }
    }

    // Calculate PDF dimensions (A4 size in mm)
    const pdfWidth = 210 // A4 width in mm (standard)
    const pdfHeight = 297 // A4 height in mm
    
    // Use full A4 width - no margins to match preview exactly
    console.log(`PDF Page: ${pdfWidth}x${pdfHeight}mm (full width, no margins)`)
    console.log(`Component width (with padding): ${fullComponentWidth}px`)
    console.log(`Actual content width (without padding): ${actualContentWidth}px`)
    
    // Calculate how the canvas should be scaled to fit A4 width exactly
    // Convert canvas pixels to mm (scale: 2 means 192 DPI)
    const baseDPI = 96
    const actualDPI = baseDPI * scale
    const pixelsPerMM = actualDPI / 25.4 // 25.4mm per inch
    
    // Note: We'll crop the canvas to remove padding before converting to image
    // This ensures the content fills the full 210mm width

    // Create PDF with proper metadata
    // Margins will be handled manually for precise control
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true, // Enable compression for smaller file size
    })
    
    // Set margins (jsPDF default margins are ~20mm, we'll override with our positioning)
    // We'll position content manually to have exact control

    // Set PDF metadata (optional, but professional)
    pdf.setProperties({
      title: filename.replace('.pdf', ''),
      subject: "Curriculum Vitae",
      author: "ARMS CV Generator",
      creator: "ARMS System",
    })

    // CRITICAL FIX: Crop the canvas to remove padding before converting to image
    // Calculate padding in canvas pixels (at scale 2)
    const paddingLeftPx = paddingLeft * scale
    const paddingRightPx = paddingRight * scale
    const marginLeftPx = marginLeft * scale
    const marginRightPx = marginRight * scale
    const borderLeftPx = borderLeft * scale
    const borderRightPx = borderRight * scale
    
    // Calculate the content area in the canvas (excluding padding/margins/borders)
    const contentStartX = paddingLeftPx + marginLeftPx + borderLeftPx
    const contentWidthPx = canvas.width - contentStartX - (paddingRightPx + marginRightPx + borderRightPx)
    const contentHeightPx = canvas.height
    
    console.log(`Canvas padding: ${paddingLeftPx}px left, ${paddingRightPx}px right`)
    console.log(`Content area in canvas: x=${contentStartX}px, width=${contentWidthPx}px`)
    
    // Create a new canvas with only the content (no padding)
    const croppedCanvas = document.createElement("canvas")
    croppedCanvas.width = contentWidthPx
    croppedCanvas.height = contentHeightPx
    const croppedCtx = croppedCanvas.getContext("2d")
    
    if (!croppedCtx) {
      throw new Error("Failed to get canvas context for cropping")
    }
    
    // Draw only the content portion (crop out padding)
    croppedCtx.drawImage(
      canvas,
      contentStartX, // source X (skip padding)
      0, // source Y
      contentWidthPx, // source width (content only)
      contentHeightPx, // source height
      0, // dest X
      0, // dest Y
      contentWidthPx, // dest width
      contentHeightPx // dest height
    )
    
    // Convert cropped canvas to image data with high quality
    const imgData = croppedCanvas.toDataURL("image/png", 1.0)
    
    // Recalculate dimensions using the cropped canvas (content only, no padding)
    const croppedCanvasWidthMM = contentWidthPx / pixelsPerMM
    const croppedCanvasHeightMM = contentHeightPx / pixelsPerMM
    
    // Scale to fit full A4 width exactly (210mm) - no margins
    // Now we're scaling content-only canvas, so it will fill 210mm perfectly
    const scaleFactor = pdfWidth / croppedCanvasWidthMM
    const imgWidth = pdfWidth // Always use full PDF width (210mm)
    const imgHeight = croppedCanvasHeightMM * scaleFactor // Scale height proportionally
    
    console.log(`Cropped canvas: ${contentWidthPx}x${contentHeightPx}px`)
    console.log(`Cropped canvas size: ${croppedCanvasWidthMM.toFixed(2)}x${croppedCanvasHeightMM.toFixed(2)}mm`)
    console.log(`Scaled Image: ${imgWidth}x${imgHeight.toFixed(2)}mm (fills full ${pdfWidth}mm width)`)
    console.log(`Scale factor: ${scaleFactor.toFixed(3)}`)
    console.log(`✓ Content will fill entire PDF page width (${pdfWidth}mm) with no padding`)

    // Calculate how many pages we need based on content height
    const totalPages = Math.ceil(imgHeight / pdfHeight)
    
    console.log(`Total content height: ${imgHeight.toFixed(2)}mm, Pages needed: ${totalPages}`)

    // Add image to PDF with proper pagination - full width, no margins
    if (totalPages === 1) {
      // Single page - fill entire width (210mm)
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST")
      console.log(`✓ Added single page: ${imgWidth}mm width x ${imgHeight.toFixed(2)}mm height at (0, 0)`)
    } else {
      // Multiple pages - split the cropped canvas into page-sized chunks
      // Calculate pixels per mm based on the scaled dimensions
      const pixelsPerMM = croppedCanvas.height / imgHeight
      const pixelsPerPage = Math.ceil(pdfHeight * pixelsPerMM)
      
      console.log(`Pixels per mm: ${pixelsPerMM.toFixed(2)}, Pixels per page: ${pixelsPerPage}`)

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage()
        }

        // Calculate source rectangle in pixels (from cropped canvas)
        const sourceY = page * pixelsPerPage
        const sourceHeight = Math.min(pixelsPerPage, croppedCanvas.height - sourceY)
        
        // Calculate destination height in mm (maintain aspect ratio)
        // For pages after the first, account for the portion already shown
        const remainingHeight = imgHeight - (page * pdfHeight)
        const destHeight = Math.min(pdfHeight, remainingHeight)
        
        console.log(`Page ${page + 1}: sourceY=${sourceY}px, sourceHeight=${sourceHeight}px, destHeight=${destHeight.toFixed(2)}mm`)

        // Create a temporary canvas for this page section
        const pageCanvas = document.createElement("canvas")
        pageCanvas.width = croppedCanvas.width // Use cropped width (content only)
        pageCanvas.height = sourceHeight
        const pageCtx = pageCanvas.getContext("2d")

        if (!pageCtx) {
          throw new Error("Failed to get canvas context for page splitting")
        }

        // Draw the section of the cropped canvas to the page canvas
        pageCtx.drawImage(
          croppedCanvas,
          0, // source X (start from left edge - already cropped)
          sourceY, // source Y
          croppedCanvas.width, // source width (content width, no padding)
          sourceHeight, // source height
          0, // dest X (start from left edge)
          0, // dest Y
          croppedCanvas.width, // dest width (content width)
          sourceHeight // dest height
        )

        // Convert page canvas to image
        const pageImgData = pageCanvas.toDataURL("image/png", 1.0)

        // Add this page section to PDF - full width (210mm), no margins
        pdf.addImage(pageImgData, "PNG", 0, 0, imgWidth, destHeight, undefined, "FAST")
        console.log(`✓ Added page ${page + 1}/${totalPages}: ${imgWidth}mm width x ${destHeight.toFixed(2)}mm height at (0, 0)`)
      }
    }

    // Save the PDF
    pdf.save(filename)
  } catch (error) {
    console.error("PDF generation error:", error)
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

