"use client"

import { useState, useEffect } from 'react'

interface ExtractedData {
  fileId: string
  extractedText: string
  extractedFields: {
    title: string
    authors: string[]
    abstract: string
    keywords: string[]
    date: string
    journal?: string
    volume?: string
    issue?: string
    pages?: string
    doi?: string
    isbn?: string
    publisher?: string
    conference?: string
    venue?: string
    year: string
    type: string
  }
  confidence: number
  processingTime: number
}

export function useDocumentExtraction() {
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [uploadedFileType, setUploadedFileType] = useState<string>('')
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if there's an uploaded file from smart document analyzer
    const fileId = sessionStorage.getItem('uploadedFileId')
    const fileName = sessionStorage.getItem('uploadedFileName')
    const fileType = sessionStorage.getItem('uploadedFileType')
    const fileData = sessionStorage.getItem('uploadedFileData')

    if (fileId && fileName && fileType && fileData) {
      setUploadedFileId(fileId)
      setUploadedFileName(fileName)
      setUploadedFileType(fileType)
      
      // Automatically extract data from the uploaded document
      extractDocumentData(fileId)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Clean up session storage when component unmounts
  useEffect(() => {
    return () => {
      // Only clear if we're not navigating to another add page
      const currentPath = window.location.pathname
      if (!currentPath.includes('/add')) {
        clearUploadedFile()
      }
    }
  }, [])

  const extractDocumentData = async (fileId: string) => {
    setIsExtracting(true)
    try {
      // Simulate document extraction with mock data
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time
      
      const mockExtractedData = {
        fileId,
        extractedText: "Sample extracted text from document...",
        extractedFields: {
          title: "Sample Document Title",
          authors: ["Dr. John Doe", "Dr. Jane Smith"],
          abstract: "This is a sample abstract extracted from the document.",
          keywords: ["research", "academic", "publication"],
          date: "2024-01-15",
          journal: "Sample Journal",
          volume: "15",
          issue: "3",
          pages: "123-145",
          doi: "10.1000/sample-doi",
          isbn: "978-0-123456-78-9",
          publisher: "Sample Publisher",
          conference: "International Conference on Sample Topic",
          venue: "Sample City, Country",
          year: "2024",
          type: "Journal Article"
        },
        confidence: 0.85,
        processingTime: 2.5
      }
      
      setExtractedData(mockExtractedData)
    } catch (error) {
      console.error('Document extraction error:', error)
    } finally {
      setIsExtracting(false)
      setIsLoading(false)
    }
  }

  const clearUploadedFile = () => {
    sessionStorage.removeItem('uploadedFileId')
    sessionStorage.removeItem('uploadedFileName')
    sessionStorage.removeItem('uploadedFileType')
    sessionStorage.removeItem('uploadedFileSize')
    sessionStorage.removeItem('uploadedFileData')
    setUploadedFileId(null)
    setUploadedFileName('')
    setUploadedFileType('')
    setExtractedData(null)
  }

  const hasUploadedFile = uploadedFileId !== null
  const isFromCentralizedUpload = hasUploadedFile

  return {
    uploadedFileId,
    uploadedFileName,
    uploadedFileType,
    extractedData,
    isExtracting,
    isLoading,
    hasUploadedFile,
    isFromCentralizedUpload,
    extractDocumentData,
    clearUploadedFile
  }
}
