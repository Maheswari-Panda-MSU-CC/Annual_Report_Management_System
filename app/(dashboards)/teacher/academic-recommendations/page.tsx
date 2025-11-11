"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  BookOpen,
  Newspaper,
  FileCheck,
  Save,
  Calendar,
  Loader2,
} from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { JournalArticlesForm } from "@/components/forms/JournalArticlesForm"
import { BooksForm } from "@/components/forms/BooksForm"
import { MagazinesForm } from "@/components/forms/MagazinesForm"
import { TechReportsForm } from "@/components/forms/TechReportsForm"

const initialSampleData = {
  articles: [],
  books: [],
  magazines: [],
  technical: [],
}

const sections = [
  {
    id: "articles",
    title: "Articles/Journals/Edited Volumes",
    icon: FileText,
    columns: [
      "Sr No.",
      "Journal Name",
      "ISSN (Without -)",
      "E-ISSN (Without -)",
      "Volume No.",
      "Publisher's Name",
      "Type",
      "Level",
      "Peer Reviewed?",
      "H Index",
      "Impact Factor",
      "In Scopus?",
      "In UGC CARE?",
      "In CLARIVATE?",
      "In Old UGC List?",
      "Approx. Price",
      "Currency",
      "Actions",
    ],
  },
  {
    id: "books",
    title: "Books",
    icon: BookOpen,
    columns: [
      "Sr No.",
      "Title",
      "Author(s)",
      "ISBN (Without -)",
      "Publisher Name",
      "Publishing Level",
      "Book Type",
      "Edition",
      "Volume No.",
      "Publication Date",
      "EBook",
      "Digital Media",
      "Approx. Price",
      "Currency",
      "Actions",
    ],
  },
  {
    id: "magazines",
    title: "Magazines",
    icon: Newspaper,
    columns: [
      "Sr No.",
      "Title",
      "Mode",
      "Publishing Agency",
      "Volume No.",
      "Publication Date",
      "Additional Attachment?",
      "Additional Attachment",
      "No. of Issues per Year",
      "Approx. Price",
      "Currency",
      "Actions",
    ],
  },
  {
    id: "technical",
    title: "Technical Report and Other(s)",
    icon: FileCheck,
    columns: [
      "Sr No.",
      "Title",
      "Subject",
      "Publisher's Name",
      "Publication Date",
      "No. of Issues per Year",
      "Approx. Price",
      "Currency",
      "Actions",
    ],
  },
]

