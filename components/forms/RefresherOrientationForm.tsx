"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Brain } from "lucide-react"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { useRouter } from "next/navigation"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"

interface RefresherOrientationFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  refresherTypeOptions?: DropdownOption[]
}

export function RefresherOrientationForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  refresherTypeOptions = []
}: RefresherOrientationFormProps) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  const formData = watch()

  useEffect(() => {
    if (isEdit && editData) {
      Object.entries(editData).forEach(([key, value]) => {
        setValue(key, value)
      })
    }
  }, [isEdit, editData, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Upload */}
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
              className="flex items-center gap-2"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Extract Information
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Step 2: Form Fields */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">
          Step 2: Verify/Complete Course Details
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name" 
              {...register("name", { 
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" }
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
              rules={{ required: "Course type is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={refresherTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select course type"
                  emptyMessage="No course type found"
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
              {...register("startdate", { 
                required: "Start date is required"
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
              {...register("enddate", {
                validate: (value) => {
                  if (!value) return true
                  const startDate = formData.startdate
                  if (startDate && value < startDate) {
                    return "End date must be after start date"
                  }
                  return true
                }
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
              {...register("university", { 
                required: "Organizing University is required",
                minLength: { value: 2, message: "University name must be at least 2 characters" }
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
              {...register("institute", { 
                required: "Organizing Institute is required",
                minLength: { value: 2, message: "Institute name must be at least 2 characters" }
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
              {...register("department", { 
                required: "Organizing Department is required",
                minLength: { value: 2, message: "Department name must be at least 2 characters" }
              })} 
            />
            {errors.department && (
              <p className="text-sm text-red-600 mt-1">{errors.department.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="centre">Centre</Label>
            <Input id="centre" {...register("centre")} />
          </div>
        </div>

        {isEdit && (
          <div className="mt-4">
            {Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
              <DocumentViewer
                documentUrl={formData.supportingDocument[0]}
                documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ''}
              />
            )}
          </div>
        )}

        {/* Submit Buttons */}
        {!isEdit && (
        <div className="flex justify-end gap-4 mt-6">
         
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : (
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
