"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Brain } from "lucide-react"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"

interface PerformanceTeacherFormProps {
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

export function PerformanceTeacherForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
}: PerformanceTeacherFormProps) {
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
      {!isEdit && (
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
      )}

      {/* Step 2: Form Fields */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">
          {isEdit ? "Edit Performance Details" : "Step 2: Verify/Complete Performance Details"}
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Title of Performance *</Label>
            <Input
              id="name"
              placeholder="Enter title of performance"
              maxLength={100}
              {...register("name", {
                required: "Title of Performance is required",
                minLength: { value: 2, message: "Title must be at least 2 characters" },
                maxLength: { value: 100, message: "Title must not exceed 100 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Title cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="place">Place *</Label>
            <Input
              id="place"
              placeholder="Enter place"
              maxLength={150}
              {...register("place", {
                required: "Place is required",
                minLength: { value: 2, message: "Place must be at least 2 characters" },
                maxLength: { value: 150, message: "Place must not exceed 150 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Place cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.place && <p className="text-sm text-red-600 mt-1">{errors.place.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Performance Date *</Label>
            <Input
              id="date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register("date", {
                required: "Performance Date is required",
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Performance date cannot be in the future"
                  }
                  if (value && new Date(value).getFullYear() < 1900) {
                    return "Performance date must be after 1900"
                  }
                  return true
                }
              })}
            />
            {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="perf_nature">Nature of Performance *</Label>
            <Input
              id="perf_nature"
              placeholder="Enter nature of performance"
              maxLength={250}
              {...register("perf_nature", {
                required: "Nature of Performance is required",
                minLength: { value: 2, message: "Nature must be at least 2 characters" },
                maxLength: { value: 250, message: "Nature must not exceed 250 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Nature cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.perf_nature && <p className="text-sm text-red-600 mt-1">{errors.perf_nature.message?.toString()}</p>}
          </div>
        </div>
      </div>

      {/* Submit Button - Only show in add mode, edit mode uses dialog button */}
      {!isEdit && (
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Performance
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

