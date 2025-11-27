"use client"

import React, { memo, useMemo } from "react"
import type { CVData } from "@/types/cv-data"
import type { CVTemplate } from "@/app/api/teacher/cv-generation/cv-template-styles"
import { cvTemplateStyles } from "@/app/api/teacher/cv-generation/cv-template-styles"
import { ProfileImage } from "./profile-image"
import {
  EducationSection,
  ExperienceSection,
  PublicationsSection,
  ResearchSection,
  AwardsSection,
  Section,
} from "./cv-sections"

// Helper to format year
const formatYear = (date: string | Date | null | undefined): string => {
  if (!date) return ""
  try {
    return new Date(date).getFullYear().toString()
  } catch {
    return String(date)
  }
}

/**
 * Left Column Component
 * Contains: Profile Image, Contact Info, Personal Details
 */
const LeftColumn = memo(({
  personal,
  template,
  selectedSections,
}: {
  personal: NonNullable<CVData["personal"]>
  template: CVTemplate
  selectedSections: string[]
}) => {
  const styles = cvTemplateStyles[template].previewStyles
  const isProfessional = template === "professional"
  const isAcademic = template === "academic"
  const isClassic = template === "classic"
  
  // Left column background - match PDF/Word exactly
  const leftColumnBgStyle = isProfessional
    ? { backgroundColor: "#1d4ed8", color: "#ffffff" } // Exact match with Word document
    : isAcademic
    ? { backgroundColor: "#f9fafb" } // Light gray for academic
    : isClassic
    ? { backgroundColor: "#f5f5f4" } // Warmer beige-gray for classic
    : { backgroundColor: "#f9fafb" }
  
  const leftColumnBorderStyle = isProfessional
    ? { borderRight: "2px solid #1e40af" }
    : isAcademic
    ? { borderRight: "2px solid #1e3a8a" } // Blue border for academic
    : isClassic
    ? { borderRight: "2px solid #6b7280" } // Gray border for classic
    : { borderRight: "2px solid #d1d5db" }

  return (
    <div 
      className={`${styles.leftColumn} p-8 min-h-full`}
      style={{ ...leftColumnBgStyle, ...leftColumnBorderStyle }}
    >
      <ProfileImage
        imageUrl={personal.profileImage}
        name={personal.name}
        isProfessional={isProfessional}
        size="md"
      />

      <div className="space-y-6">
        {/* Contact Information */}
        <div>
          <h2 
            className={styles.contactHeading}
            style={isProfessional 
              ? { color: "#e0e7ff" } // Light blue for professional - match PDF/Word
              : isAcademic
              ? { color: "#1e3a8a" } // Blue for academic
              : isClassic
              ? { color: "#4b5563" } // Dark gray for classic
              : undefined
            }
          >
            Contact
          </h2>
          <div className="space-y-2.5">
            {personal.email && (
              <p className={styles.contactText}>
                <span className="font-medium">Email:</span> {personal.email}
              </p>
            )}
            {personal.phone && (
              <p className={styles.contactText}>
                <span className="font-medium">Phone:</span> {personal.phone}
              </p>
            )}
            {personal.address && (
              <p className={styles.contactText}>
                <span className="font-medium">Address:</span> {personal.address}
              </p>
            )}
            {personal.orcid && (
              <p className={styles.contactText}>
                <span className="font-medium">ORCID:</span> {personal.orcid}
              </p>
            )}
          </div>
        </div>

        {/* Personal Details */}
        {selectedSections.includes("personal") && (personal.dateOfBirth || personal.nationality) && (
          <div>
            <h2 
              className={styles.contactHeading}
              style={isProfessional 
                ? { color: "#e0e7ff" } // Light blue for professional - match PDF/Word
                : isAcademic
                ? { color: "#1e3a8a" } // Blue for academic
                : isClassic
                ? { color: "#4b5563" } // Dark gray for classic
                : undefined
              }
            >
              Personal
            </h2>
            <div className="space-y-2.5">
              {personal.dateOfBirth && (
                <div>
                  <p className={`text-sm font-medium mb-0.5 ${isProfessional ? "text-blue-100" : "text-gray-900"}`}>
                    Date of Birth
                  </p>
                  <p className={styles.contactText}>{personal.dateOfBirth}</p>
                </div>
              )}
              {personal.nationality && (
                <div>
                  <p className={`text-sm font-medium mb-0.5 ${isProfessional ? "text-blue-100" : "text-gray-900"}`}>
                    Nationality
                  </p>
                  <p className={styles.contactText}>{personal.nationality}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

LeftColumn.displayName = "LeftColumn"

/**
 * Right Column Component
 * Contains: Header (name, designation) and all CV sections
 */
const RightColumn = memo(({
  cvData,
  template,
  selectedSections,
}: {
  cvData: CVData
  template: CVTemplate
  selectedSections: string[]
}) => {
  const styles = cvTemplateStyles[template].previewStyles

  const isProfessional = template === "professional"
  const isAcademic = template === "academic"
  const isClassic = template === "classic"
  
  // Header styling - match PDF/Word exactly with exact colors
  const headerStyle = isProfessional
    ? {
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        backgroundColor: "#1d4ed8", // Fallback
        color: "white",
        textAlign: "center" as const,
        marginBottom: "32px",
        padding: "30px",
        borderRadius: "8px",
      }
    : isAcademic
    ? {
        textAlign: "center" as const,
        marginBottom: "32px",
        paddingBottom: "20px",
        borderBottom: "2px solid #1e3a8a",
      }
    : isClassic
    ? {
        textAlign: "center" as const,
        marginBottom: "32px",
        paddingBottom: "20px",
        borderBottom: "2px solid #6b7280",
      }
    : undefined
  
  const nameColor = isProfessional ? "#ffffff" : "#1f2937"
  const titleColor = isProfessional ? "#e0e7ff" : isAcademic ? "#4b5563" : isClassic ? "#4b5563" : "#4b5563"
  const institutionColor = isProfessional ? "#c7d2fe" : "#6b7280"

  return (
    <div className={styles.rightColumn}>
      {/* Header - Match PDF/Word exactly with exact colors */}
      <div style={headerStyle || {}} className={!headerStyle ? styles.header : ""}>
        <h1 
          className={styles.nameClass}
          style={{ color: nameColor }}
        >
          {cvData.personal?.name}
        </h1>
        <p 
          className={styles.titleClass}
          style={{ color: titleColor }}
        >
          {cvData.personal?.designation}
        </p>
        <p 
          className={`${styles.titleClass} text-base`}
          style={{ color: titleColor }}
        >
          {cvData.personal?.department}
        </p>
        <p 
          className="text-sm mt-1"
          style={{ color: institutionColor }}
        >
          {cvData.personal?.institution}
        </p>
      </div>

      {/* Education */}
      {selectedSections.includes("education") && (
        <EducationSection education={cvData.education} template={template} />
      )}

      {/* Experience */}
      {selectedSections.includes("experience") && (
        <ExperienceSection experience={cvData.experience} template={template} />
      )}

      {/* Postdoc */}
      {selectedSections.includes("postdoc") && cvData.postdoc.length > 0 && (
        <Section title="Post Doctoral Research Experience" isEmpty={cvData.postdoc.length === 0} template={template}>
          {cvData.postdoc.map((postdoc: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{postdoc.Institute || ""}</p>
              <p className={styles.itemSubtitle}>
                {formatYear(postdoc.Start_Date)} - {formatYear(postdoc.End_Date) || "Present"}
              </p>
              {postdoc.SponsoredBy && (
                <p className={styles.itemDetails}>Sponsored By: {postdoc.SponsoredBy}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Research */}
      {selectedSections.includes("research") && (
        <ResearchSection research={cvData.research} template={template} />
      )}

      {/* Articles/Publications */}
      {selectedSections.includes("articles") && (
        <PublicationsSection articles={cvData.articles} template={template} />
      )}

      {/* Books */}
      {selectedSections.includes("books") && cvData.books.length > 0 && (
        <Section title="Books Published" isEmpty={cvData.books.length === 0} template={template}>
          {cvData.books.map((book: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemDetails}>
                <span className="font-medium">{idx + 1}.</span> {book.authors || ""}. "{book.title || ""}".
                {book.publisher_name || ""}, {formatYear(book.submit_date)}
                {book.isbn ? `. ISBN: ${book.isbn}` : ""}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Papers */}
      {selectedSections.includes("papers") && cvData.papers.length > 0 && (
        <Section title="Papers Presented" isEmpty={cvData.papers.length === 0} template={template}>
          {cvData.papers.map((paper: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemDetails}>
                <span className="font-medium">{idx + 1}.</span> {paper.authors || ""}. "{paper.title_of_paper || ""}".
                {paper.organising_body || ""}
                {paper.place ? `, ${paper.place}` : ""}
                {paper.date ? `, ${formatYear(paper.date)}` : ""}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Awards */}
      {selectedSections.includes("awards") && (
        <AwardsSection awards={cvData.awards} template={template} />
      )}

      {/* Patents */}
      {selectedSections.includes("patents") && cvData.patents.length > 0 && (
        <Section title="Patents" isEmpty={cvData.patents.length === 0} template={template}>
          {cvData.patents.map((patent: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{patent.title || ""}</p>
              <p className={styles.itemSubtitle}>{formatYear(patent.date)}</p>
              {patent.PatentApplicationNo && (
                <p className={styles.itemDetails}>Application No: {patent.PatentApplicationNo}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* E-Content */}
      {selectedSections.includes("econtent") && cvData.econtent.length > 0 && (
        <Section title="E-Contents" isEmpty={cvData.econtent.length === 0} template={template}>
          {cvData.econtent.map((econtent: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{econtent.title || ""}</p>
              <p className={styles.itemSubtitle}>{econtent.Publishing_Authorities || ""}</p>
              {econtent.Publishing_date && (
                <p className={styles.itemDetails}>Published: {formatYear(econtent.Publishing_date)}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Consultancy */}
      {selectedSections.includes("consultancy") && cvData.consultancy.length > 0 && (
        <Section title="Consultancy Undertaken" isEmpty={cvData.consultancy.length === 0} template={template}>
          {cvData.consultancy.map((consult: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{consult.name || ""}</p>
              <p className={styles.itemSubtitle}>{consult.collaborating_inst || ""}</p>
              {consult.Start_Date && (
                <p className={styles.itemDetails}>{formatYear(consult.Start_Date)}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Collaborations */}
      {selectedSections.includes("collaborations") && cvData.collaborations.length > 0 && (
        <Section title="Collaborations" isEmpty={cvData.collaborations.length === 0} template={template}>
          {cvData.collaborations.map((collab: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>
                {collab.collaborating_inst || collab.collab_name || ""}
              </p>
              <p className={styles.itemSubtitle}>{collab.category || ""}</p>
              {collab.starting_date && (
                <p className={styles.itemDetails}>Started: {formatYear(collab.starting_date)}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* PhD Guidance */}
      {selectedSections.includes("phdguidance") && cvData.phdguidance.length > 0 && (
        <Section title="Ph.D. Guidance" isEmpty={cvData.phdguidance.length === 0} template={template}>
          {cvData.phdguidance.map((phd: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{phd.name || ""}</p>
              <p className={styles.itemSubtitle}>Registration: {phd.regno || ""}</p>
              <p className={styles.itemDetails}>Topic: {phd.topic || ""}</p>
              {phd.start_date && (
                <p className={styles.itemDetails}>Started: {formatYear(phd.start_date)}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Talks */}
      {selectedSections.includes("talks") && cvData.talks.length > 0 && (
        <Section title="Talks" isEmpty={cvData.talks.length === 0} template={template}>
          {cvData.talks.map((talk: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{talk.title || talk.name || ""}</p>
              <p className={styles.itemSubtitle}>
                {talk.place || ""}
                {talk.date ? `, ${formatYear(talk.date)}` : ""}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Academic Contribution */}
      {selectedSections.includes("academic_contribution") && cvData.academic_contribution.length > 0 && (
        <Section title="Contribution in Academic Programme" isEmpty={cvData.academic_contribution.length === 0} template={template}>
          {cvData.academic_contribution.map((contri: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{contri.name || ""}</p>
              <p className={styles.itemSubtitle}>
                {contri.place || ""}
                {contri.date ? `, ${formatYear(contri.date)}` : ""}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Academic Participation */}
      {selectedSections.includes("academic_participation") && cvData.academic_participation.length > 0 && (
        <Section title="Participation in Academic Programme" isEmpty={cvData.academic_participation.length === 0} template={template}>
          {cvData.academic_participation.map((parti: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{parti.name || ""}</p>
              <p className={styles.itemSubtitle}>
                {parti.acad_body || ""}, {parti.place || ""}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Committees */}
      {selectedSections.includes("committees") && cvData.committees.length > 0 && (
        <Section title="Participation in Academic Committee" isEmpty={cvData.committees.length === 0} template={template}>
          {cvData.committees.map((committee: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>
                {committee.committee_name || committee.name || ""}
              </p>
              <p className={styles.itemSubtitle}>{committee.participated_as || ""}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Performance */}
      {selectedSections.includes("performance") && cvData.performance.length > 0 && (
        <Section title="Performance by Individual/Group" isEmpty={cvData.performance.length === 0} template={template}>
          {cvData.performance.map((perf: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{perf.name || ""}</p>
              <p className={styles.itemSubtitle}>
                {perf.place || ""}
                {perf.date ? `, ${formatYear(perf.date)}` : ""}
              </p>
              {perf.perf_nature && (
                <p className={styles.itemDetails}>Nature: {perf.perf_nature}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Extension */}
      {selectedSections.includes("extension") && cvData.extension.length > 0 && (
        <Section title="Extension Activities" isEmpty={cvData.extension.length === 0} template={template}>
          {cvData.extension.map((ext: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>
                {ext.name_of_activity || ext.names || ""}
              </p>
              <p className={styles.itemSubtitle}>
                {ext.place || ""}
                {ext.date ? `, ${formatYear(ext.date)}` : ""}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Orientation */}
      {selectedSections.includes("orientation") && cvData.orientation.length > 0 && (
        <Section title="Orientation Course" isEmpty={cvData.orientation.length === 0} template={template}>
          {cvData.orientation.map((orient: any, idx: number) => (
            <div key={idx} className={styles.itemClass}>
              <p className={styles.itemTitle}>{orient.name || ""}</p>
              <p className={styles.itemSubtitle}>
                {orient.institute || orient.university || ""}
              </p>
              {orient.startdate && (
                <p className={styles.itemDetails}>
                  {formatYear(orient.startdate)}
                  {orient.enddate ? ` - ${formatYear(orient.enddate)}` : ""}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
})

RightColumn.displayName = "RightColumn"

/**
 * Main Two-Column CV Preview Component
 * Responsive: Two columns on desktop, single column on mobile
 */
export const CVPreviewTwoColumn = memo(({
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

  return (
    <div
      className={`flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden ${styles.container}`}
      style={{ 
        fontFamily: template === "modern" || template === "professional" ? "Calibri, Arial, sans-serif" : "Times New Roman, serif",
        minHeight: '100%',
        width: '100%'
      }}
    >
      {/* Left Column - 33% width on desktop */}
      <div className="w-full md:w-1/3 flex-shrink-0">
        <LeftColumn
          personal={cvData.personal}
          template={template}
          selectedSections={selectedSections}
        />
      </div>

      {/* Right Column - 67% width on desktop */}
      <div className="w-full md:w-2/3 flex-grow">
        <RightColumn
          cvData={cvData}
          template={template}
          selectedSections={selectedSections}
        />
      </div>
    </div>
  )
})

CVPreviewTwoColumn.displayName = "CVPreviewTwoColumn"

