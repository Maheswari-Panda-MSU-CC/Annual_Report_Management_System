"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { useEffect } from "react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { PatentFormProps } from "@/types/interfaces"

export function PatentForm({
    form,
    onSubmit,
    isSubmitting,
    isExtracting = false,
    selectedFiles = null,
    handleFileSelect = () => { },
    handleExtractInfo = () => { },
    isEdit = false,
    editData = {},
    resPubLevelOptions: propResPubLevelOptions,
    patentStatusOptions: propPatentStatusOptions,
}: PatentFormProps) {
    const router = useRouter()
    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
    const formData = watch()

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
            if (editData.supportingDocument) formValues.supportingDocument = editData.supportingDocument
            
            // Set all values at once
            Object.keys(formValues).forEach((key) => {
                setValue(key, formValues[key], { shouldValidate: false, shouldDirty: false })
            })
        }
    }, [isEdit, editData, setValue, form]);

    const onFormSubmit = handleSubmit(
        (data:any) => {
            onSubmit(data)
        }
    )

    return (
        <form onSubmit={onFormSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Patent Document</Label>
                <FileUpload onFileSelect={handleFileSelect} />
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
                <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Patent Information</Label>


                <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input 
                        id="title" 
                        placeholder="Enter patent title" 
                        {...register("title", { required: "Patent title is required" })} 
                    />
                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <Label htmlFor="level">Level *</Label>
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
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    placeholder="Select level"
                                    emptyMessage="No level found"
                                />
                            )}
                        />
                        {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="status">Status *</Label>
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
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    placeholder="Select status"
                                    emptyMessage="No status found"
                                />
                            )}
                        />
                        {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message?.toString()}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input 
                            id="date" 
                            type="date" 
                            {...register("date", { required: "Date is required" })} 
                        />
                        {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="Tech_Licence">Transfer of Technology with Licence</Label>
                        <Input 
                            id="Tech_Licence" 
                            placeholder="Enter technology licence details" 
                            {...register("Tech_Licence")} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <Label htmlFor="Earnings_Generate">Earning Generated (Rupees)</Label>
                        <Input 
                            id="Earnings_Generate" 
                            type="number" 
                            placeholder="Enter amount" 
                            {...register("Earnings_Generate", {
                                min: { value: 0, message: "Amount must be positive" }
                            })} 
                        />
                        {errors.Earnings_Generate && <p className="text-sm text-red-600 mt-1">{errors.Earnings_Generate.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="PatentApplicationNo">Patent Application/Publication/Grant No.</Label>
                        <Input 
                            id="PatentApplicationNo" 
                            placeholder="Enter patent number" 
                            {...register("PatentApplicationNo")} 
                        />
                    </div>
                </div>

                {isEdit && (
                    <div className="mt-4">
                        {Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
                            <div className="mt-4">
                                <Label>Supporting Document</Label>
                                <div className="mt-2 border rounded-lg p-4">
                                    <DocumentViewer
                                        documentUrl={formData.supportingDocument[0]}
                                        documentType={formData.supportingDocument[0]?.split('.').pop()?.toLowerCase() || 'pdf'}
                                        documentName={formData.title || "Document"}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!isEdit && (
                    <div className="flex justify-end gap-4 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=patents")}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <>
                                    <Save className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
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
