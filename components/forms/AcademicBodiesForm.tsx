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

interface AcademicBodiesFormProps {
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

export function AcademicBodiesForm({
    form,
    onSubmit,
    isSubmitting,
    isExtracting = false,
    selectedFiles = null,
    handleFileSelect = () => {},
    handleExtractInfo = () => {},
    isEdit = false,
    editData = {},
}: AcademicBodiesFormProps) {
    const router = useRouter()
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
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
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
                        >
                            {isExtracting ? "Extracting..." : "Extract Information"}
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Details</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <Label htmlFor="courseTitle">Course Title *</Label>
                        <Input id="courseTitle" {...register("courseTitle", { required: "Course title is required" })} />
                        {errors.courseTitle && <p className="text-sm text-red-600">{errors.courseTitle.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="academicBody">Academic Body *</Label>
                        <Input id="academicBody" {...register("academicBody", { required: "Academic body is required" })} />
                        {errors.academicBody && <p className="text-sm text-red-600">{errors.academicBody.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="place">Place *</Label>
                        <Input id="place" {...register("place", { required: "Place is required" })} />
                        {errors.place && <p className="text-sm text-red-600">{errors.place.message?.toString()}</p>}
                    </div>

                    <div>
                        <Label htmlFor="participatedAs">Participated As *</Label>
                        <Select
                            value={formData.participatedAs}
                            onValueChange={(value) => setValue("participatedAs", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Member">Member</SelectItem>
                                <SelectItem value="Chairman">Chairman</SelectItem>
                                <SelectItem value="Vice-Chairman">Vice-Chairman</SelectItem>
                                <SelectItem value="Secretary">Secretary</SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                                <SelectItem value="Examiner">Examiner</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="year">Year *</Label>
                        <Input
                            id="year"
                            type="number"
                            min="1900"
                            max="2100"
                            {...register("year", { required: "Year is required" })}
                        />
                        {errors.year && <p className="text-sm text-red-600">{errors.year.message?.toString()}</p>}
                    </div>
                </div>

                {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
                    <div className="mt-4">
                        <DocumentViewer
                            documentUrl={formData.supportingDocument[0]}
                            documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ''}
                        />
                    </div>
                )}

                {!isEdit && (
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/teacher/research-contributions?tab=academic-bodies")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Add Academic Body
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </form>
    )
}
