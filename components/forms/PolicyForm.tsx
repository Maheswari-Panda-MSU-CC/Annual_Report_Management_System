"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import { Save } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { useRouter } from "next/navigation"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { PolicyFormProps } from "@/types/interfaces"
import { cn } from "@/lib/utils"

export default function PolicyForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
  resPubLevelOptions: propResPubLevelOptions,
    initialDocumentUrl,
    onClearFields,
    onCancel,
    isAutoFilled,
    onFieldChange,
}: PolicyFormProps) {
  const router = useRouter()
  const { register, handleSubmit, setValue, control, formState: { errors } } = form
  
  // Track original document URL to detect changes (only in edit mode)
  const originalDocumentUrlRef = useRef<string | undefined>(
    isEdit && editData?.supportingDocument?.[0] 
      ? (Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
      : undefined
  )

  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    initialDocumentUrl || // Use initial document URL from auto-fill first
    originalDocumentUrlRef.current
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

  // Use props if provided, otherwise fetch from hook
  const { resPubLevelOptions: hookResPubLevelOptions, fetchResPubLevels } = useDropDowns()
  
  const resPubLevelOptions = propResPubLevelOptions || hookResPubLevelOptions

  // Only fetch if props are not provided and options are empty
  useEffect(() => {
    if (!propResPubLevelOptions && hookResPubLevelOptions.length === 0) {
      fetchResPubLevels()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Update originalDocumentUrlRef when editData changes
  useEffect(() => {
    if (isEdit && editData?.supportingDocument?.[0]) {
      originalDocumentUrlRef.current = Array.isArray(editData.supportingDocument) 
        ? editData.supportingDocument[0] 
        : editData.supportingDocument
    } else if (initialDocumentUrl) {
      originalDocumentUrlRef.current = initialDocumentUrl
    }
  }, [isEdit, editData, initialDocumentUrl])

  // Set initial values when in edit mode - optimized to reset and set all values at once
  useEffect(() => {
    if (isEdit && editData && Object.keys(editData).length > 0) {
      // Reset form first to clear any previous values
      form.reset()
      
      // Prepare all form values
      const formValues: any = {}
      
      if (editData.title) formValues.title = editData.title
      if (editData.levelId !== undefined && editData.levelId !== null) {
        formValues.level = editData.levelId
      } else if (editData.level) {
        // If level is a string, find matching ID
        const levelOption = resPubLevelOptions.find(l => l.name === editData.level)
        if (levelOption) formValues.level = levelOption.id
      }
      if (editData.organisation) formValues.organisation = editData.organisation
      if (editData.date) formValues.date = editData.date
      if (editData.supportingDocument) {
        formValues.supportingDocument = editData.supportingDocument
        const docUrl = Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument
        setDocumentUrl(docUrl)
        originalDocumentUrlRef.current = docUrl
      }
      
      // Set all values at once
      Object.keys(formValues).forEach((key) => {
        setValue(key, formValues[key], { shouldValidate: false, shouldDirty: false })
      })
    }
  }, [isEdit, editData, setValue, form, resPubLevelOptions])

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

  // Handle extracted fields from DocumentUpload
  const handleExtractedFields = (fields: Record<string, any>) => {
    // Track which fields were successfully filled
    const filledFieldNames: string[] = []
    
    // Title - validate non-empty string
    if (fields.title) {
      const titleValue = String(fields.title).trim()
      if (titleValue.length > 0) {
        setValue("title", titleValue)
        filledFieldNames.push("title")
        onFieldChange?.("title")
      }
    }
    
    // Level - validate dropdown
    if (fields.level !== undefined && fields.level !== null) {
      if (setDropdownValue("level", fields.level, resPubLevelOptions)) {
        filledFieldNames.push("level")
      }
    }
    
    // Organisation - validate non-empty string
    if (fields.organisation) {
      const orgValue = String(fields.organisation).trim()
      if (orgValue.length > 0) {
        setValue("organisation", orgValue)
        filledFieldNames.push("organisation")
        onFieldChange?.("organisation")
      }
    }
    
    // Date - validate date format and not in future
    if (fields.date) {
      const dateValue = String(fields.date).trim()
      if (dateValue.length > 0) {
        const dateObj = new Date(dateValue)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (!isNaN(dateObj.getTime()) && dateObj <= today) {
          setValue("date", dateValue)
          filledFieldNames.push("date")
          onFieldChange?.("date")
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
              <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">Step 1: Upload Policy Document *</Label>
              <DocumentUpload
                documentUrl={documentUrl || initialDocumentUrl || undefined}
                category="Research & Consultancy"
                subCategory="Policy Document Developed"
                onChange={(url) => {
                  setDocumentUrl(url)
                  setValue("supportingDocument", url ? [url] : [])
                  // Only update originalDocumentUrlRef if document actually changed (new upload)
                  if (url && url.startsWith("/uploaded-document/")) {
                    // New upload - will be tracked by handleSaveEdit in page.tsx
                  } else if (url && url !== originalDocumentUrlRef.current) {
                    // Document URL changed but not a new upload
                  }
                }}
                onExtract={handleExtractedFields}
                onClearFields={onClearFields}
                isEditMode={isEdit}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>
      

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
        <div>
          <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
          <Input 
            id="title" 
            placeholder="Enter policy title" 
            disabled={isSubmitting}
            className={cn(
              "text-sm sm:text-base h-9 sm:h-10 mt-1",
              isAutoFilled?.("title") && "bg-blue-50 border-blue-200"
            )}
            {...register("title", { 
              required: "Title is required",
              onChange: () => onFieldChange?.("title")
            })} 
          />
          {errors.title && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="level" className="text-sm sm:text-base">Level *</Label>
            <Controller
              control={control}
              name="level"
              rules={{ required: "Level is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={resPubLevelOptions.map((l) => ({
                    value: l.id,
                    label: l.name,
                  }))}
                  value={field.value || ""}
                  onValueChange={(val) => {
                    field.onChange(Number(val))
                    onFieldChange?.("level")
                  }}
                  placeholder="Select level"
                  emptyMessage="No level found"
                  disabled={isSubmitting}
                  className={isAutoFilled?.("level") ? "bg-blue-50 border-blue-200" : undefined}
                />
              )}
            />
            {errors.level && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="organisation" className="text-sm sm:text-base">Organisation *</Label>
            <Input 
              id="organisation" 
              placeholder="Enter organisation" 
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("organisation") && "bg-blue-50 border-blue-200"
              )}
              {...register("organisation", { 
                required: "Organisation is required",
                onChange: () => onFieldChange?.("organisation")
              })} 
            />
            {errors.organisation && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.organisation.message?.toString()}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="date" className="text-sm sm:text-base">Date *</Label>
          <Input 
            id="date" 
            type="date" 
            max={new Date().toISOString().split('T')[0]}
            disabled={isSubmitting}
            className={cn(
              "text-sm sm:text-base h-9 sm:h-10 mt-1",
              isAutoFilled?.("date") && "bg-blue-50 border-blue-200"
            )}
            {...register("date", { 
              required: "Date is required",
              validate: (v) => {
                if (!v || v.trim() === "") {
                  return "Date is required"
                }
                const selectedDate = new Date(v)
                const today = new Date()
                today.setHours(23, 59, 59, 999) // Set to end of today to allow today's date
                if (selectedDate > today) {
                  return "Date cannot be in the future"
                }
                // Check if date is valid
                if (isNaN(selectedDate.getTime())) {
                  return "Please enter a valid date"
                }
                return true
              },
              onChange: () => onFieldChange?.("date")
            })} 
          />
          {errors.date && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
        </div>


       {
        !isEdit && 
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=policy"))}
          disabled={isSubmitting}
          className="w-full sm:w-auto text-xs sm:text-sm"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          {isEdit ? "Update Policy" : "Add Policy Document"}
        </Button>
      </div>
       }
      </div>
    </form>
  )
}
