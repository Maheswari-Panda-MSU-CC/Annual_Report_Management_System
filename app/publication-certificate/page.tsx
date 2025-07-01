"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useState } from "react"

// Sample publication data
const samplePublications = [
  {
    id: 1,
    authors: "Dr. John Smith, Dr. Jane Doe",
    title: "Advanced Machine Learning Techniques in Data Science",
    journal: "International Journal of Computer Science, ISSN: 1234-5678, Volume: 15",
    year: "2023",
    doi: "10.1000/182",
    indexing: ["Scopus", "UGC CARE"],
    documentSubmitted: "Yes",
  },
  {
    id: 2,
    authors: "Dr. Jane Doe, Prof. Mike Johnson",
    title: "Sustainable Energy Solutions for Smart Cities",
    journal: "Journal of Renewable Energy, ISSN: 9876-5432, Volume: 8",
    year: "2023",
    doi: "10.1000/183",
    indexing: ["Scopus", "Clarivate"],
    documentSubmitted: "Yes",
  },
  {
    id: 3,
    authors: "Dr. John Smith",
    title: "Blockchain Technology in Healthcare Systems",
    journal: "Medical Technology Review, ISSN: 5555-1111, Volume: 12",
    year: "2022",
    doi: "10.1000/184",
    indexing: ["UGC CARE"],
    documentSubmitted: "No",
  },
]

export default function PublicationCertificate() {
  const { user } = useAuth()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true)

      // Get the certificate content element
      const certificateElement = document.getElementById("certificate-content")
      if (!certificateElement) {
        throw new Error("Certificate content not found")
      }

      // Create canvas from the certificate content
      const canvas = await html2canvas(certificateElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: certificateElement.scrollWidth,
        height: certificateElement.scrollHeight,
      })

      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate dimensions to fit A4
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0]
      const filename = `Publication_Certificate_${user?.name?.replace(/\s+/g, "_") || "Faculty"}_${currentDate}.pdf`

      // Save the PDF
      pdf.save(filename)

      // Show success message
      alert("PDF downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again or use the print option.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-end gap-4 print:hidden">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Certificate
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        {/* Certificate Content */}
        <Card className="max-w-full mx-auto print:shadow-none print:border-none" id="certificate-content">
          <CardContent className="p-8 print:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              {/* University Logo Placeholder */}
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">MSU</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">MAHARAJA SAIYAJIRAO UNIVERSITY OF BARODA</h1>

              <h2 className="text-xl font-semibold text-blue-600 mb-6 border-b-2 border-blue-200 pb-2">
                PUBLICATION CERTIFICATE
              </h2>
            </div>

            {/* Supervisor Information */}
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold">Name of Ph.D. Supervisor:</span> Ms.
                {user?.name || "FirstName MiddleName LastName"}
              </p>
            </div>

            {/* Publications Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">Sr No.</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">Author(s)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">Paper Title</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">
                      Journal Name & ISSN & Volume No.
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">Published Year</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">DOI</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">
                      Index in Scopus/UGC CARE/Clarivate
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">
                      Document Submitted?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {samplePublications.map((publication, index) => (
                    <tr key={publication.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{publication.authors}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{publication.title}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{publication.journal}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{publication.year}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <a
                          href={`https://doi.org/${publication.doi}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {publication.doi}
                        </a>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {publication.indexing.map((index) => (
                            <Badge
                              key={index}
                              variant={index === "Scopus" ? "default" : index === "UGC CARE" ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {index}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <Badge
                          variant={publication.documentSubmitted === "Yes" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {publication.documentSubmitted}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Declaration */}
            <div className="mb-8">
              <p className="text-sm text-gray-700 leading-relaxed">
                I Undersign, agree that all submitted information in above format is true as per my knowledge and
                belief.
              </p>
            </div>

            {/* Signature */}
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700 mb-8">
                  Ms.{user?.name || "FirstName MiddleName LastName"}
                </p>
                <div className="border-b border-gray-400 w-48 mb-2"></div>
                <p className="text-xs text-gray-500">Signature</p>
              </div>
            </div>

            {/* Date */}
            <div className="mt-8 text-right">
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString("en-GB")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
