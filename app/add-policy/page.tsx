"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function AddPolicyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    level: "",
    organisation: "",
    date: "",
  })

  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleDocumentUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadedDocument(files[0])
    }
  }

  const extractPolicyInfo = async (file: File) => {
    // Simulate LLM extraction process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated extracted data - in real implementation, this would come from LLM
    return {
      title: "National Education Policy Implementation Guidelines",
      level: "National",
      organisation: "Ministry of Education, Government of India",
      date: "2023-06-15",
    }
  }

  const handleExtractInfo = async () => {
    if (!uploadedDocument) return

    setIsExtracting(true)
    try {
      const extractedData = await extractPolicyInfo(uploadedDocument)
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
        description: "Policy document added successfully!",
        duration: 3000,
      })

      setIsLoading(true)
      router.push("/research-contributions?tab=policy")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add policy document. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setIsLoading(true)
    router.push("/research-contributions?tab=policy")
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
            Back to Policy Documents
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Policy Document</h1>
          <p className="text-muted-foreground">Add details about policy documents you've contributed to or authored</p>
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <Label className="text-base font-medium">Auto-fill from Document</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Upload a policy document to automatically extract and pre-fill form information
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
            <CardTitle>Policy Document Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Policy Document Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter policy document title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={isSubmitting || isExtracting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                    required
                    disabled={isSubmitting || isExtracting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Institutional">Institutional</SelectItem>
                      <SelectItem value="State">State</SelectItem>
                      <SelectItem value="National">National</SelectItem>
                      <SelectItem value="International">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="organisation">Organisation *</Label>
                  <Input
                    id="organisation"
                    placeholder="Enter organisation name"
                    value={formData.organisation}
                    onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                    required
                    disabled={isSubmitting || isExtracting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
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
                      Add Policy Document
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
