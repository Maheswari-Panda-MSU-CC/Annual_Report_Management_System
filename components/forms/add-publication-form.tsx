"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentUpload } from "@/components/ui/document-upload"
import { LLMExtraction } from "@/components/llm/llm-extraction"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

interface PublicationData {
  title: string
  authors: string[]
  journal: string
  year: string
  volume: string
  pages: string
  doi: string
  abstract: string
  keywords: string[]
  type: string
  level: string
}

export function AddPublicationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<PublicationData>({
    title: "",
    authors: [],
    journal: "",
    year: "",
    volume: "",
    pages: "",
    doi: "",
    abstract: "",
    keywords: [],
    type: "journal",
    level: "international",
  })

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleLLMExtraction = async (extractedData: Partial<PublicationData>) => {
    setIsExtracting(true)
    try {
      // Simulate LLM processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setFormData((prev) => ({
        ...prev,
        ...extractedData,
      }))

      toast({
        title: "Success",
        description: "Publication data extracted successfully from document",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract data from document",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Publication added successfully",
      })

      router.push("/publications")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add publication",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button type="button" variant="outline" onClick={() => router.push("/publications")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Publications
        </Button>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="review">Review & Submit</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Publication Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DocumentUpload
                onFileSelect={handleFileUpload}
                acceptedTypes=".pdf,.doc,.docx"
                maxSize={10 * 1024 * 1024} // 10MB
              />

              {uploadedFile && (
                <LLMExtraction
                  file={uploadedFile}
                  onExtraction={handleLLMExtraction}
                  isExtracting={isExtracting}
                  extractionType="publication"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Publication Title *</Label>
                <Textarea
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter publication title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="journal">Journal/Conference *</Label>
                <Input
                  id="journal"
                  value={formData.journal}
                  onChange={(e) => setFormData((prev) => ({ ...prev, journal: e.target.value }))}
                  placeholder="Enter journal or conference name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                    placeholder="2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="volume">Volume</Label>
                  <Input
                    id="volume"
                    value={formData.volume}
                    onChange={(e) => setFormData((prev) => ({ ...prev, volume: e.target.value }))}
                    placeholder="Vol. 1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="pages">Pages</Label>
                <Input
                  id="pages"
                  value={formData.pages}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pages: e.target.value }))}
                  placeholder="1-10"
                />
              </div>

              <div>
                <Label htmlFor="doi">DOI</Label>
                <Input
                  id="doi"
                  value={formData.doi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, doi: e.target.value }))}
                  placeholder="10.1000/xyz123"
                />
              </div>

              <div>
                <Label htmlFor="abstract">Abstract</Label>
                <Textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => setFormData((prev) => ({ ...prev, abstract: e.target.value }))}
                  placeholder="Enter abstract"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Publication Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Title</Label>
                  <p className="text-sm text-muted-foreground">{formData.title || "Not provided"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Journal</Label>
                  <p className="text-sm text-muted-foreground">{formData.journal || "Not provided"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Year</Label>
                  <p className="text-sm text-muted-foreground">{formData.year || "Not provided"}</p>
                </div>
                <div>
                  <Label className="font-semibold">DOI</Label>
                  <p className="text-sm text-muted-foreground">{formData.doi || "Not provided"}</p>
                </div>
              </div>

              {formData.abstract && (
                <div>
                  <Label className="font-semibold">Abstract</Label>
                  <p className="text-sm text-muted-foreground">{formData.abstract}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/publications")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Add Publication
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
