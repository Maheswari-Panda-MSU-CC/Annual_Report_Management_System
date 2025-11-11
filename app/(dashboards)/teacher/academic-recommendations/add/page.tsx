"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, BookOpen, Newspaper, FileCheck, Loader2, Brain } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { JournalArticlesForm } from "@/components/forms/JournalArticlesForm"
import { BooksForm } from "@/components/forms/BooksForm"
import { MagazinesForm } from "@/components/forms/MagazinesForm"
import { TechReportsForm } from "@/components/forms/TechReportsForm"
import FileUpload from "@/components/shared/FileUpload"

export default function AddAcademicRecommendationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("articles")
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const form = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const fetchedDropdownsRef = useRef<Set<string>>(new Set())
  const fetchingDropdownsRef = useRef<Set<string>>(new Set())

  // Fetch dropdowns
  const {
    resPubLevelOptions,
    journalEditedTypeOptions,
    bookTypeOptions,
    fetchResPubLevels,
    fetchJournalEditedTypes,
    fetchBookTypes,
  } = useDropDowns()

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["articles", "books", "magazines", "technical"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Reset form when tab changes
  useEffect(() => {
    form.reset()
    form.clearErrors()
  }, [activeTab, form])

  // Fetch dropdowns for tabs
  const fetchDropdownsForTab = useCallback((tab: string) => {
    if (tab === "articles") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("resPubLevelOptions") &&
          !fetchingDropdownsRef.current.has("resPubLevelOptions") &&
          resPubLevelOptions.length === 0) {
        fetchingDropdownsRef.current.add("resPubLevelOptions")
        dropdownsToFetch.push(
          fetchResPubLevels()
            .then(() => {
              fetchedDropdownsRef.current.add("resPubLevelOptions")
            })
            .catch(error => {
              console.error("Error fetching res pub levels:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("resPubLevelOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("journalEditedTypeOptions") &&
          !fetchingDropdownsRef.current.has("journalEditedTypeOptions") &&
          journalEditedTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("journalEditedTypeOptions")
        dropdownsToFetch.push(
          fetchJournalEditedTypes()
            .then(() => {
              fetchedDropdownsRef.current.add("journalEditedTypeOptions")
            })
            .catch(error => {
              console.error("Error fetching journal edited types:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("journalEditedTypeOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for articles:", error)
        })
      }
    } else if (tab === "books") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("resPubLevelOptions") &&
          !fetchingDropdownsRef.current.has("resPubLevelOptions") &&
          resPubLevelOptions.length === 0) {
        fetchingDropdownsRef.current.add("resPubLevelOptions")
        dropdownsToFetch.push(
          fetchResPubLevels()
            .then(() => {
              fetchedDropdownsRef.current.add("resPubLevelOptions")
            })
            .catch(error => {
              console.error("Error fetching res pub levels:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("resPubLevelOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("bookTypeOptions") &&
          !fetchingDropdownsRef.current.has("bookTypeOptions") &&
          bookTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("bookTypeOptions")
        dropdownsToFetch.push(
          fetchBookTypes()
            .then(() => {
              fetchedDropdownsRef.current.add("bookTypeOptions")
            })
            .catch(error => {
              console.error("Error fetching book types:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("bookTypeOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for books:", error)
        })
      }
    }
  }, [resPubLevelOptions.length, journalEditedTypeOptions.length, bookTypeOptions.length, fetchResPubLevels, fetchJournalEditedTypes, fetchBookTypes])

  // Fetch dropdowns when tab changes
  useEffect(() => {
    if (activeTab) {
      fetchDropdownsForTab(activeTab)
    }
  }, [activeTab, fetchDropdownsForTab])

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleExtractInfo = useCallback(async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
        toast({
          title: "No Document Uploaded",
          description: "Please upload a document before extracting information.",
          variant: "destructive",
        })
        return
      }

      setIsExtracting(true)
      try {
      // Simulate document processing
        await new Promise((resolve) => setTimeout(resolve, 1000))

      // TODO: Implement actual extraction logic
      toast({
        title: "Extraction Complete",
        description: "Information extracted successfully. Please review and verify the fields.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to extract information",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }, [selectedFiles, toast])

  const handleSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      let apiUrl = ""
      let payload: any = {}

      if (activeTab === "articles") {
        apiUrl = "/api/teacher/academic-recommendations/journal-articles"
        payload = {
          teacherId: user.role_id,
          journal: {
            title: data.title,
            issn: data.issn || null,
            eISSN: data.eISSN || null,
            publisherName: data.publisherName || null,
            volume_num: data.volume_num ? parseInt(data.volume_num) : null,
            level: data.level || null,
            peer_reviewed: data.peer_reviewed || false,
            h_index: data.h_index ? parseFloat(data.h_index) : null,
            impact_factor: data.impact_factor ? parseFloat(data.impact_factor) : null,
            in_scopus: data.in_scopus || false,
            type: data.type || null,
            in_ugc: data.in_ugc || false,
            in_clarivate: data.in_clarivate || false,
            doi: data.doi || null,
            in_oldUGCList: data.in_oldUGCList || false,
            noofIssuePerYr: data.noofIssuePerYr ? parseInt(data.noofIssuePerYr) : null,
            price: data.price ? parseFloat(data.price) : null,
            currency: data.currency || null,
          },
        }
      } else if (activeTab === "books") {
        apiUrl = "/api/teacher/academic-recommendations/books"
        payload = {
          teacherId: user.role_id,
          book: {
            title: data.title,
            authors: data.authors || null,
            isbn: data.isbn || null,
            book_category: data.book_category || null,
            publisher_name: data.publisher_name || null,
            publishing_level: data.publishing_level || null,
            book_type: data.book_type || null,
            edition: data.edition || null,
            volume: data.volume || null,
            ebook: data.ebook || null,
            digital_media: data.digital_media || null,
            approx_price: data.approx_price ? parseFloat(data.approx_price) : null,
            currency: data.currency || null,
            publication_date: data.publication_date || null,
            proposed_ay: data.proposed_ay || null,
          },
        }
      } else if (activeTab === "magazines") {
        apiUrl = "/api/teacher/academic-recommendations/magazines"
        payload = {
          teacherId: user.role_id,
          magazine: {
            title: data.title,
            mode: data.mode || null,
            category: data.category || null,
            is_additional_attachment: data.is_additional_attachment || false,
            additional_attachment: data.additional_attachment || null,
            publication_date: data.publication_date || null,
            publishing_agency: data.publishing_agency || null,
            volume: data.volume || null,
            no_of_issue_per_yr: data.no_of_issue_per_yr ? parseInt(data.no_of_issue_per_yr) : null,
            price: data.price ? parseFloat(data.price) : null,
            currency: data.currency || null,
          },
        }
      } else if (activeTab === "technical") {
        apiUrl = "/api/teacher/academic-recommendations/tech-reports"
        payload = {
          teacherId: user.role_id,
          techReport: {
            title: data.title,
            subject: data.subject || null,
            publisher_name: data.publisher_name || null,
            publication_date: data.publication_date || null,
            no_of_issue_per_year: data.no_of_issue_per_year ? parseInt(data.no_of_issue_per_year) : null,
            price: data.price ? parseFloat(data.price) : null,
            currency: data.currency || null,
          },
        }
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add record")
      }

          toast({
            title: "Success",
        description: `"${data.title}" has been added successfully!`,
        duration: 3000,
      })

      // Reset form
      form.reset()
      setSelectedFiles(null)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/teacher/academic-recommendations?tab=${activeTab}`)
      }, 1000)
    } catch (error: any) {
      console.error("Error adding record:", error)
        toast({
          title: "Error",
        description: error.message || "Failed to add record",
          variant: "destructive",
        duration: 3000,
        })
      } finally {
      setIsSubmitting(false)
    }
  }

  const renderForm = () => {
    switch (activeTab) {
      case "articles":
        return (
          <JournalArticlesForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            editData={{}}
            resPubLevelOptions={resPubLevelOptions}
            journalEditedTypeOptions={journalEditedTypeOptions}
          />
        )
      case "books":
        return (
          <BooksForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            editData={{}}
            resPubLevelOptions={resPubLevelOptions}
            bookTypeOptions={bookTypeOptions}
          />
        )
      case "magazines":
        return (
          <MagazinesForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            editData={{}}
          />
        )
      case "technical":
        return (
          <TechReportsForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={false}
            editData={{}}
          />
        )
      default:
        return null
    }
  }

  const sections = [
    {
      id: "articles",
      title: "Articles/Journals/Edited Volumes",
      icon: FileText,
    },
    {
      id: "books",
      title: "Books",
      icon: BookOpen,
    },
    {
      id: "magazines",
      title: "Magazines",
      icon: Newspaper,
    },
    {
      id: "technical",
      title: "Technical Report and Other(s)",
      icon: FileCheck,
    },
  ]

  return (
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Add Teacher's Recommendation(s) for Journals/Databases and other Learning Resources
            </h1>
            <p className="text-muted-foreground">Add recommendations for academic resources</p>
          </div>
        </div>

        {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
          {sections.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
              <section.icon className="h-4 w-4" />
              {section.title}
            </TabsTrigger>
          ))}
          </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                <CardDescription>
                  Fill in the details below to add a new {section.title.toLowerCase()} recommendation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderForm()}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
        </Tabs>
      </div>
  )
}
