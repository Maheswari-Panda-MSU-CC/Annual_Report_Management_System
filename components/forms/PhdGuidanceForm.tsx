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

  // Handle extracted fields from DocumentUpload
  const handleExtractedFields = (fields: Record<string, any>) => {
    if (fields.regNo) setValue("regNo", fields.regNo)
    if (fields.nameOfStudent) setValue("nameOfStudent", fields.nameOfStudent)
    if (fields.dateOfRegistration) setValue("dateOfRegistration", fields.dateOfRegistration)
    if (fields.topic) setValue("topic", fields.topic)
    if (fields.status) setValue("status", fields.status)
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
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("dateOfRegistration") && "bg-blue-50 border-blue-200"
              )}
              max={new Date().toISOString().split('T')[0]}
              {...register("dateOfRegistration", { 
                required: "Date of registration is required",
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Date cannot be in the future"
                  }
                  return true
                },
                onChange: () => onFieldChange?.("dateOfRegistration")
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
              max={new Date().getFullYear() + 10}
              className={cn(
                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                isAutoFilled?.("yearOfCompletion") && "bg-blue-50 border-blue-200"
              )}
              {...register("yearOfCompletion", {
                validate: (value) => {
                  if (value) {
                    const year = Number(value)
                    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
                      return "Please enter a valid year"
                    }
                  }
                  return true
                },
                onChange: () => onFieldChange?.("yearOfCompletion")
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
                className={isAutoFilled?.("status") ? "bg-blue-50 border-blue-200" : undefined}
              />
            )}
          />
          {errors.status && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.status.message?.toString()}</p>}
        </div>


        {!isEdit && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=phd"))} className="w-full sm:w-auto text-xs sm:text-sm">
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
