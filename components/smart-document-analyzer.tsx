// "use client"

// import React, { useState } from 'react'
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Progress } from "@/components/ui/progress"
// import { useToast } from "@/components/ui/use-toast"
// import FileUpload from "@/components/shared/FileUpload"
// import { 
//   CheckCircle, 
//   Loader2,
//   ArrowRight,
//   Brain,
//   Target
// } from "lucide-react"
// import { useRouter } from "next/navigation"

// interface DocumentAnalysis {
//   category: string
//   confidence: number
//   extractedData: {
//     title: string
//     type: string
//     description: string
//   }
//   recommendations: string[]
//   suggestedPages: Array<{
//     name: string
//     path: string
//     description: string
//   }>
// }

// export function SmartDocumentAnalyzer() {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null)
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
//   const [progress, setProgress] = useState(0)
//   const { toast } = useToast()
//   const router = useRouter()

//   const handleFileSelect = (files: FileList | null) => {
//     if (files && files.length > 0) {
//       const file = files[0]
      
//       // Validate file type
//       const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
//       if (!allowedTypes.includes(file.type)) {
//         toast({
//           title: "Invalid File Type",
//           description: "Only PDF, PNG, JPG, and JPEG files are allowed.",
//           variant: "destructive",
//         });
//         return;
//       }

//       // Validate file size (1MB)
//       const maxSize = 1024 * 1024;
//       if (file.size > maxSize) {
//         toast({
//           title: "File Too Large",
//           description: "Maximum file size is 1MB.",
//           variant: "destructive",
//         });
//         return;
//       }

//       setSelectedFile(file)
//       setAnalysis(null) // Reset analysis when new file is selected
//     }
//   }
//   const handleAnalyze = async () => {
//     if (!selectedFile) return;
  
//     setIsAnalyzing(true);
//     setProgress(0);
  
//     try {
//       const formData = new FormData();
//       formData.append("file", selectedFile);
  
//       const response = await fetch("/api/llm/categorize-document", {
//         method: "POST",
//         body: formData,
//       });
  
//       if (!response.ok) {
//         throw new Error("Failed to analyze document");
//       }
  
//       const result = await response.json();
//       setAnalysis(result);
//       setProgress(100);
  
//       toast({
//         title: "Document Analyzed Successfully",
//         description: `Document categorized as: ${result.category}`,
//         variant: "default",
//       });
//     } catch (error) {
//       console.error("Analysis error:", error);
//       toast({
//         title: "Analysis Failed",
//         description: "Failed to analyze document. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };
  
//   // const handleAnalyze = async () => {
//   //   if (!selectedFile) return

//   //   setIsAnalyzing(true)
//   //   setProgress(0)

//   //   try {
//   //     // Simulate progress
//   //     const progressInterval = setInterval(() => {
//   //       setProgress(prev => {
//   //         if (prev >= 90) {
//   //           clearInterval(progressInterval)
//   //           return 90
//   //         }
//   //         return prev + 10
//   //       })
//   //     }, 200)

//   //     // Call LLM API for categorization
//   //     const response = await fetch('/api/llm/categorize-document', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({
//   //         fileName: selectedFile.name,
//   //         fileType: selectedFile.type,
//   //         fileSize: selectedFile.size
//   //       })
//   //     })

//   //     if (!response.ok) {
//   //       throw new Error('Failed to analyze document')
//   //     }

//   //     const result = await response.json()
//   //     setAnalysis(result)
//   //     setProgress(100)
      
//   //     toast({
//   //       title: "Document Analyzed Successfully",
//   //       description: `Document categorized as: ${result.category}`,
//   //       variant: "default",
//   //     })

//   //   } catch (error) {
//   //     console.error('Analysis error:', error)
//   //     toast({
//   //       title: "Analysis Failed",
//   //       description: "Failed to analyze document. Please try again.",
//   //       variant: "destructive",
//   //     })
//   //   } finally {
//   //     setIsAnalyzing(false)
//   //   }
//   // }

//   const handleNavigateToPage = (path: string) => {
//     // Store file information in session storage for the target page
//     if (selectedFile) {
//       const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       sessionStorage.setItem('uploadedFileId', fileId);
//       sessionStorage.setItem('uploadedFileName', selectedFile.name);
//       sessionStorage.setItem('uploadedFileType', selectedFile.type);
//       sessionStorage.setItem('uploadedFileSize', selectedFile.size.toString());
      
