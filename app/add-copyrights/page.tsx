"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Save, FileText } from "lucide-react"

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

export default function AddCopyrightsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    referenceNo: "",
    publicationDate: "",
    link: "",
  })

  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleDocumentUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadedDocument(files[0])
    }
  }

  const extractCopyrightInfo = async (file: File) => {
    // Simulate LLM extraction process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated extracted data - in real implementation, this would come from LLM
    return {
      title: "Educational Software for Interactive Learning",
      referenceNo: "L-98765/2023",
      publicationDate: "2023-09-15",
      link: "https://copyright.gov.in/Documents/CopyrightRules1957.pdf",
    }
  }

  const handleExtractInfo = async () => {
    if (!uploadedDocument) return

    setIsExtracting(true)
    try {
      const extractedData = await extractCopyrightInfo(uploadedDocument)
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
        description: "Copyright added successfully!",
        duration: 3000,
      })

      router.push("/research-contributions?tab=copyrights")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add copyright. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/research-contributions?tab=copyrights")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Copyrights
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Copyright</h1>
          <p className="text-muted-foreground">
            Add details about copyrights you have obtained for your creative works
          </p>
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <Label className="text-base font-medium">Auto-fill from Document</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Upload a copyright document to automatically extract and pre-fill form information
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
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
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
            <CardTitle>Copyright Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Copyright Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter copyright title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="referenceNo">Reference Number *</Label>
                  <Input
                    id="referenceNo"
                    placeholder="Enter copyright reference number"
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="publicationDate">Publication Date *</Label>
                  <Input
                    id="publicationDate"
                    type="date"
                    value={formData.publicationDate}
                    onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="link">Link</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="Enter copyright registry link (if available)"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/research-contributions?tab=copyrights")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Copyright
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
