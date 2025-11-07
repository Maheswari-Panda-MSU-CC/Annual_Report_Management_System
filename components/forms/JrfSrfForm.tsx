"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import { Save, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useRouter } from "next/navigation"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { useEffect } from "react"
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
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  jrfSrfTypeOptions: propJrfSrfTypeOptions,
}: JrfSrfFormProps) {
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
      if (editData.supportingDocument) setValue("supportingDocument", editData.supportingDocument)
    }
  }, [isEdit, editData, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: File Upload */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">
          Step 1: Upload Supporting Document
        </Label>
        <FileUpload onFileSelect={handleFileSelect} />
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-green-600">{selectedFiles[0].name}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExtractInfo}
              disabled={isExtracting}
            >
              {isExtracting ? "Extracting..." : "Extract Information"}
            </Button>
          </div>
        )}
      </div>

      {/* Step 2: JRF/SRF Details */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-6">
        <Label className="text-lg font-semibold block">
          Step 2: Verify/Complete JRF/SRF Details
        </Label>

        <div>
          <Label htmlFor="nameOfFellow">Name of Fellow *</Label>
          <Input
            id="nameOfFellow"
            placeholder="Enter fellow name"
            {...register("nameOfFellow", {
              required: "Name of fellow is required",
            })}
          />
          {errors.nameOfFellow && (
            <p className="text-sm text-red-600 mt-1">
              {errors.nameOfFellow.message?.toString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="type">Type *</Label>
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
              <p className="text-sm text-red-600 mt-1">{errors.type.message?.toString()}</p>
            )}
          </div>

          <div>
            <Label htmlFor="projectTitle">Project Title *</Label>
            <Input
              id="projectTitle"
              placeholder="Enter project title"
              {...register("projectTitle", {
                required: "Project title is required",
              })}
            />
            {errors.projectTitle && (
              <p className="text-sm text-red-600 mt-1">
                {errors.projectTitle.message?.toString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="duration">Duration (months) *</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Enter duration"
              min="1"
              {...register("duration", {
                required: "Duration is required",
                min: { value: 1, message: "Duration must be at least 1 month" },
              })}
            />
            {errors.duration && (
              <p className="text-sm text-red-600 mt-1">
                {errors.duration.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="monthlyStipend">Monthly Stipend (₹)</Label>
            <Input
              id="monthlyStipend"
              type="number"
              placeholder="Enter stipend amount"
              min="0"
              step="0.01"
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
              <p className="text-sm text-red-600 mt-1">
                {errors.monthlyStipend.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
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
              <p className="text-sm text-red-600 mt-1">
                {errors.date.message?.toString()}
              </p>
            )}
          </div>
        </div>

        {/* Edit mode document viewer */}
        {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
          <div className="mt-4">
            <DocumentViewer
              documentUrl={formData.supportingDocument[0]}
              documentType={
                formData.supportingDocument[0].split(".").pop()?.toLowerCase() ||
                ""
              }
            />
          </div>
        )}

        {/* Submit/Cancel Buttons */}
        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/teacher/research-contributions?tab=jrfSrf")
              }
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
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
