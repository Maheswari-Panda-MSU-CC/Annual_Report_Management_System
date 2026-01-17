// Utility function to format date to dd-mm-yyyy for display
export const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return "N/A"
  }
}

// Utility function to format date for HTML date input (YYYY-MM-DD)
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    return date.toISOString().split('T')[0]
  } catch {
    return ""
  }
}

// Helper function to display N/A for empty/null/undefined values
export const displayValue = (value: any, fallback: string = "N/A"): string => {
  if (value === null || value === undefined || value === "") return fallback
  return String(value)
}

// Enhanced helper function to handle old file deletion
export const handleOldFileDeletion = async (
  oldPath: string | null,
  newPath: string,
  recordId: number
) => {
  if (!oldPath || !oldPath.startsWith("upload/")) {
    return
  }

  if (oldPath === newPath) {
    console.log("Old and new file paths are identical - skipping deletion")
    return
  }

  const { deleteDocument, checkDocumentExists } = await import("@/lib/s3-upload-helper")

  try {
    const existsCheck = await checkDocumentExists(oldPath)
    
    if (!existsCheck.exists) {
      console.log(`Old file does not exist in S3: ${oldPath}`)
      return
    }

    console.log(`Attempting to delete old S3 file: ${oldPath}`)
    const deleteResult = await deleteDocument(oldPath)
    
    if (deleteResult.success) {
      console.log(`Successfully deleted old S3 file: ${oldPath}`)
    } else {
      console.warn(`Failed to delete old S3 file: ${oldPath}`, deleteResult.message)
    }
  } catch (deleteError: any) {
    console.warn("Error during old file deletion:", deleteError)
  }
}

