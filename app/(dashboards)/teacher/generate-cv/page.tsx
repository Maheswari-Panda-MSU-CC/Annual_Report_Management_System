"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, ArrowLeft, CheckSquare, Square, Eye, Settings, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

// Comprehensive dummy data for CV generation
const dummyData = {
  personal: {
    name: "Dr. Rajesh Kumar Sharma",
    designation: "Professor",
    department: "Computer Science & Engineering",
    institution: "Indian Institute of Technology Delhi",
    email: "rajesh.sharma@iitd.ac.in",
    phone: "+91-9876543210",
    address: "Block IV, Room 401, IIT Delhi, Hauz Khas, New Delhi - 110016",
    dateOfBirth: "15th March 1975",
    nationality: "Indian",
    orcid: "0000-0002-1234-5678",
    googleScholar: "https://scholar.google.com/citations?user=abc123",
    researchGate: "https://www.researchgate.net/profile/Rajesh-Sharma-123",
  },
  education: [
    {
      degree: "Ph.D. in Computer Science",
      institution: "Indian Institute of Science, Bangalore",
      year: "2005",
      thesis: "Machine Learning Algorithms for Big Data Analytics",
      grade: "Excellent",
    },
    {
      degree: "M.Tech in Computer Science & Engineering",
      institution: "Indian Institute of Technology Bombay",
      year: "2000",
      grade: "CGPA: 9.2/10",
    },
    {
      degree: "B.Tech in Computer Science & Engineering",
      institution: "National Institute of Technology Warangal",
      year: "1998",
      grade: "First Class with Distinction (85.6%)",
    },
  ],
  experience: [
    {
      position: "Professor",
      institution: "Indian Institute of Technology Delhi",
      duration: "2015 - Present",
      responsibilities: "Teaching graduate and undergraduate courses, Research supervision, Administrative duties",
    },
    {
      position: "Associate Professor",
      institution: "Indian Institute of Technology Delhi",
      duration: "2010 - 2015",
      responsibilities: "Teaching, Research, PhD supervision",
    },
    {
      position: "Assistant Professor",
      institution: "Indian Institute of Technology Delhi",
      duration: "2006 - 2010",
      responsibilities: "Teaching undergraduate courses, Research initiation",
    },
  ],
  research: [
    {
      title: "AI-Driven Healthcare Analytics Platform",
      agency: "Department of Science & Technology",
      amount: "₹45,00,000",
      duration: "2022-2025",
      role: "Principal Investigator",
      status: "Ongoing",
    },
    {
      title: "Machine Learning for Smart Cities",
      agency: "Ministry of Electronics & IT",
      amount: "₹32,00,000",
      duration: "2020-2023",
      role: "Co-Principal Investigator",
      status: "Completed",
    },
  ],
  publications: [
    {
      title: "Deep Learning Approaches for Medical Image Analysis: A Comprehensive Survey",
      journal: "IEEE Transactions on Medical Imaging",
      year: "2023",
      impact: "IF: 11.037",
      authors: "R.K. Sharma, A. Patel, S. Singh",
      doi: "10.1109/TMI.2023.1234567",
    },
    {
      title: "Federated Learning in Healthcare: Challenges and Opportunities",
      journal: "Nature Machine Intelligence",
      year: "2023",
      impact: "IF: 25.898",
      authors: "R.K. Sharma, M. Kumar, P. Gupta",
      doi: "10.1038/s42256-023-00123-4",
    },
    {
      title: "Blockchain-based Secure Data Sharing in IoT Networks",
      journal: "IEEE Internet of Things Journal",
      year: "2022",
      impact: "IF: 10.238",
      authors: "S. Verma, R.K. Sharma, N. Agarwal",
      doi: "10.1109/JIOT.2022.1234567",
    },
  ],
  awards: [
    {
      title: "Excellence in Teaching Award",
      organization: "IIT Delhi",
      year: "2023",
      description: "Recognized for outstanding contribution to undergraduate education",
    },
    {
      title: "Best Paper Award",
      organization: "International Conference on Machine Learning",
      year: "2022",
      description: "For the paper on Federated Learning in Healthcare",
    },
    {
      title: "Young Scientist Award",
      organization: "Indian National Science Academy",
      year: "2018",
      description: "For significant contributions to AI and Machine Learning research",
    },
  ],
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
  const previewRef = useRef<HTMLDivElement>(null)
  const [selectedSections, setSelectedSections] = useState<string[]>(["personal", "education", "experience"])
  const [downloadFormat, setDownloadFormat] = useState("word")
  const [cvTemplate, setCvTemplate] = useState("academic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

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

  const generateWordDocument = async () => {
    try {
      // Get current template styles
      const currentTemplate = templateStyles[cvTemplate as keyof typeof templateStyles]
      const styles = currentTemplate.documentStyles

      // Create a comprehensive HTML structure for Word document with template styling
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>CV - ${dummyData.personal.name}</title>
          <style>
            body { 
              ${styles.body}
            }
            .header { 
              ${styles.header}
            }
            .name { 
              ${styles.name}
            }
            .title { 
              ${styles.title}
            }
            .contact { 
              ${styles.contact}
            }
            .section { 
              ${styles.section}
            }
            .section-title { 
              ${styles.sectionTitle}
            }
            .item { 
              ${styles.item}
            }
            .item-title { 
              ${styles.itemTitle}
            }
            .item-subtitle { 
              ${styles.itemSubtitle}
            }
            .item-details { 
              ${styles.itemDetails}
            }
            table { 
              ${styles.table}
            }
            th { 
              ${styles.th}
            }
            td { 
              ${styles.td}
            }
            .publication { 
              ${styles.publication}
            }
            .page-break { 
              page-break-before: always; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">${dummyData.personal.name}</div>
            <div class="title">${dummyData.personal.designation}</div>
            <div class="title">${dummyData.personal.department}</div>
            <div class="title">${dummyData.personal.institution}</div>
            <div class="contact">
              Email: ${dummyData.personal.email} | Phone: ${dummyData.personal.phone}<br>
              Address: ${dummyData.personal.address}<br>
              ORCID: ${dummyData.personal.orcid} | Date of Birth: ${dummyData.personal.dateOfBirth}
            </div>
          </div>

          ${
            selectedSections.includes("personal")
              ? `
          <div class="section">
            <div class="section-title">Personal Information</div>
            <table>
              <tr><th>Name</th><td>${dummyData.personal.name}</td></tr>
              <tr><th>Designation</th><td>${dummyData.personal.designation}</td></tr>
              <tr><th>Department</th><td>${dummyData.personal.department}</td></tr>
              <tr><th>Institution</th><td>${dummyData.personal.institution}</td></tr>
              <tr><th>Email</th><td>${dummyData.personal.email}</td></tr>
              <tr><th>Phone</th><td>${dummyData.personal.phone}</td></tr>
              <tr><th>Date of Birth</th><td>${dummyData.personal.dateOfBirth}</td></tr>
              <tr><th>Nationality</th><td>${dummyData.personal.nationality}</td></tr>
              <tr><th>ORCID</th><td>${dummyData.personal.orcid}</td></tr>
            </table>
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("education")
              ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${dummyData.education
              .map(
                (edu) => `
              <div class="item">
                <div class="item-title">${edu.degree}</div>
                <div class="item-subtitle">${edu.institution}, ${edu.year}</div>
                ${edu.thesis ? `<div class="item-details">Thesis: ${edu.thesis}</div>` : ""}
                ${edu.grade ? `<div class="item-details">Grade: ${edu.grade}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("experience")
              ? `
          <div class="section">
            <div class="section-title">Professional Experience</div>
            <table>
              <tr>
                <th>Position</th>
                <th>Institution</th>
                <th>Duration</th>
                <th>Responsibilities</th>
              </tr>
              ${dummyData.experience
                .map(
                  (exp) => `
                <tr>
                  <td>${exp.position}</td>
                  <td>${exp.institution}</td>
                  <td>${exp.duration}</td>
                  <td>${exp.responsibilities}</td>
                </tr>
              `,
                )
                .join("")}
            </table>
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("research")
              ? `
          <div class="section">
            <div class="section-title">Research Projects</div>
            <table>
              <tr>
                <th>Project Title</th>
                <th>Funding Agency</th>
                <th>Amount</th>
                <th>Duration</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
              ${dummyData.research
                .map(
                  (proj) => `
                <tr>
                  <td>${proj.title}</td>
                  <td>${proj.agency}</td>
                  <td>${proj.amount}</td>
                  <td>${proj.duration}</td>
                  <td>${proj.role}</td>
                  <td>${proj.status}</td>
                </tr>
              `,
                )
                .join("")}
            </table>
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("articles")
              ? `
          <div class="section">
            <div class="section-title">Publications</div>
            ${dummyData.publications
              .map(
                (pub, index) => `
              <div class="publication">
                <strong>${index + 1}.</strong> ${pub.authors}. "${pub.title}". 
                <em>${pub.journal}</em>, ${pub.year}. ${pub.impact}. 
                DOI: ${pub.doi}
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("awards")
              ? `
          <div class="section">
            <div class="section-title">Awards & Honors</div>
            <table>
              <tr>
                <th>Award</th>
                <th>Organization</th>
                <th>Year</th>
                <th>Description</th>
              </tr>
              ${dummyData.awards
                .map(
                  (award) => `
                <tr>
                  <td>${award.title}</td>
                  <td>${award.organization}</td>
                  <td>${award.year}</td>
                  <td>${award.description}</td>
                </tr>
              `,
                )
                .join("")}
            </table>
          </div>
          `
              : ""
          }

          <div class="section">
            <div class="section-title">Document Information</div>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Template:</strong> ${cvTemplate.charAt(0).toUpperCase() + cvTemplate.slice(1)}</p>
            <p><strong>Sections included:</strong> ${selectedSections.length} of ${cvSections.length}</p>
          </div>
        </body>
        </html>
      `

      // Create a proper Word document using HTML
      const blob = new Blob([htmlContent], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `CV_${dummyData.personal.name.replace(/\s+/g, "_")}_${cvTemplate}_${new Date().toISOString().split("T")[0]}.doc`

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000)

      return true
    } catch (error) {
      console.error("Word generation error:", error)
      throw new Error(`Word document generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const generatePDFDocument = async () => {
    try {
      // Get current template styles
      const currentTemplate = templateStyles[cvTemplate as keyof typeof templateStyles]
      const styles = currentTemplate.documentStyles

      // Create comprehensive PDF content using template-specific styling
      const pdfContent = `
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @media print {
              body { margin: 0.5in; }
              .page-break { page-break-before: always; }
            }
            body { 
              ${styles.body}
            }
            .header { 
              ${styles.header}
            }
            .name { 
              ${styles.name}
            }
            .title { 
              ${styles.title}
            }
            .contact { 
              ${styles.contact}
            }
            .section { 
              ${styles.section}
            }
            .section-title { 
              ${styles.sectionTitle}
            }
            .item { 
              ${styles.item}
            }
            .item-title { 
              ${styles.itemTitle}
            }
            .item-subtitle { 
              ${styles.itemSubtitle}
            }
            .item-details { 
              ${styles.itemDetails}
            }
            table { 
              ${styles.table}
            }
            th { 
              ${styles.th}
            }
            td { 
              ${styles.td}
            }
            .publication { 
              ${styles.publication}
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">${dummyData.personal.name}</div>
            <div class="title">${dummyData.personal.designation}</div>
            <div class="title">${dummyData.personal.department}</div>
            <div class="title">${dummyData.personal.institution}</div>
            <div class="contact">
              Email: ${dummyData.personal.email} | Phone: ${dummyData.personal.phone}<br>
              Address: ${dummyData.personal.address}
            </div>
          </div>

          ${
            selectedSections.includes("personal")
              ? `
          <div class="section">
            <div class="section-title">Personal Information</div>
            <table>
              <tr><th>Name</th><td>${dummyData.personal.name}</td></tr>
              <tr><th>Designation</th><td>${dummyData.personal.designation}</td></tr>
              <tr><th>Email</th><td>${dummyData.personal.email}</td></tr>
              <tr><th>Phone</th><td>${dummyData.personal.phone}</td></tr>
              <tr><th>Date of Birth</th><td>${dummyData.personal.dateOfBirth}</td></tr>
              <tr><th>Nationality</th><td>${dummyData.personal.nationality}</td></tr>
            </table>
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("education")
              ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${dummyData.education
              .map(
                (edu) => `
              <div class="item">
                <div class="item-title">${edu.degree}</div>
                <div class="item-subtitle">${edu.institution}, ${edu.year}</div>
                ${edu.grade ? `<div class="item-details">${edu.grade}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("experience")
              ? `
          <div class="section">
            <div class="section-title">Professional Experience</div>
            ${dummyData.experience
              .map(
                (exp) => `
              <div class="item">
                <div class="item-title">${exp.position}</div>
                <div class="item-subtitle">${exp.institution} (${exp.duration})</div>
                <div class="item-details">${exp.responsibilities}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("research")
              ? `
          <div class="section">
            <div class="section-title">Research Projects</div>
            ${dummyData.research
              .map(
                (proj) => `
              <div class="item">
                <div class="item-title">${proj.title}</div>
                <div class="item-details">Funding: ${proj.agency} (${proj.amount})</div>
                <div class="item-details">Duration: ${proj.duration} | Role: ${proj.role}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("articles")
              ? `
          <div class="section">
            <div class="section-title">Publications</div>
            ${dummyData.publications
              .map(
                (pub, index) => `
              <div class="publication">
                <strong>${index + 1}.</strong> ${pub.authors}. "${pub.title}". 
                <em>${pub.journal}</em>, ${pub.year}. ${pub.impact}
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            selectedSections.includes("awards")
              ? `
          <div class="section">
            <div class="section-title">Awards & Honors</div>
            ${dummyData.awards
              .map(
                (award) => `
              <div class="item">
                <div class="item-title">${award.title}</div>
                <div class="item-subtitle">${award.organization}, ${award.year}</div>
                <div class="item-details">${award.description}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          <div class="section">
            <div class="section-title">Document Information</div>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Template:</strong> ${cvTemplate.charAt(0).toUpperCase() + cvTemplate.slice(1)}</p>
            <p><strong>Sections included:</strong> ${selectedSections.length} of ${cvSections.length}</p>
          </div>

        </body>
        </html>
      `

      // Convert HTML to PDF using browser's print functionality
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.")
      }

      printWindow.document.write(pdfContent)
      printWindow.document.close()

      // Wait for content to load
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Trigger print dialog which allows saving as PDF
      printWindow.print()

      // Close the window after a delay
      setTimeout(() => {
        printWindow.close()
      }, 2000)

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

    setIsGenerating(true)
    setGenerationError(null)

    try {
      // Validate browser compatibility
      if (!window.Blob || !window.URL || !window.URL.createObjectURL) {
        throw new Error("Your browser does not support file generation. Please use a modern browser.")
      }

      // Simulate processing time for better UX
      await new Promise((resolve) => setTimeout(resolve, 1500))

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
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setGenerationError(errorMessage)

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
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
                      disabled={isGenerating || selectedSections.length === 0}
                      className="w-full flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Generating CV...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Generate & Download CV
                        </>
                      )}
                    </Button>
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
                  {/* Header */}
                  <div className={currentStyles.headerClass}>
                    <h1 className={currentStyles.nameClass}>{dummyData.personal.name}</h1>
                    <p className={currentStyles.titleClass}>{dummyData.personal.designation}</p>
                    <p className={currentStyles.titleClass}>{dummyData.personal.department}</p>
                    <p className={currentStyles.titleClass}>{dummyData.personal.institution}</p>
                    <div className={currentStyles.contactClass}>
                      <p>
                        Email: {dummyData.personal.email} | Phone: {dummyData.personal.phone}
                      </p>
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
                              <td className={currentStyles.tdClass}>{dummyData.personal.dateOfBirth}</td>
                            </tr>
                            <tr>
                              <th className={currentStyles.thClass}>Nationality</th>
                              <td className={currentStyles.tdClass}>{dummyData.personal.nationality}</td>
                            </tr>
                            <tr>
                              <th className={currentStyles.thClass}>ORCID</th>
                              <td className={currentStyles.tdClass}>{dummyData.personal.orcid}</td>
                            </tr>
                            <tr>
                              <th className={currentStyles.thClass}>Address</th>
                              <td className={currentStyles.tdClass}>{dummyData.personal.address}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {selectedSections.includes("education") && (
                    <div>
                      <h2 className={currentStyles.sectionTitleClass}>Education</h2>
                      {dummyData.education.map((edu, index) => (
                        <div key={index} className={currentStyles.itemClass}>
                          <p className={currentStyles.itemTitleClass}>{edu.degree}</p>
                          <p className={currentStyles.itemSubtitleClass}>
                            {edu.institution}, {edu.year}
                          </p>
                          {edu.thesis && <p className={currentStyles.itemDetailsClass}>Thesis: {edu.thesis}</p>}
                          {edu.grade && <p className={currentStyles.itemDetailsClass}>{edu.grade}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Experience */}
                  {selectedSections.includes("experience") && (
                    <div>
                      <h2 className={currentStyles.sectionTitleClass}>Professional Experience</h2>
                      {dummyData.experience.map((exp, index) => (
                        <div key={index} className={currentStyles.itemClass}>
                          <p className={currentStyles.itemTitleClass}>{exp.position}</p>
                          <p className={currentStyles.itemSubtitleClass}>{exp.institution}</p>
                          <p className={currentStyles.itemDetailsClass}>{exp.duration}</p>
                          <p className={currentStyles.itemDetailsClass}>{exp.responsibilities}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Research */}
                  {selectedSections.includes("research") && (
                    <div>
                      <h2 className={currentStyles.sectionTitleClass}>Research Projects</h2>
                      {dummyData.research.map((proj, index) => (
                        <div key={index} className={currentStyles.itemClass}>
                          <p className={currentStyles.itemTitleClass}>{proj.title}</p>
                          <p className={currentStyles.itemDetailsClass}>Funding Agency: {proj.agency}</p>
                          <p className={currentStyles.itemDetailsClass}>
                            Amount: {proj.amount} | Duration: {proj.duration}
                          </p>
                          <p className={currentStyles.itemDetailsClass}>
                            Role: {proj.role} | Status: {proj.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Publications */}
                  {selectedSections.includes("articles") && (
                    <div>
                      <h2 className={currentStyles.sectionTitleClass}>Publications</h2>
                      {dummyData.publications.map((pub, index) => (
                        <div key={index} className={currentStyles.publicationClass}>
                          <p className="text-sm">
                            <span className="font-medium">{index + 1}.</span> {pub.authors}. "{pub.title}".
                            <em> {pub.journal}</em>, {pub.year}. {pub.impact}. DOI: {pub.doi}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Awards */}
                  {selectedSections.includes("awards") && (
                    <div>
                      <h2 className={currentStyles.sectionTitleClass}>Awards & Honors</h2>
                      {dummyData.awards.map((award, index) => (
                        <div key={index} className={currentStyles.itemClass}>
                          <p className={currentStyles.itemTitleClass}>{award.title}</p>
                          <p className={currentStyles.itemSubtitleClass}>
                            {award.organization}, {award.year}
                          </p>
                          <p className={currentStyles.itemDetailsClass}>{award.description}</p>
                        </div>
                      ))}
                    </div>
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
