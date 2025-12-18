/**
 * Centralized constants for document upload validation
 * 
 * To modify allowed file types or size limits, update these constants only.
 * All components and API routes will automatically use these values.
 */

// Allowed file extensions (lowercase, without dot)
export const ALLOWED_DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg"] as const

// Allowed MIME types for server-side validation
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
] as const

// MIME type mapping for file extensions
export const DOCUMENT_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
}

// Maximum file size in bytes (1MB)
export const MAX_DOCUMENT_FILE_SIZE = 1 * 1024 * 1024 // 1MB

// Human-readable allowed file types for error messages
export const ALLOWED_FILE_TYPES_DISPLAY = "JPG, JPEG, and PDF"

// Error message for invalid file type
export const INVALID_FILE_TYPE_ERROR = `Invalid file type. Only ${ALLOWED_FILE_TYPES_DISPLAY} files are allowed.`

// Helper function to check if file extension is allowed
export function isAllowedFileExtension(extension: string): boolean {
  return ALLOWED_DOCUMENT_EXTENSIONS.includes(extension.toLowerCase() as any)
}

// Helper function to get MIME type from file extension
export function getDocumentMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""
  return DOCUMENT_MIME_TYPES[ext] || "application/octet-stream"
}

// Helper function to check if MIME type is allowed
export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType as any)
}

