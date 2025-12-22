"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { ConsultancyFormProps } from "@/types/interfaces"
import { cn } from "@/lib/utils"

export function ConsultancyForm({
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
}: ConsultancyFormProps & { initialDocumentUrl?: string; onClearFields?: () => void; onCancel?: () => void; isAutoFilled?: (fieldName: string) => boolean; onFieldChange?: (fieldName: string) => void }) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
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

  // Set initial values when in edit mode - optimized to reset and set all values at once
  useEffect(() => {
    if (isEdit && editData && Object.keys(editData).length > 0) {
      // Reset form first to clear any previous values
      form.reset()
      
      // Prepare all form values
      const formValues: any = {}
      
      if (editData.name) formValues.title = editData.name
      if (editData.collaborating_inst) formValues.collaboratingInstitute = editData.collaborating_inst
      if (editData.address) formValues.address = editData.address
      if (editData.Start_Date) formValues.startDate = editData.Start_Date
      if (editData.duration !== undefined && editData.duration !== null) formValues.duration = editData.duration
      if (editData.amount) formValues.amount = editData.amount
      if (editData.outcome) formValues.detailsOutcome = editData.outcome
      if (editData.supportingDocument) {
        formValues.supportingDocument = editData.supportingDocument
        setDocumentUrl(Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
      }
      
      // Set all values at once
      Object.keys(formValues).forEach((key) => {
        setValue(key, formValues[key], { shouldValidate: false, shouldDirty: false })
      })
    }
  }, [isEdit, editData, setValue, form])

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
    
    // Collaborating Institute - validate non-empty string
    if (fields.collaboratingInstitute) {
      const instValue = String(fields.collaboratingInstitute).trim()
      if (instValue.length > 0) {
        setValue("collaboratingInstitute", instValue)
        filledFieldNames.push("collaboratingInstitute")
        onFieldChange?.("collaboratingInstitute")
      }
    }
    
    // Address - validate non-empty string
    if (fields.address) {
      const addressValue = String(fields.address).trim()
      if (addressValue.length > 0) {
        setValue("address", addressValue)
        filledFieldNames.push("address")
        onFieldChange?.("address")
      }
    }
    
    // Start Date - validate date format and not in future
    if (fields.startDate) {
      const dateValue = String(fields.startDate).trim()
      if (dateValue.length > 0) {
        const dateObj = new Date(dateValue)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (!isNaN(dateObj.getTime()) && dateObj <= today) {
          setValue("startDate", dateValue)
          filledFieldNames.push("startDate")
          onFieldChange?.("startDate")
        }
      }
    }
    
    // Duration - validate number
    if (fields.duration !== undefined && fields.duration !== null) {
      const durationValue = Number(fields.duration)
      if (!isNaN(durationValue) && durationValue >= 0) {
        setValue("duration", durationValue)
        filledFieldNames.push("duration")
        onFieldChange?.("duration")
      }
    }
    
    // Amount - validate number
    if (fields.amount !== undefined && fields.amount !== null) {
      // Handle comma-separated numbers
      const amountValue = String(fields.amount).replace(/,/g, '').trim()
      const numValue = Number(amountValue)
      if (!isNaN(numValue) && numValue >= 0) {
        setValue("amount", numValue)
        filledFieldNames.push("amount")
        onFieldChange?.("amount")
      }
    }
    
    // Details/Outcome - validate non-empty string
    if (fields.detailsOutcome) {
      const detailsValue = String(fields.detailsOutcome).trim()
      if (detailsValue.length > 0) {
        setValue("detailsOutcome", detailsValue)
        filledFieldNames.push("detailsOutcome")
        onFieldChange?.("detailsOutcome")
      }
    } else if (fields.details || fields.outcome) {
      // Fallback if mapping didn't work
      const detailsValue = String(fields.details || fields.outcome).trim()
      if (detailsValue.length > 0) {
        setValue("detailsOutcome", detailsValue)
        filledFieldNames.push("detailsOutcome")
        onFieldChange?.("detailsOutcome")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
        <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">Step 1: Upload Consultancy Document *</Label>
        <DocumentUpload
          documentUrl={documentUrl || initialDocumentUrl || undefined}
          category="Research & Consultancy"
          subCategory="Details of Consultancy Undertaken"
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
        <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">Step 2: Fill Consultancy Details</Label>

        <div>
          <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
          <Input
            id="title"
            placeholder="Enter consultancy project title"
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
            <Label htmlFor="collaboratingInstitute" className="text-sm sm:text-base">Collaborating Institute *</Label>
            <Input
              id="collaboratingInstitute"
              placeholder="Enter institute/industry name"
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("collaboratingInstitute") && "bg-blue-50 border-blue-200"
              )}
              {...register("collaboratingInstitute", { 
                required: "Collaborating Institute is required",
                onChange: () => onFieldChange?.("collaboratingInstitute")
              })}
            />
            {errors.collaboratingInstitute && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.collaboratingInstitute.message?.toString()}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address" className="text-sm sm:text-base">Address *</Label>
            <Input
              id="address"
              placeholder="Enter address"
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("address") && "bg-blue-50 border-blue-200"
              )}
              {...register("address", { 
                required: "Address is required",
                onChange: () => onFieldChange?.("address")
              })}
            />
            {errors.address && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.address.message?.toString()}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="startDate" className="text-sm sm:text-base">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("startDate") && "bg-blue-50 border-blue-200"
              )}
              {...register("startDate", { 
                required: "Start date is required",
                validate: (v) => {
                  if (!v || v.trim() === "") {
                    return "Start date is required"
                  }
                  const selectedDate = new Date(v)
                  const today = new Date()
                  today.setHours(23, 59, 59, 999) // Set to end of today to allow today's date
                  if (selectedDate > today) {
                    return "Start date cannot be in the future"
                  }
                  // Check if date is valid
                  if (isNaN(selectedDate.getTime())) {
                    return "Please enter a valid date"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("startDate")
              })}
            />
            {errors.startDate && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.startDate.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="duration" className="text-sm sm:text-base">Duration (in Months)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Enter duration"
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("duration") && "bg-blue-50 border-blue-200"
              )}
              {...register("duration", {
                onChange: () => onFieldChange?.("duration")
              })}
            />
          </div>

          <div>
            <Label htmlFor="amount" className="text-sm sm:text-base">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              disabled={isSubmitting}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("amount") && "bg-blue-50 border-blue-200"
              )}
              {...register("amount", {
                onChange: () => onFieldChange?.("amount")
              })}
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="detailsOutcome" className="text-sm sm:text-base">Details / Outcome</Label>
          <Textarea
            id="detailsOutcome"
            placeholder="Enter details about the consultancy project and its outcomes"
            rows={4}
            disabled={isSubmitting}
            className={cn(
              "text-sm sm:text-base mt-1",
              isAutoFilled?.("detailsOutcome") && "bg-blue-50 border-blue-200"
            )}
            {...register("detailsOutcome", {
              onChange: () => onFieldChange?.("detailsOutcome")
            })}
          />
        </div>


        {!isEdit && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=consultancy"))}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
              {isSubmitting ? "Submitting..." : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {isEdit ? "Update Consultancy" : "Add Consultancy"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
