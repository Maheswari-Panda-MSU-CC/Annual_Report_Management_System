"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2 } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { cn } from "@/lib/utils"

interface CopyrightFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isEdit?: boolean
  editData?: Record<string, any>
  onClearFields?: () => void
  onCancel?: () => void
  isAutoFilled?: (fieldName: string) => boolean
  onFieldChange?: (fieldName: string) => void
}

export function CopyrightForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
  initialDocumentUrl,
  onClearFields,
  onCancel,
  isAutoFilled,
  onFieldChange,
}: CopyrightFormProps & { initialDocumentUrl?: string }) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const formData = watch()
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    initialDocumentUrl || // Use initial document URL from auto-fill first
    (isEdit && editData?.supportingDocument?.[0] ? editData.supportingDocument[0] : undefined)
  )

  // Update documentUrl when initialDocumentUrl changes
  // Always update if initialDocumentUrl is provided and different from current value
  // This handles cases where autoFillDocumentUrl becomes available after component mount
  // CRITICAL: Also update form field for validation
  useEffect(() => {
    if (initialDocumentUrl) {
      // Always update documentUrl if it's different
      if (documentUrl !== initialDocumentUrl) {
        setDocumentUrl(initialDocumentUrl)
      }
      // CRITICAL FIX: Check form field value, not just state comparison
      // On initial mount, documentUrl === initialDocumentUrl, so we need to check form field
      const currentFormValue = form.getValues("supportingDocument")
      const formValueIsEmpty = !currentFormValue || 
                             (Array.isArray(currentFormValue) && currentFormValue.length === 0) ||
                             (Array.isArray(currentFormValue) && !currentFormValue[0])
      
      if (formValueIsEmpty) {
        setValue("supportingDocument", [initialDocumentUrl], { shouldValidate: false, shouldDirty: false })
      }
    }
  }, [initialDocumentUrl, documentUrl, setValue, form])

  useEffect(() => {
    if (isEdit && editData) {
      // Map database fields to form fields
      if (editData.Title) setValue("title", editData.Title)
      if (editData.RefNo) setValue("referenceNo", editData.RefNo)
      if (editData.PublicationDate) {
        const date = new Date(editData.PublicationDate)
        setValue("publicationDate", date.toISOString().split('T')[0])
      }
      if (editData.Link) setValue("link", editData.Link)
      if (editData.doc) setValue("doc", editData.doc)
      if (editData.supportingDocument) {
        setValue("supportingDocument", editData.supportingDocument)
        setDocumentUrl(Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
      }
    }
  }, [isEdit, editData, setValue])

  // Handle extracted fields from DocumentUpload
  const handleExtractedFields = (fields: Record<string, any>) => {
    if (fields.title) setValue("title", fields.title)
    if (fields.referenceNo) setValue("referenceNo", fields.referenceNo)
    if (fields.publicationDate) setValue("publicationDate", fields.publicationDate)
    if (fields.link) setValue("link", fields.link)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
        <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">Step 1: Upload Copyright Document *</Label>
        <DocumentUpload
          documentUrl={documentUrl || initialDocumentUrl || undefined}
          category="Research & Consultancy"
          subCategory="Copyrights"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("supportingDocument", url ? [url] : [])
          }}
          onExtract={handleExtractedFields}
          onClearFields={onClearFields}
          isEditMode={isEdit}
          className="w-full"
        />
      </div>

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
        <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">Step 2: Verify/Complete Copyright Information</Label>

        <div>
          <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
          <Input
            id="title"
            placeholder="Enter copyright title"
            className={cn(
              "text-sm sm:text-base h-9 sm:h-10 mt-1",
              isAutoFilled?.("title") && "bg-blue-50 border-blue-200"
            )}
            {...register("title", { 
              required: "Copyright title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters long"
              },
              onChange: () => onFieldChange?.("title")
            })}
          />
          {errors.title && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="referenceNo" className="text-sm sm:text-base">Reference Number *</Label>
            <Input
              id="referenceNo"
              placeholder="Enter reference number"
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("referenceNo") && "bg-blue-50 border-blue-200"
              )}
              {...register("referenceNo", { 
                required: "Reference number is required",
                minLength: {
                  value: 2,
                  message: "Reference number must be at least 2 characters long"
                },
                onChange: () => onFieldChange?.("referenceNo")
              })}
            />
            {errors.referenceNo && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.referenceNo.message?.toString()}</p>
            )}
          </div>

          <div>
            <Label htmlFor="publicationDate" className="text-sm sm:text-base">Publication Date</Label>
            <Input
              id="publicationDate"
              type="date"
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("publicationDate") && "bg-blue-50 border-blue-200"
              )}
              max={new Date().toISOString().split('T')[0]}
              {...register("publicationDate", {
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Publication date cannot be in the future"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("publicationDate")
              })}
            />
            {errors.publicationDate && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.publicationDate.message?.toString()}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="link" className="text-sm sm:text-base">Link</Label>
          <Input
            id="link"
            type="url"
            placeholder="Enter registry link (optional)"
            className={cn(
              "text-sm sm:text-base h-9 sm:h-10 mt-1",
              isAutoFilled?.("link") && "bg-blue-50 border-blue-200"
            )}
            {...register("link", {
              validate: (value) => {
                if (value && value.trim() !== "") {
                  try {
                    new URL(value)
                    return true
                  } catch {
                    return "Please enter a valid URL"
                  }
                }
                return true
              },
              onChange: () => onFieldChange?.("link")
            })}
          />
          {errors.link && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.link.message?.toString()}</p>
          )}
        </div>


        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=copyrights"))}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Copyright
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
