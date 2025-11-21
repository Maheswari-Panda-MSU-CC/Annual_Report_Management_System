"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

interface AutoFillOptions {
  onAutoFill?: (dataFields: Record<string, string>) => void
  fieldMapping?: Record<string, string>
  clearAfterUse?: boolean
}

/**
 * Hook to access and use document analysis data for auto-filling forms
 * 
 * @param options Configuration options
 * @returns Auto-fill data and utilities
 * 
 * @example
 * ```tsx
 * const { dataFields, documentUrl, hasData, applyAutoFill } = useAutoFillData({
 *   onAutoFill: (fields) => {
 *     Object.entries(fields).forEach(([key, value]) => {
 *       form.setValue(key, value)
 *     })
 *   },
 *   fieldMapping: {
 *     "Title": "title",
 *     "Date": "publicationDate"
 *   },
 *   clearAfterUse: true
 * })
 * ```
 */
export function useAutoFillData(options: AutoFillOptions = {}) {
  const { documentData, clearDocumentData, hasDocumentData } = useDocumentAnalysis()
  const { onAutoFill, fieldMapping, clearAfterUse = false } = options

  // Extract document URL from data
  const documentUrl = useMemo(() => {
    if (documentData?.file?.dataUrl) {
      return documentData.file.dataUrl
    }
    return null
  }, [documentData])

  // Extract and map data fields
  const dataFields = useMemo(() => {
    if (!documentData?.dataFields) return {}

    const fields = documentData.dataFields

    // Apply field mapping if provided
    if (fieldMapping) {
      const mappedFields: Record<string, string> = {}
      Object.entries(fields).forEach(([key, value]) => {
        const mappedKey = fieldMapping[key] || key.toLowerCase().replace(/\s+/g, "")
        mappedFields[mappedKey] = value
      })
      return mappedFields
    }

    return fields
  }, [documentData?.dataFields, fieldMapping])

  // Auto-apply data fields when component mounts and data is available
  useEffect(() => {
    if (hasDocumentData && dataFields && Object.keys(dataFields).length > 0 && onAutoFill) {
      onAutoFill(dataFields)
      
      if (clearAfterUse) {
        clearDocumentData()
      }
    }
  }, [hasDocumentData, dataFields, onAutoFill, clearAfterUse, clearDocumentData])

  // Manual apply function
  const applyAutoFill = useCallback(() => {
    if (dataFields && Object.keys(dataFields).length > 0 && onAutoFill) {
      onAutoFill(dataFields)
      
      if (clearAfterUse) {
        clearDocumentData()
      }
      return true
    }
    return false
  }, [dataFields, onAutoFill, clearAfterUse, clearDocumentData])

  return {
    // Data
    documentData,
    documentUrl,
    dataFields,
    category: documentData?.category || "",
    subCategory: documentData?.subCategory || "",
    analysis: documentData?.analysis,
    
    // State
    hasData: hasDocumentData,
    autoFill: documentData?.autoFill || false,
    
    // Actions
    applyAutoFill,
    clearData: clearDocumentData,
  }
}

