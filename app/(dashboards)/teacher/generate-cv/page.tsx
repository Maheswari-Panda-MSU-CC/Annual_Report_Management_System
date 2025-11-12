"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, ArrowLeft, CheckSquare, Square, Eye, Settings, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/app/api/auth/auth-provider"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx"
import { saveAs } from "file-saver"

interface CVSection {
  id: string
  label: string
  description?: string
}

const cvSections: CVSection[] = [
  { id: "personal", label: "Personal Information", description: "Basic personal and contact details" },
  { id: "education", label: "Education Detail", description: "Academic qualifications and degrees" },
  { id: "postdoc", label: "Post Doctoral Research Experience", description: "Post-doctoral positions and research" },
  { id: "experience", label: "Experience Detail", description: "Professional work experience" },
  { id: "research", label: "Research Projects Detail", description: "Research projects and grants" },
  { id: "patents", label: "Patents Detail", description: "Patents filed and granted" },
  { id: "econtent", label: "E-Contents Detail", description: "Digital content development" },
  { id: "consultancy", label: "Consultancy Undertaken Detail", description: "Consultancy projects and services" },
  { id: "collaborations", label: "Collaborations Detail", description: "Academic and research collaborations" },
  { id: "phdguidance", label: "Ph.D. Guidance Detail", description: "PhD students supervised" },
  { id: "books", label: "Book Published Detail", description: "Books and book chapters published" },
  { id: "papers", label: "Paper Presented Detail", description: "Conference papers and presentations" },
  { id: "reviews", label: "Reviews Detail", description: "Peer reviews and editorial work" },
  {
    id: "monographs",
    label: "Monographs/E-Resources Developed Detail",
    description: "Monographs and digital resources",
  },
  { id: "articles", label: "Published Articles/Journals Detail", description: "Journal articles and publications" },
  { id: "orientation", label: "Orientation Course Detail", description: "Orientation and refresher courses" },
  {
    id: "academic_contribution",
    label: "Contribution in Academic Programme Detail",
    description: "Academic program contributions",
  },
  {
    id: "academic_participation",
    label: "Participation in Academic Programme Detail",
    description: "Academic program participation",
  },
  { id: "committees", label: "Participation in Academic Committee", description: "Committee memberships and roles" },
  {
    id: "performance",
    label: "Performance by Individual/Group Detail",
    description: "Individual and group performances",
  },
  { id: "awards", label: "Awards/Fellowship Detail", description: "Awards and fellowships received" },
  { id: "extension", label: "Extension Detail", description: "Extension activities and outreach" },
  { id: "talks", label: "Talk Detail", description: "Academic and research talks" },
]

// Data interfaces
interface PersonalInfo {
  name: string
  designation: string
  department: string
  institution: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  nationality: string
  orcid: string
  googleScholar?: string
  researchGate?: string
}

interface CVData {
  personal: PersonalInfo | null
  education: any[]
  postdoc: any[]
  experience: any[]
  research: any[]
  patents: any[]
  econtent: any[]
  consultancy: any[]
  collaborations: any[]
  phdguidance: any[]
  books: any[]
  papers: any[]
  articles: any[]
  awards: any[]
  talks: any[]
  academic_contribution: any[]
  academic_participation: any[]
  committees: any[]
  performance: any[]
  extension: any[]
  orientation: any[]
}

// Template styling configurations for documents
const templateStyles = {
  academic: {
    containerClass: "bg-white text-gray-900 font-serif",
    headerClass: "text-center border-b-2 border-gray-800 pb-6 mb-8",
    nameClass: "text-3xl font-bold text-gray-900 mb-2",
    titleClass: "text-xl text-gray-700 mb-1",
    contactClass: "text-sm text-gray-600 mt-4 leading-relaxed",
    sectionTitleClass: "text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4 uppercase tracking-wide",
    itemClass: "mb-4 leading-relaxed",
    itemTitleClass: "font-bold text-gray-900 mb-1",
    itemSubtitleClass: "italic text-gray-700 mb-1",
    itemDetailsClass: "text-gray-600 text-sm",
    publicationClass: "mb-3 text-justify leading-relaxed",
    tableClass: "w-full border-collapse border border-gray-300 mb-4",
    thClass: "border border-gray-300 bg-gray-100 p-3 text-left font-semibold",
    tdClass: "border border-gray-300 p-3",
    // Document-specific styles
    documentStyles: {
      body: "font-family: 'Times New Roman', serif; line-height: 1.6; margin: 1in; color: #333;",
      header: "text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px;",
      name: "font-size: 28px; font-weight: bold; margin-bottom: 8px; color: #1f2937;",
      title: "font-size: 18px; color: #4b5563; margin-bottom: 5px;",
      contact: "font-size: 12px; margin-top: 15px; color: #6b7280;",
      section: "margin-bottom: 25px; page-break-inside: avoid;",
      sectionTitle:
        "font-size: 16px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;",
      item: "margin-bottom: 15px;",
      itemTitle: "font-weight: bold; margin-bottom: 3px; color: #1f2937;",
      itemSubtitle: "font-style: italic; color: #4b5563; margin-bottom: 3px;",
      itemDetails: "font-size: 14px; margin-bottom: 5px; color: #6b7280;",
      table: "width: 100%; border-collapse: collapse; margin-bottom: 15px;",
      th: "border: 1px solid #d1d5db; background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold;",
      td: "border: 1px solid #d1d5db; padding: 8px;",
      publication: "margin-bottom: 12px; text-align: justify; line-height: 1.5;",
    },
  },
  professional: {
    containerClass: "bg-white text-gray-800 font-sans",
    headerClass: "bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 mb-8 rounded-lg",
    nameClass: "text-4xl font-light mb-2",
    titleClass: "text-xl font-medium mb-1 opacity-90",
    contactClass: "text-sm mt-4 opacity-80",
    sectionTitleClass: "text-lg font-semibold text-blue-700 border-l-4 border-blue-600 pl-4 mb-4 uppercase",
    itemClass: "mb-4 pl-4 border-l-2 border-gray-200",
    itemTitleClass: "font-semibold text-gray-900 mb-1",
    itemSubtitleClass: "text-blue-600 font-medium mb-1",
    itemDetailsClass: "text-gray-600 text-sm",
    publicationClass: "mb-3 pl-4 border-l border-blue-200",
    tableClass: "w-full border-collapse shadow-sm mb-4 rounded-lg overflow-hidden",
    thClass: "bg-blue-50 p-4 text-left font-semibold text-blue-800 border-b border-blue-200",
    tdClass: "p-4 border-b border-gray-200",
    documentStyles: {
      body: "font-family: Arial, sans-serif; line-height: 1.5; margin: 1in; color: #374151;",
      header:
        "background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; margin-bottom: 30px; border-radius: 8px;",
      name: "font-size: 32px; font-weight: 300; margin-bottom: 8px;",
      title: "font-size: 20px; font-weight: 500; margin-bottom: 5px; opacity: 0.9;",
      contact: "font-size: 12px; margin-top: 15px; opacity: 0.8;",
      section: "margin-bottom: 25px; page-break-inside: avoid;",
      sectionTitle:
        "font-size: 16px; font-weight: 600; color: #1d4ed8; border-left: 4px solid #2563eb; padding-left: 15px; margin-bottom: 15px; text-transform: uppercase;",
      item: "margin-bottom: 15px; padding-left: 15px; border-left: 2px solid #e5e7eb;",
      itemTitle: "font-weight: 600; margin-bottom: 3px; color: #111827;",
      itemSubtitle: "color: #2563eb; font-weight: 500; margin-bottom: 3px;",
      itemDetails: "font-size: 14px; margin-bottom: 5px; color: #4b5563;",
      table: "width: 100%; border-collapse: collapse; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);",
      th: "background-color: #eff6ff; padding: 12px; text-left; font-weight: 600; color: #1e40af; border-bottom: 1px solid #bfdbfe;",
      td: "padding: 12px; border-bottom: 1px solid #e5e7eb;",
      publication: "margin-bottom: 12px; padding-left: 15px; border-left: 1px solid #bfdbfe;",
    },
  },
  modern: {
    containerClass: "bg-gray-50 text-gray-900 font-sans",
    headerClass: "bg-white shadow-lg p-8 mb-8 rounded-xl",
    nameClass: "text-4xl font-thin text-gray-900 mb-2",
    titleClass: "text-xl text-gray-600 mb-1 font-light",
    contactClass: "text-sm text-gray-500 mt-4",
    sectionTitleClass: "text-lg font-medium text-gray-800 bg-gray-200 px-4 py-2 rounded-full mb-4 inline-block",
    itemClass: "mb-4 bg-white p-4 rounded-lg shadow-sm",
    itemTitleClass: "font-medium text-gray-900 mb-1",
    itemSubtitleClass: "text-gray-600 mb-1",
    itemDetailsClass: "text-gray-500 text-sm",
    publicationClass: "mb-3 bg-white p-3 rounded-lg shadow-sm",
    tableClass: "w-full bg-white rounded-lg shadow-sm overflow-hidden mb-4",
    thClass: "bg-gray-100 p-4 text-left font-medium text-gray-800",
    tdClass: "p-4 border-b border-gray-100 last:border-b-0",
    documentStyles: {
      body: "font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; margin: 1in; color: #111827; background-color: #f9fafb;",
      header:
        "background-color: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); padding: 30px; margin-bottom: 30px; border-radius: 12px;",
      name: "font-size: 32px; font-weight: 100; margin-bottom: 8px; color: #111827;",
      title: "font-size: 20px; color: #4b5563; margin-bottom: 5px; font-weight: 300;",
      contact: "font-size: 12px; margin-top: 15px; color: #6b7280;",
      section: "margin-bottom: 25px; page-break-inside: avoid;",
      sectionTitle:
        "font-size: 16px; font-weight: 500; color: #374151; background-color: #e5e7eb; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px; display: inline-block;",
      item: "margin-bottom: 15px; background-color: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);",
      itemTitle: "font-weight: 500; margin-bottom: 3px; color: #111827;",
      itemSubtitle: "color: #4b5563; margin-bottom: 3px;",
      itemDetails: "font-size: 14px; margin-bottom: 5px; color: #6b7280;",
      table:
        "width: 100%; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 15px;",
      th: "background-color: #f3f4f6; padding: 12px; text-left; font-weight: 500; color: #374151;",
      td: "padding: 12px; border-bottom: 1px solid #f3f4f6;",
      publication:
        "margin-bottom: 12px; background-color: white; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);",
    },
  },
  classic: {
    containerClass: "bg-cream text-gray-900 font-serif",
    headerClass: "text-center border-b border-gray-400 pb-6 mb-8",
    nameClass: "text-3xl font-bold text-gray-900 mb-2 tracking-wide",
    titleClass: "text-lg text-gray-700 mb-1",
    contactClass: "text-sm text-gray-600 mt-4",
    sectionTitleClass:
      "text-lg font-bold text-gray-800 border-b border-gray-400 pb-1 mb-4 uppercase letter-spacing-wide",
    itemClass: "mb-4",
    itemTitleClass: "font-bold text-gray-900 mb-1",
    itemSubtitleClass: "italic text-gray-700 mb-1",
    itemDetailsClass: "text-gray-600 text-sm",
    publicationClass: "mb-3 text-justify",
    tableClass: "w-full border-collapse border-2 border-gray-400 mb-4",
    thClass: "border border-gray-400 bg-gray-200 p-3 text-left font-bold",
    tdClass: "border border-gray-400 p-3",
    documentStyles: {
      body: "font-family: 'Times New Roman', serif; line-height: 1.6; margin: 1in; color: #1f2937; background-color: #fefdf8;",
      header: "text-align: center; border-bottom: 1px solid #9ca3af; padding-bottom: 20px; margin-bottom: 30px;",
      name: "font-size: 28px; font-weight: bold; margin-bottom: 8px; color: #1f2937; letter-spacing: 1px;",
      title: "font-size: 18px; color: #374151; margin-bottom: 5px;",
      contact: "font-size: 12px; margin-top: 15px; color: #4b5563;",
      section: "margin-bottom: 25px; page-break-inside: avoid;",
      sectionTitle:
        "font-size: 16px; font-weight: bold; color: #374151; border-bottom: 1px solid #9ca3af; padding-bottom: 3px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;",
      item: "margin-bottom: 15px;",
      itemTitle: "font-weight: bold; margin-bottom: 3px; color: #1f2937;",
      itemSubtitle: "font-style: italic; color: #374151; margin-bottom: 3px;",
      itemDetails: "font-size: 14px; margin-bottom: 5px; color: #4b5563;",
      table: "width: 100%; border-collapse: collapse; border: 2px solid #9ca3af; margin-bottom: 15px;",
      th: "border: 1px solid #9ca3af; background-color: #e5e7eb; padding: 10px; text-left; font-weight: bold;",
      td: "border: 1px solid #9ca3af; padding: 10px;",
      publication: "margin-bottom: 12px; text-align: justify;",
    },
  },
}

