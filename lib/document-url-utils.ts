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
    // Validate virtual path format before sending
    if (!virtualPath || !virtualPath.startsWith("upload/")) {
      console.error('Invalid virtual path format:', virtualPath)
      return undefined
    }

    const response = await fetch('/api/s3/get-signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ virtualPath }),
    })
    
    // Check if response has content before parsing
    const contentType = response.headers.get('content-type')
    const hasJsonContent = contentType && contentType.includes('application/json')
    
    if (!response.ok) {
      // Get the actual error message from the response body
      let errorMessage = response.statusText
      let errorData: any = null
      
      try {
        // Only try to parse if we have content and it's JSON
        if (hasJsonContent) {
          const text = await response.text()
          if (text && text.trim()) {
            errorData = JSON.parse(text)
            errorMessage = errorData?.message || errorData?.error || response.statusText
          } else {
            errorMessage = `Empty response body (Status: ${response.status})`
          }
        } else {
          const text = await response.text()
          errorMessage = text || response.statusText || `HTTP ${response.status}`
        }
      } catch (parseError: any) {
        console.error('Failed to parse error response:', parseError)
        errorMessage = `Failed to parse error response: ${parseError?.message || 'Unknown error'}`
      }
      
      // Check if this is a "not found" error - these are expected during document updates
      // when old documents are deleted, so we log them as warnings instead of errors
      const isNotFoundError = 
        errorMessage?.toLowerCase().includes('not found') ||
        errorMessage?.toLowerCase().includes('object not found') ||
        response.status === 404 ||
        (errorData?.message && errorData.message.toLowerCase().includes('not found'))
      
      if (isNotFoundError) {
        // Log as warning for "not found" errors (expected during updates)
        console.warn('Document not found in S3 (this may be expected during updates):', {
          status: response.status,
          message: errorMessage,
          virtualPath: virtualPath
        })
      } else {
        // Log as error for other failures
        console.error('Failed to get presigned URL:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          virtualPath: virtualPath,
          errorData: errorData,
          contentType: contentType
        })
      }
      return undefined
    }
    
    // Parse successful response
    let data: any
    try {
      const text = await response.text()
      if (!text || !text.trim()) {
        console.error('Empty response body from presigned URL API:', {
          status: response.status,
          virtualPath: virtualPath
        })
        return undefined
      }
      data = JSON.parse(text)
    } catch (parseError: any) {
      console.error('Failed to parse presigned URL response:', {
        error: parseError?.message || 'Unknown parse error',
        virtualPath: virtualPath,
        status: response.status
      })
      return undefined
    }
    
    if (!data.success) {
      // Check if this is a "not found" error - log as warning instead of error
      const isNotFoundError = 
        data.message?.toLowerCase().includes('not found') ||
        data.message?.toLowerCase().includes('object not found')
      
      if (isNotFoundError) {
        console.warn('Document not found in S3 (this may be expected during updates):', {
          message: data.message,
          virtualPath: virtualPath
        })
      } else {
        console.error('Presigned URL request failed:', {
          message: data.message || 'Unknown error',
          virtualPath: virtualPath,
          data: data
        })
      }
      return undefined
    }
    
    if (!data.url) {
      console.error('Presigned URL response missing URL field:', {
        data: data,
        virtualPath: virtualPath
      })
      return undefined
    }
    
    return data.url
  } catch (error: any) {
    console.error('Error getting presigned URL:', {
      error: error?.message || error,
      errorType: error?.name,
      stack: error?.stack,
      virtualPath: virtualPath
    })
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

