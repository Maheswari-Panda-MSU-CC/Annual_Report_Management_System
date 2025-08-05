"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Save, Loader2, Brain } from "lucide-react"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { useRouter } from "next/navigation"

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
  editData = {}
}: RefresherOrientationFormProps) {
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseType">Course Type</Label>
            <Select value={formData.courseType} onValueChange={(value) => setValue("courseType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select course type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Refresher Course">Refresher Course</SelectItem>
                <SelectItem value="Orientation Course">Orientation Course</SelectItem>
                <SelectItem value="Faculty Development Program">Faculty Development Program</SelectItem>
                <SelectItem value="Short Term Course">Short Term Course</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" {...register("startDate", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" {...register("endDate", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizingUniversity">Organizing University</Label>
            <Input id="organizingUniversity" {...register("organizingUniversity", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizingInstitute">Organizing Institute</Label>
            <Input id="organizingInstitute" {...register("organizingInstitute", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizingDepartment">Organizing Department</Label>
            <Input id="organizingDepartment" {...register("organizingDepartment", { required: true })} />
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
