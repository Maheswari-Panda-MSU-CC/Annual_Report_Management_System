"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Save, FileText, Loader2 } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</span>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </div>
    </div>
  )
}

export default function AddConsultancyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    collaboratingInstitute: "",
    address: "",
    startDate: "",
    duration: "",
    amount: "",
    detailsOutcome: "",
  })

  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleDocumentUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadedDocument(files[0])
    }
  }

  const extractConsultancyInfo = async (file: File) => {
    // Simulate LLM extraction process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated extracted data - in real implementation, this would come from LLM
    return {
      title: "Digital Transformation Strategy for Manufacturing Industry",
      collaboratingInstitute: "Tata Consultancy Services",
      address: "Mumbai, Maharashtra, India",
      startDate: "2023-03-15",
      duration: "12",
      amount: "500000",
      detailsOutcome:
        "Developed comprehensive digital transformation roadmap including IoT implementation, data analytics framework, and process automation strategies.",
    }
  }

  const handleExtractInfo = async () => {
    if (!uploadedDocument) return

    setIsExtracting(true)
    try {
      const extractedData = await extractConsultancyInfo(uploadedDocument)
      setFormData((prev) => ({
        ...prev,
        ...extractedData,
      }))

      toast({
        title: "Success",
        description: "Information extracted and form pre-filled successfully!",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract information from document.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Consultancy added successfully!",
        duration: 3000,
      })

      setIsLoading(true)
      router.push("/research-contributions?tab=consultancy")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add consultancy. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setIsLoading(true)
    router.push("/research-contributions?tab=consultancy")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
            Back to Consultancy Undertaken
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Consultancy</h1>
          <p className="text-muted-foreground">
            Add details about consultancy projects undertaken with industry or institutions
          </p>
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <Label className="text-base font-medium">Auto-fill from Document</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Upload a consultancy document to automatically extract and pre-fill form information
          </p>

          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="document-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">Upload document</span>
                  <span className="block text-xs text-gray-500">PDF, DOCX up to 10MB</span>
                </label>
                <input
                  id="document-upload"
                  name="document-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleDocumentUpload(e.target.files)}
                  disabled={isExtracting}
                />
              </div>
            </div>

            {uploadedDocument && (
              <div className="flex items-center justify-between p-3 bg-white border rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{uploadedDocument.name}</span>
                </div>
                <Button type="button" size="sm" onClick={handleExtractInfo} disabled={isExtracting}>
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Extracting...
                    </>
                  ) : (
                    "Extract Information"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consultancy Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Consultancy Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter consultancy project title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={isSubmitting || isExtracting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="collaboratingInstitute">Collaborating Institute/Industry *</Label>
                  <Input
                    id="collaboratingInstitute"
                    placeholder="Enter institute/industry name"
                    value={formData.collaboratingInstitute}
                    onChange={(e) => setFormData({ ...formData, collaboratingInstitute: e.target.value })}
                    required
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (in Months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Enter duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="detailsOutcome">Details / Outcome</Label>
                <Textarea
                  id="detailsOutcome"
                  placeholder="Enter details about the consultancy project and its outcomes"
                  value={formData.detailsOutcome}
                  onChange={(e) => setFormData({ ...formData, detailsOutcome: e.target.value })}
                  rows={4}
                  disabled={isSubmitting || isExtracting}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting || isExtracting || isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isExtracting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Consultancy
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
