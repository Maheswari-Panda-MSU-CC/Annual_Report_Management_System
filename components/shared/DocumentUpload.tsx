"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DocumentViewer } from "@/components/document-viewer"
import { Skeleton } from "@/components/ui/skeleton"

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

  // Get file extension from filename or URL
  const getFileExtension = (filename: string): string => {
    const parts = filename.split(".")
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "pdf"
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
      return `File size exceeds ${maxSizeMB}MB limit. Maximum allowed size is 1MB.`
    }

    // Validate PDF is single page (basic check - file size for 1 page PDF is typically < 1MB)
    if (fileExtension === "pdf") {
      // Note: Full PDF page validation would require parsing the PDF
      // For now, we rely on size limit (1MB) which typically indicates a single page
      // In production, you might want to add PDF parsing to verify page count
    }

    return null
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
    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Validate file (async validation)
      const validationError = await validateFile(file)
      if (validationError) {
        setError(validationError)
        setIsUploading(false)
        return
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
      setError(err.message || "Failed to upload document")
      setIsUploading(false)
      setUploadProgress(0)
      // Clean up on error - delete temp file if upload failed
      try {
        await deleteTempFile()
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  }

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setUploadedFile(file)
        
        // Call onFileSelect callback if provided (for SmartDocumentAnalyzer)
        if (onFileSelect) {
          onFileSelect(file)
        }
        
        handleFileUpload(file)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFileSelect]
  )

  // Configure dropzone - only allow jpg, png, pdf
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: maxFileSize,
    multiple: false,
    disabled: isUploading,
  })

  // Handle Extract Data Fields
  const handleExtractData = async () => {
    if (!documentUrl && !uploadedFile) {
      setError("Please upload a document first")
      return
    }

    setIsExtracting(true)
    setError(null)

    try {
      // Determine the type for extraction based on category/subcategory
      // The API expects a 'type' field that matches the form type
      let extractionType = category || subCategory || "publication"

      // Map common categories to API types
      const typeMap: Record<string, string> = {
        "research": "research_project",
        "research-project": "research_project",
        "publication": "publication",
        "journal-article": "articles",
        "journal-articles": "articles",
        "books": "books",
        "papers": "papers",
        "patents": "patent",
        "patent": "patent",
        "awards": "awards",
        "award": "award",
        "talks": "talks",
        "events": "event",
        "refresher": "refresher",
        "performance": "performance",
        "extension": "extension",
        "econtent": "econtent",
        "policy": "policy",
        "consultancy": "contribution",
        "collaborations": "contribution",
        "visits": "contribution",
        "financial": "contribution",
        "jrf-srf": "jrf_srf",
        "phd": "contribution",
        "copyrights": "contribution",
        "academic-bodies": "academic-bodies",
        "committees": "committee",
        "academic-recommendations": "academic_recommendation",
      }

      // Normalize the type
      const normalizedType = extractionType.toLowerCase().replace(/\s+/g, "-")
      const apiType = typeMap[normalizedType] || normalizedType

      // Call LLM extraction API (dummy API that returns mock data)
      const response = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: apiType,
          category: category,
          subcategory: subCategory,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract data fields")
      }

      const data = await response.json()

      if (data.success && data.data) {
        // Call onExtract callback
        if (onExtract) {
          onExtract(data.data)
        }
      } else {
        throw new Error("No data extracted")
      }
    } catch (err: any) {
      setError(err.message || "Failed to extract data fields")
    } finally {
      setIsExtracting(false)
    }
  }

  // Handle Update Document
  const handleUpdateDocument = () => {
    setShowUploadUI(true)
    setUploadedFile(null)
    setError(null)
  }

  // Handle Clear Document
  const handleClearDocument = async () => {
    // Delete the file from local folder
    await deleteTempFile()
    setDocumentUrl(undefined)
    setShowUploadUI(true)
    setUploadedFile(null)
    setError(null)
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
    <div className={`space-y-4 ${className}`}>
      {/* Upload UI */}
      {showUploadUI && (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
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
              <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
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
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Update Document
            </Button>
            {!hideExtractButton && (
              <Button
                variant="outline"
                onClick={handleExtractData}
                disabled={isExtracting || isUploading}
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
              disabled={isUploading}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Clear Document
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
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

