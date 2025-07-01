"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"
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

export default function GenerateCVPage() {
  const router = useRouter()
  const { toast } = useToast()
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
      // Create a comprehensive HTML structure for Word document
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>CV - ${dummyData.personal.name}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              line-height: 1.6; 
              margin: 1in; 
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 5px; 
            }
            .title { 
              font-size: 18px; 
              color: #666; 
              margin-bottom: 5px; 
            }
            .contact { 
              font-size: 12px; 
              margin-top: 10px; 
            }
            .section { 
              margin-bottom: 25px; 
            }
            .section-title { 
              font-size: 16px; 
              font-weight: bold; 
              color: #2c5aa0; 
              border-bottom: 1px solid #2c5aa0; 
              padding-bottom: 5px; 
              margin-bottom: 15px; 
              text-transform: uppercase; 
            }
            .item { 
              margin-bottom: 15px; 
            }
            .item-title { 
              font-weight: bold; 
              margin-bottom: 3px; 
            }
            .item-subtitle { 
              font-style: italic; 
              color: #666; 
              margin-bottom: 3px; 
            }
            .item-details { 
              font-size: 14px; 
              margin-bottom: 5px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 15px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
            }
            .publication { 
              margin-bottom: 10px; 
              text-align: justify; 
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
      link.download = `CV_${dummyData.personal.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.doc`

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
      // Create comprehensive PDF content using HTML structure
      const pdfContent = `
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.4; 
              margin: 20px; 
              color: #333; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 15px; 
              margin-bottom: 20px; 
            }
            .name { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 5px; 
            }
            .title { 
              font-size: 14px; 
              color: #666; 
              margin-bottom: 3px; 
            }
            .contact { 
              font-size: 10px; 
              margin-top: 8px; 
            }
            .section { 
              margin-bottom: 20px; 
              page-break-inside: avoid;
            }
            .section-title { 
              font-size: 14px; 
              font-weight: bold; 
              color: #2c5aa0; 
              border-bottom: 1px solid #2c5aa0; 
              padding-bottom: 3px; 
              margin-bottom: 10px; 
              text-transform: uppercase; 
            }
            .item { 
              margin-bottom: 10px; 
            }
            .item-title { 
              font-weight: bold; 
              margin-bottom: 2px; 
            }
            .item-subtitle { 
              font-style: italic; 
              color: #666; 
              margin-bottom: 2px; 
            }
            .item-details { 
              font-size: 11px; 
              margin-bottom: 3px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 10px; 
              font-size: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 5px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
            }
            .publication { 
              margin-bottom: 8px; 
              text-align: justify; 
              font-size: 11px;
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
          description: `Your ${cvTemplate} CV with ${selectedSections.length} sections has been generated. ${downloadFormat === "pdf" ? "Use your browser's print dialog to save as PDF." : "The file should download automatically."}`,
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

  return (
    <DashboardLayout>
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
          <Button variant="outline" onClick={testDocumentGeneration} className="flex items-center gap-2">
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
                  <Button variant="outline" onClick={handleSelectAll} className="flex items-center gap-2">
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
                      className="w-full flex items-center gap-2"
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

        {/* CV Preview */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>CV Preview</CardTitle>
              <CardDescription>Preview of your generated CV content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-8 border rounded-lg shadow-sm max-h-96 overflow-y-auto">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center border-b pb-4">
                    <h1 className="text-2xl font-bold">{dummyData.personal.name}</h1>
                    <p className="text-lg text-gray-600">{dummyData.personal.designation}</p>
                    <p className="text-gray-600">{dummyData.personal.department}</p>
                    <p className="text-gray-600">{dummyData.personal.institution}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>
                        Email: {dummyData.personal.email} | Phone: {dummyData.personal.phone}
                      </p>
                    </div>
                  </div>

                  {/* Personal Information */}
                  {selectedSections.includes("personal") && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b">PERSONAL INFORMATION</h2>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Date of Birth:</strong> {dummyData.personal.dateOfBirth}
                        </div>
                        <div>
                          <strong>Nationality:</strong> {dummyData.personal.nationality}
                        </div>
                        <div>
                          <strong>ORCID:</strong> {dummyData.personal.orcid}
                        </div>
                        <div>
                          <strong>Address:</strong> {dummyData.personal.address}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {selectedSections.includes("education") && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b">EDUCATION</h2>
                      {dummyData.education.map((edu, index) => (
                        <div key={index} className="mb-3">
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-gray-600">
                            {edu.institution}, {edu.year}
                          </p>
                          {edu.thesis && <p className="text-sm text-gray-500">Thesis: {edu.thesis}</p>}
                          {edu.grade && <p className="text-sm text-gray-500">{edu.grade}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Experience */}
                  {selectedSections.includes("experience") && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b">PROFESSIONAL EXPERIENCE</h2>
                      {dummyData.experience.map((exp, index) => (
                        <div key={index} className="mb-3">
                          <p className="font-medium">{exp.position}</p>
                          <p className="text-gray-600">{exp.institution}</p>
                          <p className="text-sm text-gray-500">{exp.duration}</p>
                          <p className="text-sm">{exp.responsibilities}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Research */}
                  {selectedSections.includes("research") && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b">RESEARCH PROJECTS</h2>
                      {dummyData.research.map((proj, index) => (
                        <div key={index} className="mb-3">
                          <p className="font-medium">{proj.title}</p>
                          <p className="text-sm text-gray-600">Funding Agency: {proj.agency}</p>
                          <p className="text-sm text-gray-600">
                            Amount: {proj.amount} | Duration: {proj.duration}
                          </p>
                          <p className="text-sm text-gray-500">
                            Role: {proj.role} | Status: {proj.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Publications */}
                  {selectedSections.includes("articles") && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b">PUBLICATIONS</h2>
                      {dummyData.publications.map((pub, index) => (
                        <div key={index} className="mb-2">
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
                      <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b">AWARDS & HONORS</h2>
                      {dummyData.awards.map((award, index) => (
                        <div key={index} className="mb-2">
                          <p className="text-sm">
                            <span className="font-medium">{award.title}</span> - {award.organization}, {award.year}
                          </p>
                          <p className="text-xs text-gray-500">{award.description}</p>
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
    </DashboardLayout>
  )
}
