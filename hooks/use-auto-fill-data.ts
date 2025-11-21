"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { getFormType, getMappedFieldName } from "@/lib/categories-field-mapping"
import { findDropdownOption, normalizeModeValue, normalizeBooleanValue } from "@/lib/dropdown-matching-utils"
import { parseDateString } from "@/lib/date-parsing-utils"

interface AutoFillOptions {
  onAutoFill?: (dataFields: Record<string, any>) => void
  fieldMapping?: Record<string, string> // Custom override mapping
  clearAfterUse?: boolean
  formType?: string // Auto-detected from category/subcategory if not provided
  dropdownOptions?: {
    // Map of field names to dropdown options
    [fieldName: string]: Array<{ id: number | string; name: string }>
  }
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
  const { 
    onAutoFill, 
    fieldMapping: customFieldMapping, 
    clearAfterUse = false,
    formType: providedFormType,
    dropdownOptions = {}
  } = options

  // Track if auto-fill has been applied to prevent infinite loops
  const hasAutoFilledRef = useRef(false)
  const lastDataFieldsHashRef = useRef<string>("")
  const lastProcessedFieldsRef = useRef<Record<string, any>>({})

  // Auto-detect form type from category/subcategory
  const formType = useMemo(() => {
    if (providedFormType) return providedFormType
    
    if (documentData?.category && documentData?.subCategory) {
      const detected = getFormType(documentData.category, documentData.subCategory)
      return detected || ""
    }
    
    return ""
  }, [providedFormType, documentData?.category, documentData?.subCategory])

  // Extract document URL from data
  const documentUrl = useMemo(() => {
    if (documentData?.file?.dataUrl) {
      const url = documentData.file.dataUrl
      // If it's a data URL, return null (DocumentUpload will handle it)
      if (url.startsWith("data:")) {
        return null
      }
      // If it's a local URL, return it
      if (url.startsWith("/uploaded-document/")) {
        return url
      }
      return url
    }
    return null
  }, [documentData])

  // Process and map data fields with intelligent matching
  const processedDataFields = useMemo(() => {
    if (!documentData?.dataFields) return {}

    const fields = documentData.dataFields
    const processed: Record<string, any> = {}

    Object.entries(fields).forEach(([extractedKey, extractedValue]) => {
      // Get mapped field name (use custom mapping first, then auto-mapping)
      const mappedKey = customFieldMapping?.[extractedKey] || 
                       (formType ? getMappedFieldName(extractedKey, formType) : null) ||
                       extractedKey.toLowerCase().replace(/\s+/g, "_")

      if (!mappedKey) return

      // Process value based on field type
      let processedValue: any = extractedValue

      // Handle dropdown fields
      if (dropdownOptions[mappedKey]) {
        const matchedId = findDropdownOption(
          extractedValue,
          dropdownOptions[mappedKey],
          mappedKey
        )
        if (matchedId !== null) {
          processedValue = matchedId
        } else {
          // If no match found, keep original value (might be text field)
          processedValue = extractedValue
        }
      }
      // Handle mode field specifically
      else if (mappedKey === "mode" || mappedKey.includes("mode")) {
        const normalizedMode = normalizeModeValue(extractedValue)
        if (normalizedMode) {
          processedValue = normalizedMode
        }
      }
      // Handle boolean fields
      else if (mappedKey.includes("paid") || 
               mappedKey.includes("reviewed") || 
               mappedKey.includes("in_") ||
               mappedKey.endsWith("?")) {
        const normalizedBool = normalizeBooleanValue(extractedValue)
        if (normalizedBool !== null) {
          processedValue = normalizedBool
        }
      }
      // Handle date fields
      else if (mappedKey.includes("date") || 
               mappedKey.includes("Date") ||
               mappedKey === "month_year" ||
               mappedKey === "submit_date") {
        const parsedDate = parseDateString(extractedValue)
        if (parsedDate) {
          processedValue = parsedDate
        }
      }
      // Handle numeric fields
      else if (mappedKey.includes("num") || 
               mappedKey.includes("count") ||
               mappedKey.includes("index") ||
               mappedKey.includes("factor")) {
        const numValue = parseFloat(extractedValue)
        if (!isNaN(numValue)) {
          processedValue = numValue
        }
      }

      processed[mappedKey] = processedValue
    })

    return processed
  }, [documentData?.dataFields, customFieldMapping, formType, dropdownOptions])

  // Create a stable hash of the data fields to detect when data actually changes
  const dataFieldsHash = useMemo(() => {
    if (!documentData?.dataFields) return ""
    return JSON.stringify(documentData.dataFields)
  }, [documentData?.dataFields])

  // Store processed fields in ref to avoid dependency issues
  useEffect(() => {
    if (processedDataFields && Object.keys(processedDataFields).length > 0) {
      lastProcessedFieldsRef.current = processedDataFields
    }
  }, [processedDataFields])

  // Auto-apply data fields when component mounts and data is available
  // Only run once when data first becomes available to prevent infinite loops
  useEffect(() => {
    // Check if we have new data that hasn't been processed yet
    const hasNewData = hasDocumentData && 
                       dataFieldsHash !== lastDataFieldsHashRef.current &&
                       dataFieldsHash !== "" &&
                       Object.keys(lastProcessedFieldsRef.current).length > 0

    if (hasNewData && onAutoFill) {
      // Mark as applied before calling onAutoFill to prevent re-triggering
      hasAutoFilledRef.current = true
      lastDataFieldsHashRef.current = dataFieldsHash

      // Call onAutoFill with the processed fields from ref
      onAutoFill(lastProcessedFieldsRef.current)
      
      if (clearAfterUse) {
        clearDocumentData()
        hasAutoFilledRef.current = false
        lastDataFieldsHashRef.current = ""
        lastProcessedFieldsRef.current = {}
      }
    }

    // Reset flag if data is cleared
    if (!hasDocumentData && dataFieldsHash === "") {
      hasAutoFilledRef.current = false
      lastDataFieldsHashRef.current = ""
      lastProcessedFieldsRef.current = {}
    }
  }, [hasDocumentData, dataFieldsHash, onAutoFill, clearAfterUse, clearDocumentData])

  // Manual apply function
  const applyAutoFill = useCallback(() => {
    if (processedDataFields && Object.keys(processedDataFields).length > 0 && onAutoFill) {
      onAutoFill(processedDataFields)
      
      if (clearAfterUse) {
        clearDocumentData()
      }
      return true
    }
    return false
  }, [processedDataFields, onAutoFill, clearAfterUse, clearDocumentData])

  return {
    // Data
    documentData,
    documentUrl,
    dataFields: processedDataFields,
    rawDataFields: documentData?.dataFields || {},
    category: documentData?.category || "",
    subCategory: documentData?.subCategory || "",
    analysis: documentData?.analysis,
    formType,
    
    // State
    hasData: hasDocumentData,
    autoFill: documentData?.autoFill || false,
    
    // Actions
    applyAutoFill,
    clearData: clearDocumentData,
  }
}


