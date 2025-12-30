"use client"

import { useEffect, useState, useRef } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { EContentFormProps } from "@/types/interfaces"
import { cn } from "@/lib/utils"

export function EContentForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
  eContentTypeOptions: propEContentTypeOptions,
  typeEcontentValueOptions: propTypeEcontentValueOptions,
  initialDocumentUrl,
  onClearFields,
  onCancel,
  isAutoFilled,
  onFieldChange,
}: EContentFormProps & { initialDocumentUrl?: string; onClearFields?: () => void; onCancel?: () => void; isAutoFilled?: (fieldName: string) => boolean; onFieldChange?: (fieldName: string) => void }) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  
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
  const { eContentTypeOptions: hookEContentTypeOptions, typeEcontentValueOptions: hookTypeEcontentValueOptions, fetchEContentTypes, fetchTypeEcontentValues } = useDropDowns()
  
  const eContentTypeOptions = propEContentTypeOptions || hookEContentTypeOptions
  const typeEcontentValueOptions = propTypeEcontentValueOptions || hookTypeEcontentValueOptions

  // Only fetch if props are not provided and options are empty
  useEffect(() => {
    if (!propEContentTypeOptions && hookEContentTypeOptions.length === 0) {
      fetchEContentTypes()
    }
    if (!propTypeEcontentValueOptions && hookTypeEcontentValueOptions.length === 0) {
      fetchTypeEcontentValues()
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
      if (editData.Brief_Details) formValues.briefDetails = editData.Brief_Details
      if (editData.Quadrant !== undefined && editData.Quadrant !== null) formValues.quadrant = Number(editData.Quadrant)
      if (editData.Publishing_date) formValues.publishingDate = editData.Publishing_date
      if (editData.Publishing_Authorities) formValues.publishingAuthorities = editData.Publishing_Authorities
      if (editData.link) formValues.link = editData.link
      if (editData.e_content_type !== undefined && editData.e_content_type !== null) {
        formValues.typeOfEContentPlatform = editData.e_content_type
      }
      if (editData.type_econtent !== undefined && editData.type_econtent !== null) {
        formValues.typeOfEContent = editData.type_econtent
      }
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
  }, [isEdit, editData, setValue, form])

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

  // Helper function to validate quadrant (1-6)
  const setQuadrantValue = (fieldName: string, value: any): boolean => {
    if (value === undefined || value === null) return false
    
    const quadrantOptions = [
      { id: 1, name: "1" },
      { id: 2, name: "2" },
      { id: 3, name: "3" },
      { id: 4, name: "4" },
      { id: 5, name: "5" },
      { id: 6, name: "6" },
    ]
    
    return setDropdownValue(fieldName, value, quadrantOptions)
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
    
    // Brief Details - validate non-empty string
    if (fields.briefDetails) {
      const briefValue = String(fields.briefDetails).trim()
      if (briefValue.length > 0) {
        setValue("briefDetails", briefValue)
        filledFieldNames.push("briefDetails")
        onFieldChange?.("briefDetails")
      }
    }
    
    // Quadrant - validate dropdown (1-6)
    if (fields.quadrant !== undefined && fields.quadrant !== null) {
      if (setQuadrantValue("quadrant", fields.quadrant)) {
        filledFieldNames.push("quadrant")
      }
    }
    
    // Publishing Date - validate date format and not in future
    if (fields.publishingDate) {
      const dateValue = String(fields.publishingDate).trim()
      if (dateValue.length > 0) {
        const dateObj = new Date(dateValue)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (!isNaN(dateObj.getTime()) && dateObj <= today) {
          setValue("publishingDate", dateValue)
          filledFieldNames.push("publishingDate")
          onFieldChange?.("publishingDate")
        }
      }
    }
    
    // Publishing Authorities - validate non-empty string
    if (fields.publishingAuthorities) {
      const authValue = String(fields.publishingAuthorities).trim()
      if (authValue.length > 0) {
        setValue("publishingAuthorities", authValue)
        filledFieldNames.push("publishingAuthorities")
        onFieldChange?.("publishingAuthorities")
      }
    }
    
    // Link - validate non-empty string (optional field, but validate if provided)
    if (fields.link) {
      const linkValue = String(fields.link).trim()
      if (linkValue.length > 0) {
        setValue("link", linkValue)
        filledFieldNames.push("link")
        onFieldChange?.("link")
      }
    }
    
    // Type of E-Content Platform - validate dropdown
    if (fields.type !== undefined && fields.type !== null) {
      if (setDropdownValue("typeOfEContentPlatform", fields.type, eContentTypeOptions)) {
        filledFieldNames.push("typeOfEContentPlatform")
      }
    }
    
    // Type of E-Content - validate dropdown
    if (fields.typeEcontentValue !== undefined && fields.typeEcontentValue !== null) {
      if (setDropdownValue("typeOfEContent", fields.typeEcontentValue, typeEcontentValueOptions)) {
        filledFieldNames.push("typeOfEContent")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
        <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">Step 1: Upload Document *</Label>
        <DocumentUpload
          documentUrl={documentUrl || initialDocumentUrl || undefined}
          category="Research & Consultancy"
          subCategory="E Content"
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
        <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">Step 2: Fill E-Content Info</Label>

        <div>
          <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
          <Input
            id="title"
            placeholder="Enter e-content title"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="typeOfEContentPlatform" className="text-sm sm:text-base">Platform (E-Content Type) *</Label>
            <Controller
              control={control}
              name="typeOfEContentPlatform"
              rules={{ required: "Platform is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={eContentTypeOptions.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  value={field.value || ""}
                  onValueChange={(val) => {
                    field.onChange(Number(val))
                    onFieldChange?.("typeOfEContentPlatform")
                  }}
                  placeholder="Select platform"
                  emptyMessage="No platform found"
                  disabled={isSubmitting}
                  className={isAutoFilled?.("typeOfEContentPlatform") ? "bg-blue-50 border-blue-200" : undefined}
                />
              )}
            />
            {errors.typeOfEContentPlatform && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.typeOfEContentPlatform.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="quadrant" className="text-sm sm:text-base">Quadrant *</Label>
            <Controller
              control={control}
              name="quadrant"
              rules={{ required: "Quadrant is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={[
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                    { value: 5, label: "5" },
                    { value: 6, label: "6" },
                  ]}
                  value={field.value || ""}
                  onValueChange={(val) => {
                    field.onChange(Number(val))
                    onFieldChange?.("quadrant")
                  }}
                  placeholder="Select quadrant"
                  emptyMessage="No quadrant found"
                  disabled={isSubmitting}
                  className={isAutoFilled?.("quadrant") ? "bg-blue-50 border-blue-200" : undefined}
                />
              )}
            />
            {errors.quadrant && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.quadrant.message?.toString()}</p>}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="briefDetails" className="text-sm sm:text-base">Brief Details *</Label>
          <Textarea
            id="briefDetails"
            placeholder="Enter brief details"
            disabled={isSubmitting}
            className={cn(
              "text-sm sm:text-base mt-1",
              isAutoFilled?.("briefDetails") && "bg-blue-50 border-blue-200"
            )}
            {...register("briefDetails", { 
              required: "Brief details are required",
              onChange: () => onFieldChange?.("briefDetails")
            })}
          />
          {errors.briefDetails && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.briefDetails.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="publishingDate" className="text-sm sm:text-base">Publishing Date *</Label>
            <Input
              id="publishingDate"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("publishingDate") && "bg-blue-50 border-blue-200"
              )}
              {...register("publishingDate", { 
                required: "Publishing date is required",
                validate: (v) => {
                  if (!v || v.trim() === "") {
                    return "Publishing date is required"
                  }
                  const selectedDate = new Date(v)
                  const today = new Date()
                  today.setHours(23, 59, 59, 999) // Set to end of today to allow today's date
                  if (selectedDate > today) {
                    return "Publishing date cannot be in the future"
                  }
                  // Check if date is valid
                  if (isNaN(selectedDate.getTime())) {
                    return "Please enter a valid date"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("publishingDate")
              })}
            />
            {errors.publishingDate && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.publishingDate.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="publishingAuthorities" className="text-sm sm:text-base">Publishing Authorities *</Label>
            <Input
              id="publishingAuthorities"
              placeholder="Enter publishing authorities"
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("publishingAuthorities") && "bg-blue-50 border-blue-200"
              )}
              {...register("publishingAuthorities", { 
                required: "Publishing authorities are required",
                onChange: () => onFieldChange?.("publishingAuthorities")
              })}
            />
            {errors.publishingAuthorities && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.publishingAuthorities.message?.toString()}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="link" className="text-sm sm:text-base">Link</Label>
            <Input
              id="link"
              type="url"
              placeholder="Enter link"
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("link") && "bg-blue-50 border-blue-200"
              )}
              {...register("link", {
                onChange: () => onFieldChange?.("link")
              })}
            />
          </div>

          <div>
            <Label htmlFor="typeOfEContent" className="text-sm sm:text-base">Type of E-Content (Type Econtent Value)</Label>
            <Controller
              control={control}
              name="typeOfEContent"
              render={({ field }) => (
                <SearchableSelect
                  options={typeEcontentValueOptions.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  value={field.value || ""}
                  onValueChange={(val) => {
                    field.onChange(Number(val))
                    onFieldChange?.("typeOfEContent")
                  }}
                  placeholder="Select type"
                  emptyMessage="No type found"
                  disabled={isSubmitting}
                  className={isAutoFilled?.("typeOfEContent") ? "bg-blue-50 border-blue-200" : undefined}
                />
              )}
            />
          </div>
        </div>


       {!isEdit &&
         <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
         <Button type="button" variant="outline" onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=econtent"))} disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
           Cancel
         </Button>
         <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
           {isSubmitting ? "Submitting..." : (
             <>
               <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
               {isEdit ? "Update E-Content" : "Add E-Content"}
             </>
           )}
         </Button>
       </div>
       }
      </div>
    </form>
  )
}
