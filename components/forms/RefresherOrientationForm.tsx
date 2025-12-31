"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect, useState, useRef } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { useRouter } from "next/navigation"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"
import { cn } from "@/lib/utils"

interface RefresherOrientationFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isEdit?: boolean
  editData?: Record<string, any>
  refresherTypeOptions?: DropdownOption[]
  onClearFields?: () => void
  onCancel?: () => void
  isAutoFilled?: (fieldName: string) => boolean
  onFieldChange?: (fieldName: string) => void
}

export function RefresherOrientationForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
  refresherTypeOptions = [],
  onClearFields,
  onCancel,
  isAutoFilled,
  onFieldChange,
}: RefresherOrientationFormProps) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  const formData = watch()
  
  // Track original document URL to detect changes (only in edit mode)
  const originalDocumentUrl = useRef<string | undefined>(
    isEdit && editData?.supporting_doc ? editData.supporting_doc : undefined
  )
  
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    isEdit && editData?.supporting_doc ? editData.supporting_doc : undefined
  )

  useEffect(() => {
    if (isEdit && editData) {
      Object.entries(editData).forEach(([key, value]) => {
        setValue(key, value, { shouldValidate: false }) // Don't validate on initial load
      })
      // Set document URL if exists
      if (editData.supporting_doc) {
        setDocumentUrl(editData.supporting_doc)
        setValue("supporting_doc", editData.supporting_doc, { shouldValidate: false })
        // Track original document URL to detect changes
        originalDocumentUrl.current = editData.supporting_doc
      }
    }
  }, [isEdit, editData, setValue])

  // Sync documentUrl with form state (for auto-fill from smart document analyzer)
  // Only sync if the document URL exists and is not empty
  useEffect(() => {
    const formDocUrl = formData.supporting_doc
    if (formDocUrl && formDocUrl.trim() !== "" && formDocUrl !== documentUrl) {
      setDocumentUrl(formDocUrl)
    } else if (!formDocUrl || formDocUrl.trim() === "") {
      // Clear document URL if form state is empty
      if (documentUrl) {
        setDocumentUrl(undefined)
      }
    }
  }, [formData.supporting_doc, documentUrl])

  // Re-validate end date when start date changes
  useEffect(() => {
    if (formData.startdate && formData.enddate) {
      form.trigger("enddate")
    }
  }, [formData.startdate, form])

  // Helper function to validate and set dropdown value
  const setDropdownValue = (fieldName: string, value: any, options: Array<{ id: number; name: string }>): boolean => {
    if (value === undefined || value === null) return false
    
    let validValue: number | null = null
    
    if (typeof value === 'number') {
      if (options.some(opt => opt.id === value)) {
        validValue = value
      }
    } else {
      // Try to find matching option by name
      const option = options.find(opt => opt.name.toLowerCase() === String(value).toLowerCase())
      if (option) {
        validValue = option.id
      } else {
        // Try to convert to number and check
        const numValue = Number(value)
        if (!isNaN(numValue) && options.some(opt => opt.id === numValue)) {
          validValue = numValue
        }
      }
    }
    
    if (validValue !== null) {
      setValue(fieldName, validValue, { shouldValidate: true })
      onFieldChange?.(fieldName)
      return true
    }
    return false
  }

  // Handle extracted fields from DocumentUpload with proper validation
  const handleExtractedFields = (fields: Record<string, any>) => {
    // Track which fields were successfully filled
    const filledFieldNames: string[] = []
    
    // Name - validate non-empty string
    if (fields.name) {
      const nameValue = String(fields.name).trim()
      if (nameValue.length >= 2) {
        setValue("name", nameValue)
        filledFieldNames.push("name")
        onFieldChange?.("name")
      }
    }
    
    // Refresher Type - validate dropdown
    if (fields.refresher_type || fields.course_type) {
      const value = fields.refresher_type || fields.course_type
      if (setDropdownValue("refresher_type", value, refresherTypeOptions)) {
        filledFieldNames.push("refresher_type")
      }
    }
    
    // Start Date - validate date format and not in future
    if (fields.start_date || fields.startdate) {
      const dateValue = String(fields.start_date || fields.startdate).trim()
      if (dateValue.length > 0) {
        const dateObj = new Date(dateValue)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (!isNaN(dateObj.getTime()) && dateObj <= today && dateObj.getFullYear() >= 1900) {
          setValue("startdate", dateValue)
          filledFieldNames.push("startdate")
          onFieldChange?.("startdate")
        }
      }
    }
    
    // End Date - validate date format, not in future, and after start date
    if (fields.end_date || fields.enddate) {
      const dateValue = String(fields.end_date || fields.enddate).trim()
      if (dateValue.length > 0) {
        const dateObj = new Date(dateValue)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (!isNaN(dateObj.getTime()) && dateObj <= today && dateObj.getFullYear() >= 1900) {
          // Check if start date exists and end date is after start date
          const startDate = formData.startdate
          let isValid = true
          if (startDate) {
            const start = new Date(startDate)
            start.setHours(0, 0, 0, 0)
            dateObj.setHours(0, 0, 0, 0)
            if (dateObj < start) {
              isValid = false
            }
          }
          if (isValid) {
            setValue("enddate", dateValue)
            filledFieldNames.push("enddate")
            onFieldChange?.("enddate")
          }
        }
      }
    }
    
    // University - validate non-empty string
    if (fields.organizing_university || fields.university) {
      const uniValue = String(fields.organizing_university || fields.university).trim()
      if (uniValue.length >= 2) {
        setValue("university", uniValue)
        filledFieldNames.push("university")
        onFieldChange?.("university")
      }
    }
    
    // Institute - validate non-empty string
    if (fields.organizing_institute || fields.institute) {
      const instValue = String(fields.organizing_institute || fields.institute).trim()
      if (instValue.length >= 2) {
        setValue("institute", instValue)
        filledFieldNames.push("institute")
        onFieldChange?.("institute")
      }
    }
    
    // Department - validate non-empty string
    if (fields.organizing_department || fields.department) {
      const deptValue = String(fields.organizing_department || fields.department).trim()
      if (deptValue.length >= 2) {
        setValue("department", deptValue)
        filledFieldNames.push("department")
        onFieldChange?.("department")
      }
    }
    
    // Centre - validate non-empty string (optional field)
    if (fields.centre) {
      const centreValue = String(fields.centre).trim()
      if (centreValue.length >= 2) {
        setValue("centre", centreValue)
        filledFieldNames.push("centre")
        onFieldChange?.("centre")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Upload */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">
          Step 1: Upload Supporting Document
        </Label>
        <DocumentUpload
          documentUrl={documentUrl}
          category="Academic Programs"
          subCategory="Refresher/Orientantion Course"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("supporting_doc", url, { shouldValidate: true })
          }}
          onExtract={handleExtractedFields}
          allowedFileTypes={["pdf", "jpg", "jpeg"]}
          maxFileSize={1 * 1024 * 1024} // 1MB
          className="w-full"
          isEditMode={isEdit}
          onClearFields={onClearFields}
          disabled={isSubmitting}
        />
        {/* Hidden input for form validation */}
        <input
          type="hidden"
          {...register("supporting_doc", {
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
        {errors.supporting_doc && (
          <p className="text-sm text-red-600 mt-1">{errors.supporting_doc.message?.toString()}</p>
        )}
      </div>

      {/* Step 2: Form Fields */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">
          Step 2: Verify/Complete Course Details
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name" 
              placeholder="Enter course name"
              maxLength={500}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled?.("name") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...register("name", { 
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
                maxLength: { value: 500, message: "Name must not exceed 500 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Name cannot be only whitespace"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("name")
              })} 
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="refresher_type">Course Type *</Label>
            <Controller
              name="refresher_type"
              control={control}
              rules={{ 
                required: "Course type is required",
                validate: (value) => {
                  if (!value || value === "" || value === null || value === undefined) {
                    return "Course type is required"
                  }
                  return true
                }
              }}
              render={({ field }) => (
                <SearchableSelect
                  options={refresherTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    onFieldChange?.("refresher_type")
                    // Clear error when value is selected
                    if (value) {
                      form.clearErrors("refresher_type")
                    }
                  }}
                  placeholder="Select course type"
                  emptyMessage="No course type found"
                  disabled={isSubmitting}
                  className={isAutoFilled?.("refresher_type") ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" : undefined}
                />
              )}
            />
            {errors.refresher_type && (
              <p className="text-sm text-red-600 mt-1">{errors.refresher_type.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startdate">Start Date *</Label>
            <Input 
              id="startdate" 
              type="date" 
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled?.("startdate") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...register("startdate", { 
                required: "Start date is required",
                validate: (value) => {
                  if (!value) {
                    return "Start date is required"
                  }
                  const date = new Date(value)
                  const today = new Date()
                  today.setHours(23, 59, 59, 999) // Set to end of today
                  
                  if (date > today) {
                    return "Start date cannot be in the future"
                  }
                  if (date.getFullYear() < 1900) {
                    return "Start date must be after 1900"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("startdate")
              })} 
            />
            {errors.startdate && (
              <p className="text-sm text-red-600 mt-1">{errors.startdate.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enddate">End Date</Label>
            <Input 
              id="enddate" 
              type="date" 
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled?.("enddate") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...register("enddate", {
                validate: (value) => {
                  if (!value) return true // Optional field
                  
                  const endDate = new Date(value)
                  const today = new Date()
                  today.setHours(23, 59, 59, 999)
                  
                  // Check if end date is in the future
                  if (endDate > today) {
                    return "End date cannot be in the future"
                  }
                  
                  // Check if end date is before 1900
                  if (endDate.getFullYear() < 1900) {
                    return "End date must be after 1900"
                  }
                  
                  // Check if end date is before start date
                  const startDate = formData.startdate
                  if (startDate) {
                    const start = new Date(startDate)
                    start.setHours(0, 0, 0, 0) // Normalize to start of day
                    endDate.setHours(0, 0, 0, 0) // Normalize to start of day
                    if (endDate < start) {
                      return "End date must be after or equal to start date"
                    }
                  }
                  
                  return true
                },
                onChange: () => onFieldChange?.("enddate")
              })} 
            />
            {errors.enddate && (
              <p className="text-sm text-red-600 mt-1">{errors.enddate.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">Organizing University *</Label>
            <Input 
              id="university" 
              placeholder="Enter university name"
              maxLength={200}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled?.("university") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...register("university", { 
                required: "Organizing University is required",
                minLength: { value: 2, message: "University name must be at least 2 characters" },
                maxLength: { value: 200, message: "University name must not exceed 200 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "University name cannot be only whitespace"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("university")
              })} 
            />
            {errors.university && (
              <p className="text-sm text-red-600 mt-1">{errors.university.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="institute">Organizing Institute *</Label>
            <Input 
              id="institute" 
              placeholder="Enter institute name"
              maxLength={200}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled?.("institute") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...register("institute", { 
                required: "Organizing Institute is required",
                minLength: { value: 2, message: "Institute name must be at least 2 characters" },
                maxLength: { value: 200, message: "Institute name must not exceed 200 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Institute name cannot be only whitespace"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("institute")
              })} 
            />
            {errors.institute && (
              <p className="text-sm text-red-600 mt-1">{errors.institute.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Organizing Department *</Label>
            <Input 
              id="department" 
              placeholder="Enter department name"
              maxLength={200}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled?.("department") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...register("department", { 
                required: "Organizing Department is required",
                minLength: { value: 2, message: "Department name must be at least 2 characters" },
                maxLength: { value: 200, message: "Department name must not exceed 200 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Department name cannot be only whitespace"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("department")
              })} 
            />
            {errors.department && (
              <p className="text-sm text-red-600 mt-1">{errors.department.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="centre">Centre</Label>
            <Input 
              id="centre" 
              placeholder="Enter centre name (optional)"
              maxLength={200}
              disabled={isSubmitting}
              className={cn(
                isAutoFilled?.("centre") && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}
              {...register("centre", {
                maxLength: { value: 200, message: "Centre name must not exceed 200 characters" },
                validate: (value) => {
                  if (value && value.trim().length > 0 && value.trim().length < 2) {
                    return "Centre name must be at least 2 characters if provided"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("centre")
              })} 
            />
            {errors.centre && (
              <p className="text-sm text-red-600 mt-1">{errors.centre.message?.toString()}</p>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        {!isEdit && (
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel || (() => router.back())} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? "Update Entry" : "Add Entry"}
              </>
            )}
          </Button>
        </div>
    )}
      </div>
    </form>
  )
}
