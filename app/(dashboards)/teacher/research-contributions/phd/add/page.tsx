"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { PhdGuidanceForm } from "@/components/forms/PhdGuidanceForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { usePhdMutations } from "@/hooks/use-teacher-research-contributions-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"

export default function AddPhdPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const form = useForm()
  const { setValue, watch } = form

  // Dropdowns - already available from Context, no need to fetch
  const { phdGuidanceStatusOptions } = useDropDowns()
  
  // Use mutation for creating phd
  const { create: createPhd } = usePhdMutations()

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
  } = useAutoFillData({
    formType: "phd", // Explicit form type
    dropdownOptions: {
      status: phdGuidanceStatusOptions,
    },
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      // Auto-fill form fields from document analysis
      // Note: fields are already mapped by categories-field-mapping.ts hook
      // Form field names: regNo, nameOfStudent, dateOfRegistration, topic, status, yearOfCompletion
      
      // Registration Number - form field is "regNo"
      if (fields.regNo) {
        setValue("regNo", String(fields.regNo))
      } else if (fields.regno) {
        // Fallback if mapping didn't work
        setValue("regNo", String(fields.regno))
      }
      
      // Name of Student - form field is "nameOfStudent"
      if (fields.nameOfStudent) {
        setValue("nameOfStudent", String(fields.nameOfStudent))
      } else if (fields.name) {
        // Fallback if mapping didn't work
        setValue("nameOfStudent", String(fields.name))
      }
      
      // Date of Registration - form field is "dateOfRegistration"
      if (fields.dateOfRegistration) {
        setValue("dateOfRegistration", String(fields.dateOfRegistration))
      } else if (fields.start_date) {
        // Fallback if mapping didn't work
        setValue("dateOfRegistration", String(fields.start_date))
      }
      
      // Topic - form field is "topic"
      if (fields.topic) {
        setValue("topic", String(fields.topic))
      }
      
      // Status - this should already be matched to dropdown ID by the hook
      if (fields.status !== undefined && fields.status !== null) {
        if (typeof fields.status === 'number') {
          setValue("status", fields.status)
        } else {
          // If it's a string, try to find matching option
          const statusOption = phdGuidanceStatusOptions.find(
            opt => opt.name.toLowerCase() === String(fields.status).toLowerCase()
          )
          if (statusOption) {
            setValue("status", statusOption.id)
          } else {
            // If no match found, try to convert to number
            const numValue = Number(fields.status)
            if (!isNaN(numValue)) {
              setValue("status", numValue)
            }
          }
        }
      }
      
      // Year of Completion - form field is "yearOfCompletion"
      if (fields.yearOfCompletion !== undefined && fields.yearOfCompletion !== null) {
        const yearValue = String(fields.yearOfCompletion).replace(/[^0-9]/g, '')
        if (yearValue) {
          setValue("yearOfCompletion", Number(yearValue))
        }
      } else if (fields.completion_year !== undefined && fields.completion_year !== null) {
        // Fallback if mapping didn't work
        const yearValue = String(fields.completion_year).replace(/[^0-9]/g, '')
        if (yearValue) {
          setValue("yearOfCompletion", Number(yearValue))
        }
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
        body: JSON.stringify({ type: "phd" }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: "phd" }),
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
      const phdStudentData = {
        regno: data.regNo,
        name: data.nameOfStudent,
        start_date: data.dateOfRegistration,
        topic: data.topic,
        status: data.status ? Number(data.status) : null,
        year_of_completion: data.yearOfCompletion ? Number(data.yearOfCompletion) : null,
        doc: docUrl,
      }

      // Use mutation to create phd
      createPhd.mutate(phdStudentData, {
        onSuccess: () => {
          // Smooth transition
          setTimeout(() => {
            router.push("/teacher/research-contributions?tab=phd")
          }, 500)
        },
      })
    } catch (error: any) {
      // Error is handled by mutation's onError callback
      setIsSubmitting(false)
    } finally {
      // Only reset if not submitting (mutation handles success/error)
      if (!createPhd.isPending) {
        setIsSubmitting(false)
        form.reset()
      }
    }
  }

  return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/research-contributions?tab=phd")}
            className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-10"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to </span>PhD Guidance
          </Button>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New PhD Guidance</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Add details about PhD students you are guiding or have guided</p>
        </div>


        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">PhD Student Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
              
            <PhdGuidanceForm
              form={form}
              onSubmit={handleSubmit}
            isSubmitting={isSubmitting || createPhd.isPending}
            isExtracting={isExtracting}
            selectedFiles={null}
            handleFileSelect={() => {}}
              handleExtractInfo={handleExtractInfo}
              isEdit={false}
              phdGuidanceStatusOptions={phdGuidanceStatusOptions}
              initialDocumentUrl={autoFillDocumentUrl}
            />
          </CardContent>
        </Card>
      </div>
  )
}
