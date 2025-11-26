"use client"

import { useState } from "react"
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

export default function AddJrfSrfPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const form = useForm()
  const { setValue, watch } = form

  // Dropdowns - already available from Context, no need to fetch
  const { jrfSrfTypeOptions } = useDropDowns()
  
  // Use mutation for creating jrf-srf
  const { create: createJrfSrf } = useJrfSrfMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
  } = useAutoFillData({
    formType: "jrf-srf", // Explicit form type
    dropdownOptions: {
      type: jrfSrfTypeOptions,
    },
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Auto-fill form fields from document analysis
      // Note: fields are already mapped by categories-field-mapping.ts hook
      // So we use the mapped field names directly (nameOfFellow, projectTitle, monthlyStipend, etc.)
      
      // Name of Fellow - form field is "nameOfFellow"
      if (fields.nameOfFellow) {
        setValue("nameOfFellow", String(fields.nameOfFellow))
      } else if (fields.name) {
        // Fallback if mapping didn't work
        setValue("nameOfFellow", String(fields.name))
      }
      
      // Type - this should already be matched to dropdown ID by the hook
      // But handle both number (ID) and string (name) cases
      if (fields.type !== undefined && fields.type !== null) {
        if (typeof fields.type === 'number') {
          setValue("type", fields.type)
        } else {
          // If it's a string, try to find matching option
          const typeOption = jrfSrfTypeOptions.find(
            opt => opt.name.toLowerCase() === String(fields.type).toLowerCase()
          )
          if (typeOption) {
            setValue("type", typeOption.id)
          } else {
            // If no match found, try to convert to number (in case it's a string number)
            const numValue = Number(fields.type)
            if (!isNaN(numValue)) {
              setValue("type", numValue)
            }
          }
        }
      }
      
      // Project Title - form field is "projectTitle"
      if (fields.projectTitle) {
        setValue("projectTitle", String(fields.projectTitle))
      }
      
      // Duration - form field is "duration"
      if (fields.duration !== undefined && fields.duration !== null) {
        const durationValue = typeof fields.duration === 'number' 
          ? fields.duration 
          : Number(String(fields.duration).replace(/[^0-9.]/g, ''))
        if (!isNaN(durationValue)) {
          setValue("duration", durationValue)
        }
      }
      
      // Monthly Stipend - form field is "monthlyStipend"
      // Handle comma-separated numbers like "15,000"
      if (fields.monthlyStipend !== undefined && fields.monthlyStipend !== null) {
        const stipendValue = String(fields.monthlyStipend).replace(/,/g, '').trim()
        const numValue = Number(stipendValue)
        if (!isNaN(numValue)) {
          setValue("monthlyStipend", numValue)
        } else if (stipendValue) {
          // If it's not a valid number, set as string anyway
          setValue("monthlyStipend", stipendValue)
        }
      } else if (fields.stipend !== undefined && fields.stipend !== null) {
        // Fallback for "stipend" field name
        const stipendValue = String(fields.stipend).replace(/,/g, '').trim()
        const numValue = Number(stipendValue)
        if (!isNaN(numValue)) {
          setValue("monthlyStipend", numValue)
        }
      }
      
      // Date - form field is "date"
      if (fields.date) {
        setValue("date", String(fields.date))
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

  const handleExtractInfo = async () => {
    setIsExtracting(true)
    try {
      const res = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "jrf_srf" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "jrf_srf" }),
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
         <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/research-contributions?tab=jrfSrf")}
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
            isExtracting={isExtracting}
            selectedFiles={null}
            handleFileSelect={() => {}}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            jrfSrfTypeOptions={jrfSrfTypeOptions}
            initialDocumentUrl={autoFillDocumentUrl || "undefined"}
          />
          </CardContent>
        </Card>
      </div>
      </>
  )
}
