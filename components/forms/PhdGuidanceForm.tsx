"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import { Save, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useRouter } from "next/navigation"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { cn } from "@/lib/utils"

interface PhdGuidanceFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isEdit?: boolean
  editData?: Record<string, any>
  phdGuidanceStatusOptions?: Array<{ id: number; name: string }>
  onClearFields?: () => void
  onCancel?: () => void
  isAutoFilled?: (fieldName: string) => boolean
  onFieldChange?: (fieldName: string) => void
}

export function PhdGuidanceForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
  phdGuidanceStatusOptions: propPhdGuidanceStatusOptions,
  initialDocumentUrl,
  onClearFields,
  onCancel,
  isAutoFilled,
  onFieldChange,
}: PhdGuidanceFormProps & { initialDocumentUrl?: string }) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form
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

  // Use props if provided, otherwise fetch from hook
  const { 
    phdGuidanceStatusOptions: hookPhdGuidanceStatusOptions,
    fetchPhdGuidanceStatuses
  } = useDropDowns()
  
  const phdGuidanceStatusOptions = propPhdGuidanceStatusOptions || hookPhdGuidanceStatusOptions

  // Only fetch if props are not provided and options are empty
  useEffect(() => {
    if (!propPhdGuidanceStatusOptions && hookPhdGuidanceStatusOptions.length === 0) {
      fetchPhdGuidanceStatuses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set initial values when in edit mode
  useEffect(() => {
    if (isEdit && editData) {
      // Map database fields to form fields
      if (editData.regno) setValue("regNo", editData.regno)
      if (editData.name) setValue("nameOfStudent", editData.name)
      if (editData.start_date) setValue("dateOfRegistration", editData.start_date)
      if (editData.year_of_completion) setValue("yearOfCompletion", editData.year_of_completion)
      if (editData.topic) setValue("topic", editData.topic)
      if (editData.status) setValue("status", editData.status)
      if (editData.Res_Proj_Other_Details_Status_Id) setValue("status", editData.Res_Proj_Other_Details_Status_Id)
      if (editData.doc) setValue("doc", editData.doc)
      if (editData.supportingDocument) {
        setValue("supportingDocument", editData.supportingDocument)
        setDocumentUrl(Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
      }
    }
  }, [isEdit, editData, setValue])

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
    
    // Registration Number - validate non-empty string
    if (fields.regNo) {
      const regValue = String(fields.regNo).trim()
      if (regValue.length > 0) {
        setValue("regNo", regValue)
        filledFieldNames.push("regNo")
        onFieldChange?.("regNo")
      }
    }
    
    // Name of Student - validate non-empty string
    if (fields.nameOfStudent) {
      const nameValue = String(fields.nameOfStudent).trim()
      if (nameValue.length > 0) {
        setValue("nameOfStudent", nameValue)
        filledFieldNames.push("nameOfStudent")
        onFieldChange?.("nameOfStudent")
      }
    }
    
    // Date of Registration - validate date format and not in future
    if (fields.dateOfRegistration) {
      const dateValue = String(fields.dateOfRegistration).trim()
      if (dateValue.length > 0) {
        const dateObj = new Date(dateValue)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (!isNaN(dateObj.getTime()) && dateObj <= today) {
          setValue("dateOfRegistration", dateValue)
          filledFieldNames.push("dateOfRegistration")
          onFieldChange?.("dateOfRegistration")
        }
      }
    }
    
    // Topic - validate non-empty string
    if (fields.topic) {
      const topicValue = String(fields.topic).trim()
      if (topicValue.length > 0) {
        setValue("topic", topicValue)
        filledFieldNames.push("topic")
        onFieldChange?.("topic")
      }
    }
    
    // Status - validate dropdown
    if (fields.status !== undefined && fields.status !== null) {
      if (setDropdownValue("status", fields.status, phdGuidanceStatusOptions)) {
        filledFieldNames.push("status")
      }
    }
    
    // Year of Completion - validate 4-digit number, not in future, and compare with registration date (optional field)
    if (fields.yearOfCompletion !== undefined && fields.yearOfCompletion !== null) {
      const yearString = String(fields.yearOfCompletion).trim()
      // Check if it's exactly 4 digits
      if (/^\d{4}$/.test(yearString)) {
        const yearValue = Number(yearString)
        const currentYear = new Date().getFullYear()
        
        // Check if year is valid and not in the future
        if (!isNaN(yearValue) && yearValue >= 1900 && yearValue <= currentYear) {
          // Check if registration date exists and compare years
          const registrationDate = watch("dateOfRegistration")
          let isValid = true
          if (registrationDate) {
            const regDate = new Date(registrationDate)
            if (!isNaN(regDate.getTime())) {
              const registrationYear = regDate.getFullYear()
              if (yearValue < registrationYear) {
                isValid = false // Year of completion cannot be before registration year
              }
            }
          }
          
          if (isValid) {
            setValue("yearOfCompletion", yearValue)
            filledFieldNames.push("yearOfCompletion")
            onFieldChange?.("yearOfCompletion")
          }
        }
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
          subCategory="PhD Guidance Details"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("supportingDocument", url ? [url] : [])
          }}
          onExtract={handleExtractedFields}
          onClearFields={onClearFields}
          isEditMode={isEdit}
          className="w-full"
          disabled={isSubmitting}
        />
      </div>

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
        <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">Step 2: PhD Student Information</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="regNo" className="text-sm sm:text-base">Registration Number *</Label>
            <Input
              id="regNo"
              placeholder="Enter registration number"
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("regNo") && "bg-blue-50 border-blue-200"
              )}
              {...register("regNo", { 
                required: "Registration number is required",
                onChange: () => onFieldChange?.("regNo")
              })}
            />
            {errors.regNo && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.regNo.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="nameOfStudent" className="text-sm sm:text-base">Name of Student *</Label>
            <Input
              id="nameOfStudent"
              placeholder="Enter student's name"
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("nameOfStudent") && "bg-blue-50 border-blue-200"
              )}
              {...register("nameOfStudent", { 
                required: "Student name is required",
                onChange: () => onFieldChange?.("nameOfStudent")
              })}
            />
            {errors.nameOfStudent && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.nameOfStudent.message?.toString()}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="dateOfRegistration" className="text-sm sm:text-base">Date of Registration *</Label>
            <Input
              id="dateOfRegistration"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("dateOfRegistration") && "bg-blue-50 border-blue-200"
              )}
              {...register("dateOfRegistration", { 
                required: "Date of registration is required",
                validate: (v) => {
                  if (!v || v.trim() === "") {
                    return "Date of registration is required"
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
                  
                  // Check if year of completion (if entered) is not before registration year
                  const yearOfCompletion = watch("yearOfCompletion")
                  if (yearOfCompletion) {
                    const completionYear = Number(yearOfCompletion)
                    const registrationYear = selectedDate.getFullYear()
                    if (!isNaN(completionYear) && completionYear < registrationYear) {
                      return `Registration year (${registrationYear}) cannot be after completion year (${completionYear})`
                    }
                  }
                  
                  return true
                },
                onChange: () => {
                  onFieldChange?.("dateOfRegistration")
                  // Trigger validation for year of completion when registration date changes
                  setTimeout(() => {
                    form.trigger("yearOfCompletion")
                  }, 0)
                }
              })}
            />
            {errors.dateOfRegistration && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.dateOfRegistration.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="yearOfCompletion" className="text-sm sm:text-base">Year of Completion</Label>
            <Input
              id="yearOfCompletion"
              type="number"
              placeholder="Enter year (e.g., 2024)"
              min="1900"
              max={new Date().getFullYear()}
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("yearOfCompletion") && "bg-blue-50 border-blue-200"
              )}
              {...register("yearOfCompletion", {
                validate: (value) => {
                  // Field is optional, but if entered, must be valid
                  if (value) {
                    const year = Number(value)
                    
                    // Check if it's a valid number
                    if (isNaN(year)) {
                      return "Please enter a valid year"
                    }
                    
                    // Check if it's exactly 4 digits (between 1000-9999)
                    const yearString = String(value).trim()
                    if (yearString.length !== 4 || !/^\d{4}$/.test(yearString)) {
                      return "Year must be exactly 4 digits"
                    }
                    
                    const currentYear = new Date().getFullYear()
                    
                    // Check if year is not in the future
                    if (year > currentYear) {
                      return `Year of completion (${year}) cannot be in the future. Current year is ${currentYear}`
                    }
                    
                    // Check if year is within valid range
                    if (year < 1900 || year > currentYear) {
                      return "Please enter a valid year (1900 to " + currentYear + ")"
                    }
                    
                    // Check if year is not in the past compared to registration date
                    const registrationDate = watch("dateOfRegistration")
                    if (registrationDate) {
                      const regDate = new Date(registrationDate)
                      if (!isNaN(regDate.getTime())) {
                        const registrationYear = regDate.getFullYear()
                        if (year < registrationYear) {
                          return `Year of completion (${year}) cannot be before the registration year (${registrationYear})`
                        }
                      }
                    }
                  }
                  return true
                },
                onChange: () => {
                  onFieldChange?.("yearOfCompletion")
                  // Trigger validation for registration date when year changes
                  setTimeout(() => {
                    form.trigger("dateOfRegistration")
                  }, 0)
                }
              })}
            />
            {errors.yearOfCompletion && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.yearOfCompletion.message?.toString()}</p>}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="topic" className="text-sm sm:text-base">Research Topic *</Label>
          <Textarea
            id="topic"
            placeholder="Enter research topic"
            rows={3}
            disabled={isSubmitting}
            className={cn(
              "text-sm sm:text-base mt-1",
              isAutoFilled?.("topic") && "bg-blue-50 border-blue-200"
            )}
            {...register("topic", { 
              required: "Research topic is required",
              onChange: () => onFieldChange?.("topic")
            })}
          />
          {errors.topic && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.topic.message?.toString()}</p>}
        </div>

        <div className="mt-4">
          <Label htmlFor="status" className="text-sm sm:text-base">Status *</Label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <SearchableSelect
                options={phdGuidanceStatusOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val)
                  onFieldChange?.("status")
                }}
                placeholder="Select status"
                emptyMessage="No status found"
                disabled={isSubmitting}
                className={isAutoFilled?.("status") ? "bg-blue-50 border-blue-200" : undefined}
              />
            )}
          />
          {errors.status && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.status.message?.toString()}</p>}
        </div>


        {!isEdit && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=phd"))} disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add PhD Guidance
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
