"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"

interface DocumentAnalysisData {
  file: {
    dataUrl: string
    name: string
    type: string
  } | null
  category: string
  subCategory: string
  dataFields: Record<string, string>
  analysis: {
    success: boolean
    classification: {
      category: string
      "sub-category"?: string
      dataFields: Record<string, string>
    }
    extractedText: string
    fileType: string
    fileName: string
    timestamp: string
  } | null
  autoFill: boolean
}

interface DocumentAnalysisContextType {
  documentData: DocumentAnalysisData | null
  setDocumentData: (data: DocumentAnalysisData) => void
  clearDocumentData: () => void
  hasDocumentData: boolean
}

const DocumentAnalysisContext = createContext<DocumentAnalysisContextType | undefined>(undefined)

export function DocumentAnalysisProvider({ children }: { children: ReactNode }) {
  const [documentData, setDocumentDataState] = useState<DocumentAnalysisData | null>(() => {
    // Initialize from sessionStorage on mount (for SSR compatibility)
    if (typeof window !== "undefined") {
      try {
        const storedFile = sessionStorage.getItem("arms_uploaded_file")
        const storedFileName = sessionStorage.getItem("arms_uploaded_file_name")
        const storedFileType = sessionStorage.getItem("arms_uploaded_file_type")
        const storedAnalysis = sessionStorage.getItem("arms_last_analysis")
        const storedDataFields = sessionStorage.getItem("arms_dataFields")
        const storedCategory = sessionStorage.getItem("arms_category")
        const storedSubcategory = sessionStorage.getItem("arms_subcategory")
        const storedAutoFill = sessionStorage.getItem("arms_auto_fill")

        if (storedFile && storedFileName && storedFileType) {
          return {
            file: {
              dataUrl: storedFile,
              name: storedFileName,
              type: storedFileType,
            },
            category: storedCategory || "",
            subCategory: storedSubcategory || "",
            dataFields: storedDataFields ? JSON.parse(storedDataFields) : {},
            analysis: storedAnalysis ? JSON.parse(storedAnalysis) : null,
            autoFill: storedAutoFill === "true",
          }
        }
      } catch (error) {
        console.error("Error loading document data from sessionStorage:", error)
      }
    }
    return null
  })

  // ADD: Effect to re-check sessionStorage on mount (in case data was written after initial render)
  // This ensures data is available even if navigation happens before context state updates
  useEffect(() => {
    if (!documentData && typeof window !== "undefined") {
      try {
        const storedFile = sessionStorage.getItem("arms_uploaded_file")
        const storedFileName = sessionStorage.getItem("arms_uploaded_file_name")
        const storedFileType = sessionStorage.getItem("arms_uploaded_file_type")
        const storedDataFields = sessionStorage.getItem("arms_dataFields")
        const storedCategory = sessionStorage.getItem("arms_category")
        const storedSubcategory = sessionStorage.getItem("arms_subcategory")
        const storedAutoFill = sessionStorage.getItem("arms_auto_fill")

        if (storedFile && storedFileName && storedFileType) {
          setDocumentDataState({
            file: {
              dataUrl: storedFile,
              name: storedFileName,
              type: storedFileType,
            },
            category: storedCategory || "",
            subCategory: storedSubcategory || "",
            dataFields: storedDataFields ? JSON.parse(storedDataFields) : {},
            analysis: null, // Don't restore full analysis on mount to save memory
            autoFill: storedAutoFill === "true",
          })
        }
      } catch (error) {
        console.error("Error loading document data from sessionStorage on mount:", error)
      }
    }
  }, []) // Only run once on mount

  const setDocumentData = useCallback((data: DocumentAnalysisData) => {
    setDocumentDataState(data)

    // Also persist to sessionStorage for page navigation
    if (typeof window !== "undefined") {
      try {
        if (data.file) {
          sessionStorage.setItem("arms_uploaded_file", data.file.dataUrl)
          sessionStorage.setItem("arms_uploaded_file_name", data.file.name)
          sessionStorage.setItem("arms_uploaded_file_type", data.file.type)
        }
        if (data.analysis) {
          sessionStorage.setItem("arms_last_analysis", JSON.stringify(data.analysis))
        }
        sessionStorage.setItem("arms_dataFields", JSON.stringify(data.dataFields))
        sessionStorage.setItem("arms_category", data.category)
        sessionStorage.setItem("arms_subcategory", data.subCategory)
        sessionStorage.setItem("arms_auto_fill", data.autoFill ? "true" : "false")
      } catch (error) {
        console.error("Error saving document data to sessionStorage:", error)
      }
    }
  }, [])

  const clearDocumentData = useCallback(() => {
    setDocumentDataState(null)
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("arms_uploaded_file")
        sessionStorage.removeItem("arms_uploaded_file_name")
        sessionStorage.removeItem("arms_uploaded_file_type")
        sessionStorage.removeItem("arms_last_analysis")
        sessionStorage.removeItem("arms_dataFields")
        sessionStorage.removeItem("arms_category")
        sessionStorage.removeItem("arms_subcategory")
        sessionStorage.removeItem("arms_auto_fill")
      } catch (error) {
        console.error("Error clearing document data from sessionStorage:", error)
      }
    }
  }, [])

  return (
    <DocumentAnalysisContext.Provider
      value={{
        documentData,
        setDocumentData,
        clearDocumentData,
        hasDocumentData: documentData !== null,
      }}
    >
      {children}
    </DocumentAnalysisContext.Provider>
  )
}

export function useDocumentAnalysis() {
  const context = useContext(DocumentAnalysisContext)
  if (context === undefined) {
    throw new Error("useDocumentAnalysis must be used within a DocumentAnalysisProvider")
  }
  return context
}

