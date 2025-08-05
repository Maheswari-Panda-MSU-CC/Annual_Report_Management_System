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
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { useEffect } from "react"

interface PatentFormProps {
    form: UseFormReturn<any>
    onSubmit: (data: any) => void
    isSubmitting: boolean
    isExtracting?: boolean
    selectedFiles?: FileList | null
    handleFileSelect?: (files: FileList | null) => void
    handleExtractInfo?: () => void
    isEdit?: boolean
    editData?: Record<string, any> // ✅ new prop
}

export function PatentForm({
    form,
    onSubmit,
    isSubmitting,
    isExtracting = false,
    selectedFiles = null,
    handleFileSelect = () => { },
    handleExtractInfo = () => { },
    isEdit = false,
    editData = {}, // ✅ default value
}: PatentFormProps) {
    const router = useRouter()
    const { register, handleSubmit, setValue, watch, formState: { errors } } = form
    const formData = watch()

    // ✅ Set initial values when in edit mode
    useEffect(() => {
        if (isEdit && editData) {
            Object.entries(editData).forEach(([key, value]) => {
                setValue(key, value)
            })
        }
    }, [isEdit, editData, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    <Input id="title" placeholder="Enter patent title" {...register("title", { required: "Patent title is required" })} />
                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <Label htmlFor="level">Level *</Label>
                        <Select value={formData.level} onValueChange={(value) => setValue("level", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="National">National</SelectItem>
                                <SelectItem value="International">International</SelectItem>
                                <SelectItem value="Regional">Regional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="status">Status *</Label>
                        <Select value={formData.status} onValueChange={(value) => setValue("status", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Filed">Filed</SelectItem>
                                <SelectItem value="Published">Published</SelectItem>
                                <SelectItem value="Granted">Granted</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input id="date" type="date" {...register("date", { required: "Date is required" })} />
                        {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="transferOfTechnology">Transfer of Technology with Licence</Label>
                        <Select value={formData.transferOfTechnology} onValueChange={(value) => setValue("transferOfTechnology", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <Label htmlFor="earningGenerated">Earning Generated (Rupees)</Label>
                        <Input id="earningGenerated" type="number" placeholder="Enter amount" {...register("earningGenerated")} />
                    </div>

                    <div>
                        <Label htmlFor="patentApplicationNo">Patent Application/Publication/Grant No.</Label>
                        <Input id="patentApplicationNo" placeholder="Enter patent number" {...register("patentApplicationNo")} />
                    </div>
                </div>


                {isEdit && <div>

                    {Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
                        <DocumentViewer
                            documentUrl={formData.supportingDocument[0]}
                            documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ''}
                        />
                    )}

                </div>}
                {
                    !isEdit &&
                    <div className="flex justify-end gap-4 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=patents")}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isEdit ? "Update Patent" : "Add Patent"}
                                </>
                            )}
                        </Button>
                    </div>
                }
            </div>
        </form>
    )
}
