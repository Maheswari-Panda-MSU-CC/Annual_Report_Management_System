import { useToast } from "@/components/ui/use-toast"
import { handleOldFileDeletion } from "../utils"

interface UseS3DocumentHandlerParams {
  deptId: number
  folderName: string
  originalDocUrl: string | null
  currentDocUrl: string | null | undefined
  recordId: number
}

interface UseS3DocumentHandlerForNewParams {
  deptId: number
  folderName: string
  currentDocUrl: string | null | undefined
}

export const useS3DocumentHandler = () => {
  const { toast } = useToast()

  const handleDocumentUpload = async ({
    deptId,
    folderName,
    originalDocUrl,
    currentDocUrl,
    recordId,
  }: UseS3DocumentHandlerParams): Promise<{ docUrl: string | null; wasUploaded: boolean }> => {
    let docUrl = originalDocUrl || currentDocUrl || null
    const oldDocPath = originalDocUrl
    let wasUploaded = false
    
    // Check if document has actually changed
    const isDocumentChanged = currentDocUrl && currentDocUrl !== originalDocUrl
    
    // Only upload to S3 if document is a new upload AND has changed
    if (currentDocUrl && currentDocUrl.startsWith("/uploaded-document/") && isDocumentChanged) {
      try {
        const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        // Upload new document to S3
        docUrl = await uploadDocumentToS3(
          currentDocUrl,
          deptId,
          recordId,
          folderName
        )
        
        // CRITICAL: Verify we got a valid S3 virtual path
        if (!docUrl || !docUrl.startsWith("upload/")) {
          throw new Error("S3 upload failed: Invalid virtual path returned. Please try uploading again.")
        }
        
        // Additional validation
        if (docUrl.includes("dummy_document") || docUrl.includes("localhost") || docUrl.includes("http://") || docUrl.includes("https://")) {
          throw new Error("S3 upload failed: Document was not uploaded successfully. Please try again.")
        }
        
        // Mark that upload actually happened
        wasUploaded = true
        
        // Delete old file if it exists and is different from new one
        if (oldDocPath && oldDocPath !== docUrl) {
          await handleOldFileDeletion(oldDocPath, docUrl, recordId)
        }
        
        toast({
          title: "Document Uploaded",
          description: "Document uploaded to S3 successfully",
          duration: 3000,
        })
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        toast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document to S3. Update will not be saved.",
          variant: "destructive",
        })
        throw docError
      }
    } else if (currentDocUrl && currentDocUrl.startsWith("upload/") && isDocumentChanged) {
      docUrl = currentDocUrl
      if (oldDocPath && oldDocPath !== docUrl) {
        await handleOldFileDeletion(oldDocPath, docUrl, recordId)
      }
      // Document path changed but no new upload happened (just path change)
      wasUploaded = false
    } else if (!isDocumentChanged) {
      // Document hasn't changed, use the existing S3 path
      docUrl = originalDocUrl || null
      wasUploaded = false
    } else if (!currentDocUrl || (!currentDocUrl.startsWith("/uploaded-document/") && !currentDocUrl.startsWith("upload/"))) {
      toast({
        title: "Invalid Document Path",
        description: "Document path format is invalid. Please upload the document again.",
        variant: "destructive",
      })
      throw new Error("Invalid document path")
    }
    
    // CRITICAL: Final validation before saving
    if (isDocumentChanged && (!docUrl || !docUrl.startsWith("upload/"))) {
      toast({
        title: "Validation Error",
        description: "Document validation failed. Update will not be saved.",
        variant: "destructive",
      })
      throw new Error("Document validation failed")
    }
    if (!isDocumentChanged && !docUrl) {
      toast({
        title: "Validation Error",
        description: "Document is required. Please upload a document.",
        variant: "destructive",
      })
      throw new Error("Document is required")
    }

    return { docUrl, wasUploaded }
  }

  const handleDocumentUploadForNew = async ({
    deptId,
    folderName,
    currentDocUrl,
  }: UseS3DocumentHandlerForNewParams): Promise<string | null> => {
    let docUrl: string | null = null
    
    if (currentDocUrl && currentDocUrl.startsWith("/uploaded-document/")) {
      try {
        const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        const tempRecordId = Date.now()
        
        // Upload new document to S3
        docUrl = await uploadDocumentToS3(
          currentDocUrl,
          deptId,
          tempRecordId,
          folderName
        )
        
        // CRITICAL: Verify we got a valid S3 virtual path
        if (!docUrl || !docUrl.startsWith("upload/")) {
          throw new Error("S3 upload failed: Invalid virtual path returned. Please try uploading again.")
        }
        
        // Additional validation
        if (docUrl.includes("dummy_document") || docUrl.includes("localhost") || docUrl.includes("http://") || docUrl.includes("https://")) {
          throw new Error("S3 upload failed: Document was not uploaded successfully. Please try again.")
        }
        
        toast({
          title: "Document Uploaded",
          description: "Document uploaded to S3 successfully",
          duration: 3000,
        })
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        toast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document to S3. Record will not be saved.",
          variant: "destructive",
        })
        throw docError
      }
    } else if (!currentDocUrl || (!currentDocUrl.startsWith("/uploaded-document/") && !currentDocUrl.startsWith("upload/"))) {
      toast({
        title: "Invalid Document Path",
        description: "Document path format is invalid. Please upload the document again.",
        variant: "destructive",
      })
      throw new Error("Invalid document path")
    }
    
    // CRITICAL: Final validation before saving
    if (!docUrl || !docUrl.startsWith("upload/")) {
      toast({
        title: "Validation Error",
        description: "Document validation failed. Record will not be saved.",
        variant: "destructive",
      })
      throw new Error("Document validation failed")
    }

    return docUrl
  }

  return {
    handleDocumentUpload,
    handleDocumentUploadForNew,
  }
}

