"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import FileUpload from "@/components/shared/FileUpload"
import { Loader2, Brain, FileText, ArrowRight } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"

interface ClassificationData {
  category: string
  "sub-category"?: string
  dataFields: Record<string, string>
}

interface DocumentAnalysis {
  success: boolean
  classification: ClassificationData
  extractedText: string
  fileType: string
  fileName: string
  timestamp: string
}

export function SmartDocumentAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  // Helper function to calculate field similarity between extracted fields and expected fields
  const calculateFieldSimilarity = (
    extractedFields: Record<string, string>,
    expectedFields: string[]
  ): number => {
    if (!extractedFields || Object.keys(extractedFields).length === 0) return 0
    if (!expectedFields || expectedFields.length === 0) return 0

    const extractedKeys = Object.keys(extractedFields).map(k => k.toLowerCase().trim())
    const expectedKeys = expectedFields.map(f => f.toLowerCase().trim())
    
    // Normalize field names (remove special characters, spaces, etc.)
    const normalizeField = (field: string) => {
      return field
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim()
    }

    const normalizedExtracted = extractedKeys.map(normalizeField)
    const normalizedExpected = expectedKeys.map(normalizeField)

    // Calculate matches
    let matches = 0
    normalizedExtracted.forEach(extracted => {
      const match = normalizedExpected.some(expected => {
        // Exact match
        if (extracted === expected) return true
        // Partial match (one contains the other)
        if (extracted.includes(expected) || expected.includes(extracted)) return true
        // Fuzzy match (similar strings)
        const similarity = calculateStringSimilarity(extracted, expected)
        return similarity > 0.7
      })
      if (match) matches++
    })

    return expectedKeys.length > 0 ? matches / expectedKeys.length : 0
  }

  // Helper function to calculate string similarity (Levenshtein distance based)
  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    if (longer.length === 0) return 1.0
    
    const distance = levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  // Simple Levenshtein distance calculation
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  // Helper function to normalize strings for matching
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[&]/g, "and")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
  }

  // Helper function to find matching category and subcategory
  const findMatchingRoute = (category: string, subCategory: string = ""): { route: string; label: string } | null => {
    const normalizedCategory = normalizeString(category)
    const normalizedSubCategory = normalizeString(subCategory)

    // Try to find matching category
    for (const cat of teacherCategories) {
      const normalizedCatKey = normalizeString(cat.key)
      const normalizedCatLabel = normalizeString(cat.label)

      // Check if category matches (key or label)
      if (
        normalizedCatKey === normalizedCategory ||
        normalizedCatLabel === normalizedCategory ||
        normalizedCategory.includes(normalizedCatKey) ||
        normalizedCatKey.includes(normalizedCategory) ||
        normalizedCategory.includes(normalizedCatLabel) ||
        normalizedCatLabel.includes(normalizedCategory)
      ) {
        // If category has subcategories, try to match subcategory
        if (cat.subcategories && cat.subcategories.length > 0 && normalizedSubCategory) {
          for (const subcat of cat.subcategories) {
            const normalizedSubcatKey = normalizeString(subcat.key)
            const normalizedSubcatLabel = normalizeString(subcat.label)

            // More flexible matching - check if subcategory key/label appears in the normalized subcategory
            // or if normalized subcategory contains key parts
            const keyParts = normalizedSubcatKey.split(/[\s-]+/) // Split by spaces or hyphens
            const labelParts = normalizedSubcatLabel.split(/[\s-]+/)
            
            // Check exact matches first
            if (
              normalizedSubcatKey === normalizedSubCategory ||
              normalizedSubcatLabel === normalizedSubCategory ||
              normalizedSubCategory.includes(normalizedSubcatKey.replace(/-/g, " ")) || // Handle hyphens
              normalizedSubcatKey.replace(/-/g, " ").includes(normalizedSubCategory) ||
              normalizedSubCategory.includes(normalizedSubcatLabel.toLowerCase()) ||
              normalizedSubcatLabel.toLowerCase().includes(normalizedSubCategory) ||
              // Check for plural/singular variations
              normalizedSubCategory.includes(normalizedSubcatKey.replace(/-/g, "")) ||
              normalizedSubCategory.replace(/s$/, "").includes(normalizedSubcatKey.replace(/-/g, ""))
            ) {
              return { route: subcat.route, label: subcat.label }
            }
            
            // Check if key parts match (e.g., "academic bodies" should match "academic-bodies")
            if (keyParts.length > 1 && keyParts.every(part => normalizedSubCategory.includes(part))) {
              return { route: subcat.route, label: subcat.label }
            }
            
            // Check if label parts match
            if (labelParts.length > 1 && labelParts.every(part => normalizedSubCategory.includes(part))) {
              return { route: subcat.route, label: subcat.label }
            }
          }
        }

        // If no subcategory match but category has subcategories, return first subcategory route
        if (cat.subcategories && cat.subcategories.length > 0) {
          return { route: cat.subcategories[0].route, label: cat.subcategories[0].label }
        }
        
        // If category doesn't have subcategories, return category route
        return { route: cat.route, label: cat.label }
      }
    }

    // Special handling for research contributions variations
    if (
      normalizedCategory.includes("research") &&
      (normalizedCategory.includes("contribution") ||
        normalizedCategory.includes("consultancy") ||
        normalizedCategory.includes("academic"))
    ) {
      const route = getResearchContributionsRoute(normalizedSubCategory || normalizedCategory, true)
      return { route, label: "Research Contributions" }
    }

    // Special handling for publications variations
    if (
      normalizedCategory.includes("publication") ||
      normalizedCategory.includes("journal") ||
      normalizedCategory.includes("article") ||
      normalizedCategory.includes("book") ||
      normalizedCategory.includes("paper")
    ) {
      if (normalizedSubCategory.includes("journal") || normalizedSubCategory.includes("article")) {
        return { route: "/teacher/publication/journal-articles/add", label: "Journal Articles" }
      } else if (normalizedSubCategory.includes("book")) {
        return { route: "/teacher/publication/books/add", label: "Books" }
      } else if (normalizedSubCategory.includes("paper") || normalizedSubCategory.includes("presented")) {
        return { route: "/teacher/publication/papers/add", label: "Papers Presented" }
      }
      // Default to journal articles if no specific subcategory match
      return { route: "/teacher/publication/journal-articles/add", label: "Publications" }
    }

    // Special handling for awards variations
    if (normalizedCategory.includes("award") || normalizedCategory.includes("recognition")) {
      // Try to match specific subcategory
      if (normalizedSubCategory.includes("performance")) {
        return { route: "/teacher/awards-recognition/add?tab=performance", label: "Performance" }
      } else if (normalizedSubCategory.includes("award") || normalizedSubCategory.includes("fellowship")) {
        return { route: "/teacher/awards-recognition/add?tab=awards", label: "Awards/Fellows" }
      } else if (normalizedSubCategory.includes("extension") || normalizedSubCategory.includes("activity")) {
        return { route: "/teacher/awards-recognition/add?tab=extension", label: "Extension Activities" }
      }
      // Default to first subcategory (performance)
      return { route: "/teacher/awards-recognition/add?tab=performance", label: "Awards & Recognition" }
    }

    // Special handling for talks variations
    if (
      normalizedCategory.includes("talk") ||
      normalizedCategory.includes("event") ||
      normalizedCategory.includes("seminar") ||
      normalizedCategory.includes("conference") ||
      normalizedCategory.includes("refresher") ||
      normalizedCategory.includes("orientation") ||
      normalizedCategory.includes("academic program") ||
      normalizedCategory.includes("academic body") ||
      normalizedCategory.includes("committee")
    ) {
      // Try to match specific subcategory
      if (normalizedSubCategory.includes("refresher") || normalizedSubCategory.includes("orientation")) {
        return { route: "/teacher/talks-events/add?tab=refresher", label: "Refresher/Orientation" }
      } else if (normalizedSubCategory.includes("academic program") || normalizedSubCategory.includes("program")) {
        return { route: "/teacher/talks-events/add?tab=academic-programs", label: "Academic Programs" }
      } else if (
        normalizedSubCategory.includes("academic body") || 
        normalizedSubCategory.includes("academic bodies") || 
        normalizedSubCategory.includes("body") && normalizedSubCategory.includes("academic")
      ) {
        return { route: "/teacher/talks-events/add?tab=academic-bodies", label: "Academic Bodies" }
      } else if (normalizedSubCategory.includes("committee") || normalizedSubCategory.includes("university")) {
        return { route: "/teacher/talks-events/add?tab=committees", label: "University Committees" }
      } else if (normalizedSubCategory.includes("talk") || normalizedSubCategory.includes("presentation")) {
        return { route: "/teacher/talks-events/add?tab=talks", label: "Academic Talks" }
      }
      // Default to first subcategory (refresher)
      return { route: "/teacher/talks-events/add?tab=refresher", label: "Talks & Events" }
    }

    // Special handling for academic recommendations variations
    if (
      normalizedCategory.includes("academic") &&
      normalizedCategory.includes("recommendation")
    ) {
      // Try to match specific subcategory
      if (normalizedSubCategory.includes("article") || normalizedSubCategory.includes("journal")) {
        return { route: "/teacher/academic-recommendations/add?tab=articles", label: "Articles/Journals" }
      } else if (normalizedSubCategory.includes("book")) {
        return { route: "/teacher/academic-recommendations/add?tab=books", label: "Books" }
      } else if (normalizedSubCategory.includes("magazine")) {
        return { route: "/teacher/academic-recommendations/add?tab=magazines", label: "Magazines" }
      } else if (normalizedSubCategory.includes("technical") || normalizedSubCategory.includes("report")) {
        return { route: "/teacher/academic-recommendations/add?tab=technical", label: "Technical Reports" }
      }
      // Default to first subcategory (articles)
      return { route: "/teacher/academic-recommendations/add?tab=articles", label: "Academic Recommendations" }
    }

    return null
  }

  // Helper function to get route for research contributions subcategories
  const getResearchContributionsRoute = (subCategory: string, useAddRoute: boolean = false): string => {
    const subCategoryMap: Record<string, string> = {
      "patents": "patents",
      "policy documents": "policy",
      "policy": "policy",
      "e-content": "econtent",
      "econtent": "econtent",
      "consultancy": "consultancy",
      "collaborations": "collaborations",
      "mous": "collaborations",
      "academic visits": "visits",
      "visits": "visits",
      "financial support": "financial",
      "financial": "financial",
      "jrf": "jrf-srf",
      "srf": "jrf-srf",
      "jrfsrf": "jrf-srf",
      "jrf-srf": "jrf-srf",
      "phd guidance": "phd",
      "phd": "phd",
      "copyrights": "copyrights",
      "copyright": "copyrights",
    }
    const normalized = normalizeString(subCategory)
    const tab = subCategoryMap[normalized] || normalized
    
    if (useAddRoute) {
      return `/teacher/research-contributions/${tab}/add`
    }
    return `/teacher/research-contributions?tab=${tab}`
  }

  // Complete mappings for all teacher sections with categories and subcategories
  const teacherCategories: Array<{
    key: string
    label: string
    route: string
    fields: string[]
    subcategories?: Array<{ key: string; label: string; route: string; fields: string[] }>
  }> = [
    {
      key: "Publications",
      label: "Publications",
      route: "/teacher/publication",
      fields: ["Title", "DOI", "ISSN", "Impact Factor", "Publisher", "Year"],
      subcategories: [
        {
          key: "journals",
          label: "Published Articles/Journals",
          route: "/teacher/publication/journal-articles/add",
          fields: ["Title", "DOI", "ISSN", "Impact Factor", "Journal", "Year", "Authors"],
        },
        {
          key: "books",
          label: "Books (Authored/Edited)",
          route: "/teacher/publication/books/add",
          fields: ["Title", "ISBN", "Publisher", "Year", "Authors"],
        },
        {
          key: "papers",
          label: "Papers Presented",
          route: "/teacher/publication/papers/add",
          fields: ["Title", "Organising Body", "Place", "Date", "Authors"],
        },
      ],
    },
    {
      key: "Research Projects",
      label: "Research Projects",
      route: "/teacher/research/add",
      fields: ["Project Title", "Funding Agency", "Sanctioned Amount", "Duration", "Start Date", "End Date"],
    },
    {
      key: "Research Contributions",
      label: "Research & Academic Contributions",
      route: "/teacher/research-contributions",
      fields: ["Title", "Type", "Date", "Details"],
      subcategories: [
        {
          key: "patents",
          label: "Patents",
          route: "/teacher/research-contributions/patents/add",
          fields: ["Title", "Level", "Status", "Date", "Patent Application No"],
        },
        {
          key: "policy",
          label: "Policy Documents",
          route: "/teacher/research-contributions/policy/add",
          fields: ["Title", "Level", "Organisation", "Date"],
        },
        {
          key: "econtent",
          label: "E-Content",
          route: "/teacher/research-contributions/econtent/add",
          fields: ["Title", "Type", "Platform", "Publishing Date", "Publishing Authorities"],
        },
        {
          key: "consultancy",
          label: "Consultancy",
          route: "/teacher/research-contributions/consultancy/add",
          fields: ["Name", "Collaborating Institution", "Start Date", "Amount"],
        },
        {
          key: "collaborations",
          label: "Collaborations",
          route: "/teacher/research-contributions/collaborations/add",
          fields: ["Collaborating Institution", "Category", "Type", "Starting Date"],
        },
        {
          key: "visits",
          label: "Academic Visits",
          route: "/teacher/research-contributions/visits/add",
          fields: ["Institution", "Purpose", "Date", "Role"],
        },
        {
          key: "financial",
          label: "Financial Support",
          route: "/teacher/research-contributions/financial/add",
          fields: ["Title", "Amount", "Purpose", "Date"],
        },
        {
          key: "jrf-srf",
          label: "JRF/SRF",
          route: "/teacher/research-contributions/jrf-srf/add",
          fields: ["Name", "Type", "Project Title", "Duration"],
        },
        {
          key: "phd",
          label: "Ph.D. Guidance",
          route: "/teacher/research-contributions/phd/add",
          fields: ["Name", "Registration No", "Topic", "Start Date"],
        },
        {
          key: "copyrights",
          label: "Copyrights",
          route: "/teacher/research-contributions/copyrights/add",
          fields: ["Title", "Reference No", "Publication Date", "Link"],
        },
      ],
    },
    {
      key: "Awards Recognition",
      label: "Awards & Recognition",
      route: "/teacher/awards-recognition",
      fields: ["Award Name", "Awarding Body", "Year"],
      subcategories: [
        {
          key: "performance",
          label: "Performance",
          route: "/teacher/awards-recognition/add?tab=performance",
          fields: ["Name", "Place", "Date", "Nature"],
        },
        {
          key: "awards",
          label: "Awards/Fellows",
          route: "/teacher/awards-recognition/add?tab=awards",
          fields: ["Name", "Organization", "Date of Award", "Details"],
        },
        {
          key: "extension",
          label: "Extension Activities",
          route: "/teacher/awards-recognition/add?tab=extension",
          fields: ["Name of Activity", "Place", "Date"],
        },
      ],
    },
    {
      key: "Talks Events",
      label: "Talks & Events",
      route: "/teacher/talks-events/add",
      fields: ["Event Name", "Role", "Date", "Venue"],
      subcategories: [
        {
          key: "refresher",
          label: "Refresher/Orientation",
          route: "/teacher/talks-events/add?tab=refresher",
          fields: ["Name", "Course Type", "Start Date", "End Date", "Organizing University", "Organizing Institute"],
        },
        {
          key: "academic-programs",
          label: "Academic Programs",
          route: "/teacher/talks-events/add?tab=academic-programs",
          fields: ["Name", "Programme", "Place", "Date", "Year", "Participated As"],
        },
        {
          key: "academic-bodies",
          label: "Academic Bodies",
          route: "/teacher/talks-events/add?tab=academic-bodies",
          fields: ["Name", "Academic Body", "Place", "Participated As", "Submit Date", "Year"],
        },
        {
          key: "committees",
          label: "University Committees",
          route: "/teacher/talks-events/add?tab=committees",
          fields: ["Name", "Committee Name", "Level", "Participated As", "Submit Date", "Year"],
        },
        {
          key: "talks",
          label: "Academic Talks",
          route: "/teacher/talks-events/add?tab=talks",
          fields: ["Name", "Programme", "Place", "Talk Date", "Title of Event", "Participated As"],
        },
      ],
    },
    {
      key: "Academic Recommendations",
      label: "Academic Recommendations",
      route: "/teacher/academic-recommendations",
      fields: ["Title", "Type", "Date"],
      subcategories: [
        {
          key: "articles",
          label: "Articles/Journals",
          route: "/teacher/academic-recommendations/add?tab=articles",
          fields: ["Title", "Journal", "Date"],
        },
        {
          key: "books",
          label: "Books",
          route: "/teacher/academic-recommendations/add?tab=books",
          fields: ["Title", "Publisher", "Date"],
        },
        {
          key: "magazines",
          label: "Magazines",
          route: "/teacher/academic-recommendations/add?tab=magazines",
          fields: ["Title", "Magazine", "Date"],
        },
        {
          key: "technical",
          label: "Technical Reports",
          route: "/teacher/academic-recommendations/add?tab=technical",
          fields: ["Title", "Organization", "Date"],
        },
      ],
    },
  ]

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null)
  const [selectedSubcategoryKey, setSelectedSubcategoryKey] = useState<string | null>(null)
  const [isClassificationCorrect, setIsClassificationCorrect] = useState<boolean | null>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only PDF, PNG, JPG, and JPEG files are allowed.",
          variant: "destructive",
        })
        return
      }
      if (file.size > 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 1MB.",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
      setAnalysis(null)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    setIsAnalyzing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/llm/categorize-document", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        console.error(result.error);
        throw new Error(result.error.message || "Document analysis failed.");
      }

      setAnalysis(result)
      setProgress(100)
      // Reset classification confirmation
      setIsClassificationCorrect(null)
      setSelectedCategoryKey(null)
      setSelectedSubcategoryKey(null)

      toast({
        title: "Document Analyzed Successfully",
        description: `Category: ${result.classification.category}`,
      })
    } catch (error: any) {
      console.error("Analysis error:", error);
    
      toast({
        title: "Analysis Failed",
        description:
          error?.message || "The document could not be analyzed. Please try again later.",
        variant: "destructive",
      });
    
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Smart Document Analyzer
        </CardTitle>
        <CardDescription>
          Upload your document and let AI categorize and extract useful details.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            acceptedTypes=".pdf,.png,.jpg,.jpeg"
            multiple={false}
          />

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Badge variant="secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null)
                  setAnalysis(null)
                }}
                disabled={isAnalyzing}
              >
                Remove
              </Button>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze Document
              </>
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 text-center">
                AI is analyzing your document...
              </p>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Document analysis complete! Here's what we found:
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline">{analysis.classification.category}</Badge>
                </div>
                {analysis.classification["sub-category"] && (
                  <div className="flex justify-between">
                    <span className="font-medium">Sub-Category:</span>
                    <Badge variant="secondary">
                      {analysis.classification["sub-category"]}
                    </Badge>
                  </div>
                )}

                {/* Classification Confirmation */}
                <div className="pt-2 border-t space-y-3">
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Is this classification correct?</p>
                    <RadioGroup
                      value={isClassificationCorrect === null ? undefined : isClassificationCorrect ? "yes" : "no"}
                      onValueChange={(val) => setIsClassificationCorrect(val === "yes")}
                      className="flex gap-4"
                    >
                      <label className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="yes" />
                        <span className="text-sm font-medium">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="no" />
                        <span className="text-sm font-medium">No</span>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* If Yes - Show redirect button */}
                  {isClassificationCorrect === true && (
                    <div className="space-y-3">
                      <Button
                        onClick={async () => {
                          try {
                            const category = analysis.classification.category
                            const subCategory = analysis.classification["sub-category"] || ""
                            const dataFields = analysis.classification.dataFields || {}

                            // Find matching route using the helper function
                            const match = findMatchingRoute(category, subCategory)

                            if (!match) {
                              toast({
                                title: "Route Not Found",
                                description: "Could not determine the correct page. Please select manually below.",
                                variant: "destructive",
                              })
                              return
                            }

                            // Store file for document viewer
                            if (selectedFile) {
                              await new Promise<void>((resolve) => {
                                const reader = new FileReader()
                                reader.onload = function (e) {
                                  sessionStorage.setItem("arms_uploaded_file", e.target?.result as string)
                                  sessionStorage.setItem("arms_uploaded_file_name", selectedFile.name)
                                  sessionStorage.setItem("arms_uploaded_file_type", selectedFile.type)
                                  resolve()
                                }
                                reader.onerror = () => resolve() // Resolve even on error to not block navigation
                                reader.readAsDataURL(selectedFile)
                              })
                            }

                            // Store analysis data for form population
                            sessionStorage.setItem("arms_last_analysis", JSON.stringify(analysis))
                            sessionStorage.setItem("arms_dataFields", JSON.stringify(dataFields))
                            sessionStorage.setItem("arms_category", category.toLowerCase())
                            sessionStorage.setItem("arms_subcategory", subCategory.toLowerCase())
                            sessionStorage.setItem("arms_auto_fill", "true")

                            router.push(match.route)
                            toast({
                              title: "Redirecting...",
                              description: `Taking you to ${match.label} page with auto-filled data`,
                            })
                          } catch (e) {
                            console.error("Navigation error:", e)
                            toast({
                              title: "Navigation Failed",
                              description: "Please try again or select manually below.",
                              variant: "destructive",
                            })
                          }
                        }}
                        className="w-full"
                        variant="default"
                      >
                        Go to {analysis.classification["sub-category"] || analysis.classification.category} Add Page
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* If No - Show category and subcategory selection */}
                  {isClassificationCorrect === false && (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Select Correct Category</CardTitle>
                          <CardDescription>
                            Choose the correct category and subcategory for your document.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <p className="font-medium text-sm">Category:</p>
                            <RadioGroup
                              value={selectedCategoryKey ?? undefined}
                              onValueChange={(val) => {
                                setSelectedCategoryKey(val)
                                setSelectedSubcategoryKey(null) // Reset subcategory when category changes
                              }}
                              className="grid gap-2 sm:grid-cols-2"
                            >
                              {teacherCategories.map((c) => (
                                <label
                                  key={c.key}
                                  className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 cursor-pointer"
                                >
                                  <RadioGroupItem value={c.key} />
                                  <span className="text-sm font-medium">{c.label}</span>
                                </label>
                              ))}
                            </RadioGroup>
                          </div>

                          {/* Show subcategories if category has them */}
                          {selectedCategoryKey &&
                            teacherCategories
                              .find((c) => c.key === selectedCategoryKey)
                              ?.subcategories && (
                              <div className="space-y-2">
                                <p className="font-medium text-sm">Sub-Category:</p>
                                <RadioGroup
                                  value={selectedSubcategoryKey ?? undefined}
                                  onValueChange={(val) => setSelectedSubcategoryKey(val)}
                                  className="grid gap-2 sm:grid-cols-2"
                                >
                                  {teacherCategories
                                    .find((c) => c.key === selectedCategoryKey)
                                    ?.subcategories?.map((sub) => (
                                      <label
                                        key={sub.key}
                                        className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <RadioGroupItem value={sub.key} />
                                        <span className="text-sm font-medium">{sub.label}</span>
                                      </label>
                                    ))}
                                </RadioGroup>
                              </div>
                            )}

                          <Button
                            disabled={
                              !selectedCategoryKey ||
                              (!!teacherCategories.find((c) => c.key === selectedCategoryKey)?.subcategories &&
                                (teacherCategories.find((c) => c.key === selectedCategoryKey)?.subcategories?.length ?? 0) > 0 &&
                                !selectedSubcategoryKey)
                            }
                            onClick={async () => {
                              try {
                                if (!selectedCategoryKey) return

                                const chosenCategory = teacherCategories.find((c) => c.key === selectedCategoryKey)
                                if (!chosenCategory) return

                                // Determine route - use subcategory route if available, otherwise category route
                                let targetRoute = chosenCategory.route
                                let targetFields = chosenCategory.fields

                                if (selectedSubcategoryKey && chosenCategory.subcategories) {
                                  const chosenSubcategory = chosenCategory.subcategories.find(
                                    (s) => s.key === selectedSubcategoryKey
                                  )
                                  if (chosenSubcategory) {
                                    targetRoute = chosenSubcategory.route
                                    targetFields = chosenSubcategory.fields
                                  }
                                }

                                // Store file for document viewer
                                if (selectedFile) {
                                  await new Promise<void>((resolve) => {
                                    const reader = new FileReader()
                                    reader.onload = function (e) {
                                      sessionStorage.setItem("arms_uploaded_file", e.target?.result as string)
                                      sessionStorage.setItem("arms_uploaded_file_name", selectedFile.name)
                                      sessionStorage.setItem("arms_uploaded_file_type", selectedFile.type)
                                      resolve()
                                    }
                                    reader.onerror = () => resolve() // Resolve even on error to not block navigation
                                    reader.readAsDataURL(selectedFile)
                                  })
                                }

                                // Store analysis data for form population
                                sessionStorage.setItem("arms_last_analysis", JSON.stringify(analysis))
                                sessionStorage.setItem("arms_dataFields", JSON.stringify(analysis.classification.dataFields || {}))
                                sessionStorage.setItem("arms_category", selectedCategoryKey)
                                sessionStorage.setItem("arms_subcategory", selectedSubcategoryKey || "")
                                sessionStorage.setItem("arms_auto_fill", "true")

                                router.push(targetRoute)
                                toast({
                                  title: "Redirecting...",
                                  description: `Taking you to ${selectedSubcategoryKey ? chosenCategory.subcategories?.find(s => s.key === selectedSubcategoryKey)?.label : chosenCategory.label} page with auto-filled data`,
                                })
                              } catch (e) {
                                console.error("Navigation error:", e)
                                toast({
                                  title: "Navigation Failed",
                                  description: "Please try again.",
                                  variant: "destructive",
                                })
                              }
                            }}
                            className="w-full"
                          >
                            Continue to Add Page
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extracted Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-700">
                  {Object.entries(analysis.classification.dataFields).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {value}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extracted Text Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded-md max-h-64 overflow-y-auto">
                  {analysis.extractedText || "No extracted text found."}
                </pre>
              </CardContent>
            </Card> */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
