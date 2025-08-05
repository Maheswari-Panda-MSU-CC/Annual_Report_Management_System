"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save } from "lucide-react"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"

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
}: AcademicVisitFormProps) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form
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
              {...register("durationOfVisit", { required: "Duration is required" })}
            />
            {errors.durationOfVisit && <p className="text-sm text-red-600 mt-1">{errors.durationOfVisit.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              placeholder="e.g., Visiting Researcher"
              {...register("role")}
            />
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
              {...register("date", { required: "Visit date is required" })}
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
