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
import { Textarea } from "@/components/ui/textarea"
import { useEffect } from "react"
import { useDropDowns } from "@/hooks/use-dropdowns"

interface PhdGuidanceFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  phdGuidanceStatusOptions?: Array<{ id: number; name: string }>
}

export function PhdGuidanceForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  phdGuidanceStatusOptions: propPhdGuidanceStatusOptions,
}: PhdGuidanceFormProps) {
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
      if (editData.supportingDocument) setValue("supportingDocument", editData.supportingDocument)
    }
  }, [isEdit, editData, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Document</Label>
        <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.doc,.docx" multiple={false} />
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-green-600">{selectedFiles[0].name}</p>
            <Button type="button" variant="outline" size="sm" onClick={handleExtractInfo} disabled={isExtracting}>
              {isExtracting ? "Extracting..." : "Extract Information"}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">Step 2: PhD Student Information</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="regNo">Registration Number *</Label>
            <Input
              id="regNo"
              placeholder="Enter registration number"
              {...register("regNo", { required: "Registration number is required" })}
            />
            {errors.regNo && <p className="text-sm text-red-600 mt-1">{errors.regNo.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="nameOfStudent">Name of Student *</Label>
            <Input
              id="nameOfStudent"
              placeholder="Enter student's name"
              {...register("nameOfStudent", { required: "Student name is required" })}
            />
            {errors.nameOfStudent && <p className="text-sm text-red-600 mt-1">{errors.nameOfStudent.message?.toString()}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="dateOfRegistration">Date of Registration *</Label>
            <Input
              id="dateOfRegistration"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register("dateOfRegistration", { 
                required: "Date of registration is required",
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Date cannot be in the future"
                  }
                  return true
                }
              })}
            />
            {errors.dateOfRegistration && <p className="text-sm text-red-600 mt-1">{errors.dateOfRegistration.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="yearOfCompletion">Year of Completion</Label>
            <Input
              id="yearOfCompletion"
              type="number"
              placeholder="Enter year (e.g., 2024)"
              min="1900"
              max={new Date().getFullYear() + 10}
              {...register("yearOfCompletion", {
                validate: (value) => {
                  if (value) {
                    const year = Number(value)
                    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
                      return "Please enter a valid year"
                    }
                  }
                  return true
                }
              })}
            />
            {errors.yearOfCompletion && <p className="text-sm text-red-600 mt-1">{errors.yearOfCompletion.message?.toString()}</p>}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="topic">Research Topic *</Label>
          <Textarea
            id="topic"
            placeholder="Enter research topic"
            rows={3}
            {...register("topic", { required: "Research topic is required" })}
          />
          {errors.topic && <p className="text-sm text-red-600 mt-1">{errors.topic.message?.toString()}</p>}
        </div>

        <div className="mt-4">
          <Label htmlFor="status">Status *</Label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <SearchableSelect
                options={phdGuidanceStatusOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select status"
                emptyMessage="No status found"
              />
            )}
          />
          {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message?.toString()}</p>}
        </div>

        {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
          <div className="mt-6">
            <DocumentViewer
              documentUrl={formData.supportingDocument[0]}
              documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ''}
            />
          </div>
        )}

        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=phd")}>
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
