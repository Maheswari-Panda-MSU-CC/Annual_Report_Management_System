"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { JrfSrfForm } from "@/components/forms/JrfSrfForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useJrfSrfMutations } from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

export default function AddJrfSrfPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm()
  const { setValue, watch, reset } = form

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

  // Document analysis context
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()

  // Dropdowns - already available from Context, no need to fetch
  const { jrfSrfTypeOptions } = useDropDowns()
  
  // Use mutation for creating jrf-srf
  const { create: createJrfSrf } = useJrfSrfMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "jrf-srf", // Explicit form type
    dropdownOptions: {
      type: jrfSrfTypeOptions,
    },
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Clear previous highlighting when new document extraction happens
      setAutoFilledFields(new Set())
      
      // Track which fields were auto-filled (only non-empty fields)
      const filledFieldNames: string[] = []
      
      // Auto-fill form fields from document analysis
      // Note: fields are already mapped by categories-field-mapping.ts hook
      // So we use the mapped field names directly (nameOfFellow, projectTitle, monthlyStipend, etc.)
      
      // Name of Fellow - form field is "nameOfFellow"
      if (fields.nameOfFellow) {
        setValue("nameOfFellow", String(fields.nameOfFellow))
        filledFieldNames.push("nameOfFellow")
      } else if (fields.name) {
        // Fallback if mapping didn't work
        setValue("nameOfFellow", String(fields.name))
        filledFieldNames.push("nameOfFellow")
      }
      
      // Type - only highlight if a valid option was found and set
      if (fields.type !== undefined && fields.type !== null) {
        let typeValue: number | null = null
        
        if (typeof fields.type === 'number') {
          // Check if the number matches an option ID
          if (jrfSrfTypeOptions.some(opt => opt.id === fields.type)) {
            typeValue = fields.type
          }
        } else {
          // Try to find matching option by name
          const typeOption = jrfSrfTypeOptions.find(
            opt => opt.name.toLowerCase() === String(fields.type).toLowerCase()
          )
          if (typeOption) {
            typeValue = typeOption.id
          } else {
            // Try to convert to number and check
            const numValue = Number(fields.type)
            if (!isNaN(numValue) && jrfSrfTypeOptions.some(opt => opt.id === numValue)) {
              typeValue = numValue
            }
          }
        }
        
        // Only set and highlight if we found a valid value that exists in options
        if (typeValue !== null && jrfSrfTypeOptions.some(opt => opt.id === typeValue)) {
          setValue("type", typeValue, { shouldValidate: true })
          filledFieldNames.push("type")
        }
      }
      
      // Project Title - form field is "projectTitle"
      if (fields.projectTitle) {
        setValue("projectTitle", String(fields.projectTitle))
        filledFieldNames.push("projectTitle")
      }
      
      // Duration - form field is "duration"
      if (fields.duration !== undefined && fields.duration !== null) {
        const durationValue = typeof fields.duration === 'number' 
          ? fields.duration 
          : Number(String(fields.duration).replace(/[^0-9.]/g, ''))
        if (!isNaN(durationValue)) {
          setValue("duration", durationValue)
          filledFieldNames.push("duration")
        }
      }
      
      // Monthly Stipend - validate it's a valid number
      if (fields.monthlyStipend !== undefined && fields.monthlyStipend !== null) {
        // Handle comma-separated numbers like "15,000"
        const stipendValue = String(fields.monthlyStipend).replace(/,/g, '').trim()
        const numValue = Number(stipendValue)
        if (!isNaN(numValue) && numValue >= 0) {
          setValue("monthlyStipend", numValue)
          filledFieldNames.push("monthlyStipend")
        }
      } else if (fields.stipend !== undefined && fields.stipend !== null) {
        // Fallback for "stipend" field name
        const stipendValue = String(fields.stipend).replace(/,/g, '').trim()
        const numValue = Number(stipendValue)
        if (!isNaN(numValue) && numValue >= 0) {
          setValue("monthlyStipend", numValue)
          filledFieldNames.push("monthlyStipend")
        }
      }
      
      // Date - form field is "date"
      if (fields.date) {
        setValue("date", String(fields.date))
        filledFieldNames.push("date")
      }
      
      // Update auto-filled fields set (only fields that were actually set)
      if (filledFieldNames.length > 0) {
        setAutoFilledFields(new Set(filledFieldNames))
      }
      
      // Show toast notification with actual count of filled fields
      if (filledFieldNames.length > 0) {
        toast({
          title: "Form Auto-filled",
          description: `Populated ${filledFieldNames.length} field(s) from document analysis.`,
        })
      }
    },
    clearAfterUse: false, // Keep data for manual editing
  })

  // Navigation guard
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
    redirectPath: "/teacher/research-contributions?tab=jrfSrf",
    skipWarning: false,
    message: "Are you sure to discard the unsaved changes?",
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hasDocumentData) {
        clearDocumentData()
        clearAutoFillData()
      }
    }
  }, [hasDocumentData, clearDocumentData, clearAutoFillData])

  // Clear fields handler
  const handleClearFields = () => {
    reset()
    setAutoFilledFields(new Set())
  }

  const handleSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User information not available. Please refresh the page.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Validate document upload is required
    const documentUrl = Array.isArray(data.supportingDocument) && data.supportingDocument.length > 0 
      ? data.supportingDocument[0] 
      : null

    if (!documentUrl) {
      toast({
        title: "Error",
        description: "Please upload a supporting document.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Handle document upload to S3 - MUST succeed before saving record
      let docUrl: string | null = null

      if (documentUrl && documentUrl.startsWith("/uploaded-document/")) {
        try {
          const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
          
          // For new records, use timestamp as recordId since DB record doesn't exist yet
          const tempRecordId = Date.now()
          
          // Upload new document to S3 with Pattern: upload/JRF_SRF/{userId}_{recordId}.pdf
          docUrl = await uploadDocumentToS3(
            documentUrl,
            user?.role_id || 0,
            tempRecordId,
            "JRF_SRF"
          )
          
          // CRITICAL: Verify we got a valid S3 virtual path (not dummy URL)
          if (!docUrl || !docUrl.startsWith("upload/")) {
            throw new Error("S3 upload failed: Invalid virtual path returned. Please try uploading again.")
          }
          
          // Additional validation: Ensure it's not a dummy URL
          if (docUrl.includes("dummy_document") || docUrl.includes("localhost") || docUrl.includes("http://") || docUrl.includes("https://")) {
            throw new Error("S3 upload failed: Document was not uploaded successfully. Please try again.")
          }
        } catch (docError: any) {
          console.error("❌ [JRF/SRF Add] Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document to S3. Record will not be saved.",
            variant: "destructive",
            duration: 5000,
          })
          setIsSubmitting(false)
          return // CRITICAL: Prevent record from being saved
        }
      } else if (documentUrl && documentUrl.startsWith("upload/")) {
        // Already an S3 path, use as-is (should not happen in add page, but handle it)
        docUrl = documentUrl
      } else {
        // No document or invalid path
        toast({
          title: "Document Required",
          description: "Please upload a supporting document.",
          variant: "destructive",
          duration: 3000,
        })
        setIsSubmitting(false)
        return
      }

      // Map form data to API format
      const jrfSrfData = {
        name: data.nameOfFellow,
        type: data.type ? Number(data.type) : null,
        title: data.projectTitle,
        duration: data.duration ? Number(data.duration) : null,
        stipend: data.monthlyStipend ? Number(data.monthlyStipend) : null,
        date: data.date || null,
        doc: docUrl,
      }

      // Use mutation to create jrf-srf
      createJrfSrf.mutate(jrfSrfData, {
        onSuccess: () => {
          // Smooth transition
          setTimeout(() => {
            router.push("/teacher/research-contributions?tab=jrfSrf")
          }, 500)
        },
      })
    } catch (error: any) {
      // Error is handled by mutation's onError callback
      setIsSubmitting(false)
    } finally {
      // Only reset if not submitting (mutation handles success/error)
      if (!createJrfSrf.isPending) {
        setIsSubmitting(false)
        form.reset()
      }
    }
  }

  return (
    <>
      <NavigationDialog />
      <CancelDialog />
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-10"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to </span>Jrf/Srf Details
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Jrf/Srf</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add details about your jrf/srf details here
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">JRF/SRF Fellowship Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <JrfSrfForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting || createJrfSrf.isPending}
              isEdit={false}
              jrfSrfTypeOptions={jrfSrfTypeOptions}
              initialDocumentUrl={autoFillDocumentUrl || undefined}
              onClearFields={handleClearFields}
              onCancel={handleCancel}
              isAutoFilled={isAutoFilled}
              onFieldChange={clearAutoFillHighlight}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
