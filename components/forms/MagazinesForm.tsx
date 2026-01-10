"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"

interface MagazinesFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isEdit?: boolean
  editData?: Record<string, any>
}

const currencyOptions = [
  { value: "INR", label: "INR" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
]

export function MagazinesForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
}: MagazinesFormProps) {
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  const formData = watch()

  const editDataString = JSON.stringify(editData || {})
  
  useEffect(() => {
    if (isEdit && editData && Object.keys(editData).length > 0) {
      const data = JSON.parse(editDataString)
      Object.entries(data).forEach(([key, value]) => {
        // Trim string values before setting
        const processedValue = typeof value === 'string' ? value.trim() : value
        setValue(key, processedValue, { shouldDirty: false, shouldValidate: false, shouldTouch: false })
      })
      // Clear any validation errors that might have been set
      form.clearErrors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editDataString, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-base sm:text-lg font-semibold mb-4 block">
          {isEdit ? "Edit Magazine Details" : "Magazine Details"}
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter magazine title"
              maxLength={500}
              disabled={isSubmitting}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 2, message: "Title must be at least 2 characters" },
                maxLength: { value: 500, message: "Title must not exceed 500 characters" },
                validate: (value) => {
                  if (!value || typeof value !== 'string') return "Title is required"
                  const trimmed = value.trim()
                  if (trimmed.length < 2) return "Title must be at least 2 characters (after removing spaces)"
                  if (trimmed.length > 500) return "Title must not exceed 500 characters"
                  return true
                },
              })}
            />
            {errors.title && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Mode *</Label>
            <Controller
              name="mode"
              control={control}
              rules={{
                required: "Mode is required",
                validate: (value) => {
                  if (!value || value === null || value === undefined) {
                    return "Mode is required"
                  }
                  const validModes = ["online", "offline"]
                  if (!validModes.includes(value)) {
                    return "Please select a valid mode"
                  }
                  return true
                }
              }}
              render={({ field }) => (
                <SearchableSelect
                  options={[
                    { value: "online", label: "Online" },
                    { value: "offline", label: "Offline" },
                  ]}
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    form.clearErrors('mode')
                  }}
                  placeholder="Select mode"
                  emptyMessage="No mode found"
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.mode && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.mode.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              placeholder="Enter category"
              maxLength={50}
              disabled={isSubmitting}
              {...register("category", {
                required: "Category is required",
                minLength: { value: 2, message: "Category must be at least 2 characters" },
                maxLength: { value: 50, message: "Category must not exceed 50 characters" },
                validate: (value) => {
                  if (!value || typeof value !== 'string') return "Category is required"
                  const trimmed = value.trim()
                  if (trimmed.length === 0) return "Category is required"
                  if (trimmed.length < 2) return "Category must be at least 2 characters"
                  if (trimmed.length > 50) return "Category must not exceed 50 characters"
                  return true
                },
              })}
            />
            {errors.category && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.category.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishing_agency">Publishing Agency *</Label>
            <Input
              id="publishing_agency"
              placeholder="Enter publishing agency"
              maxLength={500}
              disabled={isSubmitting}
              {...register("publishing_agency", {
                required: "Publishing agency is required",
                minLength: { value: 2, message: "Publishing agency must be at least 2 characters" },
                maxLength: { value: 500, message: "Publishing agency must not exceed 500 characters" },
                validate: (value) => {
                  if (!value || typeof value !== 'string') return "Publishing agency is required"
                  const trimmed = value.trim()
                  if (trimmed.length === 0) return "Publishing agency is required"
                  if (trimmed.length < 2) return "Publishing agency must be at least 2 characters"
                  if (trimmed.length > 500) return "Publishing agency must not exceed 500 characters"
                  return true
                },
              })}
            />
            {errors.publishing_agency && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.publishing_agency.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Volume *</Label>
            <Input
              id="volume"
              placeholder="Enter volume"
              maxLength={10}
              disabled={isSubmitting}
              {...register("volume", {
                required: "Volume is required",
                minLength: { value: 1, message: "Volume is required" },
                maxLength: { value: 10, message: "Volume must not exceed 10 characters" },
                validate: (value) => {
                  if (!value || typeof value !== 'string') return "Volume is required"
                  const trimmed = value.trim()
                  if (trimmed.length === 0) return "Volume is required"
                  if (trimmed.length > 10) return "Volume must not exceed 10 characters"
                  return true
                },
              })}
            />
            {errors.volume && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.volume.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publication_date">Publication Date *</Label>
            <Input
              id="publication_date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              {...register("publication_date", {
                required: "Publication date is required",
                validate: (value) => {
                  if (!value) return "Publication date is required"
                  const date = new Date(value)
                  const today = new Date()
                  today.setHours(23, 59, 59, 999) // End of today
                  const minDate = new Date('1900-01-01')
                  if (isNaN(date.getTime())) {
                    return "Please enter a valid date"
                  }
                  if (date > today) {
                    return "Publication date cannot be in the future"
                  }
                  if (date < minDate) {
                    return "Publication date cannot be before 1900"
                  }
                  return true
                },
              })}
            />
            {errors.publication_date && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.publication_date.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="no_of_issue_per_yr">No. of Issues per Year *</Label>
            <Input
              id="no_of_issue_per_yr"
              type="number"
              placeholder="Enter number of issues per year"
              disabled={isSubmitting}
              {...register("no_of_issue_per_yr", {
                required: "Number of issues per year is required",
                min: { value: 1, message: "Number of issues must be at least 1" },
                validate: (value) => {
                  if (value === null || value === undefined || value === '') {
                    return "Number of issues per year is required"
                  }
                  const numValue = Number(value)
                  if (isNaN(numValue) || numValue < 1) {
                    return "Number of issues must be at least 1"
                  }
                  return true
                },
              })}
            />
            {errors.no_of_issue_per_yr && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.no_of_issue_per_yr.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              placeholder="Enter price"
              disabled={isSubmitting}
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Price must be non-negative" },
                validate: (value) => {
                  if (value === null || value === undefined || value === '') {
                    return "Price is required"
                  }
                  const numValue = Number(value)
                  if (isNaN(numValue) || numValue < 0) {
                    return "Price must be non-negative"
                  }
                  return true
                },
              })}
            />
            {errors.price && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.price.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Controller
              name="currency"
              control={control}
              rules={{
                required: "Currency is required",
                validate: (value) => {
                  if (!value || value === null || value === undefined) {
                    return "Currency is required"
                  }
                  const optionExists = currencyOptions.some(opt => opt.value === value)
                  if (!optionExists) {
                    return "Please select a valid currency"
                  }
                  return true
                }
              }}
              render={({ field }) => (
                <SearchableSelect
                  options={currencyOptions}
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    form.clearErrors('currency')
                  }}
                  placeholder="Select currency"
                  emptyMessage="No currency found"
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.currency && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.currency.message?.toString()}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center space-x-2">
              <Controller
                name="is_additional_attachment"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="is_additional_attachment"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Label htmlFor="is_additional_attachment" className="font-normal">Is Additional Attachment (USB/CD/DVD)?</Label>
            </div>
          </div>

          {formData.is_additional_attachment && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="additional_attachment">Additional Attachment</Label>
              <Input
                id="additional_attachment"
                placeholder="e.g., USB, CD/DVD"
                maxLength={500}
                disabled={isSubmitting}
                {...register("additional_attachment", {
                  maxLength: { value: 500, message: "Additional attachment must not exceed 500 characters" },
                })}
              />
              {errors.additional_attachment && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.additional_attachment.message?.toString()}</p>}
            </div>
          )}
        </div>
      </div>

      {!isEdit && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Magazine
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

