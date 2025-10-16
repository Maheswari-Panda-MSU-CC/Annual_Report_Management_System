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
import { Loader2, Brain, FileText } from "lucide-react"

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

      if (!response.ok) throw new Error("Failed to analyze document")

      const result = await response.json()
      setAnalysis(result)
      setProgress(100)

      toast({
        title: "Document Analyzed Successfully",
        description: `Category: ${result.classification.category}`,
      })
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: "Please try again.",
        variant: "destructive",
      })
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
              <CardContent className="space-y-2">
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