//       // Store the actual file in session storage (for small files)
//       const reader = new FileReader();
//       reader.onload = function(e) {
//         sessionStorage.setItem('uploadedFileData', e.target?.result as string);
//       };
//       reader.readAsDataURL(selectedFile);
//     }
//     router.push(path)
//   }

//   const getConfidenceColor = (confidence: number) => {
//     if (confidence >= 0.8) return "bg-green-500"
//     if (confidence >= 0.6) return "bg-yellow-500"
//     return "bg-red-500"
//   }

//   const getConfidenceText = (confidence: number) => {
//     if (confidence >= 0.8) return "High Confidence"
//     if (confidence >= 0.6) return "Medium Confidence"
//     return "Low Confidence"
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Brain className="h-5 w-5" />
//           Smart Document Analyzer
//         </CardTitle>
//         <CardDescription>
//           Upload your document and let AI categorize it for you. Get recommendations for the best place to add your document.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* File Upload */}
//         <div className="space-y-4">
//           <FileUpload 
//             onFileSelect={handleFileSelect}
//             acceptedTypes=".pdf,.png,.jpg,.jpeg"
//             multiple={false}
//           />

//           {selectedFile && (
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-medium">{selectedFile.name}</span>
//                 <Badge variant="secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   setSelectedFile(null)
//                   setAnalysis(null)
//                 }}
//                 disabled={isAnalyzing}
//               >
//                 Remove
//               </Button>
//             </div>
//           )}

//           <Button 
//             onClick={handleAnalyze} 
//             disabled={!selectedFile || isAnalyzing}
//             className="w-full"
//           >
//             {isAnalyzing ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Analyzing Document...
//               </>
//             ) : (
//               <>
//                 <Brain className="mr-2 h-4 w-4" />
//                 Analyze Document
//               </>
//             )}
//           </Button>

//           {isAnalyzing && (
//             <div className="space-y-2">
//               <Progress value={progress} className="w-full" />
//               <p className="text-sm text-gray-600 text-center">
//                 AI is analyzing your document...
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Analysis Results */}
//         {analysis && (
//           <div className="space-y-4">
//             <Alert>
//               <Brain className="h-4 w-4" />
//               <AlertDescription>
//                 Document analysis complete! Here's what we found:
//               </AlertDescription>
//             </Alert>

