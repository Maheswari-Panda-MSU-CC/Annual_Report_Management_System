"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Download, Loader2, CheckSquare, Square, Eye, Search, Filter, X, BookOpen, FileText } from "lucide-react"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useTeacherProfile, useTeacherPublications } from "@/hooks/use-teacher-data"
import { SearchableSelect } from "@/components/ui/searchable-select"
// OLD CLIENT-SIDE PDF GENERATION - COMMENTED OUT (Now using server-side Puppeteer)
// import { jsPDF } from "jspdf"
// import html2canvas from "html2canvas"
import { useState, useMemo, useRef, useEffect } from "react"
import Image from "next/image"

interface JournalArticle {
  id: number
  type: "article"
  srNo: number
  authors: string
  paperTitle: string
  journalNameISSNVolume: string
  publishedYear: string
  doi: string
  indexing: string
  documentSubmitted: string
  level: string
  levelId: number | null
}

interface PaperPresented {
  id: number
  type: "paper"
  srNo: number
  authors: string
  paperTitle: string
  paperTheme: string
  organisingBody: string
  dateOfPublication: string
  documentsSubmitted: string
  level: string
  levelId: number | null
}

interface TeacherInfo {
  abbri:string
  fname: string
  mname: string
  lname: string
}

export default function PublicationCertificate() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { resPubLevelOptions, fetchResPubLevels } = useDropDowns()
  
  // React Query hooks for data fetching
  const { data: profileData, isLoading: profileLoading, isError: profileError } = useTeacherProfile()
  const { journals, papers, isLoading: publicationsLoading, isFetching: publicationsFetching, isError: publicationsError, data: publicationsData } = useTeacherPublications()

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [selectedPublications, setSelectedPublications] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string | number>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Ref for certificate preview section
  const certificatePreviewRef = useRef<HTMLDivElement>(null)

  // Derived loading state
  const isLoading = profileLoading || publicationsLoading

  // Fetch dropdowns on mount
  useEffect(() => {
    if (resPubLevelOptions.length === 0) {
      fetchResPubLevels()
    }
  }, [resPubLevelOptions.length, fetchResPubLevels])

  // Show error toast if data fetching fails
  useEffect(() => {
    if (profileError) {
      toast({
        title: "Error",
        description: "Failed to load teacher profile information",
        variant: "destructive",
      })
    }
  }, [profileError, toast])

  useEffect(() => {
    if (publicationsError) {
      toast({
        title: "Error",
        description: "Failed to load publications",
        variant: "destructive",
        duration: 3000,
      })
    }
  }, [publicationsError, toast])

  // Transform teacher info from React Query data
  const teacherInfo = useMemo<TeacherInfo | null>(() => {
    if (!profileData?.teacherInfo) return null
    return {
      abbri:profileData.teacherInfo.Abbri || "",
      fname: profileData.teacherInfo.fname || "",
      mname: profileData.teacherInfo.mname || "",
      lname: profileData.teacherInfo.lname || "",
    }
  }, [profileData])

  // Transform journal articles from React Query data
  const publishedArticles = useMemo<JournalArticle[]>(() => {
    if (!publicationsData?.journals) return []
    
    return (publicationsData.journals || []).map((item: any, index: number) => {
      const publishedYear = item.month_year
        ? new Date(item.month_year).getFullYear().toString()
        : ""

      // Build indexing string
      const indexingParts = []
      if (item.in_scopus) indexingParts.push("In Scopus: Yes")
      else indexingParts.push("In Scopus: No")
      if (item.in_ugc) indexingParts.push("In UGC CARE: Yes")
      else indexingParts.push("In UGC CARE: No")
      if (item.in_clarivate) indexingParts.push("In Clarivate: Yes")
      else indexingParts.push("In Clarivate: No")

      // Build journal name, ISSN, and volume string
      const journalParts = []
      if (item.journal_name) journalParts.push(`Journal Name: ${item.journal_name}`)
      if (item.issn) journalParts.push(`ISSN: ${item.issn}`)
      if (item.volume_num) journalParts.push(`Volume No.: ${item.volume_num}`)

      return {
        id: item.id,
        type: "article" as const,
        srNo: index + 1,
        authors: item.authors || "",
        paperTitle: item.title || "",
        journalNameISSNVolume: journalParts.join(", "),
        publishedYear,
        doi: item.DOI || "",
        indexing: indexingParts.join(", "),
        documentSubmitted: item.Image ? "Submitted" : "Not Submitted",
        level: item.Res_Pub_Level_Name || "",
        levelId: item.level || null,
      }
    })
  }, [publicationsData?.journals])

  // Transform papers from React Query data
  const papersPresented = useMemo<PaperPresented[]>(() => {
    if (!publicationsData?.papers) return []
    
    return (publicationsData.papers || []).map((item: any, index: number) => {
      const dateOfPublication = item.date
        ? new Date(item.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : ""

      return {
        id: item.papid,
        type: "paper" as const,
        srNo: index + 1,
        authors: item.authors || "",
        paperTitle: item.title_of_paper || "",
        paperTheme: item.theme || "",
        organisingBody: item.organising_body || "",
        dateOfPublication,
        documentsSubmitted: item.Image ? "Submitted" : "Not Submitted",
        level: item.Res_Pub_Level_Name || "",
        levelId: item.level || null,
      }
    })
  }, [publicationsData?.papers])

  // Combined publications for selection
  const allPublications = useMemo(
    () => [
      ...publishedArticles.map((item) => ({ ...item, category: "Published Article" })),
      ...papersPresented.map((item) => ({ ...item, category: "Paper Presented" })),
    ],
    [publishedArticles, papersPresented],
  )

  // Filtered publications
  const filteredPublications = useMemo(() => {
    return allPublications.filter((pub) => {
      const matchesSearch =
        pub.paperTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pub.type === "article" && pub.journalNameISSNVolume.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pub.type === "paper" && pub.paperTheme.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesLevel =
        levelFilter === "all" ||
        (pub.type === "article" && pub.levelId?.toString() === levelFilter) ||
        (pub.type === "paper" && pub.levelId?.toString() === levelFilter)

      return matchesSearch && matchesLevel
    })
  }, [allPublications, searchTerm, levelFilter])

  // Determine salutation based on teacher name
  const getNameWithSalutation = () => {
    if (teacherInfo) {
      return `${teacherInfo.abbri} ${teacherInfo.fname} ${teacherInfo.mname} ${teacherInfo.lname}`
    }
    if (user?.name) {
      return user.name
    }
    return "FirstName MiddleName LastName"
  }

  const handlePreviewCertificate = () => {
    if (selectedPublications.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one publication to preview the certificate.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    certificatePreviewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })

    toast({
      title: "Certificate Preview",
      description: "Scroll down to view the certificate preview.",
      duration: 2000,
    })
  }

  const handleDownloadPDF = async () => {
    if (selectedPublications.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one publication to generate the certificate.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    try {
      setIsGeneratingPDF(true)

      // Prepare data for API
      const requestData = {
        teacherInfo,
        selectedArticles,
        selectedPapers,
        userName: user?.name,
      }

      // Call server-side API to generate PDF
      const response = await fetch("/api/teacher/publication-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to generate PDF" }))
        throw new Error(errorData.error || "Failed to generate PDF")
      }

      // Get PDF blob
      const blob = await response.blob()

      // Generate filename
      const currentDate = new Date().toISOString().split("T")[0]
      const teacherName = teacherInfo
        ? `${teacherInfo.fname}_${teacherInfo.lname}`.replace(/\s+/g, "_")
        : user?.name?.replace(/\s+/g, "_") || "Faculty"
      const filename = `Publication_Certificate_${teacherName}_${currentDate}.pdf`

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "PDF certificate downloaded successfully!",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
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
      setSelectedPublications(filteredPublications.map((pub) => pub.id.toString()))
    } else {
      setSelectedPublications([])
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setLevelFilter("all")
  }

  const hasActiveFilters = searchTerm || (levelFilter !== "all" && levelFilter !== "")

  // Filter selected publications for certificate generation
  const selectedArticles = publishedArticles.filter((pub) =>
    selectedPublications.includes(pub.id.toString()),
  )
  const selectedPapers = papersPresented.filter((pub) => selectedPublications.includes(pub.id.toString()))

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Publication Certificate Generator</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Select publications and generate your certificate</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {[searchTerm, levelFilter !== "all" && levelFilter !== ""].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Button
            onClick={handlePreviewCertificate}
            disabled={selectedPublications.length === 0}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview Certificate</span>
            <span className="sm:hidden">Preview</span>
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Search & Filter Publications</span>
                <span className="sm:hidden">Search & Filter</span>
              </CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">Search Publications</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Title, authors, journal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Publication Level Filter */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">Publication Level</label>
                <SearchableSelect
                  options={[
                    { value: "all", label: "All Levels" },
                    ...resPubLevelOptions.map((level) => ({
                      value: level.id.toString(),
                      label: level.name,
                    })),
                  ]}
                  value={levelFilter === "all" ? "all" : levelFilter}
                  onValueChange={(value) => setLevelFilter(value)}
                  placeholder="Select publication level"
                  emptyMessage="No level found"
                />
              </div>
            </div>

            {/* Filter Results Summary */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200">
              <span className="text-xs sm:text-sm text-gray-600">
                Showing {filteredPublications.length} of {allPublications.length} publications
              </span>
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1">
                  {searchTerm && (
                    <Badge variant="outline" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {levelFilter !== "all" && levelFilter !== "" && (
                    <Badge variant="outline" className="text-xs">
                      Level: {resPubLevelOptions.find((l) => l.id.toString() === levelFilter.toString())?.name || levelFilter}
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
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <span className="flex items-center gap-2 text-base sm:text-lg">
              <span className="hidden sm:inline">Select Publications</span>
              <span className="sm:hidden">Select</span>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {selectedPublications.length} of {filteredPublications.length} selected
              </Badge>
            </span>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handlePreviewCertificate}
                disabled={selectedPublications.length === 0}
                className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview Certificate</span>
                <span className="sm:hidden">Preview</span>
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || selectedPublications.length === 0}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">Generating</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download PDF ({selectedPublications.length})</span>
                    <span className="sm:hidden">Download ({selectedPublications.length})</span>
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading publications...</span>
            </div>
          ) : (
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
                  <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-base sm:text-lg font-medium">No publications found</p>
                  <p className="text-xs sm:text-sm">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                <>
                  {/* Published Articles Section */}
                  {filteredPublications.some((pub) => pub.type === "article") && (
                    <div className="space-y-3">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        <span className="hidden sm:inline">Published Articles/Papers in Journals</span>
                        <span className="sm:hidden">Published Articles</span>
                      </h3>
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                          <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold w-12">
                                <Checkbox
                                  id="select-all-articles"
                                  checked={filteredPublications
                                    .filter((pub) => pub.type === "article")
                                    .every((pub) => selectedPublications.includes(pub.id.toString()))}
                                  onCheckedChange={(checked) => {
                                    const articleIds = filteredPublications
                                      .filter((pub) => pub.type === "article")
                                      .map((pub) => pub.id.toString())
                                    if (checked) {
                                      setSelectedPublications((prev) => [
                                        ...new Set([...prev, ...articleIds]),
                                      ])
                                    } else {
                                      setSelectedPublications((prev) =>
                                        prev.filter((id) => !articleIds.includes(id))
                                      )
                                    }
                                  }}
                                />
                              </th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Sr No.</th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Author(s)</th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Paper Title</th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                                Journal Name & ISSN & Volume No.
                              </th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Published Year</th>
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
                            {filteredPublications
                              .filter((pub) => pub.type === "article")
                              .map((publication) => (
                                <tr
                                  key={publication.id}
                                  className={`hover:bg-gray-50 transition-colors ${
                                    selectedPublications.includes(publication.id.toString())
                                      ? "bg-blue-50"
                                      : ""
                                  }`}
                                >
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                    <Checkbox
                                      id={`pub-${publication.id}`}
                                      checked={selectedPublications.includes(publication.id.toString())}
                                      onCheckedChange={(checked) =>
                                        handleSelectPublication(publication.id.toString(), checked as boolean)
                                      }
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.srNo}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.authors}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.paperTitle}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                    {publication.journalNameISSNVolume}
                                  </td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.publishedYear}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                    {publication.doi ? (
                                      <a
                                        href={`https://doi.org/${publication.doi}`}
                                        className="text-blue-600 hover:underline break-all"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {publication.doi}
                                      </a>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.indexing}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                    <Badge
                                      variant={publication.documentSubmitted === "Submitted" ? "default" : "secondary"}
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
                  {filteredPublications.some((pub) => pub.type === "paper") && (
                    <div className="space-y-3">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        <span className="hidden sm:inline">Papers Presented in Conference/Symposia/Seminar</span>
                        <span className="sm:hidden">Papers Presented</span>
                      </h3>
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                          <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold w-12">
                                <Checkbox
                                  id="select-all-papers"
                                  checked={filteredPublications
                                    .filter((pub) => pub.type === "paper")
                                    .every((pub) => selectedPublications.includes(pub.id.toString()))}
                                  onCheckedChange={(checked) => {
                                    const paperIds = filteredPublications
                                      .filter((pub) => pub.type === "paper")
                                      .map((pub) => pub.id.toString())
                                    if (checked) {
                                      setSelectedPublications((prev) => [
                                        ...new Set([...prev, ...paperIds]),
                                      ])
                                    } else {
                                      setSelectedPublications((prev) =>
                                        prev.filter((id) => !paperIds.includes(id))
                                      )
                                    }
                                  }}
                                />
                              </th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Sr No.</th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Authors</th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Paper Title</th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Paper Theme</th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">Organising Body</th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                                Date of Publication
                              </th>
                              <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                                Documents Submitted?
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPublications
                              .filter((pub) => pub.type === "paper")
                              .map((publication) => (
                                <tr
                                  key={publication.id}
                                  className={`hover:bg-gray-50 transition-colors ${
                                    selectedPublications.includes(publication.id.toString())
                                      ? "bg-blue-50"
                                      : ""
                                  }`}
                                >
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                    <Checkbox
                                      id={`pub-${publication.id}`}
                                      checked={selectedPublications.includes(publication.id.toString())}
                                      onCheckedChange={(checked) =>
                                        handleSelectPublication(publication.id.toString(), checked as boolean)
                                      }
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.srNo}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.authors}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.paperTitle}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.paperTheme}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.organisingBody}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{publication.dateOfPublication}</td>
                                  <td className="border border-gray-300 px-2 sm:px-3 py-2">
                                    <Badge
                                      variant={publication.documentsSubmitted === "Submitted" ? "default" : "secondary"}
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
                </>
              )}

              {selectedPublications.length === 0 && filteredPublications.length > 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Please select at least one publication to generate the certificate.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Preview - Only show if publications are selected */}
      {selectedPublications.length > 0 && (
        <div ref={certificatePreviewRef}>
          <Card className="max-w-full mx-auto shadow-lg">
            <CardHeader className="text-center pb-3 sm:pb-4 p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 hidden sm:block" />
                <CardTitle className="text-base sm:text-xl font-bold text-gray-800">Certificate Preview</CardTitle>
                <div className="flex-1 flex justify-end">
                  <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="flex items-center gap-2 w-full sm:w-auto">
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Generating...</span>
                        <span className="sm:hidden">Generating</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                        <span className="sm:hidden">Download PDF</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-8" id="certificate-content" style={{ position: "relative", margin: "0 auto", maxWidth: "210mm", width: "100%", backgroundColor: "#ffffff", overflow: "visible" }}>
              <style dangerouslySetInnerHTML={{__html: `
                #certificate-content .table-container {
                  width: 100%;
                  margin-bottom: 16px;
                  overflow-x: auto;
                  overflow-y: visible;
                }
                
                #certificate-content table {
                  table-layout: fixed !important;
                  width: 100% !important;
                  border-collapse: collapse;
                  margin-bottom: 16px;
                }
                
                #certificate-content table td,
                #certificate-content table th {
                  overflow-wrap: break-word !important;
                  word-break: break-word !important;
                  hyphens: auto;
                  border: 1px solid #d1d5db;
                  padding: 6px 8px;
                  text-align: left;
                  font-size: 9px;
                  line-height: 1.3;
                  vertical-align: top;
                  max-width: 0;
                  overflow: hidden;
                }
                
                #certificate-content table th {
                  background-color: #f9fafb;
                  font-weight: 600;
                  text-align: center;
                  font-size: 9px;
                  padding: 8px 6px;
                  white-space: normal;
                }
                
                #certificate-content table td {
                  font-size: 9px;
                }
                
                #certificate-content .badge {
                  display: inline-block;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 8px;
                  font-weight: 500;
                  white-space: nowrap !important;
                  line-height: 1.1;
                  text-transform: uppercase;
                  letter-spacing: 0.3px;
                }
                
                @media (min-width: 640px) {
                  #certificate-content table th,
                  #certificate-content table td {
                    font-size: 10px;
                    padding: 8px 10px;
                  }
                  
                  #certificate-content .badge {
                    font-size: 9px;
                    padding: 3px 8px;
                  }
                }
                
                @media (min-width: 768px) {
                  #certificate-content table th,
                  #certificate-content table td {
                    font-size: 11px;
                  }
                  
                  #certificate-content .badge {
                    font-size: 10px;
                  }
                }
              `}} />
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                {/* University Logo */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <Image
                    src="/images/msu-logo.png"
                    alt="MSU Baroda Logo"
                    width={80}
                    height={80}
                    className="object-contain w-16 h-16 sm:w-20 sm:h-20"
                    priority
                  />
                </div>

                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">
                The Maharaja Sayajirao University of Baroda
                </h1>

                <h2 className="text-sm sm:text-lg md:text-xl font-semibold text-blue-600 mb-4 sm:mb-6 border-b-2 border-blue-200 pb-2">
                  PUBLICATION CERTIFICATE
                </h2>
              </div>

              {/* Supervisor Information */}
              <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base md:text-lg text-gray-700">
                  <span className="font-bold text-gray-900">Name of Ph.D. Supervisor:</span>{" "}
                  <span className="font-bold text-md sm:text-xl md:text-md text-blue-700 ml-2">
                    {getNameWithSalutation()}
                  </span>
                </p>
              </div>

              {/* Published Articles Section */}
              {selectedArticles.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 border-b border-gray-300 pb-2">
                    <span className="hidden sm:inline">Published Articles/Papers in Journals</span>
                    <span className="sm:hidden">Published Articles</span>
                  </h3>
                  <div className="table-container">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th style={{ width: "6%" }}>Sr No.</th>
                          <th style={{ width: "11%" }}>Author(s)</th>
                          <th style={{ width: "16%" }}>Paper Title</th>
                          <th style={{ width: "16%" }}>Journal Name & ISSN & Volume No.</th>
                          <th style={{ width: "12%" }}>Published Year</th>
                          <th style={{ width: "11%" }}>DOI</th>
                          <th style={{ width: "18%" }}>Index in Scopus/UGC CARE/Clarivate</th>
                          <th style={{ width: "16%" }}>Document Submitted?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedArticles.map((publication) => (
                          <tr key={publication.id} className="hover:bg-gray-50">
                            <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>{publication.srNo}</td>
                            <td>{publication.authors}</td>
                            <td>{publication.paperTitle}</td>
                            <td>{publication.journalNameISSNVolume}</td>
                            <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>{publication.publishedYear}</td>
                            <td>
                              {publication.doi ? (
                                <span className="text-blue-600 break-all">
                                  {publication.doi}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>{publication.indexing}</td>
                            <td style={{ textAlign: "center" }}>
                              <Badge
                                variant={publication.documentSubmitted === "Submitted" ? "default" : "destructive"}
                                className="badge"
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
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 border-b border-gray-300 pb-2">
                    <span className="hidden sm:inline">Papers Presented in Conference/Symposia/Seminar</span>
                    <span className="sm:hidden">Papers Presented</span>
                  </h3>
                  <div className="table-container">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th style={{ width: "6%" }}>Sr No.</th>
                          <th style={{ width: "14%" }}>Authors</th>
                          <th style={{ width: "18%" }}>Paper Title</th>
                          <th style={{ width: "16%" }}>Paper Theme</th>
                          <th style={{ width: "16%" }}>Organising Body</th>
                          <th style={{ width: "16%" }}>Date of Publication</th>
                          <th style={{ width: "16%" }}>Documents Submitted?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPapers.map((publication) => (
                          <tr key={publication.id} className="hover:bg-gray-50">
                            <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>{publication.srNo}</td>
                            <td>{publication.authors}</td>
                            <td>{publication.paperTitle}</td>
                            <td>{publication.paperTheme}</td>
                            <td>{publication.organisingBody}</td>
                            <td style={{ whiteSpace: "nowrap" }}>{publication.dateOfPublication}</td>
                            <td style={{ textAlign: "center" }}>
                              <Badge
                                variant={publication.documentsSubmitted === "Submitted" ? "default" : "destructive"}
                                className="badge"
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
              <div className="mb-6 sm:mb-8">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  I Undersign, agree that all submitted information in above format is true as per my knowledge and
                  belief.
                </p>
              </div>

              {/* Signature */}
              <div className="flex justify-end mt-8 sm:mt-12">
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-12 sm:mb-16">{getNameWithSalutation()}</p>
                  <div className="border-b border-gray-400 w-32 sm:w-48 mb-2"></div>
                  <p className="text-xs text-gray-500">Signature</p>
                </div>
              </div>

              {/* Date */}
              <div className="mt-6 sm:mt-8 text-right">
                <p className="text-xs sm:text-sm text-gray-600">Date: {new Date().toLocaleDateString("en-GB")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
