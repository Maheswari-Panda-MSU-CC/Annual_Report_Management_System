"use client"

import React, { memo } from "react"
import type { CVData } from "@/types/cv-data"
import type { CVTemplate } from "@/app/api/teacher/cv-generation/cv-template-styles"
import { cvTemplateStyles } from "@/app/api/teacher/cv-generation/cv-template-styles"
import { ProfileImage } from "./profile-image"

// Helper to format full date (DD/MM/YYYY)
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A"
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return "N/A"
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return "N/A"
  }
}

// Helper to format year (for year-only fields like year_of_passing)
const formatYear = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A"
  try {
    return new Date(date).getFullYear().toString()
  } catch {
    return "N/A"
  }
}

// Helper to show value or N/A
const showValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return "N/A"
  return String(value)
}

/**
 * Single-Column CV Preview Component
 * Horizontal layout with personal details at top, all other sections in tabular format
 */
export const CVPreviewSingleColumn = memo(({
  cvData,
  selectedSections,
  template,
}: {
  cvData: CVData
  selectedSections: string[]
  template: CVTemplate
}) => {
  const styles = cvTemplateStyles[template].previewStyles

  if (!cvData.personal) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No data available. Please ensure your profile is complete.</p>
      </div>
    )
  }

  const personal = cvData.personal
  const isProfessional = template === "professional"
  const isAcademic = template === "academic"
  const isClassic = template === "classic"

  // Section title styling
  const sectionTitleStyle = {
    fontSize: "14px",
    fontWeight: "bold",
    color: isProfessional ? "#1e3a8a" : isAcademic ? "#1e3a8a" : isClassic ? "#92400e" : "#374151",
    borderBottom: `2px solid ${isProfessional ? "#1e3a8a" : isAcademic ? "#1e3a8a" : isClassic ? "#92400e" : "#374151"}`,
    paddingBottom: "6px",
    marginTop: "24px",
    marginBottom: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  }

  // Table styling
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "16px",
    fontSize: "12px",
  }

  const thStyle = {
    backgroundColor: isProfessional ? "#eff6ff" : isAcademic ? "#eff6ff" : isClassic ? "#fef3c7" : "#f3f4f6",
    border: `1px solid ${isProfessional ? "#bfdbfe" : isAcademic ? "#bfdbfe" : isClassic ? "#fde68a" : "#d1d5db"}`,
    padding: "8px 10px",
    textAlign: "left" as const,
    fontWeight: "bold",
    color: isProfessional ? "#1e3a8a" : isAcademic ? "#1e3a8a" : isClassic ? "#92400e" : "#374151",
    fontSize: "12px",
  }

  const tdStyle = {
    border: `1px solid ${isProfessional ? "#bfdbfe" : isAcademic ? "#bfdbfe" : isClassic ? "#fde68a" : "#d1d5db"}`,
    padding: "8px 10px",
    fontSize: "12px",
    color: "#1f2937",
  }

  // Render table for a section
  const renderTableSection = (title: string, headers: string[], rows: any[], renderRow: (row: any, idx: number) => React.ReactNode) => {
    if (rows.length === 0) {
      // Show column names when no data is available
      return (
        <div style={{ pageBreakInside: "avoid", marginBottom: "20px" }}>
          <h2 style={sectionTitleStyle}>{title}</h2>
          <div style={{ 
            padding: "16px", 
            backgroundColor: "#f9fafb", 
            border: `1px solid ${isProfessional ? "#bfdbfe" : isAcademic ? "#bfdbfe" : isClassic ? "#fde68a" : "#e5e7eb"}`,
            borderRadius: "4px",
            fontSize: "12px",
            color: "#6b7280"
          }}>
            <p style={{ margin: "0 0 8px 0", fontWeight: "500", color: "#374151" }}>No data available for this section.</p>
            <p style={{ margin: 0, fontSize: "11px" }}>
              <strong>Expected columns:</strong> {headers.join(", ")}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div style={{ pageBreakInside: "avoid", marginBottom: "20px" }}>
        <h2 style={sectionTitleStyle}>{title}</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} style={thStyle}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ pageBreakInside: "avoid" }}>
                {renderRow(row, idx)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div
      className="shadow-lg rounded-lg overflow-hidden bg-white"
      style={{
        fontFamily: template === "modern" || template === "professional" ? "Calibri, Arial, sans-serif" : "Times New Roman, serif",
        fontSize: "12px",
        lineHeight: "1.5",
        padding: "24px",
        maxWidth: "100%",
      }}
    >
      {/* Personal Details Section with Profile Image */}
      {selectedSections.includes("personal") && (
        <div style={{ marginBottom: "24px", pageBreakInside: "avoid" }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", backgroundColor: "#f9fafb", padding: "20px", borderRadius: "8px", border: `1px solid ${isProfessional ? "#bfdbfe" : isAcademic ? "#bfdbfe" : isClassic ? "#fde68a" : "#e5e7eb"}` }}>
            {/* Personal Information */}
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginBottom: "12px",
                  marginTop: 0,
                  lineHeight: "1.3",
                }}
              >
                {personal.name}
              </h1>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", marginBottom: "12px" }}>
                {personal.designation && (
                  <>
                    <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>Designation:</span>
                    <span style={{ fontSize: "13px", color: "#1f2937" }}>{personal.designation}</span>
                  </>
                )}
                {personal.department && (
                  <>
                    <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>Department:</span>
                    <span style={{ fontSize: "13px", color: "#1f2937" }}>{personal.department}</span>
                  </>
                )}
                {personal.faculty && (
                  <>
                    <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>Faculty:</span>
                    <span style={{ fontSize: "13px", color: "#1f2937" }}>{personal.faculty}</span>
                  </>
                )}
                {personal.institution && (
                  <>
                    <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>Institution:</span>
                    <span style={{ fontSize: "13px", color: "#1f2937" }}>{personal.institution}</span>
                  </>
                )}
              </div>
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px", marginTop: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px" }}>
                  {personal.email && (
                    <>
                      <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Email:</span>
                      <span style={{ fontSize: "12px", color: "#1f2937" }}>{personal.email}</span>
                    </>
                  )}
                  {personal.phone && (
                    <>
                      <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Phone:</span>
                      <span style={{ fontSize: "12px", color: "#1f2937" }}>{personal.phone}</span>
                    </>
                  )}
                  {personal.address && (
                    <>
                      <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Address:</span>
                      <span style={{ fontSize: "12px", color: "#1f2937" }}>{personal.address}</span>
                    </>
                  )}
                  {personal.dateOfBirth && (
                    <>
                      <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Date of Birth:</span>
                      <span style={{ fontSize: "12px", color: "#1f2937" }}>{personal.dateOfBirth}</span>
                    </>
                  )}
                  {personal.nationality && (
                    <>
                      <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Nationality:</span>
                      <span style={{ fontSize: "12px", color: "#1f2937" }}>{personal.nationality}</span>
                    </>
                  )}
                  {personal.orcid && (
                    <>
                      <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>ORCHID:</span>
                      <span style={{ fontSize: "12px", color: "#1f2937" }}>{personal.orcid}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Image - Right Side */}
            <div style={{ flexShrink: 0 }}>
              <ProfileImage
                imageUrl={personal.profileImage}
                name={personal.name}
                isProfessional={isProfessional}
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Line Separator */}
      <hr
        style={{
          border: "none",
          borderTop: `2px solid ${isProfessional ? "#1e3a8a" : isAcademic ? "#1e3a8a" : isClassic ? "#92400e" : "#374151"}`,
          margin: "24px 0",
        }}
      />

      {/* Education Section - Table Format */}
      {selectedSections.includes("education") &&
        renderTableSection(
          "Education Detail",
          ["Degree Level", "Institution/University", "Year", "Subject", "State", "QS Ranking"],
          cvData.education,
          (edu: any) => (
            <>
              <td style={tdStyle}>{showValue(edu.degree_type)}</td>
              <td style={tdStyle}>{showValue(edu.university_name)}</td>
              <td style={tdStyle}>{showValue(edu.year_of_passing ? formatYear(edu.year_of_passing) : null)}</td>
              <td style={tdStyle}>{showValue(edu.subject)}</td>
              <td style={tdStyle}>{showValue(edu.state)}</td>
              <td style={tdStyle}>{showValue(edu.QS_Ranking)}</td>
            </>
          ),
        )}

      {/* Post Doctoral Research Experience - Table Format */}
      {selectedSections.includes("postdoc") &&
        renderTableSection(
          "Post Doctoral Research Experience",
          ["Institute", "Start Date", "End Date", "Sponsored By"],
          cvData.postdoc,
          (postdoc: any) => (
            <>
              <td style={tdStyle}>{showValue(postdoc.Institute)}</td>
              <td style={tdStyle}>{postdoc.Start_Date ? formatDate(postdoc.Start_Date) : "N/A"}</td>
              <td style={tdStyle}>{postdoc.End_Date ? formatDate(postdoc.End_Date) : "Present"}</td>
              <td style={tdStyle}>{showValue(postdoc.SponsoredBy)}</td>
            </>
          ),
        )}

      {/* Experience Section - Table Format */}
      {selectedSections.includes("experience") &&
        renderTableSection(
          "Experience Detail",
          ["Designation", "Employer/Institution", "Start Date", "End Date", "Nature", "Is Currently Working"],
          cvData.experience,
          (exp: any) => (
            <>
              <td style={tdStyle}>{showValue(exp.desig)}</td>
              <td style={tdStyle}>{showValue(exp.Employeer)}</td>
              <td style={tdStyle}>{exp.Start_Date ? formatDate(exp.Start_Date) : "N/A"}</td>
              <td style={tdStyle}>{exp.End_Date ? formatDate(exp.End_Date) : exp.currente ? "Present" : "N/A"}</td>
              <td style={tdStyle}>{showValue(exp.Nature)}</td>
              <td style={tdStyle}>{exp.currente ? "Yes" : "No"}</td>
            </>
          ),
        )}

      {/* Research Projects - Table Format */}
      {selectedSections.includes("research") &&
        renderTableSection(
          "Research Projects Detail",
          ["Title", "Funding Agency", "Project Nature", "Duration (Months)", "Status", "Date"],
          cvData.research,
          (proj: any) => (
            <>
              <td style={tdStyle}>{showValue(proj.title)}</td>
              <td style={tdStyle}>{showValue(proj.Funding_Agency_Name)}</td>
              <td style={tdStyle}>{showValue(proj.Proj_Nature_Name)}</td>
              <td style={tdStyle}>{showValue(proj.duration)}</td>
              <td style={tdStyle}>{showValue(proj.Proj_Status_Name)}</td>
              <td style={tdStyle}>{proj.start_date ? formatDate(proj.start_date) : "N/A"}</td>
            </>
          ),
        )}

      {/* Patents - Table Format */}
      {selectedSections.includes("patents") &&
        renderTableSection(
          "Patents Detail",
          ["Title", "Level", "Status", "Tech License", "Date"],
          cvData.patents,
          (patent: any) => (
            <>
              <td style={tdStyle}>{showValue(patent.title)}</td>
              <td style={tdStyle}>{showValue(patent.Res_Pub_Level_Name)}</td>
              <td style={tdStyle}>{showValue(patent.Patent_Level_Name)}</td>
              <td style={tdStyle}>{showValue(patent.Tech_Licence)}</td>
              <td style={tdStyle}>{patent.date ? formatDate(patent.date) : "N/A"}</td>
            </>
          ),
        )}

      {/* E-Contents - Table Format */}
      {selectedSections.includes("econtent") &&
        renderTableSection(
          "E-Contents Detail",
          ["Title", "Brief Details", "Link", "Content Type", "Platform"],
          cvData.econtent,
          (econtent: any) => (
            <>
              <td style={tdStyle}>{showValue(econtent.title)}</td>
              <td style={tdStyle}>{showValue(econtent.Brief_Details)}</td>
              <td style={tdStyle}>
                {econtent.link ? (
                  <a href={econtent.link} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                    {econtent.link}
                  </a>
                ) : "N/A"}
              </td>
              <td style={tdStyle}>{showValue(econtent.EcontentTypeName)}</td>
              <td style={tdStyle}>{showValue(econtent.Econtent_PlatformName)}</td>
            </>
          ),
        )}

      {/* Consultancy - Table Format */}
      {selectedSections.includes("consultancy") &&
        renderTableSection(
          "Consultancy Undertaken Detail",
          ["Name", "Collaborating Institution", "Address", "Duration", "Amount", "Start Date", "Outcome"],
          cvData.consultancy,
          (consult: any) => (
            <>
              <td style={tdStyle}>{showValue(consult.name)}</td>
              <td style={tdStyle}>{showValue(consult.collaborating_inst)}</td>
              <td style={tdStyle}>{showValue(consult.address)}</td>
              <td style={tdStyle}>{showValue(consult.duration)}</td>
              <td style={tdStyle}>{showValue(consult.amount)}</td>
              <td style={tdStyle}>{consult.Start_Date ? formatDate(consult.Start_Date) : "N/A"}</td>
              <td style={tdStyle}>{showValue(consult.outcome)}</td>
            </>
          ),
        )}

      {/* Collaborations - Table Format */}
      {selectedSections.includes("collaborations") &&
        renderTableSection(
          "Collaborations Detail",
          ["Collaboration Name", "Collaborating Institution", "Category", "Level", "Outcome", "Starting Date", "Duration", "Status"],
          cvData.collaborations,
          (collab: any) => (
            <>
              <td style={tdStyle}>{showValue(collab.collab_name)}</td>
              <td style={tdStyle}>{showValue(collab.collaborating_inst)}</td>
              <td style={tdStyle}>{showValue(collab.category)}</td>
              <td style={tdStyle}>{showValue(collab.Collaborations_Level_Name)}</td>
              <td style={tdStyle}>{showValue(collab.Collaborations_Outcome_Name)}</td>
              <td style={tdStyle}>{collab.starting_date ? formatDate(collab.starting_date) : "N/A"}</td>
              <td style={tdStyle}>{showValue(collab.duration)}</td>
              <td style={tdStyle}>{showValue(collab.collab_status)}</td>
            </>
          ),
        )}

      {/* PhD Guidance - Table Format */}
      {selectedSections.includes("phdguidance") &&
        renderTableSection(
          "Ph.D. Guidance Detail",
          ["Student Name", "Registration No", "Topic", "Status", "Date Registered", "Year of Completion"],
          cvData.phdguidance,
          (phd: any) => (
            <>
              <td style={tdStyle}>{showValue(phd.name)}</td>
              <td style={tdStyle}>{showValue(phd.regno)}</td>
              <td style={tdStyle}>{showValue(phd.topic)}</td>
              <td style={tdStyle}>{showValue(phd.Res_Proj_Other_Details_Status_Name)}</td>
              <td style={tdStyle}>{phd.start_date ? formatDate(phd.start_date) : "N/A"}</td>
              <td style={tdStyle}>{showValue(phd.year_of_completion)}</td>
            </>
          ),
        )}

      {/* Books - Table Format */}
      {selectedSections.includes("books") &&
        renderTableSection(
          "Book Published Detail",
          ["S.No", "Authors", "Title", "Publisher", "Place", "Book Type", "Author Type", "Level", "Year", "ISBN"],
          cvData.books,
          (book: any, idx: number) => (
            <>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={tdStyle}>{showValue(book.authors)}</td>
              <td style={tdStyle}>{showValue(book.title)}</td>
              <td style={tdStyle}>{showValue(book.publisher_name)}</td>
              <td style={tdStyle}>{showValue(book.place)}</td>
              <td style={tdStyle}>{showValue(book.Book_Type_Name)}</td>
              <td style={tdStyle}>{showValue(book.Author_Type_Name)}</td>
              <td style={tdStyle}>{showValue(book.Res_Pub_Level_Name)}</td>
              <td style={tdStyle}>{book.submit_date ? formatYear(book.submit_date) : "N/A"}</td>
              <td style={tdStyle}>{showValue(book.isbn)}</td>
            </>
          ),
        )}

      {/* Papers - Table Format */}
      {selectedSections.includes("papers") &&
        renderTableSection(
          "Paper Presented Detail",
          ["S.No", "Authors", "Title of Paper", "Theme", "Level", "Organising Body", "Place", "Published Year"],
          cvData.papers,
          (paper: any, idx: number) => (
            <>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={tdStyle}>{showValue(paper.authors)}</td>
              <td style={tdStyle}>{showValue(paper.title_of_paper)}</td>
              <td style={tdStyle}>{showValue(paper.theme)}</td>
              <td style={tdStyle}>{showValue(paper.Res_Pub_Level_Name)}</td>
              <td style={tdStyle}>{showValue(paper.organising_body)}</td>
              <td style={tdStyle}>{showValue(paper.place)}</td>
              <td style={tdStyle}>{paper.date ? formatYear(paper.date) : "N/A"}</td>
            </>
          ),
        )}

      {/* Articles/Publications - Table Format */}
      {selectedSections.includes("articles") &&
        renderTableSection(
          "Published Articles/Papers in Journals/Edited Volumes",
          ["S.No", "Authors", "Title", "Journal Name", "Volume No", "Page No", "ISSN", "Level", "Published Year"],
          cvData.articles,
          (pub: any, idx: number) => (
            <>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={tdStyle}>{showValue(pub.authors)}</td>
              <td style={tdStyle}>{showValue(pub.title)}</td>
              <td style={tdStyle}>{showValue(pub.journal_name)}</td>
              <td style={tdStyle}>{showValue(pub.volume_num)}</td>
              <td style={tdStyle}>{showValue(pub.page_num)}</td>
              <td style={tdStyle}>{showValue(pub.issn)}</td>
              <td style={tdStyle}>{showValue(pub.Res_Pub_Level_Name)}</td>
              <td style={tdStyle}>{pub.month_year ? formatYear(pub.month_year) : "N/A"}</td>
            </>
          ),
        )}

      {/* Awards - Table Format */}
      {selectedSections.includes("awards") &&
        renderTableSection(
          "Awards/Fellowship Detail",
          ["Name", "Organization", "Level", "Date of Award", "Details", "Address"],
          cvData.awards,
          (award: any) => (
            <>
              <td style={tdStyle}>{showValue(award.name)}</td>
              <td style={tdStyle}>{showValue(award.organization)}</td>
              <td style={tdStyle}>{showValue(award.Expr1)}</td>
              <td style={tdStyle}>{award.date_of_award ? formatDate(award.date_of_award) : "N/A"}</td>
              <td style={tdStyle}>{showValue(award.details)}</td>
              <td style={tdStyle}>{showValue(award.address)}</td>
            </>
          ),
        )}

      {/* Talks - Table Format */}
      {selectedSections.includes("talks") &&
        renderTableSection(
          "Talk Detail",
          ["Title/Name", "Programme", "Place", "Participated As", "Date"],
          cvData.talks,
          (talk: any) => (
            <>
              <td style={tdStyle}>{showValue(talk.title || talk.name)}</td>
              <td style={tdStyle}>{showValue(talk.teacher_talks_prog_name)}</td>
              <td style={tdStyle}>{showValue(talk.place)}</td>
              <td style={tdStyle}>{showValue(talk.teacher_talks_parti_name)}</td>
              <td style={tdStyle}>{talk.date ? formatDate(talk.date) : "N/A"}</td>
            </>
          ),
        )}

      {/* Academic Contribution - Table Format */}
      {selectedSections.includes("academic_contribution") &&
        renderTableSection(
          "Contribution in Academic Programme Detail",
          ["Name", "Programme", "Participated As", "Place", "Date", "Year"],
          cvData.academic_contribution,
          (contri: any) => (
            <>
              <td style={tdStyle}>{showValue(contri.name)}</td>
              <td style={tdStyle}>{showValue(contri.Expr2)}</td>
              <td style={tdStyle}>{showValue(contri.Expr1)}</td>
              <td style={tdStyle}>{showValue(contri.place)}</td>
              <td style={tdStyle}>{contri.date ? formatDate(contri.date) : "N/A"}</td>
              <td style={tdStyle}>{showValue(contri.Expr22)}</td>
            </>
          ),
        )}

      {/* Academic Participation - Table Format */}
      {selectedSections.includes("academic_participation") &&
        renderTableSection(
          "Participation in Academic Programme Detail",
          ["Name", "Academic Body", "Participated As", "Place", "Submit Date", "Year"],
          cvData.academic_participation,
          (parti: any) => (
            <>
              <td style={tdStyle}>{showValue(parti.name)}</td>
              <td style={tdStyle}>{showValue(parti.acad_body)}</td>
              <td style={tdStyle}>{showValue(parti.participated_as)}</td>
              <td style={tdStyle}>{showValue(parti.place)}</td>
              <td style={tdStyle}>{parti.submit_date ? formatDate(parti.submit_date) : "N/A"}</td>
              <td style={tdStyle}>{showValue(parti.Report_Yr)}</td>
            </>
          ),
        )}

      {/* Committees - Table Format */}
      {selectedSections.includes("committees") &&
        renderTableSection(
          "Participation in Academic Committee",
          ["Name", "Committee Name", "Level", "Participated As", "Submit Date", "Year"],
          cvData.committees,
          (committee: any) => (
            <>
              <td style={tdStyle}>{showValue(committee.name)}</td>
              <td style={tdStyle}>{showValue(committee.committee_name)}</td>
              <td style={tdStyle}>{showValue(committee.Parti_Commi_Level_Name)}</td>
              <td style={tdStyle}>{showValue(committee.participated_as)}</td>
              <td style={tdStyle}>{committee.submit_date ? formatDate(committee.submit_date) : "N/A"}</td>
              <td style={tdStyle}>{showValue(committee.Expr28)}</td>
            </>
          ),
        )}

      {/* Performance - Table Format */}
      {selectedSections.includes("performance") &&
        renderTableSection(
          "Performance by Individual/Group Detail",
          ["Name", "Place", "Date", "Nature"],
          cvData.performance,
          (perf: any) => (
            <>
              <td style={tdStyle}>{showValue(perf.name)}</td>
              <td style={tdStyle}>{showValue(perf.place)}</td>
              <td style={tdStyle}>{perf.date ? formatDate(perf.date) : "N/A"}</td>
              <td style={tdStyle}>{showValue(perf.perf_nature)}</td>
            </>
          ),
        )}

      {/* Extension - Table Format */}
      {selectedSections.includes("extension") &&
        renderTableSection(
          "Extension Detail",
          ["Name of Activity", "Place", "Level", "Sponsored By", "Date"],
          cvData.extension,
          (ext: any) => (
            <>
              <td style={tdStyle}>{showValue(ext.name_of_activity || ext.names)}</td>
              <td style={tdStyle}>{showValue(ext.place)}</td>
              <td style={tdStyle}>{showValue(ext.Awards_Fellows_Level_name)}</td>
              <td style={tdStyle}>{showValue(ext.sponsered_name)}</td>
              <td style={tdStyle}>{ext.date ? formatDate(ext.date) : "N/A"}</td>
            </>
          ),
        )}

      {/* Orientation - Table Format */}
      {selectedSections.includes("orientation") &&
        renderTableSection(
          "Orientation Course Detail",
          ["Name", "Course Type", "Institute", "University", "Department", "Centre", "Start Date", "End Date"],
          cvData.orientation,
          (orient: any) => (
            <>
              <td style={tdStyle}>{showValue(orient.name)}</td>
              <td style={tdStyle}>{showValue(orient.Refresher_Course_Type_Name)}</td>
              <td style={tdStyle}>{showValue(orient.institute)}</td>
              <td style={tdStyle}>{showValue(orient.university)}</td>
              <td style={tdStyle}>{showValue(orient.department)}</td>
              <td style={tdStyle}>{showValue(orient.centre)}</td>
              <td style={tdStyle}>{orient.startdate ? formatDate(orient.startdate) : "N/A"}</td>
              <td style={tdStyle}>{orient.enddate ? formatDate(orient.enddate) : "N/A"}</td>
            </>
          ),
        )}
    </div>
  )
})

CVPreviewSingleColumn.displayName = "CVPreviewSingleColumn"

