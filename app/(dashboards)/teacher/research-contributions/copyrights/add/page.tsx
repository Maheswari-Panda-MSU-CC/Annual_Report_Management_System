"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { CopyrightForm } from "@/components/forms/CopyrightForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useCopyrightMutations } from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

export default function AddCopyrightsPage() {
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

  // Use mutation for creating copyright
  const { create: createCopyright } = useCopyrightMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "copyrights", // Explicit form type
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Clear previous highlighting when new document extraction happens
      setAutoFilledFields(new Set())
      
      // Track which fields were auto-filled (only fields that were successfully set)
      const filledFieldNames: string[] = []
      
      // Auto-fill form fields from document analysis
      if (fields.title || fields.Title) {
        setValue("title", String(fields.title || fields.Title))
        filledFieldNames.push("title")
      }
      if (fields.referenceNo || fields.Reference_No) {
        setValue("referenceNo", String(fields.referenceNo || fields.Reference_No))
        filledFieldNames.push("referenceNo")
      }
      // Publication Date - validate date format and not in future (now required)
      if (fields.publicationDate || fields.Publication_Date) {
        const dateValue = String(fields.publicationDate || fields.Publication_Date).trim()
        if (dateValue.length > 0) {
          const dateObj = new Date(dateValue)
          const today = new Date()
          today.setHours(23, 59, 59, 999)
          if (!isNaN(dateObj.getTime()) && dateObj <= today) {
            setValue("publicationDate", dateValue)
            filledFieldNames.push("publicationDate")
          }
        }
      }
      if (fields.link || fields.Link) {
        setValue("link", String(fields.link || fields.Link))
        filledFieldNames.push("link")
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
    redirectPath: "/teacher/research-contributions?tab=copyrights",
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
          
          // Upload new document to S3 with Pattern: upload/Copyrights/{userId}_{recordId}.pdf
          docUrl = await uploadDocumentToS3(
            documentUrl,
            user?.role_id || 0,
            tempRecordId,
            "Copyrights"
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
          console.error("❌ [Copyrights Add] Document upload error:", docError)
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
      const copyrightData = {
        Title: data.title,
        RefNo: data.referenceNo,
        PublicationDate: data.publicationDate || null,
        Link: data.link || null,
        doc: docUrl,
      }

      // Use mutation to create copyright
      createCopyright.mutate(copyrightData, {
        onSuccess: () => {
          // Navigate back to main page
          router.push("/teacher/research-contributions?tab=copyrights")
        },
      })
    } catch (error: any) {
      // Error is handled by mutation's onError callback
      setIsSubmitting(false)
    } finally {
      // Only reset if not submitting (mutation handles success/error)
      if (!createCopyright.isPending) {
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
            <span className="hidden sm:inline">Back to </span>Copyrights
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Copyright</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add details about copyrights you have obtained for your creative works
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Copyright Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <CopyrightForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting || createCopyright.isPending}
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
