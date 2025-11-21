"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, ArrowLeft, CheckSquare, Square, Eye, Settings, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTeacherCVData } from "@/hooks/use-teacher-cv-data"
import { CVPreviewTwoColumn } from "@/components/cv/cv-preview-two-column"
import { generatePDFFromElement } from "@/app/api/teacher/cv-generation/cv-pdf-generator"
import type { CVTemplate } from "@/app/api/teacher/cv-generation/cv-template-styles"
import { saveAs } from "file-saver"

interface CVSection {
  id: string
  label: string
  description?: string
}

const cvSections: CVSection[] = [
  { id: "personal", label: "Personal Information", description: "Basic personal and contact details" },
  { id: "education", label: "Education Detail", description: "Academic qualifications and degrees" },
  { id: "postdoc", label: "Post Doctoral Research Experience", description: "Post-doctoral positions and research" },
  { id: "experience", label: "Experience Detail", description: "Professional work experience" },
  { id: "research", label: "Research Projects Detail", description: "Research projects and grants" },
  { id: "patents", label: "Patents Detail", description: "Patents filed and granted" },
  { id: "econtent", label: "E-Contents Detail", description: "Digital content development" },
  { id: "consultancy", label: "Consultancy Undertaken Detail", description: "Consultancy projects and services" },
  { id: "collaborations", label: "Collaborations Detail", description: "Academic and research collaborations" },
  { id: "phdguidance", label: "Ph.D. Guidance Detail", description: "PhD students supervised" },
  { id: "books", label: "Book Published Detail", description: "Books and book chapters published" },
  { id: "papers", label: "Paper Presented Detail", description: "Conference papers and presentations" },
  { id: "reviews", label: "Reviews Detail", description: "Peer reviews and editorial work" },
  {
    id: "monographs",
    label: "Monographs/E-Resources Developed Detail",
    description: "Monographs and digital resources",
  },
  { id: "articles", label: "Published Articles/Journals Detail", description: "Journal articles and publications" },
  { id: "orientation", label: "Orientation Course Detail", description: "Orientation and refresher courses" },
  {
    id: "academic_contribution",
    label: "Contribution in Academic Programme Detail",
    description: "Academic program contributions",
  },
  {
    id: "academic_participation",
    label: "Participation in Academic Programme Detail",
    description: "Academic program participation",
  },
  { id: "committees", label: "Participation in Academic Committee", description: "Committee memberships and roles" },
  {
    id: "performance",
    label: "Performance by Individual/Group Detail",
    description: "Individual and group performances",
  },
  { id: "awards", label: "Awards/Fellowship Detail", description: "Awards and fellowships received" },
  { id: "extension", label: "Extension Detail", description: "Extension activities and outreach" },
  { id: "talks", label: "Talk Detail", description: "Academic and research talks" },
]

// Types are imported from types/cv-data.ts

