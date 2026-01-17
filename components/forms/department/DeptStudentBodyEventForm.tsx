"use client"

import type React from "react"
import { UseFormReturn, Controller } from "react-hook-form"
import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { cn } from "@/lib/utils"
import { useDropDowns } from "@/hooks/use-dropdowns"

interface StudentBodyEventFormProps {
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

// Utility function to format date for HTML date input (YYYY-MM-DD)
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
  } catch {
    return ""
  }
}

export function DeptStudentBodyEventForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
  onClearFields,
  onCancel,
  isAutoFilled = () => false,
  onFieldChange = () => {},
}: StudentBodyEventFormProps) {
  const { register, handleSubmit, setValue, watch, clearErrors, control, formState: { errors } } = form
  const formData = watch()
  
  // Track original document URL to detect changes (only in edit mode)
  const originalDocumentUrl = useRef<string | undefined>(
    isEdit && editData?.Image ? editData.Image : undefined
  )
  
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    isEdit && editData?.Image ? editData.Image : undefined
  )

  // Use dropdown hook for level options
  const { eventStudentBodyLevelOptions, fetchEventStudentBodyLevels } = useDropDowns()

  // Fetch level options on mount
  useEffect(() => {
    fetchEventStudentBodyLevels()
  }, [fetchEventStudentBodyLevels])

  useEffect(() => {
    if (isEdit && editData) {
      // Set all form values without validation to prevent false errors
      Object.entries(editData).forEach(([key, value]) => {
        // Format date for input field
        if (key === 'date' && value) {
          setValue(key, formatDateForInput(value), { shouldValidate: false, shouldDirty: false })
        } else {
          setValue(key, value, { shouldValidate: false, shouldDirty: false })
        }
      })
      // Set document URL if exists
      if (editData.Image) {
        setDocumentUrl(editData.Image)
        setValue("Image", editData.Image, { shouldValidate: false, shouldDirty: false })
        originalDocumentUrl.current = editData.Image
      }
      clearErrors()
    }
  }, [isEdit, editData, setValue, clearErrors])

  // Sync documentUrl with form state
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

  // Register form fields with merged onBlur handlers
  const titleRegister = (() => {
    const { onBlur, ...rest } = register("title", {
      required: "Title is required",
      minLength: { value: 2, message: "Title must be at least 2 characters" },
      maxLength: { value: 150, message: "Title must not exceed 150 characters" },
      validate: (value) => {
        if (value && value.trim().length < 2) {
          return "Title cannot be only whitespace"
        }
        return true
      }
    })
    return {
      ...rest,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur(e)
        onFieldChange("title")
      }
    }
  })()

  const dateRegister = (() => {
    const { onBlur, ...rest } = register("date", {
      required: "Start date is required",
      validate: (value) => {
        if (!value) return "Start date is required"
        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (selectedDate > today) {
          return "Start date cannot be in the future"
        }
        if (selectedDate.getFullYear() < 1900) {
          return "Date must be after 1900"
        }
        return true
      }
    })
    return {
      ...rest,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur(e)
        onFieldChange("date")
      }
    }
  })()

  const placeRegister = (() => {
    const { onBlur, ...rest } = register("place", {
      minLength: { value: 2, message: "Venue must be at least 2 characters" },
      maxLength: { value: 150, message: "Venue must not exceed 150 characters" },
      validate: (value) => {
        if (value && value.trim().length < 2) {
          return "Venue cannot be only whitespace"
        }
        return true
      }
    })
    return {
      ...rest,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur(e)
        onFieldChange("place")
      }
    }
  })()

  const speakerNameRegister = (() => {
    const { onBlur, ...rest } = register("speaker_name", {
      minLength: { value: 2, message: "Speaker name must be at least 2 characters" },
      maxLength: { value: 1000, message: "Speaker name must not exceed 1000 characters" },
      validate: (value) => {
        if (value && value.trim().length < 2) {
          return "Speaker name cannot be only whitespace"
        }
        return true
      }
    })
    return {
      ...rest,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur(e)
        onFieldChange("speaker_name")
      }
    }
  })()

  const daysRegister = (() => {
    const { onBlur, ...rest } = register("days", {
      validate: (value) => {
        if (value && (isNaN(Number(value)) || Number(value) < 1)) {
          return "Number of days must be a positive number"
        }
        return true
      }
    })
    return {
      ...rest,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur(e)
        onFieldChange("days")
      }
    }
  })()

  const participantsNumRegister = (() => {
    const { onBlur, ...rest } = register("participants_num", {
      validate: (value) => {
        if (value && (isNaN(Number(value)) || Number(value) < 0)) {
          return "Number of participants must be a non-negative number"
        }
        return true
      }
    })
    return {
      ...rest,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur(e)
        onFieldChange("participants_num")
      }
    }
  })()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Upload */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">
          {isEdit ? "Supporting Document" : "Step 1: Upload Supporting Document"}
        </Label>
        <DocumentUpload
          documentUrl={documentUrl}
          category="Department"
          subCategory="Student Body Events"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("Image", url, { shouldValidate: true })
          }}
          onExtract={(fields) => {
            Object.entries(fields).forEach(([key, value]) => {
              setValue(key, value)
            })
          }}
          allowedFileTypes={["pdf", "jpg", "jpeg"]}
          maxFileSize={1 * 1024 * 1024} // 1MB
          className="w-full"
          isEditMode={isEdit}
          onClearFields={onClearFields}
          disabled={isSubmitting}
          hideExtractButton={true}
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
              if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/') || value.startsWith('uploaded-document') || value.startsWith('upload/'))) {
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
          {isEdit ? "Edit Event Details" : "Step 2: Verify/Complete Event Details"}
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Title */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="Enter event title"
              maxLength={150}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("title") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...titleRegister}
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Start Date <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("date") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...dateRegister}
            />
            {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
          </div>

          {/* No. of Days */}
          <div className="space-y-2">
            <Label htmlFor="days">No. of Days</Label>
            <Input
              id="days"
              type="number"
              placeholder="Enter number of days"
              min="1"
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("days") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...daysRegister}
            />
            {errors.days && <p className="text-sm text-red-600 mt-1">{errors.days.message?.toString()}</p>}
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <Label htmlFor="place">Venue</Label>
            <Input
              id="place"
              placeholder="Enter venue"
              maxLength={150}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("place") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...placeRegister}
            />
            {errors.place && <p className="text-sm text-red-600 mt-1">{errors.place.message?.toString()}</p>}
          </div>

          {/* Level */}
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={eventStudentBodyLevelOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value || ""}
                  onValueChange={(value) => {
                    // Handle empty string, null, undefined, or 0 - convert to null if invalid
                    if (!value || value === "" || value === 0) {
                      field.onChange(null)
                    } else {
                      field.onChange(Number(value))
                    }
                    onFieldChange("level")
                  }}
                  placeholder="Select level"
                  emptyMessage="No level found"
                  disabled={isSubmitting}
                  className={cn(
                    isAutoFilled("level") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                  )}
                />
              )}
            />
            {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
          </div>

          {/* No. of Participants */}
          <div className="space-y-2">
            <Label htmlFor="participants_num">No. of Participants</Label>
            <Input
              id="participants_num"
              type="number"
              placeholder="Enter number of participants"
              min="0"
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("participants_num") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...participantsNumRegister}
            />
            {errors.participants_num && <p className="text-sm text-red-600 mt-1">{errors.participants_num.message?.toString()}</p>}
          </div>

          {/* Name of Key Speakers */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="speaker_name">Name of Key Speakers</Label>
            <Input
              id="speaker_name"
              placeholder="Enter name of key speakers"
              maxLength={1000}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("speaker_name") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...speakerNameRegister}
            />
            {errors.speaker_name && <p className="text-sm text-red-600 mt-1">{errors.speaker_name.message?.toString()}</p>}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
        {onCancel && (
          <Button 
            type="button"
            variant="outline" 
            onClick={onCancel} 
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? "Update Event" : "Add Event"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

