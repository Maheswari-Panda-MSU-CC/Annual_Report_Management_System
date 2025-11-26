/**
 * Utilities for validating PDF files
 * Validates that PDFs contain exactly 1 page
 */

/**
 * Validate PDF has exactly 1 page using PDF.js
 */
export async function validatePdfPageCount(file: File): Promise<{ isValid: boolean; pageCount: number; error?: string }> {
  try {
    // Dynamic import of pdfjs-dist to reduce bundle size
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set worker source - use CDN (more reliable for client-side)
    const version = pdfjsLib.version || '5.4.296'
    
    // Try primary CDN first
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`
    } catch {
      // Fallback to alternative CDN if primary fails
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`
    }
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Add timeout to prevent hanging (10 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PDF validation timeout - please try again')), 10000)
    })
    
    // Load PDF document with timeout
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0,
      // Add error handler
    })
    
    const pdf = await Promise.race([
      loadingTask.promise,
      timeoutPromise
    ]) as any
    
    // Get page count
    const pageCount = pdf.numPages
    
    // STRICT VALIDATION: Block any PDF that is NOT exactly 1 page
    // Ensure pageCount is a valid number
    if (typeof pageCount !== 'number' || isNaN(pageCount) || pageCount < 1) {
      return {
        isValid: false,
        pageCount: 0,
        error: 'Unable to determine PDF page count. Please ensure your PDF is valid and contains exactly 1 page.'
      }
    }
    
    if (pageCount === 1) {
      return { isValid: true, pageCount: 1 }
    } else {
      // Multi-page PDFs are ALWAYS blocked, regardless of size
      return { 
        isValid: false, 
        pageCount, 
        error: `PDF must contain exactly 1 page. Your PDF has ${pageCount} page(s). Please split your PDF into single-page files or use a different document.` 
      }
    }
  } catch (error: any) {
    // If PDF parsing fails, return detailed error
    const errorMessage = String(error?.message || error?.toString() || 'Unknown error').toLowerCase()
    const errorName = String(error?.name || '').toLowerCase()
    
    // Check if it's a timeout or network error (library issue, not PDF issue)
    // These errors indicate the library failed to load/run, not that the PDF is invalid
    const isLibraryError = 
      errorMessage.includes('timeout') || 
      errorMessage.includes('failed to fetch') || 
      errorMessage.includes('network') ||
      errorMessage.includes('worker') ||
      errorMessage.includes('loading') ||
      errorMessage.includes('unexpected server response') ||
      errorMessage.includes('cors') ||
      errorMessage.includes('cross-origin') ||
      errorMessage.includes('refused to connect') ||
      errorMessage.includes('net::') ||
      errorName.includes('network') ||
      errorName.includes('timeout') ||
      errorName.includes('abort')
    
    if (isLibraryError) {
      // If it's a library/network issue, allow the PDF but log warning
      // This is graceful degradation - we can't validate but file might be fine
      // NOTE: Backend should also validate PDF page count as a safety measure
      console.warn('[PDF Validation] Library/network error (allowing upload - backend will validate):', errorMessage)
      return { isValid: true, pageCount: 0, error: undefined }
    }
    
    // Provide user-friendly error messages for actual PDF issues
    if (errorMessage.includes('Invalid PDF') || 
        errorMessage.includes('corrupted') ||
        errorMessage.includes('Malformed') ||
        errorMessage.includes('PDF header')) {
      return { 
        isValid: false, 
        pageCount: 0, 
        error: 'Invalid or corrupted PDF file. Please ensure your PDF is valid and contains exactly 1 page.' 
      }
    }
    
    if (errorMessage.includes('password') || 
        errorMessage.includes('encrypted') ||
        errorMessage.includes('password-protected')) {
      return { 
        isValid: false, 
        pageCount: 0, 
        error: 'PDF is password-protected or encrypted. Please use an unencrypted PDF with exactly 1 page.' 
      }
    }
    
    // For other unexpected errors, log and allow (graceful degradation)
    // This prevents blocking valid PDFs due to library issues
    console.warn('PDF validation unexpected error (allowing upload):', errorMessage)
    return { isValid: true, pageCount: 0, error: undefined }
  }
}