//             <div className="grid gap-4 md:grid-cols-2">
//               {/* Category Information */}
//               <Card>
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-lg">Document Category</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <span className="font-medium">Category:</span>
//                     <Badge variant="outline" className="capitalize">
//                       {analysis.category}
//                     </Badge>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="font-medium">Confidence:</span>
//                     <div className="flex items-center gap-2">
//                       <div className={`w-3 h-3 rounded-full ${getConfidenceColor(analysis.confidence)}`}></div>
//                       <span className="text-sm">{getConfidenceText(analysis.confidence)}</span>
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <span className="font-medium">Extracted Data:</span>
//                     <div className="text-sm text-gray-600 space-y-1">
//                       <p><strong>Title:</strong> {analysis.extractedData.title}</p>
//                       <p><strong>Type:</strong> {analysis.extractedData.type}</p>
//                       <p><strong>Description:</strong> {analysis.extractedData.description}</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Recommendations */}
//               <Card>
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-lg">AI Recommendations</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     {analysis.recommendations.map((recommendation, index) => (
//                       <div key={index} className="flex items-start gap-2">
//                         <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
//                         <span className="text-sm">{recommendation}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Suggested Pages */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Target className="h-5 w-5" />
//                   Recommended Pages
//                 </CardTitle>
//                 <CardDescription>
//                   Based on the document analysis, here are the best places to add your document:
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid gap-3 md:grid-cols-2">
//                   {analysis.suggestedPages.map((page, index) => (
//                     <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
//                       <div className="flex items-center justify-between">
//                         <div className="space-y-1">
//                           <h4 className="font-medium">{page.name}</h4>
//                           <p className="text-sm text-gray-600">{page.description}</p>
//                         </div>
//                         <Button
//                           size="sm"
//                           onClick={() => handleNavigateToPage(page.path)}
//                           className="ml-2"
//                         >
//                           Go to Page
//                           <ArrowRight className="ml-1 h-3 w-3" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }


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
      "jrf": "jrfSrf",
      "srf": "jrfSrf",
      "jrfsrf": "jrfSrf",
      "phd guidance": "phd",
      "phd": "phd",
      "copyrights": "copyrights",
      "copyright": "copyrights",
    }
    const normalized = subCategory.toLowerCase().trim()
    const tab = subCategoryMap[normalized] || normalized
    
    if (useAddRoute) {
      return `/teacher/research-contributions/${tab}/add`
    }
    return `/teacher/research-contributions?tab=${tab}`
  }

  // Mappings for teacher sections with expected fields and routes
  const teacherCategories: Array<{ key: string; label: string; route: string; fields: string[] }> = [
    { key: "Books/Papers", label: "Books/Papers", route: "/teacher/publication", fields: ["Title", "DOI", "ISSN", "Impact Factor", "Publisher", "Year"] },
    { key: "Books", label: "Books (Authored/Edited)", route: "/teacher/publication/books/add", fields: ["Title", "ISBN", "Publisher", "Year"] },
    { key: "Published Articles/Papers in Journals/Edited Volumes", label: "Published Articles/Papers", route: "/teacher/publication/papers/add", fields: ["Title", "DOI", "ISSN", "Impact Factor", "Journal", "Year"] },
    { key: "Research Projects", label: "Research Projects", route: "/teacher/research/add", fields: ["Project Title", "Funding Agency", "Sanctioned Amount", "Duration", "Start Date", "End Date"] },
    { key: "Research Contributions", label: "Research Contributions", route: "/teacher/research-contributions", fields: ["Title", "Type", "Date", "Details"] },
    { key: "Awards/Recognition", label: "Awards & Recognition", route: "/teacher/awards-recognition/add", fields: ["Award Name", "Awarding Body", "Year"] },
    { key: "Talks/Events", label: "Talks & Events", route: "/teacher/talks-events/add", fields: ["Event Name", "Role", "Date", "Venue"] },
    { key: "Online Engagement", label: "Online Engagement", route: "/teacher/online-engagement/add", fields: ["Platform", "URL", "Topic", "Date"] },
  ]

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null)

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
      const suggested = result?.classification?.category
      const normalized = teacherCategories.find(c => c.key.toLowerCase() === String(suggested || "").toLowerCase())
      setSelectedCategoryKey(normalized ? normalized.key : null)
      setProgress(100)

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
                
                {/* Redirect Button for Categorized Page */}
                {analysis.classification.category && (
                  <div className="pt-2 border-t space-y-3">
                    {/* Field Similarity Warning */}
                    {(() => {
                      const category = analysis.classification.category.toLowerCase()
                      const subCategory = analysis.classification["sub-category"]?.toLowerCase() || ""
                      const dataFields = analysis.classification.dataFields || {}
                      
                      // Check if it's a research contributions category
                      if (category.includes("research") && (category.includes("contribution") || category.includes("consultancy"))) {
                        // Map expected fields for each subcategory
                        const expectedFieldsMap: Record<string, string[]> = {
                          "copyrights": ["title", "reference no", "reference number", "publication date", "link"],
                          "copyright": ["title", "reference no", "reference number", "publication date", "link"],
                          "patents": ["title", "level", "status", "date", "patent application", "patent number"],
                          "policy": ["title", "level", "organisation", "date"],
                          "econtent": ["title", "type", "platform", "date"],
                          "consultancy": ["title", "organisation", "amount", "date"],
                          "collaborations": ["title", "organisation", "type", "date"],
                          "visits": ["title", "organisation", "purpose", "date"],
                          "financial": ["title", "amount", "purpose", "date"],
                          "jrfSrf": ["name", "type", "project title", "duration"],
                          "phd": ["name", "reg no", "registration no", "topic", "date"],
                        }
                        
                        const normalizedSubCat = subCategory || "copyrights"
                        const expectedFields = expectedFieldsMap[normalizedSubCat] || expectedFieldsMap["copyrights"]
                        const similarity = calculateFieldSimilarity(dataFields, expectedFields)
                        
                        if (similarity < 0.3 && Object.keys(dataFields).length > 0) {
                          return (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-yellow-800">
                                <strong>Warning:</strong> Low field match ({Math.round(similarity * 100)}%). 
                                The predicted category might not be correct. Please verify before proceeding.
                              </p>
                            </div>
                          )
                        }
                      } else {
                        // Check against teacher categories
                        const matchedCategory = teacherCategories.find(
                          c => c.key.toLowerCase() === category.toLowerCase()
                        )
                        if (matchedCategory) {
                          const similarity = calculateFieldSimilarity(dataFields, matchedCategory.fields)
                          if (similarity < 0.3 && Object.keys(dataFields).length > 0) {
                            return (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                  <strong>Warning:</strong> Low field match ({Math.round(similarity * 100)}%). 
                                  The predicted category might not be correct. Please verify before proceeding.
                                </p>
                              </div>
                            )
                          }
                        }
                      }
                      return null
                    })()}
                    
                    <Button
                      onClick={() => {
                        try {
                          const category = analysis.classification.category.toLowerCase()
                          const subCategory = analysis.classification["sub-category"]?.toLowerCase() || ""
                          const dataFields = analysis.classification.dataFields || {}
                          
                          // Handle Research & Consultancy or Research Contributions category
                          if (category.includes("research") && (category.includes("contribution") || category.includes("consultancy"))) {
                            // Use add route when we have dataFields
                            const useAddRoute = Object.keys(dataFields).length > 0
                            const route = getResearchContributionsRoute(subCategory || category, useAddRoute)
                            
                            // Store analysis data including dataFields for form population
                            sessionStorage.setItem("arms_last_analysis", JSON.stringify(analysis))
                            sessionStorage.setItem("arms_dataFields", JSON.stringify(dataFields))
                            sessionStorage.setItem("arms_category", category)
                            sessionStorage.setItem("arms_subcategory", subCategory)
                            
                            router.push(route)
                            toast({
                              title: "Redirecting...",
                              description: `Taking you to ${subCategory || "Research Contributions"} ${useAddRoute ? "add" : ""} page`,
                            })
                            return
                          }
                          
                          // Handle other categories
                          const normalized = teacherCategories.find(
                            c => c.key.toLowerCase() === category.toLowerCase()
                          )
                          
                          if (normalized) {
                            // Store analysis data including dataFields
                            sessionStorage.setItem("arms_last_analysis", JSON.stringify(analysis))
                            sessionStorage.setItem("arms_dataFields", JSON.stringify(dataFields))
                            sessionStorage.setItem("arms_category", category)
                            
                            router.push(normalized.route)
                            toast({
                              title: "Redirecting...",
                              description: `Taking you to ${normalized.label} page`,
                            })
                          } else {
                            toast({
                              title: "Route Not Found",
                              description: "Could not determine the correct page. Please select manually below.",
                              variant: "destructive",
                            })
                          }
                        } catch (e) {
                          console.error("Navigation error:", e)
                          toast({
                            title: "Navigation Failed",
                            description: "Please try again or select manually below.",
                            variant: "destructive",
                          })
                        }
                      }}
                      className="w-full sm:w-auto"
                      variant="default"
                    >
                      <span className="hidden sm:inline">
                        Go to {analysis.classification["sub-category"] || analysis.classification.category} Page
                      </span>
                      <span className="sm:hidden">
                        Go to Page
                      </span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is this category correct?</CardTitle>
                <CardDescription>
                  If not, choose the correct category from teacher sections below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedCategoryKey ?? undefined}
                  onValueChange={(val) => setSelectedCategoryKey(val)}
                  className="grid gap-2 sm:grid-cols-2"
                >
                  {teacherCategories.map((c) => (
                    <label key={c.key} className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50">
                      <RadioGroupItem value={c.key} />
                      <span className="text-sm font-medium">{c.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                disabled={!selectedCategoryKey}
                onClick={() => {
                  try {
                    if (!selectedCategoryKey) return
                    const chosen = teacherCategories.find(c => c.key === selectedCategoryKey)
                    if (!chosen) return
                    const returnedFields = Object.keys(analysis.classification.dataFields || {})
                    const overlap = returnedFields.filter(f => chosen.fields.map(x => x.toLowerCase()).includes(f.toLowerCase()))
                    const matchRatio = chosen.fields.length ? overlap.length / chosen.fields.length : 0

                    sessionStorage.setItem("arms_last_analysis", JSON.stringify(analysis))
                    sessionStorage.setItem("arms_selected_category", chosen.key)

                    if (matchRatio >= 0.5) {
                      router.push(chosen.route)
                    } else {
                      toast({
                        title: "Low field match",
                        description: "Fields don’t seem to match well. You can proceed and map manually.",
                      })
                      router.push(chosen.route)
                    }
                  } catch (e) {
                    toast({ title: "Navigation Failed", description: "Please try again.", variant: "destructive" })
                  }
                }}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

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
