"use client"

import React, { memo } from "react"
import type { CVData } from "@/types/cv-data"
import type { CVTemplate } from "@/app/api/teacher/cv-generation/cv-template-styles"
import { cvTemplateStyles } from "@/app/api/teacher/cv-generation/cv-template-styles"

// Helper to format year
const formatYear = (date: string | Date | null | undefined): string => {
  if (!date) return ""
  try {
    return new Date(date).getFullYear().toString()
  } catch {
    return String(date)
  }
}

interface SectionProps {
  title: string
  children: React.ReactNode
  isEmpty?: boolean
  className?: string
  template?: CVTemplate
}

/**
 * Reusable Section Component
 * Handles empty states gracefully
 * Uses template-specific styles for consistency with PDF/Word
 */
export const Section = memo(({ title, children, isEmpty = false, className = "", template = "academic" }: SectionProps) => {
  if (isEmpty) return null
  
  const styles = cvTemplateStyles[template].previewStyles
  
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className={styles.sectionTitle}>
        {title}
      </h2>
      {children}
    </div>
  )
})

Section.displayName = "Section"

/**
 * Education Section Component
 */
export const EducationSection = memo(({ education, template = "academic" }: { education: any[]; template?: CVTemplate }) => {
  if (education.length === 0) return null
  
  const styles = cvTemplateStyles[template].previewStyles

  return (
    <Section title="Education" isEmpty={education.length === 0} template={template}>
      {education.map((edu: any, idx: number) => (
        <div key={idx} className={styles.itemClass}>
          <p className={styles.itemTitle}>
            {edu.degree_name || edu.degree_type_name || edu.degree || ""}
          </p>
          <p className={styles.itemSubtitle}>
            {edu.university_name || edu.institution || ""}
            {edu.year_of_passing
              ? `, ${formatYear(edu.year_of_passing)}`
              : edu.year
                ? `, ${edu.year}`
                : ""}
          </p>
          {edu.subject && (
            <p className={styles.itemDetails}>Subject: {edu.subject}</p>
          )}
          {edu.state && (
            <p className={styles.itemDetails}>State: {edu.state}</p>
          )}
          {edu.QS_Ranking && (
            <p className={styles.itemDetails}>QS Ranking: {edu.QS_Ranking}</p>
          )}
        </div>
      ))}
    </Section>
  )
})

EducationSection.displayName = "EducationSection"

/**
 * Experience Section Component
 */
export const ExperienceSection = memo(({ experience, template = "academic" }: { experience: any[]; template?: CVTemplate }) => {
  if (experience.length === 0) return null
  
  const styles = cvTemplateStyles[template].previewStyles

  return (
    <Section title="Professional Experience" isEmpty={experience.length === 0} template={template}>
      {experience.map((exp: any, idx: number) => (
        <div key={idx} className={styles.itemClass}>
          <p className={styles.itemTitle}>
            {exp.desig || exp.designation || exp.position || ""}
          </p>
          <p className={styles.itemSubtitle}>
            {exp.Employeer || exp.institution || ""}
          </p>
          <p className={styles.itemDetails}>
            {formatYear(exp.Start_Date || exp.from_date)} -{" "}
            {formatYear(exp.End_Date || exp.to_date) || "Present"}
          </p>
          {exp.Nature && (
            <p className={styles.itemDetails}>Nature: {exp.Nature}</p>
          )}
        </div>
      ))}
    </Section>
  )
})

ExperienceSection.displayName = "ExperienceSection"

/**
 * Publications Section Component
 */
export const PublicationsSection = memo(({ articles, template = "academic" }: { articles: any[]; template?: CVTemplate }) => {
  if (articles.length === 0) return null
  
  const styles = cvTemplateStyles[template].previewStyles

  return (
    <Section title="Published Articles/Journals" isEmpty={articles.length === 0} template={template}>
      {articles.map((pub: any, idx: number) => (
        <div key={idx} className={styles.itemClass}>
          <p className={styles.itemDetails}>
            <span className="font-medium">{idx + 1}.</span> {pub.authors || ""}. "{pub.title || ""}".
            <em> {pub.journal_name || ""}</em>, {formatYear(pub.month_year)}.
            {pub.impact_factor ? ` IF: ${pub.impact_factor}` : ""}
            {pub.DOI ? ` DOI: ${pub.DOI}` : ""}
          </p>
        </div>
      ))}
    </Section>
  )
})

PublicationsSection.displayName = "PublicationsSection"

/**
 * Research Projects Section Component
 */
export const ResearchSection = memo(({ research, template = "academic" }: { research: any[]; template?: CVTemplate }) => {
  if (research.length === 0) return null
  
  const styles = cvTemplateStyles[template].previewStyles

  return (
    <Section title="Research Projects" isEmpty={research.length === 0} template={template}>
      {research.map((proj: any, idx: number) => (
        <div key={idx} className={styles.itemClass}>
          <p className={styles.itemTitle}>{proj.title || ""}</p>
          <p className={styles.itemDetails}>
            Funding Agency: {proj.funding_agency_name || proj.funding_agency || ""}
          </p>
          <p className={styles.itemDetails}>
            Amount:{" "}
            {proj.grant_sanctioned
              ? `₹${proj.grant_sanctioned.toLocaleString()}`
              : ""}{" "}
            | Duration: {proj.duration || ""} years
          </p>
          <p className={styles.itemDetails}>
            Status: {proj.status_name || proj.status || ""}
          </p>
        </div>
      ))}
    </Section>
  )
})

ResearchSection.displayName = "ResearchSection"

/**
 * Awards Section Component
 */
export const AwardsSection = memo(({ awards, template = "academic" }: { awards: any[]; template?: CVTemplate }) => {
  if (awards.length === 0) return null
  
  const styles = cvTemplateStyles[template].previewStyles

  return (
    <Section title="Awards & Honors" isEmpty={awards.length === 0} template={template}>
      {awards.map((award: any, idx: number) => (
        <div key={idx} className={styles.itemClass}>
          <p className={styles.itemTitle}>{award.name || ""}</p>
          <p className={styles.itemSubtitle}>
            {award.organization || ""}, {formatYear(award.date_of_award)}
          </p>
          {award.details && (
            <p className={styles.itemDetails}>{award.details}</p>
          )}
        </div>
      ))}
    </Section>
  )
})

AwardsSection.displayName = "AwardsSection"

