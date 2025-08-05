"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Loader2, CheckSquare, Square, Eye, Search, Filter, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useState, useMemo, useRef } from "react"
import Image from "next/image"

// Published Articles/Papers in Journals Data
const publishedArticles = [
  {
    id: "article-1",
    type: "article",
    srNo: 1,
    authors: "Dr. John Smith, Dr. Jane Doe",
    paperTitle: "Advanced Machine Learning Techniques in Healthcare Diagnostics",
    journalNameISSNVolume: "Journal Name: IEEE Transactions on Medical Imaging, ISSN: 02780062, Volume No.: 42",
    publishedYear: "2023",
    doi: "10.1109/TMI.2023.1234567",
    indexing: "In Scopus: Yes, In UGC CARE: Yes, In Clarivate: Yes",
    documentSubmitted: "Submitted",
  },
  {
    id: "article-2",
    type: "article",
    srNo: 2,
    authors: "Dr. Sarah Wilson, Prof. Mike Johnson",
    paperTitle: "Sustainable Energy Solutions for Smart Cities",
    journalNameISSNVolume: "Journal Name: Journal of Renewable Energy, ISSN: 9876543210, Volume No.: 15",
    publishedYear: "2023",
    doi: "10.1016/j.renene.2023.456789",
    indexing: "In Scopus: Yes, In UGC CARE: No, In Clarivate: Yes",
    documentSubmitted: "Submitted",
  },
  {
    id: "article-3",
    type: "article",
    srNo: 3,
    authors: "Dr. Alice Brown",
    paperTitle: "Blockchain Technology in Financial Systems",
    journalNameISSNVolume: "Journal Name: Financial Technology Review, ISSN: 5555111122, Volume No.: 8",
    publishedYear: "2024",
    doi: "10.1007/s12345-024-0123",
    indexing: "In Scopus: No, In UGC CARE: Yes, In Clarivate: No",
    documentSubmitted: "Submitted",
  },
  {
    id: "article-4",
    type: "article",
    srNo: 4,
    authors: "Dr. Robert Chen, Dr. Lisa Wang",
    paperTitle: "Quantum Computing Applications in Cryptography",
    journalNameISSNVolume: "Journal Name: Quantum Information Processing, ISSN: 1570-0755, Volume No.: 22",
    publishedYear: "2024",
    doi: "10.1007/s11128-024-4321",
    indexing: "In Scopus: Yes, In UGC CARE: Yes, In Clarivate: Yes",
    documentSubmitted: "Submitted",
  },
  {
    id: "article-5",
    type: "article",
    srNo: 5,
    authors: "Dr. Maria Garcia",
    paperTitle: "Artificial Intelligence in Drug Discovery",
    journalNameISSNVolume: "Journal Name: Nature Drug Discovery, ISSN: 1474-1776, Volume No.: 23",
    publishedYear: "2024",
    doi: "10.1038/s41573-024-0987",
    indexing: "In Scopus: Yes, In UGC CARE: Yes, In Clarivate: Yes",
    documentSubmitted: "Submitted",
  },
]

// Papers Presented in Conference/Symposia/Seminar Data
const papersPresented = [
  {
    id: "paper-1",
    type: "paper",
    srNo: 1,
    authors: "Dr. John Smith, Dr. Alice Brown",
    paperTitle: "Deep Learning Applications in Medical Image Analysis",
    paperTheme: "Artificial Intelligence in Healthcare",
    organisingBody: "IEEE Computer Society",
    dateOfPublication: "15-10-2023",
    documentsSubmitted: "Submitted",
  },
  {
    id: "paper-2",
    type: "paper",
    srNo: 2,
    authors: "Dr. Sarah Wilson",
    paperTitle: "Renewable Energy Integration in Smart Grids",
    paperTheme: "Sustainable Energy Technologies",
    organisingBody: "International Energy Conference",
    dateOfPublication: "22-09-2023",
    documentsSubmitted: "Submitted",
  },
  {
    id: "paper-3",
    type: "paper",
    srNo: 3,
    authors: "Dr. Mike Johnson, Dr. Jane Doe",
    paperTitle: "Cybersecurity Challenges in IoT Networks",
    paperTheme: "Internet of Things Security",
    organisingBody: "ACM Security Symposium",
    dateOfPublication: "05-11-2023",
    documentsSubmitted: "Submitted",
  },
  {
    id: "paper-4",
    type: "paper",
    srNo: 4,
    authors: "Dr. Robert Chen",
    paperTitle: "Machine Learning for Climate Prediction",
    paperTheme: "Environmental Data Science",
    organisingBody: "Climate Science Conference",
    dateOfPublication: "18-12-2023",
    documentsSubmitted: "Submitted",
  },
  {
    id: "paper-5",
    type: "paper",
    srNo: 5,
    authors: "Dr. Lisa Wang, Dr. Maria Garcia",
    paperTitle: "Blockchain in Supply Chain Management",
    paperTheme: "Digital Transformation",
    organisingBody: "International Business Technology Summit",
    dateOfPublication: "25-01-2024",
    documentsSubmitted: "Submitted",
  },
]

