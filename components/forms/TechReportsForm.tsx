"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"

interface TechReportsFormProps {
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

const modeOptions = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
]

export function TechReportsForm({
  form,
  onSubmit,
  isSubmitting,
  isEdit = false,
  editData = {},
}: TechReportsFormProps) {
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
          {isEdit ? "Edit Tech Report Details" : "Tech Report Details"}
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter report title"
              maxLength={200}
              disabled={isSubmitting}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 2, message: "Title must be at least 2 characters" },
                maxLength: { value: 200, message: "Title must not exceed 200 characters" },
                validate: (value) => {
                  if (!value || typeof value !== 'string') return "Title is required"
                  const trimmed = value.trim()
                  if (trimmed.length < 2) return "Title must be at least 2 characters (after removing spaces)"
                  if (trimmed.length > 200) return "Title must not exceed 200 characters"
                  return true
                },
              })}
            />
            {errors.title && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Enter subject"
              maxLength={100}
              disabled={isSubmitting}
              {...register("subject", {
                required: "Subject is required",
                minLength: { value: 2, message: "Subject must be at least 2 characters" },
                maxLength: { value: 100, message: "Subject must not exceed 100 characters" },
                validate: (value) => {
                  if (!value || typeof value !== 'string') return "Subject is required"
                  const trimmed = value.trim()
                  if (trimmed.length === 0) return "Subject is required"
                  if (trimmed.length < 2) return "Subject must be at least 2 characters"
                  if (trimmed.length > 100) return "Subject must not exceed 100 characters"
                  return true
                },
              })}
            />
            {errors.subject && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.subject.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher_name">Publisher's Name *</Label>
            <Input
              id="publisher_name"
              placeholder="Enter publisher name"
              maxLength={200}
              disabled={isSubmitting}
              {...register("publisher_name", {
                required: "Publisher name is required",
                minLength: { value: 2, message: "Publisher name must be at least 2 characters" },
                maxLength: { value: 200, message: "Publisher name must not exceed 200 characters" },
                validate: (value) => {
                  if (!value || typeof value !== 'string') return "Publisher name is required"
                  const trimmed = value.trim()
                  if (trimmed.length === 0) return "Publisher name is required"
                  if (trimmed.length < 2) return "Publisher name must be at least 2 characters"
                  if (trimmed.length > 200) return "Publisher name must not exceed 200 characters"
                  return true
                },
              })}
            />
            {errors.publisher_name && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.publisher_name.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publication_date">Publication Date *</Label>
            <Input
              id="publication_date"
              type="date"
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
            <Label htmlFor="no_of_issue_per_year">No. of Issues per Year *</Label>
            <Input
              id="no_of_issue_per_year"
              type="number"
              placeholder="Enter number of issues per year"
              disabled={isSubmitting}
              {...register("no_of_issue_per_year", {
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
            {errors.no_of_issue_per_year && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.no_of_issue_per_year.message?.toString()}</p>}
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
                Save Tech Report
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

