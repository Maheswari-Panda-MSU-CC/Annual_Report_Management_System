"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect, useState } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"

interface ExtensionActivityFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  awardFellowLevelOptions?: DropdownOption[]
  sponserNameOptions?: DropdownOption[]
}

export function ExtensionActivityForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  awardFellowLevelOptions = [],
  sponserNameOptions = [],
}: ExtensionActivityFormProps) {
  const { register, handleSubmit, setValue, watch, control, clearErrors, formState: { errors } } = form
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
          subCategory="Extension"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("Image", url, { shouldValidate: true })
          }}
          onExtract={(fields) => {
            Object.entries(fields).forEach(([key, value]) => {
              setValue(key, value)
            })
            if (handleExtractInfo) {
              handleExtractInfo()
            }
          }}
          allowedFileTypes={["pdf", "jpg", "jpeg", "png", "bmp"]}
          maxFileSize={10 * 1024 * 1024} // 10MB
          className="w-full"
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
          {isEdit ? "Edit Extension Activity Details" : "Step 2: Verify/Complete Extension Activity Details"}
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name_of_activity">Name of Activity *</Label>
            <Input
              id="name_of_activity"
              placeholder="Enter name of activity"
              maxLength={150}
              {...register("name_of_activity", {
                required: "Name of Activity is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
                maxLength: { value: 150, message: "Name must not exceed 150 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Name cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.name_of_activity && <p className="text-sm text-red-600 mt-1">{errors.name_of_activity.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="names">Nature of Activity *</Label>
            <Input
              id="names"
              placeholder="Enter nature of activity"
              maxLength={100}
              {...register("names", {
                required: "Nature of Activity is required",
                minLength: { value: 2, message: "Nature must be at least 2 characters" },
                maxLength: { value: 100, message: "Nature must not exceed 100 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Nature cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.names && <p className="text-sm text-red-600 mt-1">{errors.names.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level *</Label>
            <Controller
              name="level"
              control={control}
              rules={{ required: "Level is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={awardFellowLevelOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Clear error when value changes in edit mode
                    if (isEdit && errors.level) {
                      clearErrors("level")
                    }
                  }}
                  placeholder="Select level"
                  emptyMessage="No level found"
                />
              )}
            />
            {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsered">Sponsored By *</Label>
            <Controller
              name="sponsered"
              control={control}
              rules={{ required: "Sponsored By is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={sponserNameOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Clear error when value changes in edit mode
                    if (isEdit && errors.sponsered) {
                      clearErrors("sponsered")
                    }
                  }}
                  placeholder="Select sponsor"
                  emptyMessage="No sponsor found"
                />
              )}
            />
            {errors.sponsered && <p className="text-sm text-red-600 mt-1">{errors.sponsered.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="place">Place *</Label>
            <Input
              id="place"
              placeholder="Enter place"
              maxLength={150}
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
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register("date", {
                required: "Date is required",
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Date cannot be in the future"
                  }
                  if (value && new Date(value).getFullYear() < 1900) {
                    return "Date must be after 1900"
                  }
                  return true
                }
              })}
            />
            {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
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
                Save Activity
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

