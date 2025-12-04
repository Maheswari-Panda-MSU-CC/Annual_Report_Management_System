"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Save } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { useDropDowns } from "@/hooks/use-dropdowns"

interface AcademicVisitFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  academicVisitRoleOptions?: Array<{ id: number; name: string }>
  onClearFields?: () => void
  onCancel?: () => void
}

export function AcademicVisitForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  academicVisitRoleOptions: propAcademicVisitRoleOptions,
  initialDocumentUrl,
  onClearFields,
  onCancel,
}: AcademicVisitFormProps & { initialDocumentUrl?: string }) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
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
    academicVisitRoleOptions: hookAcademicVisitRoleOptions,
    fetchAcademicVisitRoles
  } = useDropDowns()
  
  const academicVisitRoleOptions = propAcademicVisitRoleOptions || hookAcademicVisitRoleOptions

  // Only fetch if props are not provided and options are empty
  useEffect(() => {
    if (!propAcademicVisitRoleOptions && hookAcademicVisitRoleOptions.length === 0) {
      fetchAcademicVisitRoles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set initial values when in edit mode
  useEffect(() => {
    if (isEdit && editData) {
      // Map database fields to form fields
      if (editData.Institute_visited) setValue("instituteVisited", editData.Institute_visited)
      if (editData.duration) setValue("durationOfVisit", editData.duration)
      if (editData.role) setValue("role", editData.role)
      if (editData.Acad_research_Role_Id) setValue("role", editData.Acad_research_Role_Id)
      if (editData.Sponsored_by) setValue("sponsoredBy", editData.Sponsored_by)
      if (editData.remarks) setValue("remarks", editData.remarks)
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
    if (fields.instituteVisited) setValue("instituteVisited", fields.instituteVisited)
    if (fields.durationOfVisit) setValue("durationOfVisit", fields.durationOfVisit)
    if (fields.role) setValue("role", fields.role)
    if (fields.date) setValue("date", fields.date)
    if (fields.sponsoredBy) setValue("sponsoredBy", fields.sponsoredBy)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Step 1: Document Upload */}
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
        <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">Step 1: Upload Document *</Label>
        <DocumentUpload
          documentUrl={documentUrl || initialDocumentUrl || undefined}
          category="Research & Consultancy"
          subCategory="Academic/Research Visit"
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

      {/* Step 2: Visit Information */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
        <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">Step 2: Verify/Complete Visit Information</Label>

        <div>
          <Label htmlFor="instituteVisited" className="text-sm sm:text-base">Institute/Industry Visited *</Label>
          <Input
            id="instituteVisited"
            placeholder="Enter institute/industry name"
            className="text-sm sm:text-base h-9 sm:h-10 mt-1"
            {...register("instituteVisited", { required: "Institute name is required" })}
          />
          {errors.instituteVisited && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.instituteVisited.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="durationOfVisit" className="text-sm sm:text-base">Duration of Visit (days) *</Label>
            <Input
              id="durationOfVisit"
              type="number"
              placeholder="Enter duration"
              min="1"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              {...register("durationOfVisit", { 
                required: "Duration is required",
                min: { value: 1, message: "Duration must be at least 1 day" }
              })}
            />
            {errors.durationOfVisit && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.durationOfVisit.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="role" className="text-sm sm:text-base">Role *</Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={academicVisitRoleOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select role"
                  emptyMessage="No role found"
                />
              )}
            />
            {errors.role && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.role.message?.toString()}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="sponsoredBy" className="text-sm sm:text-base">Sponsored By</Label>
            <Input
              id="sponsoredBy"
              placeholder="e.g., University, Government, Self-funded"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              {...register("sponsoredBy")}
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-sm sm:text-base">Visit Date *</Label>
            <Input
              id="date"
              type="date"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              max={new Date().toISOString().split('T')[0]}
              {...register("date", { 
                required: "Visit date is required",
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Visit date cannot be in the future"
                  }
                  return true
                }
              })}
            />
            {errors.date && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="remarks" className="text-sm sm:text-base">Remarks</Label>
          <Textarea
            id="remarks"
            placeholder="Outcomes, collaborations, etc."
            rows={4}
            className="text-sm sm:text-base mt-1"
            {...register("remarks")}
          />
        </div>


        {/* Form Buttons */}
        {
          !isEdit && (
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=visits"))} className="w-full sm:w-auto text-xs sm:text-sm">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
                {isSubmitting ? "Submitting..." : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Add Visit
                  </>
                )}
              </Button>
            </div>
          )
        }
      </div>
    </form>
  )
}
