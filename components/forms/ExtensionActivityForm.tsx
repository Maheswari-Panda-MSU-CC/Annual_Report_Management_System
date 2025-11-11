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
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"

interface ExtensionActivityFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  awardFellowLevelOptions?: DropdownOption[]
  sponserNameOptions?: DropdownOption[]
}

export function ExtensionActivityForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  awardFellowLevelOptions = [],
  sponserNameOptions = [],
}: ExtensionActivityFormProps) {
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
          {isEdit ? "Edit Extension Activity Details" : "Step 2: Verify/Complete Extension Activity Details"}
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name_of_activity">Name of Activity *</Label>
            <Input
              id="name_of_activity"
              placeholder="Enter name of activity"
              maxLength={150}
              {...register("name_of_activity", {
                required: "Name of Activity is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
                maxLength: { value: 150, message: "Name must not exceed 150 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Name cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.name_of_activity && <p className="text-sm text-red-600 mt-1">{errors.name_of_activity.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="names">Nature of Activity *</Label>
            <Input
              id="names"
              placeholder="Enter nature of activity"
              maxLength={100}
              {...register("names", {
                required: "Nature of Activity is required",
                minLength: { value: 2, message: "Nature must be at least 2 characters" },
                maxLength: { value: 100, message: "Nature must not exceed 100 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Nature cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.names && <p className="text-sm text-red-600 mt-1">{errors.names.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level *</Label>
            <Controller
              name="level"
              control={control}
              rules={{ required: "Level is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={awardFellowLevelOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select level"
                  emptyMessage="No level found"
                />
              )}
            />
            {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsered">Sponsored By *</Label>
            <Controller
              name="sponsered"
              control={control}
              rules={{ required: "Sponsored By is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={sponserNameOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select sponsor"
                  emptyMessage="No sponsor found"
                />
              )}
            />
            {errors.sponsered && <p className="text-sm text-red-600 mt-1">{errors.sponsered.message?.toString()}</p>}
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
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register("date", {
                required: "Date is required",
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Date cannot be in the future"
                  }
                  if (value && new Date(value).getFullYear() < 1900) {
                    return "Date must be after 1900"
                  }
                  return true
                }
              })}
            />
            {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
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
                Save Activity
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

