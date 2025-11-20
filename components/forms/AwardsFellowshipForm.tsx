"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Brain } from "lucide-react"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"

interface AwardsFellowshipFormProps {
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
}

export function AwardsFellowshipForm({
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
}: AwardsFellowshipFormProps) {
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
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="text-xs sm:text-sm text-green-600 truncate flex-1">{selectedFiles[0].name}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExtractInfo}
                disabled={isExtracting}
                className="flex items-center gap-2 w-full sm:w-auto"
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
          {isEdit ? "Edit Award/Fellowship Details" : "Step 2: Verify/Complete Award Details"}
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name of Award / Fellowship *</Label>
            <Input
              id="name"
              placeholder="Enter name of award/fellowship"
              maxLength={500}
              {...register("name", {
                required: "Name of Award/Fellowship is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
                maxLength: { value: 500, message: "Name must not exceed 500 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Name cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Name of Awarding Agency *</Label>
            <Input
              id="organization"
              placeholder="Enter name of awarding agency"
              maxLength={500}
              {...register("organization", {
                required: "Name of Awarding Agency is required",
                minLength: { value: 2, message: "Organization name must be at least 2 characters" },
                maxLength: { value: 500, message: "Organization name must not exceed 500 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Organization name cannot be only whitespace"
                  }
                  return true
                }
              })}
            />
            {errors.organization && <p className="text-sm text-red-600 mt-1">{errors.organization.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_award">Date of Award *</Label>
            <Input
              id="date_of_award"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register("date_of_award", {
                required: "Date of Award is required",
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Date of award cannot be in the future"
                  }
                  if (value && new Date(value).getFullYear() < 1900) {
                    return "Date of award must be after 1900"
                  }
                  return true
                }
              })}
            />
            {errors.date_of_award && <p className="text-sm text-red-600 mt-1">{errors.date_of_award.message?.toString()}</p>}
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
        </div>

        <div className="space-y-2 mt-6">
          <Label htmlFor="details">Details</Label>
          <Textarea
            id="details"
            placeholder="Enter award details"
            maxLength={500}
            rows={3}
            {...register("details", {
              maxLength: { value: 500, message: "Details must not exceed 500 characters" }
            })}
          />
          {errors.details && <p className="text-sm text-red-600 mt-1">{errors.details.message?.toString()}</p>}
        </div>

        <div className="space-y-2 mt-6">
          <Label htmlFor="address">Address of Awarding Agency</Label>
          <Textarea
            id="address"
            placeholder="Enter address of awarding agency"
            maxLength={500}
            rows={2}
            {...register("address", {
              maxLength: { value: 500, message: "Address must not exceed 500 characters" }
            })}
          />
          {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message?.toString()}</p>}
        </div>
      </div>

      {/* Submit Button - Only show in add mode, edit mode uses dialog button */}
      {!isEdit && (
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Award
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

