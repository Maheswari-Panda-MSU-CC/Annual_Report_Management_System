/**
 * Utilities for handling document URLs
 * Converts local document URLs to API routes for production compatibility
 */

/**
 * Check if a URL is a local uploaded document (starts with /uploaded-document/)
 */
export function isLocalDocumentUrl(url: string | undefined | null): boolean {
  if (!url) return false
  return url.startsWith("/uploaded-document/")
}

/**
 * Convert local document URL to API route
 * This ensures documents are accessible in production builds
 * 
 * @param url - The document URL (e.g., "/uploaded-document/document_123.pdf")
 * @returns API route URL (e.g., "/api/shared/local-document-upload?fileName=document_123.pdf")
 */
export function getDocumentApiUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  
  // If it's already an API URL or external URL, return as is
  if (url.startsWith("/api/") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url
  }
  
  // If it's a local document URL, convert to API route
  if (isLocalDocumentUrl(url)) {
    const fileName = url.split("/").pop()
    if (fileName) {
      return `/api/shared/local-document-upload?fileName=${encodeURIComponent(fileName)}`
    }
  }
  
  // Return as is for other cases (relative paths, etc.)
  return url
}

/**
 * Get the display URL for a document
 * Uses API route for local documents, original URL for others
 */
export function getDocumentDisplayUrl(url: string | undefined | null): string | undefined {
  return getDocumentApiUrl(url)
}

