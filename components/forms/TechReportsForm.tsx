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
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
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
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
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
        setValue(key, value, { shouldDirty: false, shouldValidate: false })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editDataString, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">
          {isEdit ? "Edit Tech Report Details" : "Tech Report Details"}
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter report title"
              maxLength={200}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 2, message: "Title must be at least 2 characters" },
                maxLength: { value: 200, message: "Title must not exceed 200 characters" },
              })}
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter subject"
              maxLength={100}
              {...register("subject", {
                maxLength: { value: 100, message: "Subject must not exceed 100 characters" },
              })}
            />
            {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher_name">Publisher's Name</Label>
            <Input
              id="publisher_name"
              placeholder="Enter publisher name"
              maxLength={200}
              {...register("publisher_name", {
                maxLength: { value: 200, message: "Publisher name must not exceed 200 characters" },
              })}
            />
            {errors.publisher_name && <p className="text-sm text-red-600 mt-1">{errors.publisher_name.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publication_date">Publication Date</Label>
            <Input
              id="publication_date"
              type="date"
              {...register("publication_date")}
            />
            {errors.publication_date && <p className="text-sm text-red-600 mt-1">{errors.publication_date.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="no_of_issue_per_year">No. of Issues per Year</Label>
            <Input
              id="no_of_issue_per_year"
              type="number"
              placeholder="Enter number of issues per year"
              {...register("no_of_issue_per_year", {
                min: { value: 1, message: "Number of issues must be at least 1" },
              })}
            />
            {errors.no_of_issue_per_year && <p className="text-sm text-red-600 mt-1">{errors.no_of_issue_per_year.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              placeholder="Enter price"
              {...register("price", {
                min: { value: 0, message: "Price must be non-negative" },
              })}
            />
            {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={currencyOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select currency"
                  emptyMessage="No currency found"
                />
              )}
            />
            {errors.currency && <p className="text-sm text-red-600 mt-1">{errors.currency.message?.toString()}</p>}
          </div>
        </div>
      </div>

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
                Save Tech Report
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

