"use client"

import { useState, useEffect,useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { EContentForm } from "@/components/forms/EcontentForm"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useEContentMutations } from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"

export default function AddEContentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const form = useForm()
  const { setValue, watch, reset } = form
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)

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
  const { eContentTypeOptions, typeEcontentValueOptions } = useDropDowns()
  
  // Use mutation for creating econtent
  const { create: createEContent } = useEContentMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "econtent", // Explicit form type
    dropdownOptions: {
      type: eContentTypeOptions,
      typeEcontentValue: typeEcontentValueOptions,
    },
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Clear previous highlighting when new document extraction happens
      setAutoFilledFields(new Set())
      
      // Track which fields were auto-filled (only non-empty fields)
      const filledFieldNames: string[] = []
      
      // Auto-fill form fields from document analysis
      if (fields.title || fields.Title) {
        setValue("title", String(fields.title || fields.Title))
        filledFieldNames.push("title")
      }
      if (fields.type !== undefined && fields.type !== null) {
        setValue("typeOfEContentPlatform", typeof fields.type === 'number' ? fields.type : Number(fields.type))
        filledFieldNames.push("typeOfEContentPlatform")
      }
      if (fields.brief_details || fields.Brief_Details) {
        setValue("briefDetails", String(fields.brief_details || fields.Brief_Details))
        filledFieldNames.push("briefDetails")
      }
      if (fields.quadrant || fields.Quadrant) {
        setValue("quadrant", String(fields.quadrant || fields.Quadrant))
        filledFieldNames.push("quadrant")
      }
      if (fields.Publishing_date || fields.publishingDate) {
        setValue("publishingDate", String(fields.Publishing_date || fields.publishingDate))
        filledFieldNames.push("publishingDate")
      }
      if (fields.Publishing_Authorities || fields.publishingAuthorities) {
        setValue("publishingAuthorities", String(fields.Publishing_Authorities || fields.publishingAuthorities))
        filledFieldNames.push("publishingAuthorities")
      }
      if (fields.link || fields.Link) {
        setValue("link", String(fields.link || fields.Link))
        filledFieldNames.push("link")
      }
      if (fields.typeEcontentValue !== undefined && fields.typeEcontentValue !== null) {
        setValue("typeOfEContent", typeof fields.typeEcontentValue === 'number' ? fields.typeEcontentValue : Number(fields.typeEcontentValue))
        filledFieldNames.push("typeOfEContent")
      }
      
      // Update auto-filled fields set
      if (filledFieldNames.length > 0) {
        setAutoFilledFields(new Set(filledFieldNames)) // Use new Set instead of merging
      }
      
      // Show toast notification
      const filledCount = Object.keys(fields).filter(
        k => fields[k] !== null && fields[k] !== undefined && fields[k] !== ""
      ).length
      if (filledCount > 0) {
        toast({
          title: "Form Auto-filled",
          description: `Populated ${filledCount} field(s) from document analysis.`,
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
    redirectPath: "/teacher/research-contributions?tab=econtent",
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

  const handleExtractInfo = async () => {
    setIsExtracting(true)
    try {
      const res = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "econtent" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "econtent" }),
      })
      const { data, success, extracted_fields, confidence } = await res2.json()

      if (success) {
        Object.entries(data).forEach(([key, value]) => {
          form.setValue(key, value)
        })

        toast({
          title: "Success",
          description: `Form auto-filled with ${extracted_fields} fields (${Math.round(
            confidence * 100
          )}% confidence)`,
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-fill form.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsExtracting(false)
    }
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
      // Handle document upload to S3 if a new document was uploaded
      let docUrl = documentUrl

      // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
      if (documentUrl && documentUrl.startsWith("/uploaded-document/")) {
        try {
          // Extract fileName from local URL
          const fileName = documentUrl.split("/").pop()
          
          if (fileName) {
            // Upload to S3 using the file in /public/uploaded-document/
            const s3Response = await fetch("/api/shared/s3", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fileName: fileName,
              }),
            })

            if (!s3Response.ok) {
              const s3Error = await s3Response.json()
              throw new Error(s3Error.error || "Failed to upload document to S3")
            }

            const s3Data = await s3Response.json()
            docUrl = s3Data.url // Use S3 URL for database storage

            // Delete local file after successful S3 upload
            await fetch("/api/shared/local-document-upload", {
              method: "DELETE",
            })
          }
        } catch (docError: any) {
          console.error("Document upload error:", docError)
          toast({
            title: "Document Upload Error",
            description: docError.message || "Failed to upload document. Please try again.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      const eContentData = {
        title: data.title,
        Brief_Details: data.briefDetails,
        Quadrant: Number(data.quadrant),
        Publishing_date: data.publishingDate,
        Publishing_Authorities: data.publishingAuthorities,
        link: data.link || null,
        type_econtent: data.typeOfEContent ? Number(data.typeOfEContent) : null,
        e_content_type: data.typeOfEContentPlatform ? Number(data.typeOfEContentPlatform) : null,
        doc: docUrl,
      }

      // Use mutation to create econtent
      createEContent.mutate(eContentData, {
        onSuccess: () => {
          // Smooth transition
          setTimeout(() => {
            router.push("/teacher/research-contributions?tab=econtent")
          }, 500)
        },
      })
    } catch (error: any) {
      // Error is handled by mutation's onError callback
      setIsSubmitting(false)
    } finally {
      // Only reset if not submitting (mutation handles success/error)
      if (!createEContent.isPending) {
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
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden sm:inline">Back to </span>E-Content Development
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New E-Content</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add details about your e-learning content, online courses, or digital educational materials
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">E-Content Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
           <EContentForm
              form={form}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting || createEContent.isPending}
              isExtracting={isExtracting}
              selectedFiles={null}
              handleFileSelect={() => {}}
              handleExtractInfo={handleExtractInfo}
              isEdit={false}
              eContentTypeOptions={eContentTypeOptions}
              typeEcontentValueOptions={typeEcontentValueOptions}
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
