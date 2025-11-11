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
import { SearchableSelect } from "@/components/ui/searchable-select"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useState, useMemo, useRef, useEffect, useCallback } from "react"
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
  fname: string
  mname: string
  lname: string
}

export default function PublicationCertificate() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { resPubLevelOptions, fetchResPubLevels } = useDropDowns()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPublications, setSelectedPublications] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [publishedArticles, setPublishedArticles] = useState<JournalArticle[]>([])
  const [papersPresented, setPapersPresented] = useState<PaperPresented[]>([])
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string | number>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Ref for certificate preview section
  const certificatePreviewRef = useRef<HTMLDivElement>(null)

  // Fetch dropdowns on mount
  useEffect(() => {
    if (resPubLevelOptions.length === 0) {
      fetchResPubLevels()
    }
  }, [resPubLevelOptions.length, fetchResPubLevels])

  // Fetch teacher profile to get full name
  const fetchTeacherProfile = useCallback(async () => {
    if (!user?.role_id) return

    try {
      const res = await fetch(`/api/teacher/profile?teacherId=${user.role_id}`)
      if (!res.ok) {
        throw new Error("Failed to fetch teacher profile")
      }
      const data = await res.json()
      if (data.teacherInfo) {
        setTeacherInfo({
          fname: data.teacherInfo.fname || "",
          mname: data.teacherInfo.mname || "",
          lname: data.teacherInfo.lname || "",
        })
      }
    } catch (error: any) {
      console.error("Error fetching teacher profile:", error)
      toast({
        title: "Error",
        description: "Failed to load teacher profile information",
        variant: "destructive",
      })
    }
  }, [user?.role_id, toast])

  // Fetch publications data
  const fetchPublications = useCallback(async () => {
    if (!user?.role_id) return

    setIsLoading(true)
    try {
      // Fetch journals and papers in parallel
      const [journalsRes, papersRes] = await Promise.all([
        fetch(`/api/teacher/publication/journals?teacherId=${user.role_id}`),
        fetch(`/api/teacher/publication/papers?teacherId=${user.role_id}`),
      ])

      const journalsData = await journalsRes.json()
      const papersData = await papersRes.json()

      if (!journalsRes.ok || !journalsData.success) {
        throw new Error(journalsData.error || "Failed to fetch journal articles")
      }

      if (!papersRes.ok || !papersData.success) {
        throw new Error(papersData.error || "Failed to fetch papers")
      }

      // Map journal articles to simplified format
      const mappedArticles: JournalArticle[] = (journalsData.journals || []).map((item: any, index: number) => {
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

      // Map papers to simplified format
      const mappedPapers: PaperPresented[] = (papersData.papers || []).map((item: any, index: number) => {
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

      setPublishedArticles(mappedArticles)
      setPapersPresented(mappedPapers)
    } catch (error: any) {
      console.error("Error fetching publications:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load publications",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.role_id, toast])

  // Fetch data on component mount
  useEffect(() => {
    if (user?.role_id) {
      fetchTeacherProfile()
      fetchPublications()
    }
  }, [user?.role_id, fetchTeacherProfile, fetchPublications])

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
  const getSalutation = () => {
    if (teacherInfo) {
      const parts = [teacherInfo.fname, teacherInfo.mname, teacherInfo.lname].filter(Boolean)
      if (parts.length > 0) {
        return `Dr. ${parts.join(" ")}`
      }
    }
    if (user?.name) {
      if (user.name.toLowerCase().includes("dr.") || user.name.toLowerCase().includes("prof.")) {
        return user.name
      }
      return `Dr. ${user.name}`
    }
    return "Dr. FirstName MiddleName LastName"
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

      // Get the certificate content element
      const certificateElement = document.getElementById("certificate-content")
      if (!certificateElement) {
        throw new Error("Certificate content not found")
      }

      // Wait for images to load
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Ensure images are loaded
      const images = certificateElement.getElementsByTagName("img")
      const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
        if (img.complete) {
          return Promise.resolve()
        }
        return new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
          setTimeout(resolve, 2000)
        })
      })
      await Promise.all(imagePromises)

      // Create canvas from certificate content
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: certificateElement.scrollWidth,
        height: certificateElement.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: certificateElement.scrollWidth,
        windowHeight: certificateElement.scrollHeight,
        logging: false,
        removeContainer: false,
      })

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      })

      // A4 dimensions in mm
      const pageWidth = 210
      const pageHeight = 297
      const margin = 10 // Margin for better appearance

      // Calculate dimensions to fit A4 with margins
      const imgWidth = pageWidth - 2 * margin
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Calculate pages needed
      const usablePageHeight = pageHeight - 2 * margin
      const pagesNeeded = Math.ceil(imgHeight / usablePageHeight)

      let sourceY = 0

      // Add pages
      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) {
          pdf.addPage()
        }

        // Calculate content height for this page
        const remainingHeight = canvas.height - sourceY
        const pageContentHeight = Math.min(
          (usablePageHeight * canvas.width) / imgWidth,
          remainingHeight
        )

        // Create temporary canvas for this page
        const pageCanvas = document.createElement("canvas")
        pageCanvas.width = canvas.width
        pageCanvas.height = pageContentHeight
        const pageCtx = pageCanvas.getContext("2d")

        if (pageCtx) {
          // Draw portion of original canvas
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            pageContentHeight,
            0,
            0,
            canvas.width,
            pageContentHeight
          )

          const pageImgData = pageCanvas.toDataURL("image/png", 1.0)
          const pageImgHeightMM = (pageCanvas.height * imgWidth) / pageCanvas.width

          // Add image to PDF centered horizontally
          const xPosition = margin
          const yPosition = margin
          pdf.addImage(
            pageImgData,
            "PNG",
            xPosition,
            yPosition,
            imgWidth,
            Math.min(pageImgHeightMM, usablePageHeight)
          )
        }

        sourceY += pageContentHeight
      }

      // Generate filename
      const currentDate = new Date().toISOString().split("T")[0]
      const teacherName = teacherInfo
        ? `${teacherInfo.fname}_${teacherInfo.lname}`.replace(/\s+/g, "_")
        : user?.name?.replace(/\s+/g, "_") || "Faculty"
      const filename = `Publication_Certificate_${teacherName}_${currentDate}.pdf`

      // Save PDF
      pdf.save(filename)

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
                {[searchTerm, levelFilter !== "all" && levelFilter !== ""].filter(Boolean).length}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Publication Level Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Publication Level</label>
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
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No publications found</p>
                  <p className="text-sm">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                <>
                  {/* Published Articles Section */}
                  {filteredPublications.some((pub) => pub.type === "article") && (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-800 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Published Articles/Papers in Journals
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
                      <h3 className="text-base font-semibold text-gray-800 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Papers Presented in Conference/Symposia/Seminar
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
            <CardContent className="p-4 sm:p-8" id="certificate-content" style={{ position: "relative", margin: "0 auto", maxWidth: "210mm" }}>
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
                          <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                            Sr No.
                          </th>
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
                          <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-semibold">
                            Sr No.
                          </th>
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