export default function AcademicRecommendationsPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("articles")
  const [data, setData] = useState(initialSampleData)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ sectionId: string; itemId: number; itemName: string } | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    articles: false,
    books: false,
    magazines: false,
    technical: false,
  })
  const [fetchedSections, setFetchedSections] = useState<Set<string>>(new Set())
  const fetchingRef = useRef<Set<string>>(new Set())
  const fetchedDropdownsRef = useRef<Set<string>>(new Set())
  const fetchingDropdownsRef = useRef<Set<string>>(new Set())
  const form = useForm()

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
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

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
  }, [fetchResPubLevels, fetchJournalEditedTypes, fetchBookTypes])

  // Fetch dropdowns when tab changes
  useEffect(() => {
    if (activeTab) {
      fetchDropdownsForTab(activeTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // Fetch journal articles from API
  const fetchJournalArticles = useCallback(async () => {
    if (!user?.role_id || activeTab !== "articles") return
    
    const sectionId = "articles"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/academic-recommendations/journal-articles?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch journal articles")
      }

      const mappedData = (result.journals || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        title: item.title || "",
        issn: item.ISSN || "",
        eISSN: item.eISSN || "",
        volume_num: item.volume_num || "",
        publisherName: item.PublisherName || "",
        type: item.Teacher_Jour_Edited_Type_Name || "",
        typeId: item.type !== null && item.type !== undefined ? Number(item.type) : null,
        level: item.Res_Pub_Level_Name || "",
        levelId: item.level !== null && item.level !== undefined ? Number(item.level) : null,
        peer_reviewed: item.peer_reviewed || false,
        h_index: item.h_index || "",
        impact_factor: item.impact_factor || "",
        in_scopus: item.in_scopus || false,
        in_ugc: item.in_ugc || false,
        in_clarivate: item.in_clarivate || false,
        in_oldUGCList: item.in_oldUGCList || false,
        doi: item.DOI || "",
        noofIssuePerYr: item.NoofIssuePerYr || "",
        price: item.Price || "",
        currency: item.Currency || "",
      }))

      setData((prev: any) => ({
        ...prev,
        articles: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching journal articles:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load journal articles",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch books from API
  const fetchBooks = useCallback(async () => {
    if (!user?.role_id || activeTab !== "books") return
    
    const sectionId = "books"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/academic-recommendations/books?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch books")
      }

      const mappedData = (result.books || []).map((item: any, index: number) => ({
        id: item.Id,
        srNo: index + 1,
        title: item.Title || "",
        authors: item.Authors || "",
        isbn: item.ISBN || "",
        book_category: item.Book_Category || "",
        publisher_name: item.Publisher_Name || "",
        publishing_level: item.LevelName || "",
        publishing_levelId: item.Publishing_Level,
        book_type: item.BookType || "",
        book_typeId: item.Book_Type,
        edition: item.Edition || "",
        volume: item.Volume || "",
        ebook: item.Ebook || "",
        digital_media: item.DigitalMedia || "",
        approx_price: item.ApproxPrice || "",
        currency: item.Currency || "",
        publication_date: item.PublicationDate ? new Date(item.PublicationDate).toISOString().split('T')[0] : "",
        proposed_ay: item.Proposed_AY || "",
      }))

      setData((prev: any) => ({
        ...prev,
        books: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching books:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load books",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch magazines from API
  const fetchMagazines = useCallback(async () => {
    if (!user?.role_id || activeTab !== "magazines") return
    
    const sectionId = "magazines"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/academic-recommendations/magazines?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch magazines")
      }

      const mappedData = (result.magazines || []).map((item: any, index: number) => ({
        id: item.Id,
        srNo: index + 1,
        title: item.Title || "",
        mode: item.Mode || "",
        category: item.Category || "",
        is_additional_attachment: item.IsAdditionalAttachment || false,
        additional_attachment: item.AdditionalAttachment || "",
        publication_date: item.PublicationDate ? new Date(item.PublicationDate).toISOString().split('T')[0] : "",
        publishing_agency: item.PublishingAgency || "",
        volume: item.Volume || "",
        no_of_issue_per_yr: item.NoOfIssuePerYr || "",
        price: item.Price || "",
        currency: item.Currency || "",
      }))

      setData((prev: any) => ({
        ...prev,
        magazines: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching magazines:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load magazines",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch tech reports from API
  const fetchTechReports = useCallback(async () => {
    if (!user?.role_id || activeTab !== "technical") return
    
    const sectionId = "technical"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/academic-recommendations/tech-reports?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch tech reports")
      }

      const mappedData = (result.techReports || []).map((item: any, index: number) => ({
        id: item.Id,
        srNo: index + 1,
        title: item.Title || "",
        subject: item.Subject || "",
        publisher_name: item.PublisherName || "",
        publication_date: item.PublicationDate ? new Date(item.PublicationDate).toISOString().split('T')[0] : "",
        no_of_issue_per_year: item.NoOfIssuePerYear || "",
        price: item.Price || "",
        currency: item.Currency || "",
      }))

      setData((prev: any) => ({
        ...prev,
        technical: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching tech reports:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load tech reports",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch data when tab changes
  useEffect(() => {
    if (user?.role_id && activeTab === "articles") {
      fetchJournalArticles()
    } else if (user?.role_id && activeTab === "books") {
      fetchBooks()
    } else if (user?.role_id && activeTab === "magazines") {
      fetchMagazines()
    } else if (user?.role_id && activeTab === "technical") {
      fetchTechReports()
    }
  }, [user?.role_id, activeTab, fetchJournalArticles, fetchBooks, fetchMagazines, fetchTechReports])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

  const handleDeleteClick = (sectionId: string, itemId: number, itemName: string) => {
    setDeleteConfirm({ sectionId, itemId, itemName })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { sectionId, itemId } = deleteConfirm

    try {
      setIsDeleting(true)
      let apiUrl = ""
      
      if (sectionId === "articles") {
        apiUrl = `/api/teacher/academic-recommendations/journal-articles?journalId=${itemId}`
      } else if (sectionId === "books") {
        apiUrl = `/api/teacher/academic-recommendations/books?bookId=${itemId}`
      } else if (sectionId === "magazines") {
        apiUrl = `/api/teacher/academic-recommendations/magazines?magazineId=${itemId}`
      } else if (sectionId === "technical") {
        apiUrl = `/api/teacher/academic-recommendations/tech-reports?techReportId=${itemId}`
      }

      const res = await fetch(apiUrl, {
        method: "DELETE",
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete record")
      }

      setData((prevData: any) => ({
        ...prevData,
        [sectionId]: (prevData[sectionId] || []).filter((item: any) => item.id !== itemId),
      }))
      
      // Reset fetched section to allow refetch
      setFetchedSections(prev => {
        const newSet = new Set(prev)
        newSet.delete(sectionId)
        return newSet
      })
      
      toast({
        title: "Success",
        description: `"${deleteConfirm.itemName}" has been deleted successfully!`,
        duration: 3000,
      })
      
      setDeleteConfirm(null)
    } catch (error: any) {
      console.error("Error deleting record:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete record",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = useCallback((sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    
    // Map UI format to form format
    let formItem: any = {}
    
    if (sectionId === "articles") {
      formItem = {
        title: item.title || "",
        issn: item.issn || "",
        eISSN: item.eISSN || "",
        volume_num: item.volume_num || "",
        publisherName: item.publisherName || "",
        type: item.typeId !== null && item.typeId !== undefined ? Number(item.typeId) : null,
        level: item.levelId !== null && item.levelId !== undefined ? Number(item.levelId) : null,
        peer_reviewed: item.peer_reviewed || false,
        h_index: item.h_index || "",
        impact_factor: item.impact_factor || "",
        in_scopus: item.in_scopus || false,
        in_ugc: item.in_ugc || false,
        in_clarivate: item.in_clarivate || false,
        in_oldUGCList: item.in_oldUGCList || false,
        doi: item.doi || "",
        noofIssuePerYr: item.noofIssuePerYr || "",
        price: item.price || "",
        currency: item.currency || "",
      }
    } else if (sectionId === "books") {
      formItem = {
        title: item.title || "",
        authors: item.authors || "",
        isbn: item.isbn || "",
        book_category: item.book_category || "",
        publisher_name: item.publisher_name || "",
        publishing_level: item.publishing_levelId || null,
        book_type: item.book_typeId || null,
        edition: item.edition || "",
        volume: item.volume || "",
        ebook: item.ebook || "",
        digital_media: item.digital_media || "",
        approx_price: item.approx_price || "",
        currency: item.currency || "",
        publication_date: item.publication_date || "",
        proposed_ay: item.proposed_ay || "",
      }
    } else if (sectionId === "magazines") {
      formItem = {
        title: item.title || "",
        mode: item.mode || "",
        category: item.category || "",
        is_additional_attachment: item.is_additional_attachment || false,
        additional_attachment: item.additional_attachment || "",
        publication_date: item.publication_date || "",
        publishing_agency: item.publishing_agency || "",
        volume: item.volume || "",
        no_of_issue_per_yr: item.no_of_issue_per_yr || "",
        price: item.price || "",
        currency: item.currency || "",
      }
    } else if (sectionId === "technical") {
      formItem = {
        title: item.title || "",
        subject: item.subject || "",
        publisher_name: item.publisher_name || "",
        publication_date: item.publication_date || "",
        no_of_issue_per_year: item.no_of_issue_per_year || "",
        price: item.price || "",
        currency: item.currency || "",
      }
    }
    
    // Reset form with the mapped data
    // Ensure type and level are numbers for dropdown matching
    const normalizedFormItem = {
      ...formItem,
      type: formItem.type !== null && formItem.type !== undefined ? Number(formItem.type) : null,
      level: formItem.level !== null && formItem.level !== undefined ? Number(formItem.level) : null,
    }
    form.reset(normalizedFormItem)
    setIsEditDialogOpen(true)
  }, [form])

  const handleSaveEdit = useCallback(async () => {
    if (!editingItem || !user?.role_id) return

    try {
      setIsSubmitting(true)
      
      const formValues = form.getValues()
      let apiUrl = ""
      let payload: any = {}

      if (editingItem.sectionId === "articles") {
        apiUrl = "/api/teacher/academic-recommendations/journal-articles"
        payload = {
          journalId: editingItem.id,
          teacherId: user.role_id,
          journal: {
            title: formValues.title,
            issn: formValues.issn || null,
            eISSN: formValues.eISSN || null,
            publisherName: formValues.publisherName || null,
            volume_num: formValues.volume_num ? parseInt(formValues.volume_num) : null,
            level: formValues.level || null,
            peer_reviewed: formValues.peer_reviewed || false,
            h_index: formValues.h_index ? parseFloat(formValues.h_index) : null,
            impact_factor: formValues.impact_factor ? parseFloat(formValues.impact_factor) : null,
            in_scopus: formValues.in_scopus || false,
            type: formValues.type || null,
            in_ugc: formValues.in_ugc || false,
            in_clarivate: formValues.in_clarivate || false,
            doi: formValues.doi || null,
            in_oldUGCList: formValues.in_oldUGCList || false,
            noofIssuePerYr: formValues.noofIssuePerYr ? parseInt(formValues.noofIssuePerYr) : null,
            price: formValues.price ? parseFloat(formValues.price) : null,
            currency: formValues.currency || null,
          },
        }
      } else if (editingItem.sectionId === "books") {
        apiUrl = "/api/teacher/academic-recommendations/books"
        payload = {
          bookId: editingItem.id,
          teacherId: user.role_id,
          book: {
            title: formValues.title,
            authors: formValues.authors || null,
            isbn: formValues.isbn || null,
            book_category: formValues.book_category || null,
            publisher_name: formValues.publisher_name || null,
            publishing_level: formValues.publishing_level || null,
            book_type: formValues.book_type || null,
            edition: formValues.edition || null,
            volume: formValues.volume || null,
            ebook: formValues.ebook || null,
            digital_media: formValues.digital_media || null,
            approx_price: formValues.approx_price ? parseFloat(formValues.approx_price) : null,
            currency: formValues.currency || null,
            publication_date: formValues.publication_date || null,
            proposed_ay: formValues.proposed_ay || null,
          },
        }
      } else if (editingItem.sectionId === "magazines") {
        apiUrl = "/api/teacher/academic-recommendations/magazines"
        payload = {
          magazineId: editingItem.id,
          teacherId: user.role_id,
          magazine: {
            title: formValues.title,
            mode: formValues.mode || null,
            category: formValues.category || null,
            is_additional_attachment: formValues.is_additional_attachment || false,
            additional_attachment: formValues.additional_attachment || null,
            publication_date: formValues.publication_date || null,
            publishing_agency: formValues.publishing_agency || null,
            volume: formValues.volume || null,
            no_of_issue_per_yr: formValues.no_of_issue_per_yr ? parseInt(formValues.no_of_issue_per_yr) : null,
            price: formValues.price ? parseFloat(formValues.price) : null,
            currency: formValues.currency || null,
          },
        }
      } else if (editingItem.sectionId === "technical") {
        apiUrl = "/api/teacher/academic-recommendations/tech-reports"
        payload = {
          techReportId: editingItem.id,
          teacherId: user.role_id,
          techReport: {
            title: formValues.title,
            subject: formValues.subject || null,
            publisher_name: formValues.publisher_name || null,
            publication_date: formValues.publication_date || null,
            no_of_issue_per_year: formValues.no_of_issue_per_year ? parseInt(formValues.no_of_issue_per_year) : null,
            price: formValues.price ? parseFloat(formValues.price) : null,
            currency: formValues.currency || null,
          },
        }
      }

      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update record")
      }

      // Refresh data
      setFetchedSections(prev => {
        const newSet = new Set(prev)
        newSet.delete(editingItem.sectionId)
        return newSet
      })
      
      if (editingItem.sectionId === "articles") {
        await fetchJournalArticles()
      } else if (editingItem.sectionId === "books") {
        await fetchBooks()
      } else if (editingItem.sectionId === "magazines") {
        await fetchMagazines()
      } else if (editingItem.sectionId === "technical") {
        await fetchTechReports()
      }

      setIsEditDialogOpen(false)
      setEditingItem(null)
      form.reset()
      
      toast({
        title: "Success",
        description: `"${formValues.title}" has been updated successfully!`,
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error updating record:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update record",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [editingItem, user?.role_id, form, fetchJournalArticles, fetchBooks, fetchMagazines, fetchTechReports, toast])

  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "articles":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell>{item.issn}</TableCell>
            <TableCell>{item.eISSN}</TableCell>
            <TableCell>{item.volume_num}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.publisherName}>
                {item.publisherName}
              </div>
            </TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.level}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.peer_reviewed ? "default" : "secondary"}>
                {item.peer_reviewed ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell>{item.h_index}</TableCell>
            <TableCell>{item.impact_factor}</TableCell>
            <TableCell>
              <Badge variant={item.in_scopus ? "default" : "secondary"}>{item.in_scopus ? "Yes" : "No"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.in_ugc ? "default" : "secondary"}>{item.in_ugc ? "Yes" : "No"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.in_clarivate ? "default" : "secondary"}>{item.in_clarivate ? "Yes" : "No"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.in_oldUGCList ? "default" : "secondary"}>{item.in_oldUGCList ? "Yes" : "No"}</Badge>
            </TableCell>
            <TableCell>{item.price}</TableCell>
            <TableCell>{item.currency}</TableCell>
          </>
        )
      case "books":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.authors}>
                {item.authors}
              </div>
            </TableCell>
            <TableCell>{item.isbn}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.publisher_name}>
                {item.publisher_name}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.publishing_level}</Badge>
            </TableCell>
            <TableCell>{item.book_type}</TableCell>
            <TableCell>{item.edition}</TableCell>
            <TableCell>{item.volume}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.publication_date}</span>
              </div>
            </TableCell>
            <TableCell>{item.ebook || "N/A"}</TableCell>
            <TableCell>{item.digital_media || "N/A"}</TableCell>
            <TableCell>{item.approx_price}</TableCell>
            <TableCell>{item.currency}</TableCell>
          </>
        )
      case "magazines":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell>{item.mode}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.publishing_agency}>
                {item.publishing_agency}
              </div>
            </TableCell>
            <TableCell>{item.volume}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.publication_date}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.is_additional_attachment ? "default" : "secondary"}>
                {item.is_additional_attachment ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell>{item.additional_attachment || "N/A"}</TableCell>
            <TableCell>{item.no_of_issue_per_yr}</TableCell>
            <TableCell>{item.price}</TableCell>
            <TableCell>{item.currency}</TableCell>
          </>
        )
      case "technical":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium max-w-xs">
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell>{item.subject}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.publisher_name}>
                {item.publisher_name}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.publication_date}</span>
              </div>
            </TableCell>
            <TableCell>{item.no_of_issue_per_year}</TableCell>
            <TableCell>{item.price}</TableCell>
            <TableCell>{item.currency}</TableCell>
          </>
        )
      default:
        return null
    }
  }

  // Memoize edit data to prevent infinite loops
  const editDataRef = useRef<any>({})
  
  useEffect(() => {
    if (editingItem && isEditDialogOpen) {
      if (editingItem.sectionId === "articles") {
        editDataRef.current = {
          title: editingItem.title || "",
          issn: editingItem.issn || "",
          eISSN: editingItem.eISSN || "",
          volume_num: editingItem.volume_num || "",
          publisherName: editingItem.publisherName || "",
          type: editingItem.typeId !== null && editingItem.typeId !== undefined ? Number(editingItem.typeId) : null,
          level: editingItem.levelId !== null && editingItem.levelId !== undefined ? Number(editingItem.levelId) : null,
          peer_reviewed: editingItem.peer_reviewed || false,
          h_index: editingItem.h_index || "",
          impact_factor: editingItem.impact_factor || "",
          in_scopus: editingItem.in_scopus || false,
          in_ugc: editingItem.in_ugc || false,
          in_clarivate: editingItem.in_clarivate || false,
          in_oldUGCList: editingItem.in_oldUGCList || false,
          doi: editingItem.doi || "",
          noofIssuePerYr: editingItem.noofIssuePerYr || "",
          price: editingItem.price || "",
          currency: editingItem.currency || "",
        }
      } else if (editingItem.sectionId === "books") {
        editDataRef.current = {
          title: editingItem.title || "",
          authors: editingItem.authors || "",
          isbn: editingItem.isbn || "",
          book_category: editingItem.book_category || "",
          publisher_name: editingItem.publisher_name || "",
          publishing_level: editingItem.publishing_levelId || null,
          book_type: editingItem.book_typeId || null,
          edition: editingItem.edition || "",
          volume: editingItem.volume || "",
          ebook: editingItem.ebook || "",
          digital_media: editingItem.digital_media || "",
          approx_price: editingItem.approx_price || "",
          currency: editingItem.currency || "",
          publication_date: editingItem.publication_date || "",
          proposed_ay: editingItem.proposed_ay || "",
        }
      } else if (editingItem.sectionId === "magazines") {
        editDataRef.current = {
          title: editingItem.title || "",
          mode: editingItem.mode || "",
          category: editingItem.category || "",
          is_additional_attachment: editingItem.is_additional_attachment || false,
          additional_attachment: editingItem.additional_attachment || "",
          publication_date: editingItem.publication_date || "",
          publishing_agency: editingItem.publishing_agency || "",
          volume: editingItem.volume || "",
          no_of_issue_per_yr: editingItem.no_of_issue_per_yr || "",
          price: editingItem.price || "",
          currency: editingItem.currency || "",
        }
      } else if (editingItem.sectionId === "technical") {
        editDataRef.current = {
          title: editingItem.title || "",
          subject: editingItem.subject || "",
          publisher_name: editingItem.publisher_name || "",
          publication_date: editingItem.publication_date || "",
          no_of_issue_per_year: editingItem.no_of_issue_per_year || "",
          price: editingItem.price || "",
          currency: editingItem.currency || "",
        }
      }
    } else {
      editDataRef.current = {}
    }
  }, [editingItem, isEditDialogOpen])

  const renderForm = useCallback((sectionId: string, isEdit = false) => {
    // Get current form values for edit mode
    const currentData = isEdit ? editDataRef.current : {}

    switch (sectionId) {
      case "articles":
        return (
          <JournalArticlesForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={null}
            handleFileSelect={() => {}}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
            resPubLevelOptions={resPubLevelOptions}
            journalEditedTypeOptions={journalEditedTypeOptions}
          />
        )
      case "books":
        return (
          <BooksForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={null}
            handleFileSelect={() => {}}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
            resPubLevelOptions={resPubLevelOptions}
            bookTypeOptions={bookTypeOptions}
          />
        )
      case "magazines":
        return (
          <MagazinesForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={null}
            handleFileSelect={() => {}}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
          />
        )
      case "technical":
        return (
          <TechReportsForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={null}
            handleFileSelect={() => {}}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
          />
        )
      default:
        return null
    }
  }, [form, isSubmitting, resPubLevelOptions, journalEditedTypeOptions, bookTypeOptions, handleSaveEdit])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Teacher's Recommendation(s) for Journals/Databases and other Learning Resources
        </h1>
        <p className="text-muted-foreground">
          Manage your academic recommendations for articles, books, magazines, and technical reports
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="border-b mb-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex min-w-max w-full">
              {sections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
                >
                  <section.icon className="h-4 w-4" />
                  <span className="text-xs">{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                <Button
                  onClick={() => {
                    router.push(`/teacher/academic-recommendations/add?tab=${section.id}`)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {section.title}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {section.columns.map((column) => (
                          <TableHead key={column} className="whitespace-nowrap">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingStates[section.id] ? (
                        <TableRow>
                          <TableCell
                            colSpan={section.columns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : !data[section.id as keyof typeof data] ||
                        data[section.id as keyof typeof data].length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={section.columns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No {section.title.toLowerCase()} found. Click "Add {section.title}" to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data[section.id as keyof typeof data].map((item: any) => (
                          <TableRow key={item.id}>
                            {renderTableData(section, item)}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(section.id, item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(section.id, item.id, item.title || "this record")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) {
          setEditingItem(null)
          form.reset()
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] pr-2">
            {editingItem && renderForm(editingItem.sectionId, true)}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingItem(null)
              form.reset()
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                form.handleSubmit(handleSaveEdit)()
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record
              <strong className="block mt-2 text-base">
                "{deleteConfirm?.itemName}"
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
