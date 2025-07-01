"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface LLMExtractionProps {
  file: File
  onExtraction: (data: any) => void
  isExtracting: boolean
  extractionType: "publication" | "research" | "patent" | "faculty"
}

export function LLMExtraction({ file, onExtraction, isExtracting, extractionType }: LLMExtractionProps) {
  const [extractionStatus, setExtractionStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [extractedData, setExtractedData] = useState<any>(null)

  const handleExtraction = async () => {
    setExtractionStatus("processing")

    try {
      // Simulate LLM API call
      const mockExtractedData = await simulateLLMExtraction(file, extractionType)

      setExtractedData(mockExtractedData)
      setExtractionStatus("success")
      onExtraction(mockExtractedData)
    } catch (error) {
      setExtractionStatus("error")
      console.error("LLM extraction failed:", error)
    }
  }

  const simulateLLMExtraction = async (file: File, type: string): Promise<any> => {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock extracted data based on type
    switch (type) {
      case "publication":
        return {
          title: "Advanced Machine Learning Techniques for Natural Language Processing",
          authors: ["Dr. John Smith", "Dr. Jane Doe", "Dr. Bob Johnson"],
          journal: "Journal of Artificial Intelligence Research",
          year: "2024",
          volume: "Vol. 45, Issue 2",
          pages: "123-145",
          doi: "10.1234/jair.2024.45.123",
          abstract:
            "This paper presents novel approaches to natural language processing using advanced machine learning techniques...",
          keywords: ["Machine Learning", "NLP", "AI", "Deep Learning"],
          type: "journal",
          level: "international",
        }
      case "research":
        return {
          title: "Development of Sustainable Energy Solutions",
          principalInvestigator: "Dr. Sarah Wilson",
          fundingAgency: "National Science Foundation",
          grantAmount: 500000,
          duration: 36,
          startDate: "2024-01-01",
          endDate: "2026-12-31",
          description: "This project aims to develop innovative sustainable energy solutions...",
          objectives: ["Develop new solar cell technology", "Improve energy efficiency", "Reduce environmental impact"],
        }
      case "patent":
        return {
          title: "Method and System for Automated Data Processing",
          inventors: ["Dr. Alice Brown", "Dr. Charlie Davis"],
          applicationNumber: "US20240123456",
          filingDate: "2024-03-15",
          status: "Pending",
          abstract: "A novel method for automated data processing that improves efficiency...",
        }
      case "faculty":
        return {
          name: "Dr. Michael Johnson",
          email: "michael.johnson@university.edu",
          department: "Computer Science",
          designation: "Associate Professor",
          qualifications: ["PhD in Computer Science", "MS in Software Engineering"],
          experience: 12,
          researchAreas: ["Artificial Intelligence", "Machine Learning", "Data Science"],
        }
      default:
        return {}
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI Document Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{file.name}</Badge>
            <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
          </div>

          {extractionStatus === "idle" && (
            <Button onClick={handleExtraction} disabled={isExtracting}>
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Extract Data"
              )}
            </Button>
          )}

          {extractionStatus === "processing" && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing document...</span>
            </div>
          )}

          {extractionStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Extraction complete</span>
            </div>
          )}

          {extractionStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Extraction failed</span>
            </div>
          )}
        </div>

        {extractionStatus === "processing" && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              AI is analyzing your document and extracting relevant information...
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
          </div>
        )}

        {extractedData && extractionStatus === "success" && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Extracted Information:</h4>
            <div className="space-y-1 text-sm text-green-700">
              {extractionType === "publication" && (
                <>
                  <p>
                    <strong>Title:</strong> {extractedData.title}
                  </p>
                  <p>
                    <strong>Authors:</strong> {extractedData.authors?.join(", ")}
                  </p>
                  <p>
                    <strong>Journal:</strong> {extractedData.journal}
                  </p>
                  <p>
                    <strong>Year:</strong> {extractedData.year}
                  </p>
                </>
              )}
              {extractionType === "research" && (
                <>
                  <p>
                    <strong>Project:</strong> {extractedData.title}
                  </p>
                  <p>
                    <strong>PI:</strong> {extractedData.principalInvestigator}
                  </p>
                  <p>
                    <strong>Funding:</strong> ${extractedData.grantAmount?.toLocaleString()}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
