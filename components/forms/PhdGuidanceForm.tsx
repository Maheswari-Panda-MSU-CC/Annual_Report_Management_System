"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { Textarea } from "@/components/ui/textarea"
import { useEffect } from "react"

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
}: PhdGuidanceFormProps) {
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
              {...register("dateOfRegistration", { required: "Date of registration is required" })}
            />
            {errors.dateOfRegistration && <p className="text-sm text-red-600 mt-1">{errors.dateOfRegistration.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="yearOfCompletion">Year of Completion</Label>
            <Input
              id="yearOfCompletion"
              placeholder="Enter year of completion"
              {...register("yearOfCompletion")}
            />
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
          <Select
            value={formData.status}
            onValueChange={(value) => setValue("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Awarded">Awarded</SelectItem>
              <SelectItem value="Discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
          <div className="mt-6">
            <DocumentViewer
              documentUrl={formData.supportingDocument[0]}
              documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ''}
            />
          </div>
        )}

       {
        !isEdit && 
        <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=phd")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? "Update PhD Guidance" : "Add PhD Guidance"}
            </>
          )}
        </Button>
      </div>
       }
      </div>
    </form>
  )
}
