"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Loader2, Save } from "lucide-react"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
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
}: AcademicVisitFormProps) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  const formData = watch()

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
      if (editData.supportingDocument) setValue("supportingDocument", editData.supportingDocument)
    }
  }, [isEdit, editData, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Document Upload */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Document</Label>
        <FileUpload onFileSelect={handleFileSelect} />
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-green-600">{selectedFiles[0].name}</p>
            <Button type="button" variant="outline" size="sm" onClick={handleExtractInfo} disabled={isExtracting}>
              {isExtracting ? "Extracting..." : "Extract Information"}
            </Button>
          </div>
        )}
      </div>

      {/* Step 2: Visit Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Visit Information</Label>

        <div>
          <Label htmlFor="instituteVisited">Institute/Industry Visited *</Label>
          <Input
            id="instituteVisited"
            placeholder="Enter institute/industry name"
            {...register("instituteVisited", { required: "Institute name is required" })}
          />
          {errors.instituteVisited && <p className="text-sm text-red-600 mt-1">{errors.instituteVisited.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="durationOfVisit">Duration of Visit (days) *</Label>
            <Input
              id="durationOfVisit"
              type="number"
              placeholder="Enter duration"
              min="1"
              {...register("durationOfVisit", { 
                required: "Duration is required",
                min: { value: 1, message: "Duration must be at least 1 day" }
              })}
            />
            {errors.durationOfVisit && <p className="text-sm text-red-600 mt-1">{errors.durationOfVisit.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
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
              <p className="text-sm text-red-600 mt-1">{errors.role.message?.toString()}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="sponsoredBy">Sponsored By</Label>
            <Input
              id="sponsoredBy"
              placeholder="e.g., University, Government, Self-funded"
              {...register("sponsoredBy")}
            />
          </div>

          <div>
            <Label htmlFor="date">Visit Date *</Label>
            <Input
              id="date"
              type="date"
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
            {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            placeholder="Outcomes, collaborations, etc."
            rows={4}
            {...register("remarks")}
          />
        </div>

        {/* Optional Document Viewer in Edit Mode */}
        {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
          <div className="mt-4">
            <DocumentViewer
              documentUrl={formData.supportingDocument[0]}
              documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ''}
            />
          </div>
        )}

        {/* Form Buttons */}
        {
          !isEdit && (
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=visits")}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
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
