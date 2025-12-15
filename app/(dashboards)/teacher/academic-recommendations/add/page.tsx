"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, BookOpen, Newspaper, FileCheck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useArticlesMutations, useBooksMutations, useMagazinesMutations, useTechReportsMutations } from "@/hooks/use-teacher-academic-recommendations-mutations"
import { JournalArticlesForm } from "@/components/forms/JournalArticlesForm"
import { BooksForm } from "@/components/forms/BooksForm"
import { MagazinesForm } from "@/components/forms/MagazinesForm"
import { TechReportsForm } from "@/components/forms/TechReportsForm"

export default function AddAcademicRecommendationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("articles")
  const form = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  // Mutation hooks
  const articlesMutations = useArticlesMutations()
  const booksMutations = useBooksMutations()
  const magazinesMutations = useMagazinesMutations()
  const techReportsMutations = useTechReportsMutations()

  // Derive submitting state from mutations
  const isSubmitting = articlesMutations.createMutation.isPending || 
                       booksMutations.createMutation.isPending || 
                       magazinesMutations.createMutation.isPending || 
                       techReportsMutations.createMutation.isPending

  // Fetch dropdowns (handled internally by useDropDowns hook)
  const {
    resPubLevelOptions,
    journalEditedTypeOptions,
    bookTypeOptions,
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


  const handleSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      let payload: any = {}

      if (activeTab === "articles") {
        payload = {
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
        }
        await articlesMutations.createMutation.mutateAsync(payload)
      } else if (activeTab === "books") {
        payload = {
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
        }
        await booksMutations.createMutation.mutateAsync(payload)
      } else if (activeTab === "magazines") {
        payload = {
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
        }
        await magazinesMutations.createMutation.mutateAsync(payload)
      } else if (activeTab === "technical") {
        payload = {
          title: data.title,
          subject: data.subject || null,
          publisher_name: data.publisher_name || null,
          publication_date: data.publication_date || null,
          no_of_issue_per_year: data.no_of_issue_per_year ? parseInt(data.no_of_issue_per_year) : null,
          price: data.price ? parseFloat(data.price) : null,
          currency: data.currency || null,
        }
        await techReportsMutations.createMutation.mutateAsync(payload)
      }

      // Reset form
      form.reset()

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/teacher/academic-recommendations?tab=${activeTab}`)
      }, 1000)
    } catch (error) {
      // Error handling is done in the mutation hook
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
      <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Add Teacher's Recommendation(s) for Journals/Databases and other Learning Resources
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Add recommendations for academic resources</p>
          </div>
        </div>

        {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 overflow-x-auto">
          {sections.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <section.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">{section.title}</span>
            </TabsTrigger>
          ))}
          </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
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
