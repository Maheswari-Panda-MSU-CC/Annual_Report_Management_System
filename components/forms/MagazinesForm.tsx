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

export function MagazinesForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
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
        setValue(key, value, { shouldDirty: false, shouldValidate: false })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editDataString, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">
          {isEdit ? "Edit Magazine Details" : "Magazine Details"}
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter magazine title"
              maxLength={500}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 2, message: "Title must be at least 2 characters" },
                maxLength: { value: 500, message: "Title must not exceed 500 characters" },
              })}
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={[
                    { value: "online", label: "Online" },
                    { value: "offline", label: "Offline" },
                  ]}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select mode"
                  emptyMessage="No mode found"
                />
              )}
            />
            {errors.mode && <p className="text-sm text-red-600 mt-1">{errors.mode.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Enter category"
              maxLength={50}
              {...register("category", {
                maxLength: { value: 50, message: "Category must not exceed 50 characters" },
              })}
            />
            {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishing_agency">Publishing Agency</Label>
            <Input
              id="publishing_agency"
              placeholder="Enter publishing agency"
              maxLength={500}
              {...register("publishing_agency", {
                maxLength: { value: 500, message: "Publishing agency must not exceed 500 characters" },
              })}
            />
            {errors.publishing_agency && <p className="text-sm text-red-600 mt-1">{errors.publishing_agency.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Volume</Label>
            <Input
              id="volume"
              placeholder="Enter volume"
              maxLength={10}
              {...register("volume", {
                maxLength: { value: 10, message: "Volume must not exceed 10 characters" },
              })}
            />
            {errors.volume && <p className="text-sm text-red-600 mt-1">{errors.volume.message?.toString()}</p>}
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
            <Label htmlFor="no_of_issue_per_yr">No. of Issues per Year</Label>
            <Input
              id="no_of_issue_per_yr"
              type="number"
              placeholder="Enter number of issues per year"
              {...register("no_of_issue_per_yr", {
                min: { value: 1, message: "Number of issues must be at least 1" },
              })}
            />
            {errors.no_of_issue_per_yr && <p className="text-sm text-red-600 mt-1">{errors.no_of_issue_per_yr.message?.toString()}</p>}
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

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Controller
                name="is_additional_attachment"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="is_additional_attachment"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_additional_attachment" className="font-normal">Is Additional Attachment (USB/CD/DVD)?</Label>
            </div>
          </div>

          {formData.is_additional_attachment && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="additional_attachment">Additional Attachment</Label>
              <Input
                id="additional_attachment"
                placeholder="e.g., USB, CD/DVD"
                maxLength={500}
                {...register("additional_attachment", {
                  maxLength: { value: 500, message: "Additional attachment must not exceed 500 characters" },
                })}
              />
              {errors.additional_attachment && <p className="text-sm text-red-600 mt-1">{errors.additional_attachment.message?.toString()}</p>}
            </div>
          )}
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
                Save Magazine
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

