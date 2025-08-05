"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { Save, Brain, Loader2 } from "lucide-react"

interface CommitteeFormProps {
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

export function UniversityCommitteeParticipationForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
}: CommitteeFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

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
        <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
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

      {/* Step 2: Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Details</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="committeeName">Committee Name *</Label>
            <Input
              id="committeeName"
              {...register("committeeName", { required: "Committee name is required" })}
            />
            {errors.committeeName && <p className="text-sm text-red-600">{errors.committeeName.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="level">Level *</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setValue("level", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="University">University</SelectItem>
                <SelectItem value="Faculty">Faculty</SelectItem>
                <SelectItem value="Department">Department</SelectItem>
                <SelectItem value="Institute">Institute</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="participatedAs">Participated As *</Label>
            <Select
              value={formData.participatedAs}
              onValueChange={(value) => setValue("participatedAs", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chairman">Chairman</SelectItem>
                <SelectItem value="Vice-Chairman">Vice-Chairman</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Secretary">Secretary</SelectItem>
                <SelectItem value="Convener">Convener</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              min="1900"
              max="2100"
              {...register("year", { required: "Year is required" })}
            />
            {errors.year && <p className="text-sm text-red-600">{errors.year.message?.toString()}</p>}
          </div>
        </div>

        {isEdit && (
          <div className="mt-6">
            {Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
              <DocumentViewer
                documentUrl={formData.supportingDocument[0]}
                documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ''}
              />
            )}
          </div>
        )}

        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push("/teacher/academic-contributions?tab=committees")}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? "Update Committee Info" : "Add Committee Info"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
