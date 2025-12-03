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
  // NEW: Function to get current form values to check if fields are empty
  getFormValues?: () => Record<string, any>
  // NEW: Only auto-fill empty fields (default: true to prevent overwriting user input)
  onlyFillEmpty?: boolean
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
    dropdownOptions = {},
    getFormValues, // NEW: Function to get current form values
    onlyFillEmpty = true, // NEW: Default to true to prevent overwriting user input
  } = options

  // Track if auto-fill has been applied to prevent infinite loops
  const hasAutoFilledRef = useRef(false)
  const lastDataFieldsHashRef = useRef<string>("")
  const lastProcessedFieldsRef = useRef<Record<string, any>>({})
  // NEW: Track if component has mounted to ensure we only auto-fill once on initial mount
  const hasMountedRef = useRef(false)

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
        return undefined
      }
      // If it's a local URL, return it
      if (url.startsWith("/uploaded-document/")) {
        return url
      }
      return url
    }
    return undefined
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
      // Handle numeric fields (including grant amounts with commas)
      else if (mappedKey.includes("num") || 
               mappedKey.includes("count") ||
               mappedKey.includes("index") ||
               mappedKey.includes("factor") ||
               mappedKey === "grant_sanctioned" ||
               mappedKey === "grant_received") {
        // Remove commas and spaces, then parse
        const cleanedValue = String(extractedValue).replace(/[,\s]/g, '')
        const numValue = parseFloat(cleanedValue)
        if (!isNaN(numValue)) {
          processedValue = numValue
        }
      }
      // Handle duration field - extract number from "9 months" format
      else if (mappedKey === "duration") {
        // Extract number from string like "9 months" or "9"
        const durationStr = String(extractedValue)
        const match = durationStr.match(/(\d+)/)
        if (match) {
          const numValue = parseInt(match[1])
          if (!isNaN(numValue) && numValue > 0) {
            processedValue = numValue
          }
        }
      }

      processed[mappedKey] = processedValue
    })

    return processed
  }, [documentData?.dataFields, customFieldMapping, formType, dropdownOptions])

  // Create a stable hash of the data fields to detect when data actually changes
  // Include timestamp and file name to ensure hash changes even if data is similar
  const dataFieldsHash = useMemo(() => {
    if (!documentData?.dataFields) return ""
    // Include timestamp and file name to ensure unique hash for each extraction
    const timestamp = documentData?.analysis?.timestamp || documentData?.file?.name || ""
    return JSON.stringify({
      dataFields: documentData.dataFields,
      timestamp: timestamp,
      fileName: documentData?.file?.name || "",
    })
  }, [documentData?.dataFields, documentData?.analysis?.timestamp, documentData?.file?.name])

  // Store processed fields in ref to avoid dependency issues
  useEffect(() => {
    if (processedDataFields && Object.keys(processedDataFields).length > 0) {
      lastProcessedFieldsRef.current = processedDataFields
    }
  }, [processedDataFields])

  // Mark component as mounted
  useEffect(() => {
    hasMountedRef.current = true
  }, [])

  // Helper function to check if a value is empty
  const isEmpty = (value: any): boolean => {
    if (value === undefined || value === null) return true
    if (typeof value === "string" && value.trim() === "") return true
    if (typeof value === "number" && isNaN(value)) return true
    if (Array.isArray(value) && value.length === 0) return true
    return false
  }

  // Auto-apply data fields when new data arrives (including re-extractions)
  // This ensures it runs on initial mount AND when new data is extracted
  useEffect(() => {
    // Only proceed if:
    // 1. Component has mounted
    // 2. We have document data
    // 3. We haven't already auto-filled THIS specific hash (or hash changed)
    // 4. We have processed fields
    // 5. This is new data (hash is different from last processed hash)
    const isNewData = lastDataFieldsHashRef.current === "" || dataFieldsHash !== lastDataFieldsHashRef.current
    const shouldAutoFill = hasMountedRef.current &&
                          hasDocumentData &&
                          !hasAutoFilledRef.current &&
                          dataFieldsHash !== "" &&
                          Object.keys(processedDataFields).length > 0 &&
                          isNewData

    if (!shouldAutoFill || !onAutoFill) {
      console.log("useAutoFillData: Skipping auto-fill", {
        hasMounted: hasMountedRef.current,
        hasDocumentData,
        hasAutoFilled: hasAutoFilledRef.current,
        dataFieldsHash: dataFieldsHash ? dataFieldsHash.substring(0, 30) + "..." : "",
        processedFieldsCount: Object.keys(processedDataFields).length,
        isNewData,
        lastHash: lastDataFieldsHashRef.current ? lastDataFieldsHashRef.current.substring(0, 30) + "..." : "empty",
      })
      return
    }

    // Get current form values if we should only fill empty fields
    // If onlyFillEmpty is true but getFormValues is not provided, default to filling all fields (backward compatibility)
    const shouldCheckEmpty = onlyFillEmpty && getFormValues
    let currentFormValues: Record<string, any> = {}
    if (shouldCheckEmpty) {
      try {
        currentFormValues = getFormValues()
      } catch (error) {
        console.warn("Error getting form values for auto-fill:", error)
        // If error getting form values, fall back to filling all fields
      }
    }

    // Filter fields to only include empty ones (if onlyFillEmpty is true AND getFormValues is provided)
    const fieldsToFill: Record<string, any> = {}
    Object.entries(processedDataFields).forEach(([key, value]) => {
      if (shouldCheckEmpty) {
        const currentValue = currentFormValues[key]
        // Only include if field is empty
        if (isEmpty(currentValue)) {
          fieldsToFill[key] = value
        }
      } else {
        // If onlyFillEmpty is false or getFormValues is not provided, include all fields (for backward compatibility)
        fieldsToFill[key] = value
      }
    })

    // Only proceed if there are fields to fill
    if (Object.keys(fieldsToFill).length === 0) {
      // Mark as filled even if no fields were filled to prevent re-checking
      hasAutoFilledRef.current = true
      lastDataFieldsHashRef.current = dataFieldsHash
      return
    }

    // Mark as applied BEFORE calling onAutoFill to prevent re-triggering
    hasAutoFilledRef.current = true
    lastDataFieldsHashRef.current = dataFieldsHash

    console.log("useAutoFillData: Triggering auto-fill", {
      formType,
      fieldsCount: Object.keys(fieldsToFill).length,
      fields: Object.keys(fieldsToFill),
      dataFieldsHash: dataFieldsHash.substring(0, 50) + "...",
      onlyFillEmpty,
      shouldCheckEmpty,
    })

    // Call onAutoFill with only the fields that should be filled
    onAutoFill(fieldsToFill)
    
    // Update ref for future checks
    lastProcessedFieldsRef.current = processedDataFields
    
    if (clearAfterUse) {
      clearDocumentData()
      hasAutoFilledRef.current = false
      lastDataFieldsHashRef.current = ""
      lastProcessedFieldsRef.current = {}
    }
  }, [
    hasDocumentData, 
    dataFieldsHash, 
    processedDataFields, 
    onAutoFill, 
    clearAfterUse, 
    clearDocumentData,
    onlyFillEmpty,
    getFormValues
  ])

  // Reset flag if data is cleared OR if new data arrives (allows re-filling if new document is uploaded)
  useEffect(() => {
    if (!hasDocumentData && dataFieldsHash === "") {
      // Data was cleared
      hasAutoFilledRef.current = false
      lastDataFieldsHashRef.current = ""
      lastProcessedFieldsRef.current = {}
    } else if (hasDocumentData && dataFieldsHash !== "" && dataFieldsHash !== lastDataFieldsHashRef.current) {
      // New data arrived (different hash) - reset flag to allow auto-fill
      // This handles the case when DocumentUpload extracts new data after page is already mounted
      console.log("useAutoFillData: New data detected, resetting auto-fill flag", {
        oldHash: lastDataFieldsHashRef.current ? lastDataFieldsHashRef.current.substring(0, 50) : "empty",
        newHash: dataFieldsHash.substring(0, 50),
        hasAutoFilled: hasAutoFilledRef.current,
      })
      // CRITICAL: Reset the flag to allow auto-fill to trigger again
      hasAutoFilledRef.current = false
      // Don't update lastDataFieldsHashRef here - let the auto-fill effect update it after filling
      // This ensures the auto-fill effect will see the hash change and trigger
    }
  }, [hasDocumentData, dataFieldsHash])

  // Manual apply function (for explicit user action)
  const applyAutoFill = useCallback(() => {
    if (processedDataFields && Object.keys(processedDataFields).length > 0 && onAutoFill) {
      // Get current form values if we should only fill empty fields
      // If onlyFillEmpty is true but getFormValues is not provided, default to filling all fields (backward compatibility)
      const shouldCheckEmpty = onlyFillEmpty && getFormValues
      let currentFormValues: Record<string, any> = {}
      if (shouldCheckEmpty) {
        try {
          currentFormValues = getFormValues()
        } catch (error) {
          console.warn("Error getting form values for manual auto-fill:", error)
          // If error getting form values, fall back to filling all fields
        }
      }

      // Filter fields to only include empty ones (if onlyFillEmpty is true AND getFormValues is provided)
      const fieldsToFill: Record<string, any> = {}
      Object.entries(processedDataFields).forEach(([key, value]) => {
        if (shouldCheckEmpty) {
          const currentValue = currentFormValues[key]
          if (isEmpty(currentValue)) {
            fieldsToFill[key] = value
          }
        } else {
          fieldsToFill[key] = value
        }
      })

      if (Object.keys(fieldsToFill).length > 0) {
        onAutoFill(fieldsToFill)
        
        if (clearAfterUse) {
          clearDocumentData()
        }
        return true
      }
    }
    return false
  }, [processedDataFields, onAutoFill, clearAfterUse, clearDocumentData, onlyFillEmpty, getFormValues])

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


