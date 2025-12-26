"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ResearchProjectFormData } from "@/types/interfaces"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { useResearchMutations } from "@/hooks/use-teacher-mutations"
import { useQuery } from "@tanstack/react-query"
import { teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { cn } from "@/lib/utils"

export default function EditResearchPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string | null>(null)
  const { updateResearch } = useResearchMutations()
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()
  const teacherId: number = user?.role_id 
    ? parseInt(user.role_id.toString()) 
    : parseInt(user?.id?.toString() || '0')

  const {
    projectStatusOptions,
    projectLevelOptions,
    fundingAgencyOptions,
    projectNatureOptions,
  } = useDropDowns()

  const form = useForm<ResearchProjectFormData>({
    defaultValues: {
    title: "",
      funding_agency: null,
      grant_sanctioned: "",
      grant_received: "",
      proj_nature: null,
      duration: 0,
      status: null,
      start_date: "",
      proj_level: null,
      grant_year: "",
      grant_sealed: false,
      Pdf: "",
    },
  })

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = form

  // Watch grant_sealed to enable/disable grant_year
  const grantSealed = watch("grant_sealed")
  
  // Watch grant amounts for cross-validation
  const grantSanctioned = watch("grant_sanctioned")
  const grantReceived = watch("grant_received")

  // Track auto-filled fields for highlighting
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())

  // Helper function to check if a field is auto-filled
  const isAutoFilled = useCallback((fieldName: string) => {
    return autoFilledFields.has(fieldName)
  }, [autoFilledFields])

  // Helper function to clear auto-fill highlight for a field
  const clearAutoFillHighlight = useCallback((fieldName: string) => {
    setAutoFilledFields(prev => {
      if (prev.has(fieldName)) {
        const next = new Set(prev)
        next.delete(fieldName)
        return next
      }
      return prev
    })
  }, [])

  // Helper function to parse currency amounts (handles formats like 'INR 50,000/-', '₹50,000', '50,000/-', etc.)
  const parseCurrencyAmount = useCallback((value: any): string => {
    if (!value) return ""
    
    // Convert to string and trim
    let strValue = String(value).trim()
    
    // Remove currency prefixes (INR, ₹, Rs., etc.) - case insensitive
    strValue = strValue.replace(/^(INR|₹|Rs\.?|rupees?)\s*/i, '')
    
    // Remove trailing symbols like '/-', '-', etc.
    strValue = strValue.replace(/[/\-]+$/, '')
    
    // Remove all commas and spaces
    strValue = strValue.replace(/[,\s]/g, '')
    
    // Extract numeric value (including decimals) - match digits with optional decimal point and more digits
    const numericMatch = strValue.match(/(\d+\.?\d*)/)
    if (numericMatch) {
      return numericMatch[1]
    }
    
    // Fallback: try to parse as number (handles edge cases)
    const parsed = parseFloat(strValue)
    if (!isNaN(parsed) && isFinite(parsed)) {
      return String(parsed)
    }
    
    // Last resort: try to extract any number from the string
    const anyNumberMatch = strValue.match(/\d+/)
    if (anyNumberMatch) {
      return anyNumberMatch[0]
    }
    
    return ""
  }, [])

  // Helper function to validate and set dropdown field value
  const setDropdownValue = useCallback((
    fieldName: string,
    value: any,
    options: Array<{ id: number; name: string }>,
    filledFieldNames: string[]
  ): number | null => {
    if (value === null || value === undefined) {
      setValue(fieldName as any, null)
      return null
    }
    
    const numValue = Number(value)
    if (isNaN(numValue)) {
      setValue(fieldName as any, null)
      return null
    }
    
    // Verify the value exists in options
    const existsInOptions = options.some(opt => opt.id === numValue)
    if (existsInOptions) {
      setValue(fieldName as any, numValue)
      filledFieldNames.push(fieldName)
      return numValue
    }
    
    setValue(fieldName as any, null)
    return null
  }, [setValue])

  // Use auto-fill hook for document analysis data - watches context changes
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "research", // Explicit form type
    dropdownOptions: {
      funding_agency: fundingAgencyOptions,
      proj_nature: projectNatureOptions,
      proj_level: projectLevelOptions,
      status: projectStatusOptions,
    },
    onlyFillEmpty: false, // REPLACE existing data with new extracted data
    onAutoFill: (fields) => {
      console.log("EDIT PAGE: Auto-fill triggered with fields", fields)
      
      // Track which fields were auto-filled (only non-empty fields)
      const filledFieldNames: string[] = []
      
      // REPLACE all form fields with extracted data (even if they already have values)
      // This ensures new extraction replaces existing data
      
      // Title - replace if exists in extraction and is non-empty
      if (fields.title !== undefined) {
        const titleValue = fields.title ? String(fields.title).trim() : ""
        setValue("title", titleValue)
        if (titleValue) {
          filledFieldNames.push("title")
        }
      }
      
      // Funding Agency - replace if exists in extraction
      if (fields.funding_agency !== undefined) {
        setDropdownValue("funding_agency", fields.funding_agency, fundingAgencyOptions, filledFieldNames)
      }
      
      // Handle grant_sanctioned - parse currency format (e.g., 'INR 50,000/-'), replace if exists
      if (fields.grant_sanctioned !== undefined) {
        if (fields.grant_sanctioned) {
          const grantValue = parseCurrencyAmount(fields.grant_sanctioned)
          setValue("grant_sanctioned", grantValue)
          // Only track if we successfully parsed a valid number
          if (grantValue && !isNaN(parseFloat(grantValue)) && parseFloat(grantValue) > 0) {
            filledFieldNames.push("grant_sanctioned")
          }
        } else {
          setValue("grant_sanctioned", "")
        }
      }
      
      // Handle grant_received - parse currency format (e.g., 'INR 50,000/-'), replace if exists
      if (fields.grant_received !== undefined) {
        if (fields.grant_received) {
          const grantValue = parseCurrencyAmount(fields.grant_received)
          setValue("grant_received", grantValue)
          // Only track if we successfully parsed a valid number
          if (grantValue && !isNaN(parseFloat(grantValue)) && parseFloat(grantValue) > 0) {
            filledFieldNames.push("grant_received")
          }
        } else {
          setValue("grant_received", "")
        }
      }
      
      // Project Nature - replace if exists in extraction
      if (fields.proj_nature !== undefined) {
        setDropdownValue("proj_nature", fields.proj_nature, projectNatureOptions, filledFieldNames)
      }
      
      // Handle duration - extract number from "9 months" format, replace if exists
      if (fields.duration !== undefined) {
        if (fields.duration !== null) {
          let durationValue = 0
          if (typeof fields.duration === 'number') {
            durationValue = fields.duration
          } else {
            const durationStr = String(fields.duration)
            const match = durationStr.match(/(\d+)/)
            if (match) {
              durationValue = parseInt(match[1]) || 0
            } else {
              durationValue = parseInt(durationStr) || 0
            }
          }
          setValue("duration", durationValue)
          if (durationValue > 0) {
            filledFieldNames.push("duration")
          }
        } else {
          setValue("duration", 0)
        }
      }
      
      // Status - replace if exists in extraction
      if (fields.status !== undefined) {
        setDropdownValue("status", fields.status, projectStatusOptions, filledFieldNames)
      }
      
      // Start Date - replace if exists in extraction and is valid
      if (fields.start_date !== undefined) {
        const dateValue = fields.start_date ? String(fields.start_date) : ""
        if (dateValue) {
          // Validate date format and ensure it's not in the future
          try {
            const parsedDate = new Date(dateValue)
            const today = new Date()
            today.setHours(23, 59, 59, 999)
            // Only track if date is valid and not in the future
            if (!isNaN(parsedDate.getTime()) && parsedDate <= today) {
              setValue("start_date", dateValue)
              filledFieldNames.push("start_date")
            } else {
              // Set empty if invalid or future date
              setValue("start_date", "")
            }
          } catch {
            // Set empty if parsing fails
            setValue("start_date", "")
          }
        } else {
          setValue("start_date", "")
        }
      }
      
      // Project Level - replace if exists in extraction
      if (fields.proj_level !== undefined) {
        setDropdownValue("proj_level", fields.proj_level, projectLevelOptions, filledFieldNames)
      }
      
      // Grant Year - replace if exists in extraction and is valid
      if (fields.grant_year !== undefined) {
        const yearValue = fields.grant_year ? String(fields.grant_year).trim() : ""
        if (yearValue) {
          // Validate it's exactly 4 digits and within valid range
          if (/^\d{4}$/.test(yearValue)) {
            const yearNum = parseInt(yearValue)
            if (yearNum >= 2000 && yearNum <= 2100) {
              setValue("grant_year", yearValue)
              filledFieldNames.push("grant_year")
            } else {
              setValue("grant_year", "")
            }
          } else {
            setValue("grant_year", "")
          }
        } else {
          setValue("grant_year", "")
        }
      }
      
      // Grant Sealed - replace if exists in extraction
      if (fields.grant_sealed !== undefined) {
        setValue("grant_sealed", Boolean(fields.grant_sealed))
        // Note: grant_sealed is a boolean, so we track it if it's explicitly set
        filledFieldNames.push("grant_sealed")
      }
      
      // Update the auto-filled fields set AFTER processing all fields
      setAutoFilledFields(new Set(filledFieldNames))
      
      // Show toast notification
      const filledCount = filledFieldNames.length
      if (filledCount > 0) {
        toast({
          title: "Form Auto-filled",
          description: `${filledCount} field(s) replaced with new extracted data`,
        })
      } else {
        toast({
          title: "Extraction Complete",
          description: "Data fields have been updated (some fields may be empty)",
        })
      }
    },
    clearAfterUse: false, // Keep data for manual editing
  })

  // Unsaved changes guard
  const { DialogComponent: NavigationDialog } = useUnsavedChangesGuard({
    form,
    clearDocumentData: () => {
      clearDocumentData()
      clearAutoFillData()
    },
    clearAutoFillData: clearAutoFillData,
    enabled: true,
    message: "Are you sure to discard the unsaved changes?",
  })

  // Cancel handler
  const { handleCancel, DialogComponent: CancelDialog } = useFormCancelHandler({
    form,
    clearDocumentData: () => {
      clearDocumentData()
      clearAutoFillData()
    },
    redirectPath: "/teacher/research",
    skipWarning: false,
    message: "Are you sure to discard the unsaved changes?",
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear document data when leaving the page
      if (hasDocumentData) {
        clearDocumentData()
        clearAutoFillData()
      }
    }
  }, [hasDocumentData, clearDocumentData, clearAutoFillData])

  // Note: Dropdown data is already available from Context, no need to fetch

  // Format date for input helper
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().split("T")[0]
    } catch (error) {
      return ""
    }
  }

  // Use React Query to fetch research projects - always fetch fresh data for edit pages
  const { data: researchData, isLoading: isLoadingResearch } = useQuery({
    queryKey: teacherQueryKeys.research(teacherId),
    queryFn: async () => {
      const res = await fetch(`/api/teacher/research?teacherId=${teacherId}`)
      if (!res.ok) {
        throw new Error("Failed to fetch research projects")
      }
      return res.json()
    },
    enabled: !!params.id && !!teacherId && teacherId > 0,
    staleTime: 0, // Always fetch fresh data for edit pages
    gcTime: 0, // Don't cache for edit pages
    refetchOnMount: true, // Always refetch when component mounts
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (!researchData || !params.id) return

    const formattedProjects = Array.isArray(researchData.researchProjects)
      ? researchData.researchProjects
      : [researchData.researchProjects]

    const project = formattedProjects.find((p: any) => p.projid.toString() === params.id)

    if (!project) {
      toast({
        title: "Project not found",
        description: "The research project you're looking for doesn't exist.",
        variant: "destructive",
      })
      router.push("/teacher/research")
      return
    }

    // Reset form with project data
    const formData = {
      title: project.title || "",
      funding_agency: project.funding_agency || null,
      grant_sanctioned: project.grant_sanctioned?.toString() || "",
      grant_received: project.grant_received?.toString() || "",
      proj_nature: project.proj_nature || null,
      duration: project.duration?.toString() || "",
      status: project.status || null,
      start_date: formatDateForInput(project.start_date),
      proj_level: project.proj_level || null,
      grant_year: project.grant_year?.toString() || "",
      grant_sealed: project.grant_sealed || false,
      Pdf: project.Pdf || "",
    }

    reset(formData)
    setDocumentUrl(project.Pdf || null)
    setExistingDocumentUrl(project.Pdf || null)
  }, [researchData, params.id, reset, router, toast])

  const isLoading = isLoadingResearch || !researchData

  // Handle extracted fields from DocumentUpload - REPLACE existing data with new extracted data
  const handleExtractedFields = useCallback((fields: Record<string, any>) => {
    let fieldsPopulated = 0

    // Track which fields were auto-filled (only fields that were successfully set)
    const filledFieldNames: string[] = []

    // REPLACE all fields - set values even if they're empty/null in extracted data
    // This ensures existing data is replaced with new extracted data
    
    // Title - replace if exists in extraction, otherwise keep existing
    if (fields.title !== undefined) {
      const titleValue = fields.title ? String(fields.title).trim() : ""
      setValue("title", titleValue)
      if (titleValue) {
        fieldsPopulated++
        filledFieldNames.push("title")
      }
    }
    
    // Funding Agency - replace if exists in extraction
    if (fields.fundingAgency !== undefined) {
      if (fields.fundingAgency) {
        const matchingAgency = fundingAgencyOptions.find(
          (a) => a.name.toLowerCase().includes(fields.fundingAgency.toLowerCase()) || 
                 fields.fundingAgency.toLowerCase().includes(a.name.toLowerCase())
        )
        if (matchingAgency) {
          setValue("funding_agency", matchingAgency.id)
          fieldsPopulated++
          filledFieldNames.push("funding_agency")
        } else {
          setValue("funding_agency", null)
        }
      } else {
        setValue("funding_agency", null)
      }
    }
    
    // Grant Sanctioned - replace if exists in extraction
    if (fields.totalGrantSanctioned !== undefined) {
      const grantValue = fields.totalGrantSanctioned
      if (grantValue) {
        const cleanedValue = parseCurrencyAmount(grantValue)
        setValue("grant_sanctioned", cleanedValue)
        // Only track if we successfully parsed a valid number
        if (cleanedValue && !isNaN(parseFloat(cleanedValue)) && parseFloat(cleanedValue) > 0) {
          fieldsPopulated++
          filledFieldNames.push("grant_sanctioned")
        }
      } else {
        setValue("grant_sanctioned", "")
      }
    }
    
    // Grant Received - replace if exists in extraction
    if (fields.totalGrantReceived !== undefined) {
      const grantValue = fields.totalGrantReceived
      if (grantValue) {
        const cleanedValue = parseCurrencyAmount(grantValue)
        setValue("grant_received", cleanedValue)
        // Only track if we successfully parsed a valid number
        if (cleanedValue && !isNaN(parseFloat(cleanedValue)) && parseFloat(cleanedValue) > 0) {
          fieldsPopulated++
          filledFieldNames.push("grant_received")
        }
      } else {
        setValue("grant_received", "")
      }
    }
    
    // Project Nature - replace if exists in extraction
    if (fields.projectNature !== undefined) {
      setValue("proj_nature", typeof fields.projectNature === 'number' ? fields.projectNature : null)
      if (fields.projectNature) fieldsPopulated++
    }
    
    // Level - replace if exists in extraction
    if (fields.level !== undefined) {
      if (fields.level) {
        const matchingLevel = projectLevelOptions.find(
          (l) => l.name.toLowerCase().includes(fields.level.toLowerCase()) ||
                 fields.level.toLowerCase().includes(l.name.toLowerCase())
        )
        if (matchingLevel) {
          setValue("proj_level", matchingLevel.id)
          fieldsPopulated++
          filledFieldNames.push("proj_level")
        } else {
          setValue("proj_level", null)
        }
      } else {
        setValue("proj_level", null)
      }
    }
    
    // Duration - replace if exists in extraction
    if (fields.duration !== undefined) {
      setValue("duration", fields.duration ? fields.duration.toString() : "0")
      if (fields.duration) fieldsPopulated++
    }
    
    // Status - replace if exists in extraction
    if (fields.status !== undefined) {
      if (fields.status) {
        const matchingStatus = projectStatusOptions.find(
          (s) => s.name.toLowerCase().includes(fields.status.toLowerCase()) ||
                 fields.status.toLowerCase().includes(s.name.toLowerCase())
        )
        if (matchingStatus) {
          setValue("status", matchingStatus.id)
          fieldsPopulated++
          filledFieldNames.push("status")
        } else {
          setValue("status", null)
        }
      } else {
        setValue("status", null)
      }
    }
    
    // Start Date - replace if exists in extraction and is valid
    if (fields.startDate !== undefined) {
      const dateValue = fields.startDate
      if (dateValue) {
        // Validate date format and ensure it's not in the future
        try {
          const parsedDate = new Date(dateValue)
          const today = new Date()
          today.setHours(23, 59, 59, 999)
          // Only track if date is valid and not in the future
          if (!isNaN(parsedDate.getTime()) && parsedDate <= today) {
            setValue("start_date", dateValue)
            fieldsPopulated++
            filledFieldNames.push("start_date")
          } else {
            setValue("start_date", "")
          }
        } catch {
          setValue("start_date", "")
        }
      } else {
        setValue("start_date", "")
      }
    }
    
    // Seed Grant - replace if exists in extraction
    if (fields.seedGrant !== undefined) {
      setValue("grant_sanctioned", fields.seedGrant ? fields.seedGrant.toString() : "")
      if (fields.seedGrant) fieldsPopulated++
    }
    
    // Seed Grant Year - replace if exists in extraction and is valid
    if (fields.seedGrantYear !== undefined) {
      const yearValue = fields.seedGrantYear
      if (yearValue) {
        const yearStr = String(yearValue).trim()
        // Validate it's exactly 4 digits and within valid range
        if (/^\d{4}$/.test(yearStr)) {
          const yearNum = parseInt(yearStr)
          if (yearNum >= 2000 && yearNum <= 2100) {
            setValue("grant_year", yearStr)
            fieldsPopulated++
            filledFieldNames.push("grant_year")
          } else {
            setValue("grant_year", "")
          }
        } else {
          setValue("grant_year", "")
        }
      } else {
        setValue("grant_year", "")
      }
    }

    // Update auto-filled fields tracking
    setAutoFilledFields(new Set(filledFieldNames))

    if (fieldsPopulated > 0) {
      toast({
        title: "Information Extracted Successfully",
        description: `${fieldsPopulated} fields replaced with new extracted data`,
      })
    } else {
      toast({
        title: "Extraction Complete",
        description: "Data fields have been updated (some fields may be empty)",
      })
    }
  }, [setValue, toast, fundingAgencyOptions, projectLevelOptions, projectStatusOptions, parseCurrencyAmount, setAutoFilledFields])

  const onSubmit = async (data: ResearchProjectFormData) => {
    const projectId = params.id as string

    if (!teacherId) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!data.title?.trim() || !data.funding_agency || !data.proj_nature || !data.status || !data.start_date || !data.duration || !data.proj_level || !data.grant_sanctioned || !data.grant_received) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Funding Agency, Project Nature, Status, Start Date, Duration, Project Level, Grant Sanctioned, Grant Received)",
        variant: "destructive",
      })
      return
    }

    // Validate numeric fields
    const grantSanctioned = data.grant_sanctioned?.trim() ? parseFloat(data.grant_sanctioned.replace(/[,\s]/g, '')) : null
    const grantReceived = data.grant_received?.trim() ? parseFloat(data.grant_received.replace(/[,\s]/g, '')) : null
    const duration = data.duration && data.duration > 0 ? Math.floor(data.duration) : null

    if (!grantSanctioned || isNaN(grantSanctioned) || grantSanctioned < 0) {
      toast({
        title: "Validation Error",
        description: "Grant Sanctioned is required and must be a valid positive number",
        variant: "destructive",
      })
      return
    }

    if (!grantReceived || isNaN(grantReceived) || grantReceived < 0) {
      toast({
        title: "Validation Error",
        description: "Grant Received is required and must be a valid positive number",
        variant: "destructive",
      })
      return
    }

    // Validate that Grant Sanctioned is not less than Grant Received
    if (grantReceived > grantSanctioned) {
      toast({
        title: "Validation Error",
        description: "Grant Received cannot be greater than Grant Sanctioned",
        variant: "destructive",
      })
      return
    }

    if (!duration || duration <= 0) {
      toast({
        title: "Validation Error",
        description: "Duration is required and must be a positive number",
        variant: "destructive",
      })
      return
    }

    // Grant Year: only set if grant_sealed is checked, otherwise null
    let grantYear = null
    if (data.grant_sealed && data.grant_year?.trim()) {
      // Validate it's exactly 4 digits
      if (!/^\d{4}$/.test(data.grant_year.trim())) {
        toast({
          title: "Validation Error",
          description: "Grant Year must be exactly 4 digits",
          variant: "destructive",
        })
        return
      }
      const yearValue = parseInt(data.grant_year)
      if (!isNaN(yearValue) && yearValue >= 2000 && yearValue <= 2100) {
        grantYear = yearValue
      } else {
        toast({
          title: "Validation Error",
          description: "Grant Year must be a valid year between 2000 and 2100",
          variant: "destructive",
        })
        return
      }
    }

    // Handle document upload to S3 if a new document was uploaded
    let pdfPath = existingDocumentUrl || data.Pdf || ""
    const oldPdfPath = existingDocumentUrl // Store for deletion if new file is uploaded

    // Enhanced helper function to handle old file deletion with improved logging and error handling
    const handleOldFileDeletion = async (
      oldPath: string | null,
      newPath: string,
      recordId: number
    ) => {
      // Early return if no old path or paths are the same (updating same file)
      if (!oldPath || !oldPath.startsWith("upload/")) {
        return
      }

      // If old and new paths are the same, no deletion needed (same file being updated)
      if (oldPath === newPath) {
        console.log("Old and new file paths are identical - skipping deletion (same file update)")
        return
      }

      // Import helper functions
      const { deleteDocument, checkDocumentExists } = await import("@/lib/s3-upload-helper")

      try {
        // Optional: Check if file exists before attempting deletion (optimization)
        // This prevents unnecessary API calls if file was already deleted
        const existsCheck = await checkDocumentExists(oldPath)
        
        if (!existsCheck.exists) {
          console.log(`Old file does not exist in S3 (may have been already deleted): ${oldPath}`)
          return
        }

        // File exists, proceed with deletion
        console.log(`Attempting to delete old S3 file: ${oldPath}`)
        const deleteResult = await deleteDocument(oldPath)
        
        if (deleteResult.success) {
          console.log(`Successfully deleted old S3 file: ${oldPath}`)
        } else {
          console.warn(`Failed to delete old S3 file: ${oldPath}`, {
            error: deleteResult.message,
            recordId,
            oldPath,
            newPath
          })
          // Don't fail the update if old file deletion fails - this is a cleanup operation
        }
      } catch (deleteError: any) {
        console.warn("Error during old file deletion process:", {
          error: deleteError?.message || deleteError,
          oldPath,
          newPath,
          recordId
        })
        // Don't fail the update if old file deletion fails - this is a cleanup operation
      }
    }

    // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
    if (documentUrl && documentUrl.startsWith("/uploaded-document/")) {
      try {
        const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        const recordId = parseInt(projectId, 10)
        
        // Upload new document to S3 with Pattern 1: upload/research pdf/{userId}_{recordId}.pdf
        pdfPath = await uploadDocumentToS3(
          documentUrl,
          teacherId,
          recordId,
          "research pdf" // Folder name for research projects (matches existing convention)
        )
        
        // Verify we got a valid S3 virtual path
        if (!pdfPath || !pdfPath.startsWith("upload/")) {
          throw new Error("Failed to get S3 virtual path from upload")
        }

        // Enhanced deletion logic: Delete old file if it exists and is different from new one
        await handleOldFileDeletion(oldPdfPath, pdfPath, recordId)
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        toast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document to S3. Please try again.",
          variant: "destructive",
        })
        return
      }
    } else if (documentUrl && documentUrl.startsWith("upload/")) {
      // Already an S3 path, use as-is
      pdfPath = documentUrl
      
      // If the document URL changed but is still an S3 path, check if we need to delete old file
      if (oldPdfPath && oldPdfPath !== pdfPath) {
        const recordId = parseInt(projectId, 10)
        await handleOldFileDeletion(oldPdfPath, pdfPath, recordId)
      }
    } else if (documentUrl && !documentUrl.startsWith("/uploaded-document/") && !documentUrl.startsWith("upload/")) {
      // Invalid path format
      toast({
        title: "Invalid Document Path",
        description: "Document path format is invalid. Please upload the document again.",
        variant: "destructive",
      })
      return
    }

    const projectData = {
      title: data.title.trim(),
      funding_agency: data.funding_agency,
      grant_sanctioned: grantSanctioned,
      grant_received: grantReceived,
      proj_nature: data.proj_nature,
      duration: duration,
      status: data.status,
      start_date: data.start_date,
      proj_level: data.proj_level,
      grant_year: grantYear,
      grant_sealed: data.grant_sealed,
      Pdf: pdfPath,
    }

    // Use mutation instead of direct fetch
    updateResearch.mutate(
      { projectId: parseInt(projectId), projectData },
      {
        onSuccess: () => {
          // Clear document data on successful submission
          clearDocumentData()
          clearAutoFillData()
          setAutoFilledFields(new Set())
          router.push("/teacher/research")
        },
      }
    )
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading research project...</p>
          </div>
        </div>
    )
  }

  return (
    <>
      {NavigationDialog && <NavigationDialog />}
      {CancelDialog && <CancelDialog />}
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
          </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Research Project</h1>
        </div>

              <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Research Project Details</CardTitle>
                </CardHeader>
        <CardContent>
          {/* Document Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <Label className="text-lg font-semibold mb-3 block">Step 1: Supporting Document</Label>
            <DocumentUpload
              documentUrl={documentUrl || undefined}
              category="Research & Consultancy"
              subCategory="Research Projects"
              onChange={(url) => {
                setDocumentUrl(url)
                setValue("Pdf", url)
              }}
              onExtract={handleExtractedFields}
              className="w-full"
              isEditMode={true}
              onClearFields={() => {
                // Clear all form fields when document is cleared in edit mode
                reset()
              }}
            />
          </div>

          {/* Form Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-lg font-semibold mb-4 block">Step 2: Update Project Details</Label>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">
                    Project Title <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="title"
                    rules={{ required: "Project title is required" }}
                    render={({ field }) => (
                      <Input 
                        {...field} 
                        id="title" 
                        placeholder="Enter project title"
                        className={cn(
                          isAutoFilled("title") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                        onChange={(e) => {
                          field.onChange(e)
                          clearAutoFillHighlight("title")
                        }}
                      />
                    )}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                    </div>

                {/* Funding Agency */}
                <div className="space-y-2">
                  <Label htmlFor="funding_agency">
                    Funding Agency <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="funding_agency"
                    rules={{ required: "Funding agency is required" }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={fundingAgencyOptions.map((a) => ({
                          value: a.id,
                          label: a.name,
                        }))}
                        value={field.value || ""}
                        onValueChange={(val) => {
                          field.onChange(Number(val))
                          clearAutoFillHighlight("funding_agency")
                        }}
                        placeholder="Select funding agency"
                        emptyMessage="No funding agency found"
                        className={cn(
                          isAutoFilled("funding_agency") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                      />
                    )}
                  />
                  {errors.funding_agency && (
                    <p className="text-sm text-red-500 mt-1">{errors.funding_agency.message}</p>
                  )}
                    </div>

                {/* Project Nature */}
                <div className="space-y-2">
                  <Label htmlFor="proj_nature">
                    Project Nature <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="proj_nature"
                    rules={{ required: "Project nature is required" }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={projectNatureOptions.map((n) => ({
                          value: n.id,
                          label: n.name,
                        }))}
                        value={field.value || ""}
                        onValueChange={(val) => {
                          field.onChange(Number(val))
                          clearAutoFillHighlight("proj_nature")
                        }}
                        placeholder="Select project nature"
                        emptyMessage="No project nature found"
                        className={cn(
                          isAutoFilled("proj_nature") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                      />
                    )}
                  />
                  {errors.proj_nature && (
                    <p className="text-sm text-red-500 mt-1">{errors.proj_nature.message}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="status"
                    rules={{ required: "Status is required" }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={projectStatusOptions.map((s) => ({
                          value: s.id,
                          label: s.name,
                        }))}
                        value={field.value || ""}
                        onValueChange={(val) => {
                          field.onChange(Number(val))
                          clearAutoFillHighlight("status")
                        }}
                        placeholder="Select status"
                        emptyMessage="No status found"
                        className={cn(
                          isAutoFilled("status") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                      />
                    )}
                  />
                  {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>}
                  </div>


                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="start_date"
                    rules={{ 
                      required: "Start date is required",
                      validate: (value) => {
                        if (!value) return "Start date is required"
                        const selectedDate = new Date(value)
                        const today = new Date()
                        today.setHours(23, 59, 59, 999)
                        if (selectedDate > today) {
                          return "Start date cannot be in the future"
                        }
                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input 
                        {...field} 
                        id="start_date" 
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        className={cn(
                          isAutoFilled("start_date") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                        onChange={(e) => {
                          field.onChange(e)
                          clearAutoFillHighlight("start_date")
                        }}
                      />
                    )}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>
                  )}
                    </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration (months) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="duration"
                    rules={{ 
                      required: "Duration is required",
                      min: { value: 1, message: "Duration must be at least 1 month" }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="duration"
                        type="number"
                        placeholder="Enter duration in months"
                        min="1"
                        value={field.value || ""}
                        className={cn(
                          isAutoFilled("duration") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                        onChange={(e) => {
                          field.onChange(e.target.value ? Number(e.target.value) : "")
                          clearAutoFillHighlight("duration")
                        }}
                      />
                    )}
                  />
                  {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>}
                  </div>

                {/* Grant Sanctioned */}
                <div className="space-y-2">
                  <Label htmlFor="grant_sanctioned">
                    Grant Sanctioned (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="grant_sanctioned"
                    rules={{ 
                      required: "Grant Sanctioned is required",
                      min: { value: 0, message: "Grant Sanctioned must be a positive number" },
                      validate: (value) => {
                        const sanctioned = parseFloat(String(value || 0))
                        const received = parseFloat(String(grantReceived || 0))
                        if (received > 0 && sanctioned < received) {
                          return "Grant Sanctioned cannot be less than Grant Received"
                        }
                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="grant_sanctioned"
                        type="number"
                        placeholder="Enter sanctioned amount"
                        min="0"
                        step="0.01"
                        className={cn(
                          isAutoFilled("grant_sanctioned") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                        onChange={(e) => {
                          field.onChange(e)
                          clearAutoFillHighlight("grant_sanctioned")
                          // Trigger validation for grant_received when grant_sanctioned changes
                          setTimeout(() => trigger("grant_received"), 0)
                        }}
                      />
                    )}
                  />
                  {errors.grant_sanctioned && <p className="text-sm text-red-500 mt-1">{errors.grant_sanctioned.message}</p>}
                  </div>

                {/* Grant Received */}
                <div className="space-y-2">
                  <Label htmlFor="grant_received">
                    Grant Received (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="grant_received"
                    rules={{ 
                      required: "Grant Received is required",
                      min: { value: 0, message: "Grant Received must be a positive number" },
                      validate: (value) => {
                        const received = parseFloat(String(value || 0))
                        const sanctioned = parseFloat(String(grantSanctioned || 0))
                        if (sanctioned > 0 && received > sanctioned) {
                          return "Grant Received cannot be greater than Grant Sanctioned"
                        }
                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="grant_received"
                        type="number"
                        placeholder="Enter received amount"
                        min="0"
                        step="0.01"
                        className={cn(
                          isAutoFilled("grant_received") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                        onChange={(e) => {
                          field.onChange(e)
                          clearAutoFillHighlight("grant_received")
                          // Trigger validation for grant_sanctioned when grant_received changes
                          setTimeout(() => trigger("grant_sanctioned"), 0)
                        }}
                      />
                    )}
                  />
                  {errors.grant_received && <p className="text-sm text-red-500 mt-1">{errors.grant_received.message}</p>}
                    </div>

                {/* Project Level */}
                <div className="space-y-2">
                  <Label htmlFor="proj_level">
                    Project Level <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="proj_level"
                    rules={{ required: "Project Level is required" }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={projectLevelOptions.map((l) => ({
                          value: l.id,
                          label: l.name,
                        }))}
                        value={field.value || ""}
                        onValueChange={(val) => {
                          field.onChange(val ? Number(val) : null)
                          clearAutoFillHighlight("proj_level")
                        }}
                        placeholder="Select project level"
                        emptyMessage="No level found"
                        className={cn(
                          isAutoFilled("proj_level") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                      />
                    )}
                  />
                  {errors.proj_level && <p className="text-sm text-red-500 mt-1">{errors.proj_level.message}</p>}
                  </div>

                {/* Grant Sealed Checkbox */}
                <div className="md:col-span-2 flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="grant_sealed"
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="grant_sealed"
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked)
                          clearAutoFillHighlight("grant_sealed")
                          // Clear grant_year when unchecked
                          if (!e.target.checked) {
                            setValue("grant_year", "")
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    )}
                  />
                  <Label htmlFor="grant_sealed" className="cursor-pointer">
                    Whether this Project is under University Grant Seed
                  </Label>
                </div>

                {/* Grant Year - Only enabled when grant_sealed is checked */}
                <div className="space-y-2">
                  <Label htmlFor="grant_year">Grant Year</Label>
                  <Controller
                    control={control}
                    name="grant_year"
                    rules={{
                      validate: (value) => {
                        if (grantSealed && !value?.trim()) {
                          return "Grant Year is required when University Grant Seed is selected"
                        }
                        if (grantSealed && value?.trim()) {
                          // Check if it's exactly 4 digits
                          if (!/^\d{4}$/.test(value.trim())) {
                            return "Grant Year must be exactly 4 digits"
                          }
                          const yearValue = parseInt(value)
                          if (isNaN(yearValue) || yearValue < 2000 || yearValue > 2100) {
                            return "Grant Year must be between 2000 and 2100"
                          }
                        }
                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="grant_year"
                        type="number"
                        placeholder="Enter grant year (YYYY)"
                        min="2000"
                        max="2100"
                        maxLength={4}
                        disabled={!grantSealed || updateResearch.isPending}
                        className={cn(
                          !grantSealed && "bg-gray-100 cursor-not-allowed",
                          grantSealed && isAutoFilled("grant_year") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        )}
                        onChange={(e) => {
                          // Limit to 4 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          field.onChange(value)
                          clearAutoFillHighlight("grant_year")
                        }}
                      />
                    )}
                  />
                  {errors.grant_year && <p className="text-sm text-red-500 mt-1">{errors.grant_year.message}</p>}
                </div>
                    </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={updateResearch.isPending}>
              Cancel
            </Button>
                <Button type="submit" disabled={updateResearch.isPending}>
                  {updateResearch.isPending ? (
                <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                </>
              ) : (
                <>
                      <Save className="mr-2 h-4 w-4" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </form>
          </div>
        </CardContent>
      </Card>

      </div>
    </>
  )
}
