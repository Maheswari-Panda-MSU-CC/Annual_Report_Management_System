import { useTeacherProfile, useTeacherResearch, useTeacherPublications, useTeacherResearchContributions, useTeacherAwardsRecognition, useTeacherTalksEvents } from "./use-teacher-data"
import type { CVData, PersonalInfo } from "@/types/cv-data"

/**
 * Centralized CV Data Hook
 * Aggregates all teacher data for CV generation using React Query
 * Provides optimized, cached, parallel data fetching
 */
export function useTeacherCVData() {
  const profile = useTeacherProfile()
  const research = useTeacherResearch()
  const publications = useTeacherPublications()
  const researchContributions = useTeacherResearchContributions()
  const awardsRecognition = useTeacherAwardsRecognition()
  const talksEvents = useTeacherTalksEvents()

  const isLoading = profile.isLoading || research.isLoading || publications.isLoading || 
    researchContributions.isLoading || awardsRecognition.isLoading || talksEvents.isLoading
  
  const isFetching = profile.isFetching || research.isFetching || publications.isFetching || 
    researchContributions.isFetching || awardsRecognition.isFetching || talksEvents.isFetching

  const isError = profile.isError || research.isError || publications.isError || 
    researchContributions.isError || awardsRecognition.isError || talksEvents.isError

  // Transform data to match CVData structure
  const cvData: CVData = {
    personal: profile.data?.teacherInfo ? {
      name: [profile.data.teacherInfo.fname, profile.data.teacherInfo.mname, profile.data.teacherInfo.lname].filter(Boolean).join(" "),
      designation: profile.data.designation?.name || "",
      department: profile.data.department?.name || "",
      institution: "The Maharaja Sayajirao University of Baroda",
      email: profile.data.teacherInfo?.email_id || profile.data.teacherInfo?.email || "",
      phone: profile.data.teacherInfo?.phone_no?.toString() || profile.data.teacherInfo?.phone || "",
      address: profile.data.teacherInfo?.address || profile.data.teacherInfo?.Address || "",
      dateOfBirth: profile.data.teacherInfo?.DOB 
        ? new Date(profile.data.teacherInfo.DOB).toLocaleDateString()
        : profile.data.teacherInfo?.dob 
          ? new Date(profile.data.teacherInfo.dob).toLocaleDateString()
          : "",
      nationality: profile.data.teacherInfo?.nationality || "Indian",
      orcid: profile.data.teacherInfo?.ORCHID_ID || profile.data.teacherInfo?.orcid || "",
      profileImage: profile.data.teacherInfo?.ProfileImage || null,
    } : null,
    education: profile.data?.graduationDetails || [],
    experience: profile.data?.teacherExperience || [],
    postdoc: profile.data?.postDoctoralExp || [],
    research: research.data?.researchProjects || [],
    patents: researchContributions.data.patents,
    econtent: researchContributions.data.eContent,
    consultancy: researchContributions.data.consultancies,
    collaborations: researchContributions.data.collaborations,
    phdguidance: researchContributions.data.phdStudents,
    books: publications.data.books,
    papers: publications.data.papers,
    articles: publications.data.journals,
    awards: awardsRecognition.data.awardsFellows,
    talks: talksEvents.data.teacherTalks,
    academic_contribution: talksEvents.data.academicContributions,
    academic_participation: talksEvents.data.academicBodiesParticipation,
    committees: talksEvents.data.universityCommittees,
    performance: awardsRecognition.data.performanceTeacher,
    extension: awardsRecognition.data.extensionActivities,
    orientation: talksEvents.data.refresherDetails,
  }

  return {
    cvData,
    isLoading,
    isFetching,
    isError,
    refetch: () => {
      profile.refetch()
      research.refetch()
      publications.journals.refetch()
      publications.books.refetch()
      publications.papers.refetch()
      researchContributions.patents.refetch()
      researchContributions.econtent.refetch()
      researchContributions.consultancy.refetch()
      researchContributions.collaborations.refetch()
      researchContributions.phdguidance.refetch()
      awardsRecognition.awards.refetch()
      awardsRecognition.performance.refetch()
      awardsRecognition.extension.refetch()
      talksEvents.talks.refetch()
      talksEvents.academicContri.refetch()
      talksEvents.academicParticipation.refetch()
      talksEvents.committees.refetch()
      talksEvents.refresher.refetch()
    }
  }
}

