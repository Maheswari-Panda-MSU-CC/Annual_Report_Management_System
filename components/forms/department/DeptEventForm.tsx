"use client"

import type React from "react"
import { UseFormReturn, Controller } from "react-hook-form"
import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { cn } from "@/lib/utils"

interface EventFormProps {
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

export function EventForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
  onClearFields,
  onCancel,
  isAutoFilled = () => false,
  onFieldChange = () => {},
}: EventFormProps) {
  const { register, handleSubmit, setValue, watch, clearErrors, control, formState: { errors } } = form
  const formData = watch()
  
  // Track original document URL to detect changes (only in edit mode)
  const originalDocumentUrl = useRef<string | undefined>(
    isEdit && editData?.Image ? editData.Image : undefined
  )
  
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    isEdit && editData?.Image ? editData.Image : undefined
  )

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
  const enameRegister = (() => {
    const { onBlur, ...rest } = register("ename", {
      required: "Event name is required",
      minLength: { value: 2, message: "Event name must be at least 2 characters" },
      maxLength: { value: 450, message: "Event name must not exceed 450 characters" },
      validate: (value) => {
        if (value && value.trim().length < 2) {
          return "Event name cannot be only whitespace"
        }
        return true
      }
    })
    return {
      ...rest,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur(e)
        onFieldChange("ename")
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

  const spoNameRegister = (() => {
    const { onBlur, ...rest } = register("Spo_Name", {
      minLength: { value: 2, message: "Sponsoring Agency must be at least 2 characters" },
      maxLength: { value: 500, message: "Sponsoring Agency must not exceed 500 characters" },
      validate: (value) => {
        if (value && value.trim().length < 2) {
          return "Sponsoring Agency cannot be only whitespace"
        }
        return true
      }
    })
    return {
      ...rest,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur(e)
        onFieldChange("Spo_Name")
      }
    }
  })()

  const descriptionRegister = (() => {
    const { onBlur, ...rest } = register("description", {
      minLength: { value: 10, message: "Description must be at least 10 characters if provided" },
      maxLength: { value: 5000, message: "Description must not exceed 5000 characters" },
      validate: (value) => {
        if (value && value.trim().length > 0 && value.trim().length < 10) {
          return "Description must be at least 10 characters if provided"
        }
        return true
      }
    })
    return {
      ...rest,
      onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
        onBlur(e)
        onFieldChange("description")
      }
    }
  })()

  const noOfDaysRegister = (() => {
    const { onBlur, ...rest } = register("no_of_days", {
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
        onFieldChange("no_of_days")
      }
    }
  })()

  const noParticipantRegister = (() => {
    const { onBlur, ...rest } = register("No_Participant", {
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
        onFieldChange("No_Participant")
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
          subCategory="Events"
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
          {/* Event Name */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ename">Event Name <span className="text-red-500">*</span></Label>
            <Input
              id="ename"
              placeholder="Enter event name"
              maxLength={450}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("ename") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...enameRegister}
            />
            {errors.ename && <p className="text-sm text-red-600 mt-1">{errors.ename.message?.toString()}</p>}
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
            <Label htmlFor="no_of_days">No. of Days</Label>
            <Input
              id="no_of_days"
              type="number"
              placeholder="Enter number of days"
              min="1"
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("no_of_days") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...noOfDaysRegister}
            />
            {errors.no_of_days && <p className="text-sm text-red-600 mt-1">{errors.no_of_days.message?.toString()}</p>}
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

          {/* Type of Events */}
          <div className="space-y-2">
            <Label htmlFor="Type_Prog">Type of Events</Label>
            <Controller
              name="Type_Prog"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={[
                    { value: "Conferences", label: "Conferences" },
                    { value: "Workshops", label: "Workshops" },
                    { value: "Seminars", label: "Seminars" },
                    { value: "Lectures / Invited Talks", label: "Lectures / Invited Talks" },
                  ]}
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value || "")
                    onFieldChange("Type_Prog")
                  }}
                  placeholder="Select type of events"
                  emptyMessage="No type found"
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.Type_Prog && <p className="text-sm text-red-600 mt-1">{errors.Type_Prog.message?.toString()}</p>}
          </div>

          {/* Level of Program */}
          <div className="space-y-2">
            <Label htmlFor="Level_Prog">Level of Program</Label>
            <Controller
              name="Level_Prog"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={[
                    { value: "International", label: "International" },
                    { value: "National", label: "National" },
                    { value: "State", label: "State" },
                    { value: "University", label: "University" },
                    { value: "College", label: "College" },
                  ]}
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value || "")
                    onFieldChange("Level_Prog")
                  }}
                  placeholder="Select level of program"
                  emptyMessage="No level found"
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.Level_Prog && <p className="text-sm text-red-600 mt-1">{errors.Level_Prog.message?.toString()}</p>}
          </div>

          {/* Sponsoring Agency */}
          <div className="space-y-2">
            <Label htmlFor="Spo_Name">Sponsoring Agency</Label>
            <Input
              id="Spo_Name"
              type="text"
              placeholder="Enter sponsoring agency"
              maxLength={500}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("Spo_Name") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...spoNameRegister}
            />
            {errors.Spo_Name && <p className="text-sm text-red-600 mt-1">{errors.Spo_Name.message?.toString()}</p>}
          </div>

          {/* Level of Sponsoring Agency */}
          <div className="space-y-2">
            <Label htmlFor="Spo_Level">Level of Sponsoring Agency</Label>
            <Controller
              name="Spo_Level"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={[
                    { value: "International", label: "International" },
                    { value: "National", label: "National" },
                    { value: "State", label: "State" },
                    { value: "University", label: "University" },
                    { value: "College", label: "College" },
                  ]}
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value || "")
                    onFieldChange("Spo_Level")
                  }}
                  placeholder="Select level of sponsoring agency"
                  emptyMessage="No level found"
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.Spo_Level && <p className="text-sm text-red-600 mt-1">{errors.Spo_Level.message?.toString()}</p>}
          </div>

          {/* No of Participant */}
          <div className="space-y-2">
            <Label htmlFor="No_Participant">No of Participant</Label>
            <Input
              id="No_Participant"
              type="number"
              placeholder="Enter number of participants"
              min="0"
              disabled={isSubmitting}
              className={cn(
                isAutoFilled("No_Participant") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...noParticipantRegister}
            />
            {errors.No_Participant && <p className="text-sm text-red-600 mt-1">{errors.No_Participant.message?.toString()}</p>}
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

          {/* Description */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              rows={4}
              maxLength={5000}
              disabled={isSubmitting}
              className={cn(
                "resize-none",
                isAutoFilled("description") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...descriptionRegister}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message?.toString()}</p>}
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

