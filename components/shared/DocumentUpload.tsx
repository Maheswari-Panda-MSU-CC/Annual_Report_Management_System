"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DocumentViewer } from "@/components/document-viewer"
import { Skeleton } from "@/components/ui/skeleton"
import { validatePdfPageCount } from "@/lib/pdf-validation-utils"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

interface DocumentUploadProps {
  documentUrl?: string
  category?: string
  subCategory?: string
  onChange?: (url: string) => void
  onFileSelect?: (file: File) => void // New optional callback for File object
  onExtract?: (fields: Record<string, any>) => void
  allowedFileTypes?: string[]
  maxFileSize?: number
  predictedCategory?: string
  predictedSubCategory?: string
  extractedFields?: Record<string, any>
  className?: string
  hideExtractButton?: boolean // Flag to hide Extract Data Fields button
  disabled?: boolean // NEW: Disable upload/clear during analysis
  onClear?: () => void // NEW: Callback when document is cleared
  onClearFields?: () => void // NEW: Callback to clear form fields when document is cleared
  onError?: (error: string) => void // NEW: Optional callback for error notifications (e.g., toast)
}

export function DocumentUpload({
  documentUrl: initialDocumentUrl,
  category,
  subCategory,
  onChange,
  onFileSelect, // New prop
  onExtract,
  allowedFileTypes = ["pdf", "jpg", "jpeg", "png"],
  maxFileSize = 1 * 1024 * 1024, // 1MB default
  predictedCategory,
  predictedSubCategory,
  extractedFields: initialExtractedFields,
  className = "",
  hideExtractButton = false, // Default to false to maintain existing behavior
  disabled = false, // NEW: Default to false for backward compatibility
  onClear, // NEW: Optional callback
  onClearFields, // NEW: Optional callback to clear form fields
  onError, // NEW: Optional error callback for toast notifications
}: DocumentUploadProps) {
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(initialDocumentUrl)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [showUploadUI, setShowUploadUI] = useState(!initialDocumentUrl)
  const [documentType, setDocumentType] = useState<string>("pdf")
  const [documentName, setDocumentName] = useState<string>("document")
  // Store the actual File object for API calls (not just URL)
  const fileRef = useRef<File | null>(null)
  // Access document analysis context to store extracted data
  const { setDocumentData, clearDocumentData } = useDocumentAnalysis()

  // Get file extension from filename or URL
  const getFileExtension = (filename: string): string => {
    const parts = filename.split(".")
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "pdf"
  }

  // Get MIME type from file extension
  const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    return mimeTypes[extension] || "application/pdf"
  }

  // Handle Smart Document Analyzer redirect props
  useEffect(() => {
    if (initialDocumentUrl) {
      setDocumentUrl(initialDocumentUrl)
      setShowUploadUI(false)
      // Determine document type from URL
      const urlParts = initialDocumentUrl.split("/")
      const fileName = urlParts[urlParts.length - 1]
      const ext = getFileExtension(fileName)
      setDocumentType(ext)
      setDocumentName(fileName)
    }
  }, [initialDocumentUrl])

  // Handle extracted fields from Smart Document Analyzer
  useEffect(() => {
    if (initialExtractedFields && onExtract) {
      onExtract(initialExtractedFields)
    }
  }, [initialExtractedFields, onExtract])

  // Validate file
  const validateFile = async (file: File): Promise<string | null> => {
    const fileExtension = getFileExtension(file.name)
    
    // Only allow jpg, png, pdf
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"]
    if (!allowedExtensions.includes(fileExtension)) {
      return `Invalid file type. Only JPG, PNG, and PDF (1 page) files are allowed.`
    }

    // Check file size (1MB max)
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / 1024 / 1024).toFixed(0)
      return `File size exceeds ${maxSizeMB}MB limit. Maximum allowed size is ${maxSizeMB}MB.`
    }

    // Validate PDF is single page - ONLY for PDFs (NOT for images)
    if (fileExtension === "pdf") {
      try {
        const pdfValidation = await validatePdfPageCount(file)
        
        // STRICT CHECK: Block upload if PDF validation failed
        // Check if validation explicitly failed (isValid === false)
        if (pdfValidation.isValid === false) {
          // If there's an error message, use it; otherwise provide default
          const errorMsg = pdfValidation.error || `PDF validation failed. Your PDF has ${pdfValidation.pageCount || 'unknown'} page(s). Please ensure your PDF contains exactly 1 page.`
          
          console.log("[PDF Validation] BLOCKED:", {
            pageCount: pdfValidation.pageCount,
            error: errorMsg,
            isValid: pdfValidation.isValid
          })
          
          // Return error to block upload
          return errorMsg
        }
        
        // Additional safety check: if pageCount is explicitly > 1, block even if isValid is true
        // This is a defensive check in case of any edge cases
        if (pdfValidation.pageCount !== undefined && pdfValidation.pageCount > 1) {
          const errorMsg = `PDF must contain exactly 1 page. Your PDF has ${pdfValidation.pageCount} page(s). Please split your PDF into single-page files or use a different document.`
          console.warn("[PDF Validation] BLOCKED - Page count check:", {
            pageCount: pdfValidation.pageCount,
            isValid: pdfValidation.isValid
          })
          return errorMsg
        }
        
        // If validation passed (isValid === true), continue - allow upload
        // This includes cases where library failed gracefully (isValid: true, pageCount: 0)
        // In that case, backend will validate as a safety measure
        if (pdfValidation.isValid === true) {
          console.log("[PDF Validation] PASSED - Allowing upload", {
            pageCount: pdfValidation.pageCount
          })
        }
      } catch (error: any) {
        // If validation throws an unexpected error, log but don't block
        // This handles cases where PDF.js completely fails to load
        console.warn("[PDF Validation] Library error (allowing upload - backend will validate):", error)
        // Don't return error - allow upload to proceed
        // The backend will validate the PDF anyway
      }
    }

    // Images (jpg, jpeg, png) don't need PDF validation - they pass through here
    // PDFs that passed validation also pass through here
    return null // Success for images and validated PDFs
  }

  // Upload file to local temp folder
  const uploadToLocal = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/shared/local-document-upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to upload file")
    }

    const data = await response.json()
    return data.url
  }

  // Delete temp file
  const deleteTempFile = async () => {
    try {
      await fetch("/api/shared/local-document-upload", {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error deleting temp file:", error)
      // Don't throw, this is cleanup
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    // Don't upload if disabled
    if (disabled) {
      const errorMsg = "Document upload is disabled during analysis."
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
      return
    }

    // Clear previous errors only when starting a new upload attempt
    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Validate file BEFORE uploading (prevents upload if validation fails)
      const validationError = await validateFile(file)
      if (validationError) {
        setError(validationError)
        setIsUploading(false)
        setUploadProgress(0)
        // Don't call onFileSelect if validation fails
        setUploadedFile(null)
        
        // Call onError callback if provided (for toast notifications)
        if (onError) {
          onError(validationError)
        }
        
        return // Exit early - don't upload
      }

      setUploadProgress(10)

      // Delete existing temp file first (to replace it)
      await deleteTempFile()
      setUploadProgress(20)

      // Upload to local folder (this will replace any existing file)
      const localUrl = await uploadToLocal(file)
      setUploadProgress(80)

      // Get file info
      const fileExtension = getFileExtension(file.name)
      const fileName = localUrl.split("/").pop() || file.name

      setUploadProgress(100)

      // Update state - use local URL for viewing
      // File stays in /public/uploaded-document/ until form submission or new upload
      setDocumentUrl(localUrl)
      setDocumentType(fileExtension)
      setDocumentName(file.name)
      setShowUploadUI(false)
      setUploadedFile(null)
      // Store the actual File object for API calls
      fileRef.current = file

      // Call onChange callback with local URL
      // Form submission will handle S3 upload using the file in /public/uploaded-document/
      if (onChange) {
        onChange(localUrl) // Pass local URL - form will handle S3 upload on submit
      }

      // Small delay to show 100% progress
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to upload document"
      setError(errorMessage)
      setIsUploading(false)
      setUploadProgress(0)
      
      // Call onError callback if provided (for toast notifications)
      if (onError) {
        onError(errorMessage)
      }
      
      // Clean up on error - delete temp file if upload failed
      try {
        await deleteTempFile()
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  }

  // Handle file drop (accepted files)
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return // Don't allow file drop if disabled
      
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setUploadedFile(file)
        fileRef.current = file // Store file reference immediately
        
        // Call onFileSelect callback if provided (for SmartDocumentAnalyzer)
        // Only call if validation will pass (we'll validate in handleFileUpload)
        // But we set it here so parent can track the file selection
        if (onFileSelect) {
          onFileSelect(file)
        }
        
        handleFileUpload(file)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFileSelect, disabled]
  )

  // Handle rejected files (e.g., file too large, wrong type)
  const onDropRejected = useCallback(
    (fileRejections: any[]) => {
      if (disabled) return
      
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0]
        const file = rejection.file
        let errorMessage = "File upload failed."
        
        // Check rejection reasons
        rejection.errors.forEach((error: any) => {
          if (error.code === "file-too-large") {
            const maxSizeMB = (maxFileSize / 1024 / 1024).toFixed(0)
            errorMessage = `File size exceeds ${maxSizeMB}MB limit. Maximum allowed size is ${maxSizeMB}MB.`
          } else if (error.code === "file-invalid-type") {
            errorMessage = `Invalid file type. Only ${allowedFileTypes.map((t) => t.toUpperCase()).join(", ")} files are allowed.`
          } else if (error.code === "too-many-files") {
            errorMessage = "Only one file is allowed."
          } else {
            errorMessage = error.message || "File upload failed."
          }
        })
        
        setError(errorMessage)
        setUploadedFile(null)
        setIsUploading(false)
        setUploadProgress(0)
        
        // Call onError callback if provided (for toast notifications)
        if (onError) {
          onError(errorMessage)
        }
      }
    },
    [disabled, maxFileSize, allowedFileTypes, onError]
  )

  // Configure dropzone - only allow jpg, png, pdf
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected, // NEW: Handle rejected files
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: maxFileSize,
    multiple: false,
    disabled: isUploading || disabled, // Disable if uploading OR if disabled prop is true
  })

  // Handle Extract Data Fields
  const handleExtractData = async () => {
    let fileToExtract = fileRef.current || uploadedFile

    // Get the current documentUrl (use prop if internal state is empty)
    const currentDocumentUrl = documentUrl || initialDocumentUrl

    // If we don't have the file but have a documentUrl, try to fetch it
    if (!fileToExtract && currentDocumentUrl) {
      setIsExtracting(true)
      setError(null)

      try {
        const response = await fetch(currentDocumentUrl)
        if (response.ok) {
          const blob = await response.blob()
          const urlParts = currentDocumentUrl.split("/")
          const fileName = urlParts[urlParts.length - 1] || documentName || "document.pdf"
          const fileExtension = getFileExtension(fileName)
          const mimeType = getMimeType(fileExtension)
          // Create File object from Blob
          // File constructor: new File(fileBits, fileName, options)
          fileToExtract = new (window.File || File)([blob], fileName, { type: mimeType })
          fileRef.current = fileToExtract
        } else {
          setError("Could not access the document file. Please re-upload the document.")
          setIsExtracting(false)
          return
        }
      } catch (fetchError) {
        console.error("Error fetching file from URL:", fetchError)
        setError("Could not access the document file. Please re-upload the document.")
        setIsExtracting(false)
        return
      }
    }

    if (!fileToExtract) {
      if (currentDocumentUrl) {
        setError("Could not access the document file. Please re-upload the document.")
      } else {
        setError("Please upload a document first")
      }
      return
    }

    setIsExtracting(true)
    setError(null)

    try {
      // Use reverse mapping to get standard category and subcategory from form type
      let standardCategory: string | null = null
      let standardSubCategory: string | null = null

      // Fallback to provided category/subCategory if reverse mapping fails
      if (!standardCategory) {
        standardCategory = category || ""
      }
      if (!standardSubCategory) {
        standardSubCategory = subCategory || ""
      }

      // Create FormData with file, category, and subCategory
      const formData = new FormData()
      formData.append("file", fileToExtract)
      formData.append("category", standardCategory)
      if (standardSubCategory) {
        formData.append("subCategory", standardSubCategory)
      }

      // Call LLM extraction API with multipart/form-data
      const response = await fetch("/api/llm/get-formfields", {
        method: "POST",
        body: formData, // Don't set Content-Type header - browser will set it with boundary
      })

      if (!response.ok) {
        let errorMessage = "Failed to extract data fields"
        try {
          const errorData = await response.json()
          errorMessage = errorData?.error?.message || errorData?.error || errorData?.message || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (!result.success) {
        const errorMessage = result?.error?.message || result?.error || result?.message || "Document field extraction failed."
        throw new Error(errorMessage)
      }

      // The API returns dataFields directly (not nested in data)
      const dataFields = result.dataFields || {}

      if (Object.keys(dataFields).length === 0) {
        throw new Error("No data fields extracted from document")
      }

      // Store extracted data in context (like smart-document-analyzer)
      // This allows useAutoFillData hook to access the data automatically
      if (fileToExtract && (documentUrl || initialDocumentUrl)) {
        const currentDocUrl = documentUrl || initialDocumentUrl || ""
        
        // Transform API response to match context format (same as smart-document-analyzer)
        const analysisData = {
          success: result.success,
          classification: {
            category: result.category || standardCategory || "",
            "sub-category": result.subCategory || standardSubCategory || "",
            dataFields: dataFields,
          },
          extractedText: result.extractedText || "",
          fileType: result.fileType || fileToExtract.type || "",
          fileName: result.fileName || fileToExtract.name || "",
          timestamp: result.timestamp || new Date().toISOString(),
        }

        // Store in context (same format as smart-document-analyzer)
        const contextData = {
          file: {
            dataUrl: currentDocUrl,
            name: fileToExtract.name,
            type: fileToExtract.type,
          },
          category: result.category || standardCategory || category || "",
          subCategory: result.subCategory || standardSubCategory || subCategory || "",
          dataFields: dataFields,
          analysis: analysisData,
          autoFill: true,
        }
        
        console.log("DocumentUpload: Storing data in context", {
          category: contextData.category,
          subCategory: contextData.subCategory,
          dataFieldsCount: Object.keys(contextData.dataFields).length,
          autoFill: contextData.autoFill,
        })
        
        setDocumentData(contextData)
      }

      // Still call onExtract callback for backward compatibility
      // Existing pages that use onExtract will continue to work
      // Pass dataFields as the extracted data
      if (onExtract) {
        onExtract(dataFields)
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to extract data fields"
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsExtracting(false)
    }
  }

  // Handle Update Document
  const handleUpdateDocument = () => {
    if (disabled) return // Don't allow update if disabled
    
    setShowUploadUI(true)
    setUploadedFile(null)
    setError(null)
  }

  // Handle Clear Document
  const handleClearDocument = async () => {
    if (disabled) return // Don't allow clear if disabled
    
    // Delete the file from local folder
    await deleteTempFile()
    setDocumentUrl(undefined)
    setShowUploadUI(true)
    setUploadedFile(null)
    fileRef.current = null // Clear stored file reference
    setError(null)
    
    // Clear document data from context
    clearDocumentData()
    
    // Call onClearFields callback to clear form fields
    if (onClearFields) {
      onClearFields()
    }
    
    // Call onClear callback if provided
    if (onClear) {
      onClear()
    }
    
    if (onChange) {
      onChange("")
    }
  }

  // Determine document type from URL
  useEffect(() => {
    if (documentUrl) {
      const urlParts = documentUrl.split("/")
      const fileName = urlParts[urlParts.length - 1]
      const ext = getFileExtension(fileName)
      setDocumentType(ext)
      setDocumentName(fileName)
    }
  }, [documentUrl])

  return (
    <div className={`space-y-4 ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Upload UI */}
      {showUploadUI && (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${isUploading || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                <p className="text-blue-600 font-medium">Uploading document...</p>
                <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop a file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: {allowedFileTypes.map((t) => t.toUpperCase()).join(", ")} (max{" "}
                      {(maxFileSize / 1024 / 1024).toFixed(0)}MB)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {uploadedFile && !isUploading && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                setUploadedFile(null)
                setError(null) // Clear error when removing file
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Error Alert - Always show when there's an error */}
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Document Viewer */}
      {!showUploadUI && documentUrl && (
        <div className="space-y-4">
          <div className="min-h-[200px]">
            <DocumentViewer
              documentUrl={documentUrl}
              documentName={documentName}
              documentType={documentType}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleUpdateDocument}
              disabled={isUploading || disabled}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Update Document
            </Button>
            {!hideExtractButton && (
              <Button
                variant="outline"
                onClick={handleExtractData}
                disabled={isExtracting || isUploading || disabled}
                className="flex items-center gap-2"
              >
                {isExtracting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Extract Data Fields
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleClearDocument}
              disabled={isUploading || disabled}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Clear Document
            </Button>
          </div>

          {/* Error Alert - Always show when there's an error */}
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Skeleton Loader for Document Viewer */}
      {!showUploadUI && !documentUrl && isUploading && (
        <div className="space-y-4">
          <Skeleton className="w-full h-[600px] rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      )}
    </div>
  )
}

