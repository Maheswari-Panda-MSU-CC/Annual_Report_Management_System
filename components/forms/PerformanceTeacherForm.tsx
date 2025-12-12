"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { cn } from "@/lib/utils"

interface PerformanceTeacherFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  onClearFields?: () => void
  onCancel?: () => void
  isAutoFilled?: (fieldName: string) => boolean
  onFieldChange?: (fieldName: string) => void
}

export function PerformanceTeacherForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  onClearFields,
  onCancel,
  isAutoFilled = () => false,
  onFieldChange = () => {},
}: PerformanceTeacherFormProps) {
  const { register, handleSubmit, setValue, watch, clearErrors, formState: { errors } } = form
  const formData = watch()
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    isEdit && editData?.Image ? editData.Image : undefined
  )

  useEffect(() => {
    if (isEdit && editData) {
      // Set all form values without validation to prevent false errors
      Object.entries(editData).forEach(([key, value]) => {
        setValue(key, value, { shouldValidate: false, shouldDirty: false })
      })
      // Set document URL if exists
      if (editData.Image) {
        setDocumentUrl(editData.Image)
        setValue("Image", editData.Image, { shouldValidate: false, shouldDirty: false })
      }
      // Clear any existing errors when loading edit data
      clearErrors()
    }
  }, [isEdit, editData, setValue, clearErrors])

  // Sync documentUrl with form state (for auto-fill from smart document analyzer)
  useEffect(() => {
    const formDocUrl = formData.Image
    if (formDocUrl && formDocUrl !== documentUrl) {
      setDocumentUrl(formDocUrl)
    }
  }, [formData.Image, documentUrl])

  // Clear documentUrl when form field is empty
  useEffect(() => {
    if (!formData.Image && documentUrl) {
      setDocumentUrl(undefined)
    }
  }, [formData.Image, documentUrl])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Upload */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">
          {isEdit ? "Supporting Document" : "Step 1: Upload Supporting Document"}
        </Label>
        <DocumentUpload
          documentUrl={documentUrl}
          category="Awards/Performance"
          subCategory="Performance by Individual/Group"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("Image", url, { shouldValidate: true })
          }}
          onExtract={(fields) => {
            // DocumentUpload already handles extraction and stores data in context
            // useAutoFillData hook will automatically fill the form
            // We just need to set the extracted values directly here
            Object.entries(fields).forEach(([key, value]) => {
              setValue(key, value)
            })
            // Don't call handleExtractInfo - it uses old API and causes false errors
          }}
          allowedFileTypes={["pdf", "jpg", "jpeg", "png", "bmp"]}
          maxFileSize={10 * 1024 * 1024} // 10MB
          className="w-full"
          isEditMode={isEdit}
          onClearFields={onClearFields}
        />
        {/* Hidden input for form validation */}
        <input
          type="hidden"
          {...register("Image", {
            required: "Supporting document is required",
            validate: (value) => {
              if (!value || (typeof value === 'string' && value.trim() === '')) {
                return "Please upload a supporting document"
              }
              // Check if it's a valid URL or local path
              if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/') || value.startsWith('uploaded-document'))) {
                return true
              }
              return "Invalid document URL"
            }
          })}
        />
        {errors.Image && (
          <p className="text-sm text-red-600 mt-1">{errors.Image.message?.toString()}</p>
        )}
      </div>

      {/* Step 2: Form Fields */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">
          {isEdit ? "Edit Performance Details" : "Step 2: Verify/Complete Performance Details"}
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Title of Performance *</Label>
            <Input
              id="name"
              placeholder="Enter title of performance"
              maxLength={100}
              className={cn(isAutoFilled("name") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800")}
              onBlur={() => onFieldChange("name")}
              {...register("name", {
                required: "Title of Performance is required",
                minLength: { value: 2, message: "Title must be at least 2 characters" },
                maxLength: { value: 100, message: "Title must not exceed 100 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Title cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="place">Place *</Label>
            <Input
              id="place"
              placeholder="Enter place"
              maxLength={150}
              className={cn(isAutoFilled("place") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800")}
              onBlur={() => onFieldChange("place")}
              {...register("place", {
                required: "Place is required",
                minLength: { value: 2, message: "Place must be at least 2 characters" },
                maxLength: { value: 150, message: "Place must not exceed 150 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Place cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.place && <p className="text-sm text-red-600 mt-1">{errors.place.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Performance Date *</Label>
            <Input
              id="date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              className={cn(isAutoFilled("date") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800")}
              onBlur={() => onFieldChange("date")}
              {...register("date", {
                required: "Performance Date is required",
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Performance date cannot be in the future"
                  }
                  if (value && new Date(value).getFullYear() < 1900) {
                    return "Performance date must be after 1900"
                  }
                  return true
                }
              })}
            />
            {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="perf_nature">Nature of Performance *</Label>
            <Input
              id="perf_nature"
              placeholder="Enter nature of performance"
              maxLength={250}
              className={cn(isAutoFilled("perf_nature") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800")}
              onBlur={() => onFieldChange("perf_nature")}
              {...register("perf_nature", {
                required: "Nature of Performance is required",
                minLength: { value: 2, message: "Nature must be at least 2 characters" },
                maxLength: { value: 250, message: "Nature must not exceed 250 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Nature cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.perf_nature && <p className="text-sm text-red-600 mt-1">{errors.perf_nature.message?.toString()}</p>}
          </div>
        </div>
      </div>

      {/* Submit Button - Only show in add mode, edit mode uses dialog button */}
      {!isEdit && (
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Performance
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

