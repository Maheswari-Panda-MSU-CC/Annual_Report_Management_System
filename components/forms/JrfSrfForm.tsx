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
import { DocumentViewer } from "../document-viewer"
import { useEffect, useState } from "react"
import { useDropDowns } from "@/hooks/use-dropdowns"

interface JrfSrfFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  jrfSrfTypeOptions?: Array<{ id: number; name: string }>
}

export function JrfSrfForm({
  form,
  onSubmit,
  isSubmitting,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  jrfSrfTypeOptions: propJrfSrfTypeOptions,
  initialDocumentUrl,
}: JrfSrfFormProps & { initialDocumentUrl?: string }) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form
  const formData = watch()
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
    jrfSrfTypeOptions: hookJrfSrfTypeOptions,
    fetchJrfSrfTypes
  } = useDropDowns()
  
  const jrfSrfTypeOptions = propJrfSrfTypeOptions || hookJrfSrfTypeOptions

  // Only fetch if props are not provided and options are empty
  useEffect(() => {
    if (!propJrfSrfTypeOptions && hookJrfSrfTypeOptions.length === 0) {
      fetchJrfSrfTypes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set initial values when in edit mode
  useEffect(() => {
    if (isEdit && editData) {
      // Map database fields to form fields
      if (editData.name) setValue("nameOfFellow", editData.name)
      if (editData.type) setValue("type", editData.type)
      if (editData.JRF_SRF_Type_Id) setValue("type", editData.JRF_SRF_Type_Id)
      if (editData.title) setValue("projectTitle", editData.title)
      if (editData.duration) setValue("duration", editData.duration)
      if (editData.stipend) setValue("monthlyStipend", editData.stipend)
      if (editData.date) setValue("date", editData.date)
      if (editData.doc) setValue("doc", editData.doc)
      if (editData.supportingDocument) {
        setValue("supportingDocument", editData.supportingDocument)
        setDocumentUrl(Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
      }
    }
  }, [isEdit, editData, setValue])

  // Handle extracted fields from DocumentUpload
  const handleExtractedFields = (fields: Record<string, any>) => {
    if (handleExtractInfo) {
      handleExtractInfo()
    }
    if (fields.nameOfFellow) setValue("nameOfFellow", fields.nameOfFellow)
    if (fields.type) setValue("type", fields.type)
    if (fields.projectTitle) setValue("projectTitle", fields.projectTitle)
    if (fields.duration) setValue("duration", fields.duration)
    if (fields.monthlyStipend) setValue("monthlyStipend", fields.monthlyStipend)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Step 1: File Upload */}
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
        <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">
          Step 1: Upload Supporting Document *
        </Label>
        <DocumentUpload
          documentUrl={documentUrl || initialDocumentUrl || undefined}
          category="Research & Consultancy"
          subCategory="Details Of JRF/SRF Working With You"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("supportingDocument", url ? [url] : [])
          }}
          onExtract={handleExtractedFields}
          className="w-full"
        />
      </div>

      {/* Step 2: JRF/SRF Details */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
        <Label className="text-base sm:text-lg font-semibold block">
          Step 2: Verify/Complete JRF/SRF Details
        </Label>

        <div>
          <Label htmlFor="nameOfFellow" className="text-sm sm:text-base">Name of Fellow *</Label>
          <Input
            id="nameOfFellow"
            placeholder="Enter fellow name"
            className="text-sm sm:text-base h-9 sm:h-10 mt-1"
            {...register("nameOfFellow", {
              required: "Name of fellow is required",
            })}
          />
          {errors.nameOfFellow && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">
              {errors.nameOfFellow.message?.toString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="type" className="text-sm sm:text-base">Type *</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "Type is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={jrfSrfTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select type"
                  emptyMessage="No type found"
                />
              )}
            />
            {errors.type && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.type.message?.toString()}</p>
            )}
          </div>

          <div>
            <Label htmlFor="projectTitle" className="text-sm sm:text-base">Project Title *</Label>
            <Input
              id="projectTitle"
              placeholder="Enter project title"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              {...register("projectTitle", {
                required: "Project title is required",
              })}
            />
            {errors.projectTitle && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.projectTitle.message?.toString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="duration" className="text-sm sm:text-base">Duration (months) *</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Enter duration"
              min="1"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              {...register("duration", {
                required: "Duration is required",
                min: { value: 1, message: "Duration must be at least 1 month" },
              })}
            />
            {errors.duration && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.duration.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="monthlyStipend" className="text-sm sm:text-base">Monthly Stipend (₹)</Label>
            <Input
              id="monthlyStipend"
              type="number"
              placeholder="Enter stipend amount"
              min="0"
              step="0.01"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              {...register("monthlyStipend", {
                min: { value: 0, message: "Stipend must be positive" },
                validate: (value) => {
                  if (value && isNaN(Number(value))) {
                    return "Please enter a valid number"
                  }
                  return true
                }
              })}
            />
            {errors.monthlyStipend && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.monthlyStipend.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="date" className="text-sm sm:text-base">Date</Label>
            <Input
              id="date"
              type="date"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              max={new Date().toISOString().split('T')[0]}
              {...register("date", {
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Date cannot be in the future"
                  }
                  return true
                }
              })}
            />
            {errors.date && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.date.message?.toString()}
              </p>
            )}
          </div>
        </div>


        {/* Submit/Cancel Buttons */}
        {!isEdit && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/teacher/research-contributions?tab=jrfSrf")
              }
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
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
                  Add JRF/SRF Record
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
