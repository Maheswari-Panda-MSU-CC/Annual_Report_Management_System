"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ConsultancyForm } from "@/components/forms/ConsultancyForm"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useConsultancyMutations } from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useToast } from "@/components/ui/use-toast"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useCallback } from "react"

export default function AddConsultancyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const form = useForm()
  const { setValue, watch, reset } = form
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Use mutation for creating consultancy
  const { create: createConsultancy } = useConsultancyMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "consultancy", // Explicit form type
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Clear previous highlighting when new document extraction happens
      setAutoFilledFields(new Set())
      
      // Track which fields were auto-filled (only non-empty fields)
      const filledFieldNames: string[] = []
      
      // Auto-fill form fields from document analysis
      // Note: fields are already mapped by categories-field-mapping.ts hook
      // Form field names: title, collaboratingInstitute, address, startDate, duration, amount, detailsOutcome
      
      // Title - form field is "title"
      if (fields.title) {
        setValue("title", String(fields.title))
        filledFieldNames.push("title")
      } else if (fields.name) {
        // Fallback if mapping didn't work (backend uses name, form uses title)
        setValue("title", String(fields.name))
        filledFieldNames.push("title")
      }
      
      // Collaborating Institute - form field is "collaboratingInstitute"
      if (fields.collaboratingInstitute) {
        setValue("collaboratingInstitute", String(fields.collaboratingInstitute))
        filledFieldNames.push("collaboratingInstitute")
      } else if (fields.collaborating_inst) {
        // Fallback if mapping didn't work
        setValue("collaboratingInstitute", String(fields.collaborating_inst))
        filledFieldNames.push("collaboratingInstitute")
      }
      
      // Address
      if (fields.address) {
        setValue("address", String(fields.address))
        filledFieldNames.push("address")
      }
      
      // Start Date - form field is "startDate"
      if (fields.startDate) {
        setValue("startDate", String(fields.startDate))
        filledFieldNames.push("startDate")
      } else if (fields.Start_Date) {
        // Fallback if mapping didn't work
        setValue("startDate", String(fields.Start_Date))
        filledFieldNames.push("startDate")
      }
      
      // Duration - validate it's a valid number
      if (fields.duration !== undefined && fields.duration !== null) {
        const durationValue = Number(fields.duration)
        if (!isNaN(durationValue) && durationValue >= 0) {
          setValue("duration", durationValue)
          filledFieldNames.push("duration")
        }
      }
      
      // Amount - validate it's a valid number
      if (fields.amount !== undefined && fields.amount !== null) {
        // Handle comma-separated numbers
        const amountValue = String(fields.amount).replace(/,/g, '').trim()
        const numValue = Number(amountValue)
        if (!isNaN(numValue) && numValue >= 0) {
          setValue("amount", numValue)
          filledFieldNames.push("amount")
        }
      }
      
      // Details / Outcome - form field is "detailsOutcome"
      if (fields.detailsOutcome) {
        setValue("detailsOutcome", String(fields.detailsOutcome))
        filledFieldNames.push("detailsOutcome")
      } else if (fields.details || fields.outcome) {
        // Fallback if mapping didn't work
        setValue("detailsOutcome", String(fields.details || fields.outcome))
        filledFieldNames.push("detailsOutcome")
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
    redirectPath: "/teacher/research-contributions?tab=consultancy",
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
    
    // Handle document upload to S3 - MUST succeed before saving record
    let docUrl: string | null = null

    if (documentUrl && documentUrl.startsWith("/uploaded-document/")) {
      try {
        const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        // For new records, use timestamp as recordId since DB record doesn't exist yet
        const tempRecordId = Date.now()
        
        // Upload new document to S3 with Pattern 1: upload/Consultancy_Undertaken/{userId}_{recordId}.pdf
        docUrl = await uploadDocumentToS3(
          documentUrl,
          user?.role_id || 0,
          tempRecordId,
          "Consultancy_Undertaken"
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
        console.error("❌ [Consultancy Add] Document upload error:", docError)
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
      // Invalid path format or no document
      toast({
        title: "Invalid Document Path",
        description: "Document path format is invalid. Please upload the document again.",
        variant: "destructive",
        duration: 3000,
      })
      setIsSubmitting(false)
      return // Prevent record from being saved
    }

    // CRITICAL: Final validation before saving - ensure we have a valid S3 path
    if (!docUrl || !docUrl.startsWith("upload/")) {
      toast({
        title: "Validation Error",
        description: "Document upload validation failed. Record will not be saved.",
        variant: "destructive",
        duration: 5000,
      })
      setIsSubmitting(false)
      return // Prevent record from being saved
    }

    try {

      const consultancyData = {
        name: data.title,
        collaborating_inst: data.collaboratingInstitute,
        address: data.address,
        duration: data.duration ? Number(data.duration) : null,
        amount: data.amount ? data.amount.toString() : null,
        submit_date: new Date().toISOString().split('T')[0], // Current date
        Start_Date: data.startDate,
        outcome: data.detailsOutcome || null,
        doc: docUrl,
      }

      // Use mutation to create consultancy
      createConsultancy.mutate(consultancyData, {
        onSuccess: () => {
          clearDocumentData()
          clearAutoFillData()
          // Smooth transition
          setTimeout(() => {
            router.push("/teacher/research-contributions?tab=consultancy")
          }, 500)
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to save consultancy record. Please try again.",
            variant: "destructive",
            duration: 5000,
          })
        },
      })
    } catch (error: any) {
      console.error("❌ [Consultancy Add] Unexpected error:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
      setIsSubmitting(false)
    } finally {
      // Only reset if not submitting (mutation handles success/error)
      if (!createConsultancy.isPending) {
        setIsSubmitting(false)
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
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to </span>Consultancy Undertaken
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Consultancy</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add details about consultancy projects undertaken with industry or institutions
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Consultancy Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ConsultancyForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting || createConsultancy.isPending}
              isEdit={false}
              initialDocumentUrl={autoFillDocumentUrl}
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
