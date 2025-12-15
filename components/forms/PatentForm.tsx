"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { useEffect, useState } from "react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { PatentFormProps } from "@/types/interfaces"
import { cn } from "@/lib/utils"

export function PatentForm({
    form,
    onSubmit,
    isSubmitting,
    isEdit = false,
    editData = {},
    resPubLevelOptions: propResPubLevelOptions,
    patentStatusOptions: propPatentStatusOptions,
    initialDocumentUrl,
    onClearFields,
    onCancel,
    isAutoFilled,
    onFieldChange,
}: PatentFormProps) {
    const router = useRouter()
    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
    const formData = watch()
    const [documentUrl, setDocumentUrl] = useState<string | undefined>(
        initialDocumentUrl || // Use initial document URL from auto-fill first
        (isEdit && editData?.supportingDocument?.[0] ? editData.supportingDocument[0] : undefined)
    )

    // Update documentUrl when initialDocumentUrl changes
    // Always update if initialDocumentUrl is provided and different from current value
    // This handles cases where autoFillDocumentUrl becomes available after component mount
    // CRITICAL: Also update form field for validation
    useEffect(() => {
        if (initialDocumentUrl) {
            // Always update documentUrl if it's different
            if (documentUrl !== initialDocumentUrl) {
                setDocumentUrl(initialDocumentUrl)
            }
            // CRITICAL FIX: Check form field value, not just state comparison
            // On initial mount, documentUrl === initialDocumentUrl, so we need to check form field
            const currentFormValue = form.getValues("supportingDocument")
            const formValueIsEmpty = !currentFormValue || 
                                   (Array.isArray(currentFormValue) && currentFormValue.length === 0) ||
                                   (Array.isArray(currentFormValue) && !currentFormValue[0])
            
            if (formValueIsEmpty) {
                setValue("supportingDocument", [initialDocumentUrl], { shouldValidate: false, shouldDirty: false })
            }
        }
    }, [initialDocumentUrl, documentUrl, setValue, form])

    // Use props if provided, otherwise fetch from hook
    const { resPubLevelOptions: hookResPubLevelOptions, patentStatusOptions: hookPatentStatusOptions, fetchResPubLevels, fetchPatentStatuses } = useDropDowns()
    
    const resPubLevelOptions = propResPubLevelOptions || hookResPubLevelOptions
    const patentStatusOptions = propPatentStatusOptions || hookPatentStatusOptions

    // Only fetch if props are not provided and options are empty
    useEffect(() => {
        if (!propResPubLevelOptions && hookResPubLevelOptions.length === 0) {
            fetchResPubLevels()
        }
        if (!propPatentStatusOptions && hookPatentStatusOptions.length === 0) {
            fetchPatentStatuses()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Only run once on mount

    // Set initial values when in edit mode - optimized to reset and set all values at once
    useEffect(() => {
        if (isEdit && editData && Object.keys(editData).length > 0) {
            // Reset form first to clear any previous values
            form.reset()
            
            // Prepare all form values
            const formValues: any = {}
            
            if (editData.title) formValues.title = editData.title
            if (editData.levelId !== undefined && editData.levelId !== null) formValues.level = editData.levelId
            if (editData.statusId !== undefined && editData.statusId !== null) formValues.status = editData.statusId
            if (editData.date) formValues.date = editData.date
            if (editData.Tech_Licence !== undefined) formValues.Tech_Licence = editData.Tech_Licence || ""
            if (editData.Earnings_Generate !== undefined && editData.Earnings_Generate !== null && editData.Earnings_Generate !== "") {
                formValues.Earnings_Generate = editData.Earnings_Generate
            }
            if (editData.PatentApplicationNo !== undefined) formValues.PatentApplicationNo = editData.PatentApplicationNo || ""
            if (editData.supportingDocument) {
                formValues.supportingDocument = editData.supportingDocument
                setDocumentUrl(Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
            }
            
            // Set all values at once
            Object.keys(formValues).forEach((key) => {
                setValue(key, formValues[key], { shouldValidate: false, shouldDirty: false })
            })
        }
    }, [isEdit, editData, setValue, form]);

    // Handle extracted fields from DocumentUpload
    const handleExtractedFields = (fields: Record<string, any>) => {
        // Map extracted fields to form fields
        if (fields.title) setValue("title", fields.title)
        if (fields.level) setValue("level", fields.level)
        if (fields.status) setValue("status", fields.status)
        if (fields.date) setValue("date", fields.date)
        if (fields.patentApplicationNo) setValue("PatentApplicationNo", fields.patentApplicationNo)
    }

    const onFormSubmit = handleSubmit(
        (data:any) => {
            onSubmit(data)
        }
    )

    return (
        <form onSubmit={onFormSubmit} className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
                <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">Step 1: Upload Patent Document *</Label>
                <DocumentUpload
                    documentUrl={documentUrl || initialDocumentUrl || undefined}
                    category="Research & Consultancy"
                    subCategory="Patents"
                    onChange={(url) => {
                        setDocumentUrl(url)
                        setValue("supportingDocument", url ? [url] : [])
                    }}
                    onExtract={handleExtractedFields}
                    onClearFields={onClearFields}
                    isEditMode={isEdit}
                    className="w-full"
                />
            </div>

            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
                <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">Step 2: Verify/Complete Patent Information</Label>


                <div>
                    <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
                    <Input 
                        id="title" 
                        placeholder="Enter patent title" 
                        className={cn(
                            "text-sm sm:text-base h-9 sm:h-10 mt-1",
                            isAutoFilled?.("title") && "bg-blue-50 border-blue-200"
                        )}
                        {...register("title", { 
                            required: "Patent title is required",
                            onChange: () => onFieldChange?.("title")
                        })} 
                    />
                    {errors.title && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
                    <div>
                        <Label htmlFor="level" className="text-sm sm:text-base">Level *</Label>
                        <Controller
                            control={control}
                            name="level"
                            rules={{ required: "Level is required" }}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={resPubLevelOptions.map((l) => ({
                                        value: l.id,
                                        label: l.name,
                                    }))}
                                    value={field.value || ""}
                                    onValueChange={(val) => {
                                        field.onChange(Number(val))
                                        onFieldChange?.("level")
                                    }}
                                    placeholder="Select level"
                                    emptyMessage="No level found"
                                    className={isAutoFilled?.("level") ? "bg-blue-50 border-blue-200" : undefined}
                                />
                            )}
                        />
                        {errors.level && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="status" className="text-sm sm:text-base">Status *</Label>
                        <Controller
                            control={control}
                            name="status"
                            rules={{ required: "Status is required" }}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={patentStatusOptions.map((s) => ({
                                        value: s.id,
                                        label: s.name,
                                    }))}
                                    value={field.value || ""}
                                    onValueChange={(val) => {
                                        field.onChange(Number(val))
                                        onFieldChange?.("status")
                                    }}
                                    placeholder="Select status"
                                    emptyMessage="No status found"
                                    className={isAutoFilled?.("status") ? "bg-blue-50 border-blue-200" : undefined}
                                />
                            )}
                        />
                        {errors.status && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.status.message?.toString()}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
                    <div>
                        <Label htmlFor="date" className="text-sm sm:text-base">Date *</Label>
                        <Input 
                            id="date" 
                            type="date" 
                            className={cn(
                                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                                isAutoFilled?.("date") && "bg-blue-50 border-blue-200"
                            )}
                            {...register("date", { 
                                required: "Date is required",
                                onChange: () => onFieldChange?.("date")
                            })} 
                        />
                        {errors.date && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="Tech_Licence" className="text-sm sm:text-base">Transfer of Technology with Licence</Label>
                        <Input 
                            id="Tech_Licence" 
                            placeholder="Enter technology licence details" 
                            className={cn(
                                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                                isAutoFilled?.("Tech_Licence") && "bg-blue-50 border-blue-200"
                            )}
                            {...register("Tech_Licence", {
                                onChange: () => onFieldChange?.("Tech_Licence")
                            })} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
                    <div>
                        <Label htmlFor="Earnings_Generate" className="text-sm sm:text-base">Earning Generated (Rupees)</Label>
                        <Input 
                            id="Earnings_Generate" 
                            type="number" 
                            placeholder="Enter amount" 
                            className={cn(
                                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                                isAutoFilled?.("Earnings_Generate") && "bg-blue-50 border-blue-200"
                            )}
                            {...register("Earnings_Generate", {
                                min: { value: 0, message: "Amount must be positive" },
                                onChange: () => onFieldChange?.("Earnings_Generate")
                            })} 
                        />
                        {errors.Earnings_Generate && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.Earnings_Generate.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="PatentApplicationNo" className="text-sm sm:text-base">Patent Application/Publication/Grant No.</Label>
                        <Input 
                            id="PatentApplicationNo" 
                            placeholder="Enter patent number" 
                            className={cn(
                                "text-sm sm:text-base h-9 sm:h-10 mt-1",
                                isAutoFilled?.("PatentApplicationNo") && "bg-blue-50 border-blue-200"
                            )}
                            {...register("PatentApplicationNo", {
                                onChange: () => onFieldChange?.("PatentApplicationNo")
                            })} 
                        />
                    </div>
                </div>


                {!isEdit && (
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=patents"))} className="w-full sm:w-auto text-xs sm:text-sm">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    Add Patent
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </form>
    )
}
