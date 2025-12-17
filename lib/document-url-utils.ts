/**
 * Utilities for handling document URLs
 * Converts local document URLs to API routes for production compatibility
 * Handles S3 virtual paths with presigned URLs
 */

/**
 * Check if a URL is a local uploaded document (starts with /uploaded-document/)
 */
export function isLocalDocumentUrl(url: string | undefined | null | string[]): boolean {
  if (!url) return false
  
  // Handle array case - take first element
  if (Array.isArray(url)) {
    url = url[0]
    if (!url) return false
  }
  
  // Ensure url is a string
  if (typeof url !== 'string') {
    return false
  }
  
  return url.startsWith("/uploaded-document/")
}

/**
 * Check if a URL is an S3 virtual path (starts with upload/)
 */
export function isS3VirtualPath(url: string | undefined | null | string[]): boolean {
  if (!url) return false
  
  // Handle array case - take first element
  if (Array.isArray(url)) {
    url = url[0]
    if (!url) return false
  }
  
  // Ensure url is a string
  if (typeof url !== 'string') {
    return false
  }
  
  return url.startsWith("upload/")
}

/**
 * Convert local document URL to API route
 * This ensures documents are accessible in production builds
 * 
 * @param url - The document URL (e.g., "/uploaded-document/document_123.pdf")
 * @returns API route URL (e.g., "/api/shared/local-document-upload?fileName=document_123.pdf")
 */
export function getDocumentApiUrl(url: string | undefined | null | string[]): string | undefined {
  if (!url) return undefined
  
  // Handle array case - take first element
  if (Array.isArray(url)) {
    url = url[0]
    if (!url) return undefined
  }
  
  // Ensure url is a string
  if (typeof url !== 'string') {
    return undefined
  }
  
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
 * Convert S3 virtual path to presigned URL via API
 */
export async function getS3PresignedUrl(virtualPath: string): Promise<string | undefined> {
  try {
    const response = await fetch('/api/s3/get-signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ virtualPath }),
    })
    
    if (!response.ok) {
      console.error('Failed to get presigned URL:', response.statusText)
      return undefined
    }
    
    const data = await response.json()
    return data.success ? data.url : undefined
  } catch (error) {
    console.error('Error getting presigned URL:', error)
    return undefined
  }
}

/**
 * Get the display URL for a document (synchronous version)
 * Uses API route for local documents, original URL for others
 * Note: For S3 paths, use getDocumentDisplayUrlAsync instead
 */
export function getDocumentDisplayUrl(url: string | undefined | null | string[]): string | undefined {
  return getDocumentApiUrl(url)
}

/**
 * Get the display URL for a document (async version)
 * Handles local documents, S3 paths with presigned URLs, and external URLs
 */
export async function getDocumentDisplayUrlAsync(
  url: string | undefined | null | string[]
): Promise<string | undefined> {
  if (!url) return undefined
  
  // Handle array case - take first element
  if (Array.isArray(url)) {
    url = url[0]
    if (!url) return undefined
  }
  
  // Ensure url is a string
  if (typeof url !== 'string') {
    return undefined
  }
  
  // If it's an S3 virtual path, get presigned URL
  if (isS3VirtualPath(url)) {
    return await getS3PresignedUrl(url)
  }
  
  // Otherwise use existing logic for local/external URLs
  return getDocumentApiUrl(url)
}

