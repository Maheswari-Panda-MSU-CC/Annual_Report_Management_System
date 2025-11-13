"use client"

import React, { memo } from "react"
import type { CVData } from "@/types/cv-data"

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
}

/**
 * Reusable Section Component
 * Handles empty states gracefully
 */
export const Section = memo(({ title, children, isEmpty = false, className = "" }: SectionProps) => {
  if (isEmpty) return null
  
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-base font-semibold mb-4 mt-8 uppercase tracking-wide border-b-2 border-gray-300 pb-2.5">
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
export const EducationSection = memo(({ education }: { education: any[] }) => {
  if (education.length === 0) return null

  return (
    <Section title="Education" isEmpty={education.length === 0}>
      {education.map((edu: any, idx: number) => (
        <div key={idx} className="mb-5 pb-4 border-b border-gray-100 last:border-b-0">
          <p className="font-semibold text-gray-900 mb-1.5 text-base">
            {edu.degree_name || edu.degree_type_name || edu.degree || ""}
          </p>
          <p className="text-sm italic text-gray-600 mb-1.5">
            {edu.university_name || edu.institution || ""}
            {edu.year_of_passing
              ? `, ${formatYear(edu.year_of_passing)}`
              : edu.year
                ? `, ${edu.year}`
                : ""}
          </p>
          {edu.subject && (
            <p className="text-sm text-gray-500 leading-relaxed">Subject: {edu.subject}</p>
          )}
          {edu.state && (
            <p className="text-sm text-gray-500 leading-relaxed">State: {edu.state}</p>
          )}
          {edu.QS_Ranking && (
            <p className="text-sm text-gray-500 leading-relaxed">QS Ranking: {edu.QS_Ranking}</p>
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
export const ExperienceSection = memo(({ experience }: { experience: any[] }) => {
  if (experience.length === 0) return null

  return (
    <Section title="Professional Experience" isEmpty={experience.length === 0}>
      {experience.map((exp: any, idx: number) => (
        <div key={idx} className="mb-5 pb-4 border-b border-gray-100 last:border-b-0">
          <p className="font-semibold text-gray-900 mb-1.5 text-base">
            {exp.desig || exp.designation || exp.position || ""}
          </p>
          <p className="text-sm italic text-gray-600 mb-1.5">
            {exp.Employeer || exp.institution || ""}
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            {formatYear(exp.Start_Date || exp.from_date)} -{" "}
            {formatYear(exp.End_Date || exp.to_date) || "Present"}
          </p>
          {exp.Nature && (
            <p className="text-sm text-gray-500 leading-relaxed">Nature: {exp.Nature}</p>
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
export const PublicationsSection = memo(({ articles }: { articles: any[] }) => {
  if (articles.length === 0) return null

  return (
    <Section title="Published Articles/Journals" isEmpty={articles.length === 0}>
      {articles.map((pub: any, idx: number) => (
        <div key={idx} className="mb-4 pb-3 border-b border-gray-100 last:border-b-0">
          <p className="text-sm leading-relaxed">
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
export const ResearchSection = memo(({ research }: { research: any[] }) => {
  if (research.length === 0) return null

  return (
    <Section title="Research Projects" isEmpty={research.length === 0}>
      {research.map((proj: any, idx: number) => (
        <div key={idx} className="mb-5 pb-4 border-b border-gray-100 last:border-b-0">
          <p className="font-semibold text-gray-900 mb-1.5 text-base">{proj.title || ""}</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Funding Agency: {proj.funding_agency_name || proj.funding_agency || ""}
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Amount:{" "}
            {proj.grant_sanctioned
              ? `₹${proj.grant_sanctioned.toLocaleString()}`
              : ""}{" "}
            | Duration: {proj.duration || ""} years
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
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
export const AwardsSection = memo(({ awards }: { awards: any[] }) => {
  if (awards.length === 0) return null

  return (
    <Section title="Awards & Honors" isEmpty={awards.length === 0}>
      {awards.map((award: any, idx: number) => (
        <div key={idx} className="mb-5 pb-4 border-b border-gray-100 last:border-b-0">
          <p className="font-semibold text-gray-900 mb-1.5 text-base">{award.name || ""}</p>
          <p className="text-sm italic text-gray-600 mb-1.5">
            {award.organization || ""}, {formatYear(award.date_of_award)}
          </p>
          {award.details && (
            <p className="text-sm text-gray-500 leading-relaxed">{award.details}</p>
          )}
        </div>
      ))}
    </Section>
  )
})

AwardsSection.displayName = "AwardsSection"