export default function PublicationCertificate() {
  const { user } = useAuth()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [selectedPublications, setSelectedPublications] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [authorFilter, setAuthorFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Ref for certificate preview section
  const certificatePreviewRef = useRef<HTMLDivElement>(null)

  // Combined publications for selection
  const allPublications = useMemo(
    () => [
      ...publishedArticles.map((item) => ({ ...item, category: "Published Article" })),
      ...papersPresented.map((item) => ({ ...item, category: "Paper Presented" })),
    ],
    [],
  )

  // Filtered publications
  const filteredPublications = useMemo(() => {
    return allPublications.filter((pub) => {
      const matchesSearch =
        pub.paperTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pub.type === "article" && pub.journalNameISSNVolume.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pub.type === "paper" && pub.paperTheme.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesYear =
        yearFilter === "all" ||
        (pub.type === "article" && pub.publishedYear === yearFilter) ||
        (pub.type === "paper" && pub.dateOfPublication.includes(yearFilter))

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "articles" && pub.type === "article") ||
        (typeFilter === "papers" && pub.type === "paper")

      const matchesAuthor = authorFilter === "" || pub.authors.toLowerCase().includes(authorFilter.toLowerCase())

      return matchesSearch && matchesYear && matchesType && matchesAuthor
    })
  }, [allPublications, searchTerm, yearFilter, typeFilter, authorFilter])

  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = new Set<string>()
    publishedArticles.forEach((pub) => years.add(pub.publishedYear))
    papersPresented.forEach((pub) => years.add(pub.dateOfPublication.split("-")[2]))
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }, [])

  // Determine salutation based on user name or default to Dr.
  const getSalutation = () => {
    if (user?.name) {
      // Check if name already contains a title
      if (user.name.toLowerCase().includes("dr.") || user.name.toLowerCase().includes("prof.")) {
        return user.name
      }
      // Default to Dr. for academic context
      return `Dr. ${user.name}`
    }
    return "Dr. FirstName MiddleName LastName"
  }

  const handlePreviewCertificate = () => {
    if (selectedPublications.length === 0) {
      alert("Please select at least one publication to preview the certificate.")
      return
    }

    // Smooth scroll to certificate preview
    certificatePreviewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const handleDownloadPDF = async () => {
    if (selectedPublications.length === 0) {
      alert("Please select at least one publication to generate the certificate.")
      return
    }

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
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleSelectPublication = (publicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedPublications((prev) => [...prev, publicationId])
    } else {
      setSelectedPublications((prev) => prev.filter((id) => id !== publicationId))
      setSelectAll(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedPublications(filteredPublications.map((pub) => pub.id))
    } else {
      setSelectedPublications([])
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setYearFilter("all")
    setTypeFilter("all")
    setAuthorFilter("")
  }

  const hasActiveFilters = searchTerm || yearFilter !== "all" || typeFilter !== "all" || authorFilter

  // Filter selected publications for certificate generation
  const selectedArticles = publishedArticles.filter((pub) => selectedPublications.includes(pub.id))
  const selectedPapers = papersPresented.filter((pub) => selectedPublications.includes(pub.id))

  return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Publication Certificate Generator</h1>
            <p className="text-gray-600 mt-1">Select publications and generate your certificate</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {[searchTerm, yearFilter !== "all", typeFilter !== "all", authorFilter].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            <Button
              onClick={handlePreviewCertificate}
              disabled={selectedPublications.length === 0}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Certificate
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter Publications
                </CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Search Publications</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Title, authors, journal..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Publication Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Publication Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="articles">Journal Articles</SelectItem>
                      <SelectItem value="papers">Conference Papers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Publication Year</label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Author Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Author Name</label>
                  <Input
                    placeholder="Filter by author..."
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Results Summary */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200">
                <span className="text-sm text-gray-600">
                  Showing {filteredPublications.length} of {allPublications.length} publications
                </span>
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-1">
                    {searchTerm && (
                      <Badge variant="outline" className="text-xs">
                        Search: "{searchTerm}"
                      </Badge>
                    )}
                    {typeFilter !== "all" && (
                      <Badge variant="outline" className="text-xs">
                        Type: {typeFilter === "articles" ? "Journal Articles" : "Conference Papers"}
                      </Badge>
                    )}
                    {yearFilter !== "all" && (
                      <Badge variant="outline" className="text-xs">
                        Year: {yearFilter}
                      </Badge>
                    )}
                    {authorFilter && (
                      <Badge variant="outline" className="text-xs">
                        Author: "{authorFilter}"
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selection Summary and Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="flex items-center gap-2">
                Select Publications
                <Badge variant="secondary" className="text-sm">
                  {selectedPublications.length} of {filteredPublications.length} selected
                </Badge>
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviewCertificate}
                  disabled={selectedPublications.length === 0}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Eye className="h-4 w-4" />
                  Preview Certificate
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF || selectedPublications.length === 0}
                  className="flex items-center gap-2"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF ({selectedPublications.length})
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Select All Checkbox */}
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  disabled={filteredPublications.length === 0}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  Select All Filtered Publications ({filteredPublications.length})
                </label>
                {selectAll ? (
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
              </div>

              {filteredPublications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No publications found</p>
                  <p className="text-sm">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                <>
                  {/* Published Articles Section */}
                  {filteredPublications.some((pub) => pub.type === "article") && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
                        Published Articles/Papers in Journals
                      </h3>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredPublications
                          .filter((pub) => pub.type === "article")
                          .map((publication) => (
                            <div
                              key={publication.id}
                              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                                selectedPublications.includes(publication.id)
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-white border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <Checkbox
                                id={`pub-${publication.id}`}
                                checked={selectedPublications.includes(publication.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectPublication(publication.id, checked as boolean)
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`pub-${publication.id}`}
                                  className="text-sm font-medium text-gray-900 cursor-pointer block"
                                >
                                  {publication.paperTitle}
                                </label>
                                <p className="text-xs text-gray-600 mt-1">
                                  {publication.authors} • {publication.publishedYear}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {publication.journalNameISSNVolume}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <Badge variant="default" className="text-xs">
                                    Published Article
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    DOI: {publication.doi}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Papers Presented Section */}
                  {filteredPublications.some((pub) => pub.type === "paper") && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
                        Papers Presented in Conference/Symposia/Seminar
                      </h3>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredPublications
                          .filter((pub) => pub.type === "paper")
                          .map((publication) => (
                            <div
                              key={publication.id}
                              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                                selectedPublications.includes(publication.id)
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-white border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <Checkbox
                                id={`pub-${publication.id}`}
                                checked={selectedPublications.includes(publication.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectPublication(publication.id, checked as boolean)
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`pub-${publication.id}`}
                                  className="text-sm font-medium text-gray-900 cursor-pointer block"
                                >
                                  {publication.paperTitle}
                                </label>
                                <p className="text-xs text-gray-600 mt-1">
                                  {publication.authors} • {publication.dateOfPublication}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Theme: {publication.paperTheme}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  Organising Body: {publication.organisingBody}
                                </p>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  Paper Presented
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedPublications.length === 0 && filteredPublications.length > 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Please select at least one publication to generate the certificate.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certificate Preview - Only show if publications are selected */}
        {selectedPublications.length > 0 && (
          <div ref={certificatePreviewRef}>
            <Card className="max-w-full mx-auto shadow-lg" >
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1" />
                  <CardTitle className="text-xl font-bold text-gray-800">Certificate Preview</CardTitle>
                  <div className="flex-1 flex justify-end">
                    <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="flex items-center gap-2">
                      {isGeneratingPDF ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-8" id="certificate-content">
                {/* Header */}
                <div className="text-center mb-8">
                  {/* University Logo */}
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/images/msu-logo.png"
                      alt="MSU Baroda Logo"
                      width={80}
                      height={80}
                      className="object-contain"
                      priority
                    />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    MAHARAJA SAIYAJIRAO UNIVERSITY OF BARODA
                  </h1>

                  <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mb-6 border-b-2 border-blue-200 pb-2">
                    PUBLICATION CERTIFICATE
                  </h2>
                </div>

                {/* Supervisor Information */}
                <div className="mb-6">
                  <p className="text-base sm:text-lg font-medium text-gray-700">
                    <span className="font-semibold">Name of Ph.D. Supervisor:</span> {getSalutation()}
                  </p>
                </div>

                {/* Published Articles Section */}
                {selectedArticles.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                      Published Articles/Papers in Journals
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Sr No.</th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Author(s)
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Paper Title
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Journal Name & ISSN & Volume No.
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Published Year
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">DOI</th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Index in Scopus/UGC CARE/Clarivate
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Document Submitted?
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedArticles.map((publication) => (
                            <tr key={publication.id} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.srNo}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.authors}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.paperTitle}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                {publication.journalNameISSNVolume}
                              </td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.publishedYear}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                <a
                                  href={`https://doi.org/${publication.doi}`}
                                  className="text-blue-600 hover:underline break-all"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {publication.doi}
                                </a>
                              </td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.indexing}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                <Badge
                                  variant={publication.documentSubmitted === "Submitted" ? "default" : "destructive"}
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
                  </div>
                )}

                {/* Papers Presented Section */}
                {selectedPapers.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                      Papers Presented in Conference/Symposia/Seminar
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Sr No.</th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Authors
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Paper Title
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Paper Theme
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Organising Body
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Date of Publication
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                              Documents Submitted?
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPapers.map((publication) => (
                            <tr key={publication.id} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.srNo}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.authors}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.paperTitle}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.paperTheme}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.organisingBody}</td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                {publication.dateOfPublication}
                              </td>
                              <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                <Badge
                                  variant={publication.documentsSubmitted === "Submitted" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {publication.documentsSubmitted}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

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
                    <p className="text-sm font-medium text-gray-700 mb-8">{getSalutation()}</p>
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
        )}
      </div>
  )
}