export default function GenerateCVPage() {
  const router = useRouter()
  const { toast } = useToast()
  const previewRef = useRef<HTMLDivElement>(null)
  const [selectedSections, setSelectedSections] = useState<string[]>(["personal", "education", "experience"])
  const [downloadFormat, setDownloadFormat] = useState("word")
  const [cvTemplate, setCvTemplate] = useState<CVTemplate>("academic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Use centralized CV data hook
  const { cvData, isLoading: isLoadingData, isError } = useTeacherCVData()

  // Handle errors
  if (isError && !generationError) {
    setGenerationError("Failed to load CV data. Please try again.")
  }

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const handleSelectAll = () => {
    if (selectedSections.length === cvSections.length) {
      setSelectedSections([])
    } else {
      setSelectedSections(cvSections.map((section) => section.id))
    }
  }

  const handleGenerateWord = async () => {
    if (!cvData.personal) {
      throw new Error("Personal information not available. Please wait for data to load.")
    }

    try {
      setIsGenerating(true)
      
      // Call API route for Word generation
      const response = await fetch("/api/teacher/cv-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvData,
          template: cvTemplate,
          format: "word",
          selectedSections,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || "Failed to generate Word document")
      }

      // Get the blob from response
      const blob = await response.blob()
      const fileName = `CV_${cvData.personal.name.replace(/\s+/g, "_")}_${cvTemplate}_${new Date().toISOString().split("T")[0]}.docx`
      
      // Save the file
      saveAs(blob, fileName)
      return true
    } catch (error) {
      console.error("Word generation error:", error)
      throw new Error(`Word document generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!cvData.personal) {
      throw new Error("Personal information not available. Please wait for data to load.")
    }

    try {
      setIsGenerating(true)
      setShowPreview(true) // Ensure preview is shown before export
      await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for preview to render

      // First, validate and prepare via API call
      const response = await fetch("/api/teacher/cv-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvData,
          template: cvTemplate,
          format: "pdf",
          selectedSections,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || "Failed to validate PDF generation")
      }

      // API validated successfully, now generate PDF client-side
      if (!previewRef.current) {
        throw new Error("Preview element not found")
      }

      // Find the actual CV content element (the one with id="cv-preview-content")
      // This ensures we capture the full CV including the header
      const cvContentElement = previewRef.current.querySelector('#cv-preview-content') as HTMLElement
      
      if (!cvContentElement) {
        throw new Error("CV content element not found. Please ensure the preview is visible.")
      }

      // Find the CV component itself (without the padding wrapper)
      // This ensures we capture exactly what's shown in preview without extra padding
      const cvComponent = cvContentElement.querySelector('[class*="shadow-lg"][class*="rounded-lg"]') as HTMLElement
      
      if (!cvComponent) {
        throw new Error("CV component not found. Please ensure the preview is visible.")
      }

      // Temporarily remove padding from wrapper to ensure clean capture
      const originalPadding = cvContentElement.style.padding
      cvContentElement.style.padding = '0'
      
      try {
        const fileName = `CV_${cvData.personal.name.replace(/\s+/g, "_")}_${cvTemplate}_${new Date().toISOString().split("T")[0]}.pdf`
        
        // Generate PDF directly from the CV component (not the wrapper with padding)
        await generatePDFFromElement(cvComponent, fileName)
      } finally {
        // Restore original padding
        cvContentElement.style.padding = originalPadding
      }
      return true
    } catch (error) {
      console.error("PDF generation error:", error)
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCV = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: "No sections selected",
        description: "Please select at least one section to include in your CV.",
        variant: "destructive",
      })
      return
    }

    if (!cvData.personal) {
      toast({
        title: "Data not loaded",
        description: "Please wait for your data to load before generating the CV.",
        variant: "destructive",
      })
      return
    }

    if (isLoadingData) {
      toast({
        title: "Loading data",
        description: "Please wait for data to finish loading.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      // Validate browser compatibility
      if (!window.Blob || !window.URL || !window.URL.createObjectURL) {
        throw new Error("Your browser does not support file generation. Please use a modern browser.")
      }

      let success = false
      if (downloadFormat === "word") {
        success = await handleGenerateWord()
      } else {
        success = await handleGeneratePDF()
      }

      if (success) {
        toast({
          title: "CV Generated Successfully!",
          description: `Your ${cvTemplate} template CV with ${selectedSections.length} sections has been generated. ${downloadFormat === "pdf" ? "Use your browser's print dialog to save as PDF." : "The file should download automatically."}`,
          duration: 5000,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setGenerationError(errorMessage)

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })

      console.error("CV Generation Error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = () => {
    setShowPreview(true)
    toast({
      title: "Preview Generated",
      description: "CV preview is now available below the form.",
    })

    // Smooth scroll to preview section
    setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      })
    }, 100)
  }

  const testDocumentGeneration = async () => {
    try {
      // Test basic browser capabilities
      const testBlob = new Blob(["Test content"], { type: "text/plain" })
      const testUrl = URL.createObjectURL(testBlob)
      URL.revokeObjectURL(testUrl)

      toast({
        title: "Browser Compatibility Test Passed",
        description: "Your browser supports document generation.",
      })
    } catch (error) {
      toast({
        title: "Browser Compatibility Issue",
        description: "Your browser may not support document generation features.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generate CV</h1>
            <p className="text-muted-foreground">Create a professional CV with your selected information</p>
          </div>
        </div>
      
      </div>

      {/* Error Alert */}
      {generationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Document Generation Error:</strong> {generationError}
            <br />
            <small>
              Try using a different browser or check if popups are blocked. For PDF generation, ensure your browser
              supports printing.
            </small>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CV Sections Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    CV Sections
                  </CardTitle>
                  <CardDescription>Select the sections you want to include in your CV</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {selectedSections.length === cvSections.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {selectedSections.length === cvSections.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cvSections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => handleSectionToggle(section.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={section.id} className="text-sm font-medium cursor-pointer">
                        {section.label}
                      </Label>
                      {section.description && (
                        <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CV Generation Options */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                CV Template
              </CardTitle>
              <CardDescription>Choose your preferred CV template</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={cvTemplate} onValueChange={(value) => setCvTemplate(value as CVTemplate)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic Template</SelectItem>
                  <SelectItem value="professional">Professional Template</SelectItem>
                  <SelectItem value="modern">Modern Template</SelectItem>
                  <SelectItem value="classic">Classic Template</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Download Format */}
          <Card>
            <CardHeader>
              <CardTitle>Download Format</CardTitle>
              <CardDescription>Choose your preferred CV format</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={downloadFormat} onValueChange={setDownloadFormat}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="word" id="word" />
                  <Label htmlFor="word" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Microsoft Word (.doc)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    PDF (.pdf) - Print to PDF
                  </Label>
                </div>
              </RadioGroup>
              <div className="mt-2 text-xs text-muted-foreground">
                {downloadFormat === "pdf" && (
                  <p>PDF generation uses your browser's print dialog. Select "Save as PDF" when prompted.</p>
                )}
                {downloadFormat === "word" && (
                  <p>
                    Word document will be downloaded as .doc file compatible with Microsoft Word and similar editors.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Summary</CardTitle>
              <CardDescription>Review your CV settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Template:</span>
                  <span className="font-medium capitalize">{cvTemplate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sections Selected:</span>
                  <span className="font-medium">
                    {selectedSections.length} of {cvSections.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Format:</span>
                  <span className="font-medium capitalize">{downloadFormat}</span>
                </div>
                <div className="pt-3 border-t space-y-2">
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    disabled={selectedSections.length === 0}
                    className="w-full flex items-center gap-2 bg-transparent"
                  >
                    <Eye className="h-4 w-4" />
                    Preview CV
                  </Button>
                  <Button
                    onClick={handleGenerateCV}
                    disabled={isGenerating || selectedSections.length === 0 || isLoadingData || !cvData.personal}
                    className="w-full flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating CV...
                      </>
                    ) : isLoadingData ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading Data...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Generate & Download CV
                      </>
                    )}
                  </Button>
                  {isLoadingData && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Please wait while we load your CV data...
                    </p>
                  )}
                  {!isLoadingData && !cvData.personal && (
                    <p className="text-xs text-muted-foreground text-center mt-2 text-amber-600">
                      No profile data available. Please complete your profile first.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browser Compatibility Info */}
          <Card>
            <CardHeader>
              <CardTitle>Compatibility Info</CardTitle>
              <CardDescription>Document generation requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Modern browser required (Chrome, Firefox, Safari, Edge)</p>
                <p>• Allow popups for PDF generation</p>
                <p>• Word documents compatible with MS Word, LibreOffice, Google Docs</p>
                <p>• PDF generation uses browser's print functionality</p>
                <p>• Template styling preserved in downloaded documents</p>
              </div>
            </CardContent>
          </Card>

          {/* Selected Sections Preview */}
          {selectedSections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Sections</CardTitle>
                <CardDescription>Sections included in your CV</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedSections.map((sectionId) => {
                    const section = cvSections.find((s) => s.id === sectionId)
                    return (
                      <div key={sectionId} className="flex items-center gap-2 text-sm">
                        <CheckSquare className="h-3 w-3 text-green-600" />
                        <span>{section?.label}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* CV Preview with Dynamic Styling */}
      {showPreview && (
        <Card ref={previewRef} className="scroll-mt-6">
          <CardHeader>
            <CardTitle>CV Preview - {cvTemplate.charAt(0).toUpperCase() + cvTemplate.slice(1)} Template</CardTitle>
            <CardDescription>Preview of your generated CV content with selected template styling</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-3 text-gray-600">Loading CV data...</span>
                </div>
              ) : !cvData.personal ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No data available. Please ensure your profile is complete.</p>
                </div>
              ) : (
                <div className="max-h-[800px] overflow-y-auto overflow-x-hidden bg-white smooth-scroll">
                  <div className="p-4" id="cv-preview-content">
                    <CVPreviewTwoColumn
                      cvData={cvData}
                      selectedSections={selectedSections}
                      template={cvTemplate}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