export default function GenerateCVPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const previewRef = useRef<HTMLDivElement>(null)
  const [selectedSections, setSelectedSections] = useState<string[]>(["personal", "education", "experience"])
  const [downloadFormat, setDownloadFormat] = useState("word")
  const [cvTemplate, setCvTemplate] = useState("academic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [cvData, setCvData] = useState<CVData>({
    personal: null,
    education: [],
    postdoc: [],
    experience: [],
    research: [],
    patents: [],
    econtent: [],
    consultancy: [],
    collaborations: [],
    phdguidance: [],
    books: [],
    papers: [],
    articles: [],
    awards: [],
    talks: [],
    academic_contribution: [],
    academic_participation: [],
    committees: [],
    performance: [],
    extension: [],
    orientation: [],
  })

  // Fetch all CV data
  const fetchCVData = useCallback(async () => {
    if (!user?.role_id) return

    setIsLoadingData(true)
    try {
      const teacherId = user.role_id

      // Fetch all data in parallel
      // Note: graduation, experience, and postdoc data come from profile route
      const [
        profileRes,
        researchRes,
        patentsRes,
        econtentRes,
        consultancyRes,
        collaborationsRes,
        phdguidanceRes,
        booksRes,
        papersRes,
        journalsRes,
        awardsRes,
        talksRes,
        academicContriRes,
        academicPartiRes,
        committeesRes,
        performanceRes,
        extensionRes,
        orientationRes,
      ] = await Promise.allSettled([
        fetch(`/api/teacher/profile?teacherId=${teacherId}`),
        fetch(`/api/teacher/research?teacherId=${teacherId}`),
        fetch(`/api/teacher/research-contributions/patents?teacherId=${teacherId}`),
        fetch(`/api/teacher/research-contributions/e-content?teacherId=${teacherId}`),
        fetch(`/api/teacher/research-contributions/consultancy?teacherId=${teacherId}`),
        fetch(`/api/teacher/research-contributions/collaborations?teacherId=${teacherId}`),
        fetch(`/api/teacher/research-contributions/phd-guidance?teacherId=${teacherId}`),
        fetch(`/api/teacher/publication/books?teacherId=${teacherId}`),
        fetch(`/api/teacher/publication/papers?teacherId=${teacherId}`),
        fetch(`/api/teacher/publication/journals?teacherId=${teacherId}`),
        fetch(`/api/teacher/awards-recognition/awards-fellow?teacherId=${teacherId}`),
        fetch(`/api/teacher/talks-events/teacher-talks?teacherId=${teacherId}`),
        fetch(`/api/teacher/talks-events/academic-contri?teacherId=${teacherId}`),
        fetch(`/api/teacher/talks-events/acad-bodies-parti?teacherId=${teacherId}`),
        fetch(`/api/teacher/talks-events/parti-university-committes?teacherId=${teacherId}`),
        fetch(`/api/teacher/awards-recognition/performance-teacher?teacherId=${teacherId}`),
        fetch(`/api/teacher/awards-recognition/extensions?teacherId=${teacherId}`),
        fetch(`/api/teacher/talks-events/refresher-details?teacherId=${teacherId}`),
      ])

      // Process profile data
      if (profileRes.status === "fulfilled" && profileRes.value.ok) {
        const profileData = await profileRes.value.json()
        if (profileData.teacherInfo) {
          const parts = [
            profileData.teacherInfo.fname,
            profileData.teacherInfo.mname,
            profileData.teacherInfo.lname,
          ].filter(Boolean)
          const fullName = parts.length > 0 ? `Dr. ${parts.join(" ")}` : user?.name || ""

          setCvData((prev) => ({
            ...prev,
            personal: {
              name: fullName,
              designation: profileData.designation?.name || "",
              department: profileData.department?.name || "",
              institution: "Maharaja Sayajirao University of Baroda",
              email: profileData.teacherInfo?.email_id || profileData.teacherInfo?.email || "",
              phone: profileData.teacherInfo?.phone_no?.toString() || profileData.teacherInfo?.phone || "",
              address: profileData.teacherInfo?.address || profileData.teacherInfo?.Address || "",
              dateOfBirth: profileData.teacherInfo?.DOB
                ? new Date(profileData.teacherInfo.DOB).toLocaleDateString()
                : profileData.teacherInfo?.dob
                  ? new Date(profileData.teacherInfo.dob).toLocaleDateString()
                  : "",
              nationality: profileData.teacherInfo?.nationality || "Indian",
              orcid: profileData.teacherInfo?.ORCHID_ID || profileData.teacherInfo?.orcid || "",
            },
            education: profileData.graduationDetails || [],
            experience: profileData.teacherExperience || [],
            postdoc: profileData.postDoctoralExp || [],
          }))
        }
      }

      // Process other data - map API responses to CVData keys
      const processResponse = async (res: PromiseSettledResult<Response>, key: keyof CVData) => {
        if (res.status === "fulfilled" && res.value.ok) {
          try {
            const data = await res.value.json()
            
            // Handle different response structures based on actual API responses
            if (data.success) {
              // Most routes return { success: true, [dataKey]: [...] }
              if (key === "research" && data.researchProjects) {
                setCvData((prev) => ({ ...prev, research: data.researchProjects || [] }))
              } else if (key === "patents" && data.patents) {
                setCvData((prev) => ({ ...prev, patents: data.patents || [] }))
              } else if (key === "econtent" && data.eContent) {
                setCvData((prev) => ({ ...prev, econtent: data.eContent || [] }))
              } else if (key === "consultancy" && data.consultancies) {
                setCvData((prev) => ({ ...prev, consultancy: data.consultancies || [] }))
              } else if (key === "collaborations" && data.collaborations) {
                setCvData((prev) => ({ ...prev, collaborations: data.collaborations || [] }))
              } else if (key === "phdguidance" && data.phdStudents) {
                setCvData((prev) => ({ ...prev, phdguidance: data.phdStudents || [] }))
              } else if (key === "books" && data.books) {
                setCvData((prev) => ({ ...prev, books: data.books || [] }))
              } else if (key === "papers" && data.papers) {
                setCvData((prev) => ({ ...prev, papers: data.papers || [] }))
              } else if (key === "articles" && data.journals) {
                setCvData((prev) => ({ ...prev, articles: data.journals || [] }))
              } else if (key === "awards" && data.awardsFellows) {
                setCvData((prev) => ({ ...prev, awards: data.awardsFellows || [] }))
              } else if (key === "talks" && data.teacherTalks) {
                setCvData((prev) => ({ ...prev, talks: data.teacherTalks || [] }))
              } else if (key === "academic_contribution" && data.academicContributions) {
                setCvData((prev) => ({ ...prev, academic_contribution: data.academicContributions || [] }))
              } else if (key === "academic_participation" && data.academicBodiesParticipation) {
                setCvData((prev) => ({ ...prev, academic_participation: data.academicBodiesParticipation || [] }))
              } else if (key === "committees" && data.universityCommittees) {
                setCvData((prev) => ({ ...prev, committees: data.universityCommittees || [] }))
              } else if (key === "performance" && data.performanceTeacher) {
                setCvData((prev) => ({ ...prev, performance: data.performanceTeacher || [] }))
              } else if (key === "extension" && data.extensionActivities) {
                setCvData((prev) => ({ ...prev, extension: data.extensionActivities || [] }))
              } else if (key === "orientation" && data.refresherDetails) {
                setCvData((prev) => ({ ...prev, orientation: data.refresherDetails || [] }))
              }
            } else if (data.researchProjects) {
              // Research route returns { researchProjects: [...] } without success flag
              setCvData((prev) => ({ ...prev, research: data.researchProjects || [] }))
            } else if (Array.isArray(data)) {
              // Some routes might return arrays directly
              setCvData((prev) => ({ ...prev, [key]: data }))
            }
          } catch (error) {
            console.error(`Error processing response for ${key}:`, error)
          }
        }
      }

      await Promise.all([
        processResponse(researchRes, "research"),
        processResponse(patentsRes, "patents"),
        processResponse(econtentRes, "econtent"),
        processResponse(consultancyRes, "consultancy"),
        processResponse(collaborationsRes, "collaborations"),
        processResponse(phdguidanceRes, "phdguidance"),
        processResponse(booksRes, "books"),
        processResponse(papersRes, "papers"),
        processResponse(journalsRes, "articles"),
        processResponse(awardsRes, "awards"),
        processResponse(talksRes, "talks"),
        processResponse(academicContriRes, "academic_contribution"),
        processResponse(academicPartiRes, "academic_participation"),
        processResponse(committeesRes, "committees"),
        processResponse(performanceRes, "performance"),
        processResponse(extensionRes, "extension"),
        processResponse(orientationRes, "orientation"),
      ])
    } catch (error: any) {
      console.error("Error fetching CV data:", error)
      toast({
        title: "Error",
        description: "Failed to load some CV data. Some sections may be empty.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }, [user?.role_id, toast])

  useEffect(() => {
    if (user?.role_id) {
      fetchCVData()
    }
  }, [user?.role_id, fetchCVData])

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const handleSelectAll = () => {
    if (selectedSections.length === cvSections.length) {
      setSelectedSections([])
    } else {
      setSelectedSections(cvSections.map((section) => section.id))
    }
  }

  // Helper function to escape HTML to prevent XSS and ensure proper rendering
  const escapeHtml = (text: string | number | null | undefined): string => {
    if (text === null || text === undefined) return ""
    const div = document.createElement("div")
    div.textContent = String(text)
    return div.innerHTML
  }

  // Helper function to format CV sections for document generation
  const formatCVSection = (sectionId: string, data: CVData, styles: any): string => {
    if (!data.personal) return ""

    switch (sectionId) {
      case "personal":
        return `
          <div class="section">
            <div class="section-title">Personal Information</div>
            <table>
              <tr><th>Name</th><td>${escapeHtml(data.personal.name || "")}</td></tr>
              <tr><th>Designation</th><td>${escapeHtml(data.personal.designation || "")}</td></tr>
              <tr><th>Department</th><td>${escapeHtml(data.personal.department || "")}</td></tr>
              <tr><th>Institution</th><td>${escapeHtml(data.personal.institution || "")}</td></tr>
              <tr><th>Email</th><td>${escapeHtml(data.personal.email || "")}</td></tr>
              <tr><th>Phone</th><td>${escapeHtml(data.personal.phone || "")}</td></tr>
              <tr><th>Date of Birth</th><td>${escapeHtml(data.personal.dateOfBirth || "")}</td></tr>
              <tr><th>Nationality</th><td>${escapeHtml(data.personal.nationality || "")}</td></tr>
              <tr><th>ORCID</th><td>${escapeHtml(data.personal.orcid || "")}</td></tr>
            </table>
          </div>
        `
      case "education":
        return data.education.length > 0
          ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${data.education
              .map(
                (edu: any) => `
              <div class="item">
                <div class="item-title">${escapeHtml(edu.degree_name || edu.degree_type_name || edu.degree || "")}</div>
                <div class="item-subtitle">${escapeHtml(edu.university_name || edu.institution || "")}${edu.year_of_passing ? `, ${new Date(edu.year_of_passing).getFullYear()}` : edu.year ? `, ${escapeHtml(String(edu.year))}` : ""}</div>
                ${edu.subject ? `<div class="item-details">Subject: ${escapeHtml(edu.subject)}</div>` : ""}
                ${edu.state ? `<div class="item-details">State: ${escapeHtml(edu.state)}</div>` : ""}
                ${edu.QS_Ranking ? `<div class="item-details">QS Ranking: ${escapeHtml(edu.QS_Ranking)}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "experience":
        return data.experience.length > 0
          ? `
          <div class="section">
            <div class="section-title">Professional Experience</div>
            ${data.experience
              .map(
                (exp: any) => `
              <div class="item">
                <div class="item-title">${exp.desig || exp.designation || exp.position || ""}</div>
                <div class="item-subtitle">${exp.Employeer || exp.institution || ""}</div>
                <div class="item-details">${exp.Start_Date ? new Date(exp.Start_Date).getFullYear() : exp.from_date ? new Date(exp.from_date).getFullYear() : ""} - ${exp.End_Date ? new Date(exp.End_Date).getFullYear() : exp.to_date ? new Date(exp.to_date).getFullYear() : exp.currente ? "Present" : ""}</div>
                ${exp.Nature ? `<div class="item-details">Nature: ${exp.Nature}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "research":
        return data.research.length > 0
          ? `
          <div class="section">
            <div class="section-title">Research Projects</div>
            ${data.research
              .map(
                (proj: any) => `
              <div class="item">
                <div class="item-title">${proj.title || ""}</div>
                <div class="item-details">Funding Agency: ${proj.funding_agency_name || proj.funding_agency || ""}</div>
                <div class="item-details">Amount: ${proj.grant_sanctioned ? `₹${proj.grant_sanctioned.toLocaleString()}` : ""} | Duration: ${proj.duration || ""} years</div>
                <div class="item-details">Status: ${proj.status_name || proj.status || ""}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "articles":
        return data.articles.length > 0
          ? `
          <div class="section">
            <div class="section-title">Publications</div>
            ${data.articles
              .map(
                (pub: any, index: number) => `
              <div class="publication">
                <strong>${index + 1}.</strong> ${pub.authors || ""}. "${pub.title || ""}". 
                <em>${pub.journal_name || ""}</em>, ${pub.month_year ? new Date(pub.month_year).getFullYear() : ""}. 
                ${pub.impact_factor ? `IF: ${pub.impact_factor}` : ""}. 
                ${pub.DOI ? `DOI: ${pub.DOI}` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "postdoc":
        return data.postdoc.length > 0
          ? `
          <div class="section">
            <div class="section-title">Post Doctoral Research Experience</div>
            ${data.postdoc
              .map(
                (postdoc: any) => `
              <div class="item">
                <div class="item-title">${postdoc.Institute || ""}</div>
                <div class="item-subtitle">${postdoc.Start_Date ? new Date(postdoc.Start_Date).getFullYear() : ""} - ${postdoc.End_Date ? new Date(postdoc.End_Date).getFullYear() : "Present"}</div>
                ${postdoc.SponsoredBy ? `<div class="item-details">Sponsored By: ${postdoc.SponsoredBy}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "patents":
        return data.patents.length > 0
          ? `
          <div class="section">
            <div class="section-title">Patents</div>
            ${data.patents
              .map(
                (patent: any) => `
              <div class="item">
                <div class="item-title">${patent.title || ""}</div>
                <div class="item-subtitle">${patent.date ? new Date(patent.date).getFullYear() : ""}</div>
                ${patent.PatentApplicationNo ? `<div class="item-details">Application No: ${patent.PatentApplicationNo}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "econtent":
        return data.econtent.length > 0
          ? `
          <div class="section">
            <div class="section-title">E-Contents</div>
            ${data.econtent
              .map(
                (econtent: any) => `
              <div class="item">
                <div class="item-title">${econtent.title || ""}</div>
                <div class="item-subtitle">${econtent.Publishing_Authorities || ""}</div>
                ${econtent.Publishing_date ? `<div class="item-details">Published: ${new Date(econtent.Publishing_date).getFullYear()}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "consultancy":
        return data.consultancy.length > 0
          ? `
          <div class="section">
            <div class="section-title">Consultancy Undertaken</div>
            ${data.consultancy
              .map(
                (consult: any) => `
              <div class="item">
                <div class="item-title">${consult.name || ""}</div>
                <div class="item-subtitle">${consult.collaborating_inst || ""}</div>
                ${consult.Start_Date ? `<div class="item-details">${new Date(consult.Start_Date).getFullYear()}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "collaborations":
        return data.collaborations.length > 0
          ? `
          <div class="section">
            <div class="section-title">Collaborations</div>
            ${data.collaborations
              .map(
                (collab: any) => `
              <div class="item">
                <div class="item-title">${collab.collaborating_inst || collab.collab_name || ""}</div>
                <div class="item-subtitle">${collab.category || ""}</div>
                ${collab.starting_date ? `<div class="item-details">Started: ${new Date(collab.starting_date).getFullYear()}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "phdguidance":
        return data.phdguidance.length > 0
          ? `
          <div class="section">
            <div class="section-title">Ph.D. Guidance</div>
            ${data.phdguidance
              .map(
                (phd: any) => `
              <div class="item">
                <div class="item-title">${phd.name || ""}</div>
                <div class="item-subtitle">Registration: ${phd.regno || ""}</div>
                <div class="item-details">Topic: ${phd.topic || ""}</div>
                ${phd.start_date ? `<div class="item-details">Started: ${new Date(phd.start_date).getFullYear()}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "books":
        return data.books.length > 0
          ? `
          <div class="section">
            <div class="section-title">Books Published</div>
            ${data.books
              .map(
                (book: any, index: number) => `
              <div class="publication">
                <strong>${index + 1}.</strong> ${book.authors || ""}. "${book.title || ""}". ${book.publisher_name || ""}${book.submit_date ? `, ${new Date(book.submit_date).getFullYear()}` : ""}${book.isbn ? `. ISBN: ${book.isbn}` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "papers":
        return data.papers.length > 0
          ? `
          <div class="section">
            <div class="section-title">Papers Presented</div>
            ${data.papers
              .map(
                (paper: any, index: number) => `
              <div class="publication">
                <strong>${index + 1}.</strong> ${paper.authors || ""}. "${paper.title_of_paper || ""}". ${paper.organising_body || ""}${paper.place ? `, ${paper.place}` : ""}${paper.date ? `, ${new Date(paper.date).getFullYear()}` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "talks":
        return data.talks.length > 0
          ? `
          <div class="section">
            <div class="section-title">Talks</div>
            ${data.talks
              .map(
                (talk: any) => `
              <div class="item">
                <div class="item-title">${talk.title || talk.name || ""}</div>
                <div class="item-subtitle">${talk.place || ""}${talk.date ? `, ${new Date(talk.date).getFullYear()}` : ""}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "academic_contribution":
        return data.academic_contribution.length > 0
          ? `
          <div class="section">
            <div class="section-title">Contribution in Academic Programme</div>
            ${data.academic_contribution
              .map(
                (contri: any) => `
              <div class="item">
                <div class="item-title">${contri.name || ""}</div>
                <div class="item-subtitle">${contri.place || ""}${contri.date ? `, ${new Date(contri.date).getFullYear()}` : ""}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "academic_participation":
        return data.academic_participation.length > 0
          ? `
          <div class="section">
            <div class="section-title">Participation in Academic Programme</div>
            ${data.academic_participation
              .map(
                (parti: any) => `
              <div class="item">
                <div class="item-title">${parti.name || ""}</div>
                <div class="item-subtitle">${parti.acad_body || ""}, ${parti.place || ""}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "committees":
        return data.committees.length > 0
          ? `
          <div class="section">
            <div class="section-title">Participation in Academic Committee</div>
            ${data.committees
              .map(
                (committee: any) => `
              <div class="item">
                <div class="item-title">${committee.committee_name || committee.name || ""}</div>
                <div class="item-subtitle">${committee.participated_as || ""}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "performance":
        return data.performance.length > 0
          ? `
          <div class="section">
            <div class="section-title">Performance by Individual/Group</div>
            ${data.performance
              .map(
                (perf: any) => `
              <div class="item">
                <div class="item-title">${perf.name || ""}</div>
                <div class="item-subtitle">${perf.place || ""}${perf.date ? `, ${new Date(perf.date).getFullYear()}` : ""}</div>
                ${perf.perf_nature ? `<div class="item-details">Nature: ${perf.perf_nature}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "extension":
        return data.extension.length > 0
          ? `
          <div class="section">
            <div class="section-title">Extension Activities</div>
            ${data.extension
              .map(
                (ext: any) => `
              <div class="item">
                <div class="item-title">${ext.name_of_activity || ext.names || ""}</div>
                <div class="item-subtitle">${ext.place || ""}${ext.date ? `, ${new Date(ext.date).getFullYear()}` : ""}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "orientation":
        return data.orientation.length > 0
          ? `
          <div class="section">
            <div class="section-title">Orientation Course</div>
            ${data.orientation
              .map(
                (orient: any) => `
              <div class="item">
                <div class="item-title">${orient.name || ""}</div>
                <div class="item-subtitle">${orient.institute || orient.university || ""}</div>
                ${orient.startdate ? `<div class="item-details">${new Date(orient.startdate).getFullYear()}${orient.enddate ? ` - ${new Date(orient.enddate).getFullYear()}` : ""}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      case "awards":
        return data.awards.length > 0
          ? `
          <div class="section">
            <div class="section-title">Awards & Honors</div>
            ${data.awards
              .map(
                (award: any) => `
              <div class="item">
                <div class="item-title">${award.name || ""}</div>
                <div class="item-subtitle">${award.organization || ""}, ${award.date_of_award ? new Date(award.date_of_award).getFullYear() : ""}</div>
                ${award.details ? `<div class="item-details">${award.details}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : ""
      default:
        return ""
    }
  }

  // Helper function to create Word document sections
  const createWordSection = (sectionId: string, data: CVData): Paragraph[] => {
    const sections: Paragraph[] = []

    switch (sectionId) {
      case "personal":
        sections.push(
          new Paragraph({
            text: "Personal Information",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          ...Object.entries({
            Name: data.personal?.name || "",
            Designation: data.personal?.designation || "",
            Department: data.personal?.department || "",
            Institution: data.personal?.institution || "",
            Email: data.personal?.email || "",
            Phone: data.personal?.phone || "",
            "Date of Birth": data.personal?.dateOfBirth || "",
            Nationality: data.personal?.nationality || "",
            ORCID: data.personal?.orcid || "",
            Address: data.personal?.address || "",
          })
            .filter(([_, value]) => value)
            .map(
              ([key, value]) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `${key}: `, bold: true }),
                    new TextRun({ text: String(value) }),
                  ],
                  spacing: { after: 100 },
                }),
            ),
        )
        break

      case "education":
        if (data.education.length > 0) {
          sections.push(
            new Paragraph({
              text: "Education",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.education.forEach((edu: any) => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.degree_name || edu.degree_type_name || edu.degree || "",
                    bold: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.university_name || edu.institution || ""}${
                      edu.year_of_passing
                        ? `, ${new Date(edu.year_of_passing).getFullYear()}`
                        : edu.year
                          ? `, ${edu.year}`
                          : ""
                    }`,
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
            if (edu.subject) {
              sections.push(
                new Paragraph({
                  children: [new TextRun({ text: `Subject: ${edu.subject}` })],
                  spacing: { after: 50 },
                }),
              )
            }
            if (edu.state) {
              sections.push(
                new Paragraph({
                  children: [new TextRun({ text: `State: ${edu.state}` })],
                  spacing: { after: 50 },
                }),
              )
            }
            sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
          })
        }
        break

      case "experience":
        if (data.experience.length > 0) {
          sections.push(
            new Paragraph({
              text: "Professional Experience",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.experience.forEach((exp: any) => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.desig || exp.designation || exp.position || "",
                    bold: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.Employeer || exp.institution || "",
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${
                      exp.Start_Date
                        ? new Date(exp.Start_Date).getFullYear()
                        : exp.from_date
                          ? new Date(exp.from_date).getFullYear()
                          : ""
                    } - ${
                      exp.End_Date
                        ? new Date(exp.End_Date).getFullYear()
                        : exp.to_date
                          ? new Date(exp.to_date).getFullYear()
                          : exp.currente
                            ? "Present"
                            : ""
                    }`,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
            if (exp.Nature) {
              sections.push(
                new Paragraph({
                  children: [new TextRun({ text: `Nature: ${exp.Nature}` })],
                  spacing: { after: 50 },
                }),
              )
            }
            sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
          })
        }
        break

      case "research":
        if (data.research.length > 0) {
          sections.push(
            new Paragraph({
              text: "Research Projects",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.research.forEach((proj: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: proj.title || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Funding Agency: ${proj.funding_agency_name || proj.funding_agency || ""}`,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Amount: ${
                      proj.grant_sanctioned ? `₹${proj.grant_sanctioned.toLocaleString()}` : ""
                    } | Duration: ${proj.duration || ""} years`,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Status: ${proj.status_name || proj.status || ""}`,
                  }),
                ],
                spacing: { after: 150 },
              }),
            )
          })
        }
        break

      case "articles":
        if (data.articles.length > 0) {
          sections.push(
            new Paragraph({
              text: "Published Articles/Journals",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.articles.forEach((pub: any, index: number) => {
            const pubText = `${index + 1}. ${pub.authors || ""}. "${pub.title || ""}". ${
              pub.journal_name || ""
            }, ${pub.month_year ? new Date(pub.month_year).getFullYear() : ""}. ${
              pub.impact_factor ? `IF: ${pub.impact_factor}` : ""
            }. ${pub.DOI ? `DOI: ${pub.DOI}` : ""}`
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: pubText })],
                spacing: { after: 100 },
              }),
            )
          })
        }
        break

      case "awards":
        if (data.awards.length > 0) {
          sections.push(
            new Paragraph({
              text: "Awards & Honors",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.awards.forEach((award: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: award.name || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${award.organization || ""}, ${
                      award.date_of_award ? new Date(award.date_of_award).getFullYear() : ""
                    }`,
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
            if (award.details) {
              sections.push(
                new Paragraph({
                  children: [new TextRun({ text: award.details })],
                  spacing: { after: 150 },
                }),
              )
            } else {
              sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
            }
          })
        }
        break

      case "postdoc":
        if (data.postdoc.length > 0) {
          sections.push(
            new Paragraph({
              text: "Post Doctoral Research Experience",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.postdoc.forEach((postdoc: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: postdoc.Institute || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${
                      postdoc.Start_Date ? new Date(postdoc.Start_Date).getFullYear() : ""
                    } - ${postdoc.End_Date ? new Date(postdoc.End_Date).getFullYear() : "Present"}`,
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
            if (postdoc.SponsoredBy) {
              sections.push(
                new Paragraph({
                  children: [new TextRun({ text: `Sponsored By: ${postdoc.SponsoredBy}` })],
                  spacing: { after: 150 },
                }),
              )
            } else {
              sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
            }
          })
        }
        break

      case "patents":
        if (data.patents.length > 0) {
          sections.push(
            new Paragraph({
              text: "Patents",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.patents.forEach((patent: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: patent.title || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: patent.date ? new Date(patent.date).getFullYear().toString() : "",
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
            if (patent.PatentApplicationNo) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `Application No: ${patent.PatentApplicationNo}` }),
                  ],
                  spacing: { after: 150 },
                }),
              )
            } else {
              sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
            }
          })
        }
        break

      case "books":
        if (data.books.length > 0) {
          sections.push(
            new Paragraph({
              text: "Books Published",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.books.forEach((book: any, index: number) => {
            const bookText = `${index + 1}. ${book.authors || ""}. "${book.title || ""}". ${
              book.publisher_name || ""
            }${book.submit_date ? `, ${new Date(book.submit_date).getFullYear()}` : ""}${
              book.isbn ? `. ISBN: ${book.isbn}` : ""
            }`
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: bookText })],
                spacing: { after: 100 },
              }),
            )
          })
        }
        break

      case "papers":
        if (data.papers.length > 0) {
          sections.push(
            new Paragraph({
              text: "Papers Presented",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.papers.forEach((paper: any, index: number) => {
            const paperText = `${index + 1}. ${paper.authors || ""}. "${paper.title_of_paper || ""}". ${
              paper.organising_body || ""
            }${paper.place ? `, ${paper.place}` : ""}${
              paper.date ? `, ${new Date(paper.date).getFullYear()}` : ""
            }`
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: paperText })],
                spacing: { after: 100 },
              }),
            )
          })
        }
        break

      case "talks":
        if (data.talks.length > 0) {
          sections.push(
            new Paragraph({
              text: "Talks",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.talks.forEach((talk: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: talk.title || talk.name || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${talk.place || ""}${talk.date ? `, ${new Date(talk.date).getFullYear()}` : ""}`,
                    italics: true,
                  }),
                ],
                spacing: { after: 150 },
              }),
            )
          })
        }
        break

      case "econtent":
        if (data.econtent.length > 0) {
          sections.push(
            new Paragraph({
              text: "E-Contents",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.econtent.forEach((econtent: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: econtent.title || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: econtent.Publishing_Authorities || "",
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
            if (econtent.Publishing_date) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Published: ${new Date(econtent.Publishing_date).getFullYear()}`,
                    }),
                  ],
                  spacing: { after: 150 },
                }),
              )
            } else {
              sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
            }
          })
        }
        break

      case "consultancy":
        if (data.consultancy.length > 0) {
          sections.push(
            new Paragraph({
              text: "Consultancy Undertaken",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.consultancy.forEach((consult: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: consult.name || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: consult.collaborating_inst || "",
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
            if (consult.Start_Date) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: new Date(consult.Start_Date).getFullYear().toString(),
                    }),
                  ],
                  spacing: { after: 150 },
                }),
              )
            } else {
              sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
            }
          })
        }
        break

      case "collaborations":
        if (data.collaborations.length > 0) {
          sections.push(
            new Paragraph({
              text: "Collaborations",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.collaborations.forEach((collab: any) => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: collab.collaborating_inst || collab.collab_name || "",
                    bold: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [new TextRun({ text: collab.category || "", italics: true })],
                spacing: { after: 50 },
              }),
            )
            if (collab.starting_date) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Started: ${new Date(collab.starting_date).getFullYear()}`,
                    }),
                  ],
                  spacing: { after: 150 },
                }),
              )
            } else {
              sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
            }
          })
        }
        break

      case "phdguidance":
        if (data.phdguidance.length > 0) {
          sections.push(
            new Paragraph({
              text: "Ph.D. Guidance",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.phdguidance.forEach((phd: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: phd.name || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [new TextRun({ text: `Registration: ${phd.regno || ""}` })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [new TextRun({ text: `Topic: ${phd.topic || ""}` })],
                spacing: { after: 50 },
              }),
            )
            if (phd.start_date) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Started: ${new Date(phd.start_date).getFullYear()}`,
                    }),
                  ],
                  spacing: { after: 150 },
                }),
              )
            } else {
              sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
            }
          })
        }
        break

      case "academic_contribution":
        if (data.academic_contribution.length > 0) {
          sections.push(
            new Paragraph({
              text: "Contribution in Academic Programme",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.academic_contribution.forEach((contri: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: contri.name || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${contri.place || ""}${contri.date ? `, ${new Date(contri.date).getFullYear()}` : ""}`,
                    italics: true,
                  }),
                ],
                spacing: { after: 150 },
              }),
            )
          })
        }
        break

      case "academic_participation":
        if (data.academic_participation.length > 0) {
          sections.push(
            new Paragraph({
              text: "Participation in Academic Programme",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.academic_participation.forEach((parti: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: parti.name || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${parti.acad_body || ""}, ${parti.place || ""}`,
                    italics: true,
                  }),
                ],
                spacing: { after: 150 },
              }),
            )
          })
        }
        break

      case "committees":
        if (data.committees.length > 0) {
          sections.push(
            new Paragraph({
              text: "Participation in Academic Committee",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.committees.forEach((committee: any) => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: committee.committee_name || committee.name || "",
                    bold: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: committee.participated_as || "",
                    italics: true,
                  }),
                ],
                spacing: { after: 150 },
              }),
            )
          })
        }
        break

      case "performance":
        if (data.performance.length > 0) {
          sections.push(
            new Paragraph({
              text: "Performance by Individual/Group",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.performance.forEach((perf: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: perf.name || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${perf.place || ""}${perf.date ? `, ${new Date(perf.date).getFullYear()}` : ""}`,
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
            if (perf.perf_nature) {
              sections.push(
                new Paragraph({
                  children: [new TextRun({ text: `Nature: ${perf.perf_nature}` })],
                  spacing: { after: 150 },
                }),
              )
            } else {
              sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
            }
          })
        }
        break

      case "extension":
        if (data.extension.length > 0) {
          sections.push(
            new Paragraph({
              text: "Extension Activities",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.extension.forEach((ext: any) => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: ext.name_of_activity || ext.names || "",
                    bold: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${ext.place || ""}${ext.date ? `, ${new Date(ext.date).getFullYear()}` : ""}`,
                    italics: true,
                  }),
                ],
                spacing: { after: 150 },
              }),
            )
          })
        }
        break

      case "orientation":
        if (data.orientation.length > 0) {
          sections.push(
            new Paragraph({
              text: "Orientation Course",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          data.orientation.forEach((orient: any) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: orient.name || "", bold: true })],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: orient.institute || orient.university || "",
                    italics: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
            if (orient.startdate) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${new Date(orient.startdate).getFullYear()}${
                        orient.enddate ? ` - ${new Date(orient.enddate).getFullYear()}` : ""
                      }`,
                    }),
                  ],
                  spacing: { after: 150 },
                }),
              )
            } else {
              sections.push(new Paragraph({ text: "", spacing: { after: 150 } }))
            }
          })
        }
        break

      default:
        break
    }

    return sections
  }

  const generateWordDocument = async () => {
    if (!cvData.personal) {
      throw new Error("Personal information not available. Please wait for data to load.")
    }

    try {
      // Call backend API for Word document generation
      const response = await fetch("/api/teacher/cv-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvData,
          template: cvTemplate,
          format: "word",
          selectedSections,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || "Failed to generate Word document")
      }

      // Get the blob from response
      const blob = await response.blob()
      const fileName = `CV_${cvData.personal.name.replace(/\s+/g, "_")}_${cvTemplate}_${new Date().toISOString().split("T")[0]}.docx`
      saveAs(blob, fileName)

      return true
    } catch (error) {
      console.error("Word generation error:", error)
      throw new Error(`Word document generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const generatePDFDocument = async () => {
    if (!cvData.personal) {
      throw new Error("Personal information not available. Please wait for data to load.")
    }

    try {
      // Call backend API for PDF generation
      const response = await fetch("/api/teacher/cv-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvData,
          template: cvTemplate,
          format: "pdf",
          selectedSections,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || "Failed to generate PDF")
      }

      const result = await response.json()

      if (result.html) {
        // Use browser's print functionality to convert HTML to PDF
        const printWindow = window.open("", "_blank")
        if (!printWindow) {
          throw new Error("Popup blocked. Please allow popups for this site.")
        }

        printWindow.document.write(result.html)
        printWindow.document.close()

        // Wait for content to load
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Trigger print dialog which allows saving as PDF
        printWindow.print()

        // Close the window after a delay
        setTimeout(() => {
          printWindow.close()
        }, 2000)
      }

      return true
    } catch (error) {
      console.error("PDF generation error:", error)
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleGenerateCV = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: "No sections selected",
        description: "Please select at least one section to include in your CV.",
        variant: "destructive",
      })
      return
    }

    if (!cvData.personal) {
      toast({
        title: "Data not loaded",
        description: "Please wait for your data to load before generating the CV.",
        variant: "destructive",
      })
      return
    }

    if (isLoadingData) {
      toast({
        title: "Loading data",
        description: "Please wait for data to finish loading.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      // Validate browser compatibility
      if (!window.Blob || !window.URL || !window.URL.createObjectURL) {
        throw new Error("Your browser does not support file generation. Please use a modern browser.")
      }

      let success = false
      if (downloadFormat === "word") {
        success = await generateWordDocument()
      } else {
        success = await generatePDFDocument()
      }

      if (success) {
        toast({
          title: "CV Generated Successfully!",
          description: `Your ${cvTemplate} template CV with ${selectedSections.length} sections has been generated. ${downloadFormat === "pdf" ? "Use your browser's print dialog to save as PDF." : "The file should download automatically."}`,
          duration: 5000,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setGenerationError(errorMessage)

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })

      console.error("CV Generation Error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = () => {
    setShowPreview(true)
    toast({
      title: "Preview Generated",
      description: "CV preview is now available below the form.",
    })

    // Smooth scroll to preview section
    setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      })
    }, 100)
  }

  const testDocumentGeneration = async () => {
    try {
      // Test basic browser capabilities
      const testBlob = new Blob(["Test content"], { type: "text/plain" })
      const testUrl = URL.createObjectURL(testBlob)
      URL.revokeObjectURL(testUrl)

      toast({
        title: "Browser Compatibility Test Passed",
        description: "Your browser supports document generation.",
      })
    } catch (error) {
      toast({
        title: "Browser Compatibility Issue",
        description: "Your browser may not support document generation features.",
        variant: "destructive",
      })
    }
  }

  // Get current template styles
  const currentStyles = templateStyles[cvTemplate as keyof typeof templateStyles]

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Generate CV</h1>
              <p className="text-muted-foreground">Create a professional CV with your selected information</p>
            </div>
          </div>
          <Button variant="outline" onClick={testDocumentGeneration} className="flex items-center gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Test Browser
          </Button>
        </div>

        {/* Error Alert */}
        {generationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Document Generation Error:</strong> {generationError}
              <br />
              <small>
                Try using a different browser or check if popups are blocked. For PDF generation, ensure your browser
                supports printing.
              </small>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CV Sections Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      CV Sections
                    </CardTitle>
                    <CardDescription>Select the sections you want to include in your CV</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    {selectedSections.length === cvSections.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    {selectedSections.length === cvSections.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cvSections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={section.id}
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={section.id} className="text-sm font-medium cursor-pointer">
                          {section.label}
                        </Label>
                        {section.description && (
                          <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CV Generation Options */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  CV Template
                </CardTitle>
                <CardDescription>Choose your preferred CV template</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={cvTemplate} onValueChange={setCvTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic Template</SelectItem>
                    <SelectItem value="professional">Professional Template</SelectItem>
                    <SelectItem value="modern">Modern Template</SelectItem>
                    <SelectItem value="classic">Classic Template</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Download Format */}
            <Card>
              <CardHeader>
                <CardTitle>Download Format</CardTitle>
                <CardDescription>Choose your preferred CV format</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={downloadFormat} onValueChange={setDownloadFormat}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="word" id="word" />
                    <Label htmlFor="word" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      Microsoft Word (.doc)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      PDF (.pdf) - Print to PDF
                    </Label>
                  </div>
                </RadioGroup>
                <div className="mt-2 text-xs text-muted-foreground">
                  {downloadFormat === "pdf" && (
                    <p>PDF generation uses your browser's print dialog. Select "Save as PDF" when prompted.</p>
                  )}
                  {downloadFormat === "word" && (
                    <p>
                      Word document will be downloaded as .doc file compatible with Microsoft Word and similar editors.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selection Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
                <CardDescription>Review your CV settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Template:</span>
                    <span className="font-medium capitalize">{cvTemplate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sections Selected:</span>
                    <span className="font-medium">
                      {selectedSections.length} of {cvSections.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Format:</span>
                    <span className="font-medium capitalize">{downloadFormat}</span>
                  </div>
                  <div className="pt-3 border-t space-y-2">
                    <Button
                      onClick={handlePreview}
                      variant="outline"
                      disabled={selectedSections.length === 0}
                      className="w-full flex items-center gap-2 bg-transparent"
                    >
                      <Eye className="h-4 w-4" />
                      Preview CV
                    </Button>
                    <Button
                      onClick={handleGenerateCV}
                      disabled={isGenerating || selectedSections.length === 0 || isLoadingData || !cvData.personal}
                      className="w-full flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating CV...
                        </>
                      ) : isLoadingData ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading Data...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Generate & Download CV
                        </>
                      )}
                    </Button>
                    {isLoadingData && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Please wait while we load your CV data...
                      </p>
                    )}
                    {!isLoadingData && !cvData.personal && (
                      <p className="text-xs text-muted-foreground text-center mt-2 text-amber-600">
                        No profile data available. Please complete your profile first.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browser Compatibility Info */}
            <Card>
              <CardHeader>
                <CardTitle>Compatibility Info</CardTitle>
                <CardDescription>Document generation requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• Modern browser required (Chrome, Firefox, Safari, Edge)</p>
                  <p>• Allow popups for PDF generation</p>
                  <p>• Word documents compatible with MS Word, LibreOffice, Google Docs</p>
                  <p>• PDF generation uses browser's print functionality</p>
                  <p>• Template styling preserved in downloaded documents</p>
                </div>
              </CardContent>
            </Card>

            {/* Selected Sections Preview */}
            {selectedSections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Sections</CardTitle>
                  <CardDescription>Sections included in your CV</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedSections.map((sectionId) => {
                      const section = cvSections.find((s) => s.id === sectionId)
                      return (
                        <div key={sectionId} className="flex items-center gap-2 text-sm">
                          <CheckSquare className="h-3 w-3 text-green-600" />
                          <span>{section?.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* CV Preview with Dynamic Styling */}
        {showPreview && (
          <Card ref={previewRef} className="scroll-mt-6">
            <CardHeader>
              <CardTitle>CV Preview - {cvTemplate.charAt(0).toUpperCase() + cvTemplate.slice(1)} Template</CardTitle>
              <CardDescription>Preview of your generated CV content with selected template styling</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`p-4 sm:p-6 lg:p-8 border rounded-lg shadow-sm max-h-[600px] overflow-y-auto ${currentStyles.containerClass}`}
              >
                <div className="space-y-6">
                  {isLoadingData ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <span className="ml-3 text-gray-600">Loading CV data...</span>
                    </div>
                  ) : !cvData.personal ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No data available. Please ensure your profile is complete.</p>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className={currentStyles.headerClass}>
                        <h1 className={currentStyles.nameClass}>{cvData.personal.name}</h1>
                        <p className={currentStyles.titleClass}>{cvData.personal.designation}</p>
                        <p className={currentStyles.titleClass}>{cvData.personal.department}</p>
                        <p className={currentStyles.titleClass}>{cvData.personal.institution}</p>
                        <div className={currentStyles.contactClass}>
                          {cvData.personal.email && <p>Email: {cvData.personal.email}</p>}
                          {cvData.personal.phone && <p>Phone: {cvData.personal.phone}</p>}
                          {cvData.personal.address && <p>Address: {cvData.personal.address}</p>}
                          {cvData.personal.orcid && <p>ORCID: {cvData.personal.orcid}</p>}
                        </div>
                      </div>

                      {/* Personal Information */}
                      {selectedSections.includes("personal") && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Personal Information</h2>
                          <div className="overflow-x-auto">
                            <table className={currentStyles.tableClass}>
                              <tbody>
                                <tr>
                                  <th className={currentStyles.thClass}>Date of Birth</th>
                                  <td className={currentStyles.tdClass}>{cvData.personal.dateOfBirth}</td>
                                </tr>
                                <tr>
                                  <th className={currentStyles.thClass}>Nationality</th>
                                  <td className={currentStyles.tdClass}>{cvData.personal.nationality}</td>
                                </tr>
                                <tr>
                                  <th className={currentStyles.thClass}>ORCID</th>
                                  <td className={currentStyles.tdClass}>{cvData.personal.orcid}</td>
                                </tr>
                                <tr>
                                  <th className={currentStyles.thClass}>Address</th>
                                  <td className={currentStyles.tdClass}>{cvData.personal.address}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {selectedSections.includes("education") && cvData.education.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Education</h2>
                          {cvData.education.map((edu: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>
                                {edu.degree_name || edu.degree_type_name || edu.degree || ""}
                              </p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {edu.university_name || edu.institution || ""}
                                {edu.year_of_passing
                                  ? `, ${new Date(edu.year_of_passing).getFullYear()}`
                                  : edu.year
                                    ? `, ${edu.year}`
                                    : ""}
                              </p>
                              {edu.subject && (
                                <p className={currentStyles.itemDetailsClass}>Subject: {edu.subject}</p>
                              )}
                              {edu.state && (
                                <p className={currentStyles.itemDetailsClass}>State: {edu.state}</p>
                              )}
                              {edu.QS_Ranking && (
                                <p className={currentStyles.itemDetailsClass}>QS Ranking: {edu.QS_Ranking}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Experience */}
                      {selectedSections.includes("experience") && cvData.experience.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Professional Experience</h2>
                          {cvData.experience.map((exp: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>
                                {exp.desig || exp.designation || exp.position || ""}
                              </p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {exp.Employeer || exp.institution || ""}
                              </p>
                              <p className={currentStyles.itemDetailsClass}>
                                {exp.Start_Date
                                  ? new Date(exp.Start_Date).getFullYear()
                                  : exp.from_date
                                    ? new Date(exp.from_date).getFullYear()
                                    : ""}{" "}
                                -{" "}
                                {exp.End_Date
                                  ? new Date(exp.End_Date).getFullYear()
                                  : exp.to_date
                                    ? new Date(exp.to_date).getFullYear()
                                    : exp.currente
                                      ? "Present"
                                      : ""}
                              </p>
                              {exp.Nature && (
                                <p className={currentStyles.itemDetailsClass}>Nature: {exp.Nature}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Research */}
                      {selectedSections.includes("research") && cvData.research.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Research Projects</h2>
                          {cvData.research.map((proj: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{proj.title || ""}</p>
                              <p className={currentStyles.itemDetailsClass}>
                                Funding Agency: {proj.funding_agency_name || proj.funding_agency || ""}
                              </p>
                              <p className={currentStyles.itemDetailsClass}>
                                Amount:{" "}
                                {proj.grant_sanctioned ? `₹${proj.grant_sanctioned.toLocaleString()}` : ""} |
                                Duration: {proj.duration || ""} years
                              </p>
                              <p className={currentStyles.itemDetailsClass}>
                                Status: {proj.status_name || proj.status || ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Publications */}
                      {selectedSections.includes("articles") && cvData.articles.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Publications</h2>
                          {cvData.articles.map((pub: any, index: number) => (
                            <div key={index} className={currentStyles.publicationClass}>
                              <p className="text-sm">
                                <span className="font-medium">{index + 1}.</span> {pub.authors || ""}. "{pub.title || ""}".
                                <em> {pub.journal_name || ""}</em>,{" "}
                                {pub.month_year ? new Date(pub.month_year).getFullYear() : ""}.{" "}
                                {pub.impact_factor ? `IF: ${pub.impact_factor}` : ""}.{" "}
                                {pub.DOI ? `DOI: ${pub.DOI}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Post Doctoral Research */}
                      {selectedSections.includes("postdoc") && cvData.postdoc.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Post Doctoral Research Experience</h2>
                          {cvData.postdoc.map((postdoc: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{postdoc.Institute || ""}</p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {postdoc.Start_Date ? new Date(postdoc.Start_Date).getFullYear() : ""} -{" "}
                                {postdoc.End_Date ? new Date(postdoc.End_Date).getFullYear() : "Present"}
                              </p>
                              {postdoc.SponsoredBy && (
                                <p className={currentStyles.itemDetailsClass}>Sponsored By: {postdoc.SponsoredBy}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Patents */}
                      {selectedSections.includes("patents") && cvData.patents.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Patents</h2>
                          {cvData.patents.map((patent: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{patent.title || ""}</p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {patent.date ? new Date(patent.date).getFullYear() : ""}
                              </p>
                              {patent.PatentApplicationNo && (
                                <p className={currentStyles.itemDetailsClass}>
                                  Application No: {patent.PatentApplicationNo}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* E-Content */}
                      {selectedSections.includes("econtent") && cvData.econtent.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>E-Contents</h2>
                          {cvData.econtent.map((econtent: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{econtent.title || ""}</p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {econtent.Publishing_Authorities || ""}
                              </p>
                              {econtent.Publishing_date && (
                                <p className={currentStyles.itemDetailsClass}>
                                  Published: {new Date(econtent.Publishing_date).getFullYear()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Consultancy */}
                      {selectedSections.includes("consultancy") && cvData.consultancy.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Consultancy Undertaken</h2>
                          {cvData.consultancy.map((consult: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{consult.name || ""}</p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {consult.collaborating_inst || ""}
                              </p>
                              {consult.Start_Date && (
                                <p className={currentStyles.itemDetailsClass}>
                                  {new Date(consult.Start_Date).getFullYear()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Collaborations */}
                      {selectedSections.includes("collaborations") && cvData.collaborations.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Collaborations</h2>
                          {cvData.collaborations.map((collab: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>
                                {collab.collaborating_inst || collab.collab_name || ""}
                              </p>
                              <p className={currentStyles.itemSubtitleClass}>{collab.category || ""}</p>
                              {collab.starting_date && (
                                <p className={currentStyles.itemDetailsClass}>
                                  Started: {new Date(collab.starting_date).getFullYear()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* PhD Guidance */}
                      {selectedSections.includes("phdguidance") && cvData.phdguidance.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Ph.D. Guidance</h2>
                          {cvData.phdguidance.map((phd: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{phd.name || ""}</p>
                              <p className={currentStyles.itemSubtitleClass}>
                                Registration: {phd.regno || ""}
                              </p>
                              <p className={currentStyles.itemDetailsClass}>Topic: {phd.topic || ""}</p>
                              {phd.start_date && (
                                <p className={currentStyles.itemDetailsClass}>
                                  Started: {new Date(phd.start_date).getFullYear()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Books */}
                      {selectedSections.includes("books") && cvData.books.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Books Published</h2>
                          {cvData.books.map((book: any, index: number) => (
                            <div key={index} className={currentStyles.publicationClass}>
                              <p className="text-sm">
                                <span className="font-medium">{index + 1}.</span> {book.authors || ""}. "
                                {book.title || ""}". {book.publisher_name || ""}
                                {book.submit_date ? `, ${new Date(book.submit_date).getFullYear()}` : ""}
                                {book.isbn ? `. ISBN: ${book.isbn}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Papers */}
                      {selectedSections.includes("papers") && cvData.papers.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Papers Presented</h2>
                          {cvData.papers.map((paper: any, index: number) => (
                            <div key={index} className={currentStyles.publicationClass}>
                              <p className="text-sm">
                                <span className="font-medium">{index + 1}.</span> {paper.authors || ""}. "
                                {paper.title_of_paper || ""}". {paper.organising_body || ""}
                                {paper.place ? `, ${paper.place}` : ""}
                                {paper.date ? `, ${new Date(paper.date).getFullYear()}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Publications (Articles/Journals) */}
                      {selectedSections.includes("articles") && cvData.articles.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Published Articles/Journals</h2>
                          {cvData.articles.map((pub: any, index: number) => (
                            <div key={index} className={currentStyles.publicationClass}>
                              <p className="text-sm">
                                <span className="font-medium">{index + 1}.</span> {pub.authors || ""}. "
                                {pub.title || ""}". <em>{pub.journal_name || ""}</em>,{" "}
                                {pub.month_year ? new Date(pub.month_year).getFullYear() : ""}.{" "}
                                {pub.impact_factor ? `IF: ${pub.impact_factor}` : ""}.{" "}
                                {pub.DOI ? `DOI: ${pub.DOI}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Talks */}
                      {selectedSections.includes("talks") && cvData.talks.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Talks</h2>
                          {cvData.talks.map((talk: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{talk.title || talk.name || ""}</p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {talk.place || ""}
                                {talk.date ? `, ${new Date(talk.date).getFullYear()}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Academic Contribution */}
                      {selectedSections.includes("academic_contribution") &&
                        cvData.academic_contribution.length > 0 && (
                          <div>
                            <h2 className={currentStyles.sectionTitleClass}>
                              Contribution in Academic Programme
                            </h2>
                            {cvData.academic_contribution.map((contri: any, index: number) => (
                              <div key={index} className={currentStyles.itemClass}>
                                <p className={currentStyles.itemTitleClass}>{contri.name || ""}</p>
                                <p className={currentStyles.itemSubtitleClass}>
                                  {contri.place || ""}
                                  {contri.date ? `, ${new Date(contri.date).getFullYear()}` : ""}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Academic Participation */}
                      {selectedSections.includes("academic_participation") &&
                        cvData.academic_participation.length > 0 && (
                          <div>
                            <h2 className={currentStyles.sectionTitleClass}>
                              Participation in Academic Programme
                            </h2>
                            {cvData.academic_participation.map((parti: any, index: number) => (
                              <div key={index} className={currentStyles.itemClass}>
                                <p className={currentStyles.itemTitleClass}>{parti.name || ""}</p>
                                <p className={currentStyles.itemSubtitleClass}>
                                  {parti.acad_body || ""}, {parti.place || ""}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Committees */}
                      {selectedSections.includes("committees") && cvData.committees.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>
                            Participation in Academic Committee
                          </h2>
                          {cvData.committees.map((committee: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>
                                {committee.committee_name || committee.name || ""}
                              </p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {committee.participated_as || ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Performance */}
                      {selectedSections.includes("performance") && cvData.performance.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>
                            Performance by Individual/Group
                          </h2>
                          {cvData.performance.map((perf: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{perf.name || ""}</p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {perf.place || ""}
                                {perf.date ? `, ${new Date(perf.date).getFullYear()}` : ""}
                              </p>
                              {perf.perf_nature && (
                                <p className={currentStyles.itemDetailsClass}>Nature: {perf.perf_nature}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Extension */}
                      {selectedSections.includes("extension") && cvData.extension.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Extension Activities</h2>
                          {cvData.extension.map((ext: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>
                                {ext.name_of_activity || ext.names || ""}
                              </p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {ext.place || ""}
                                {ext.date ? `, ${new Date(ext.date).getFullYear()}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Orientation */}
                      {selectedSections.includes("orientation") && cvData.orientation.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Orientation Course</h2>
                          {cvData.orientation.map((orient: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{orient.name || ""}</p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {orient.institute || orient.university || ""}
                              </p>
                              {orient.startdate && (
                                <p className={currentStyles.itemDetailsClass}>
                                  {new Date(orient.startdate).getFullYear()}
                                  {orient.enddate
                                    ? ` - ${new Date(orient.enddate).getFullYear()}`
                                    : ""}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Awards */}
                      {selectedSections.includes("awards") && cvData.awards.length > 0 && (
                        <div>
                          <h2 className={currentStyles.sectionTitleClass}>Awards & Honors</h2>
                          {cvData.awards.map((award: any, index: number) => (
                            <div key={index} className={currentStyles.itemClass}>
                              <p className={currentStyles.itemTitleClass}>{award.name || ""}</p>
                              <p className={currentStyles.itemSubtitleClass}>
                                {award.organization || ""},{" "}
                                {award.date_of_award ? new Date(award.date_of_award).getFullYear() : ""}
                              </p>
                              {award.details && <p className={currentStyles.itemDetailsClass}>{award.details}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Document Info */}
                  <div className="border-t pt-4 text-xs text-gray-500">
                    <p>Generated on: {new Date().toLocaleDateString()}</p>
                    <p>Template: {cvTemplate.charAt(0).toUpperCase() + cvTemplate.slice(1)}</p>
                    <p>
                      Sections: {selectedSections.length} of {cvSections.length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  )
}

