import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"

// Query Keys - Centralized for consistency
export const teacherQueryKeys = {
  all: ["teacher"] as const,
  dashboard: (teacherId: number) => [...teacherQueryKeys.all, "dashboard", teacherId] as const,
  profile: (teacherId: number) => [...teacherQueryKeys.all, "profile", teacherId] as const,
  publications: {
    all: (teacherId: number) => [...teacherQueryKeys.all, "publications", teacherId] as const,
    journals: (teacherId: number) => [...teacherQueryKeys.publications.all(teacherId), "journals"] as const,
    books: (teacherId: number) => [...teacherQueryKeys.publications.all(teacherId), "books"] as const,
    papers: (teacherId: number) => [...teacherQueryKeys.publications.all(teacherId), "papers"] as const,
  },
  research: (teacherId: number) => [...teacherQueryKeys.all, "research", teacherId] as const,
  researchContributions: {
    all: (teacherId: number) => [...teacherQueryKeys.all, "research-contributions", teacherId] as const,
    patents: (teacherId: number) => [...teacherQueryKeys.researchContributions.all(teacherId), "patents"] as const,
  },
  awards: {
    all: (teacherId: number) => [...teacherQueryKeys.all, "awards", teacherId] as const,
    performance: (teacherId: number) => [...teacherQueryKeys.awards.all(teacherId), "performance"] as const,
    awards: (teacherId: number) => [...teacherQueryKeys.awards.all(teacherId), "awards"] as const,
    extension: (teacherId: number) => [...teacherQueryKeys.awards.all(teacherId), "extension"] as const,
  },
  talks: {
    all: (teacherId: number) => [...teacherQueryKeys.all, "talks", teacherId] as const,
    talks: (teacherId: number) => [...teacherQueryKeys.talks.all(teacherId), "talks"] as const,
    refresher: (teacherId: number) => [...teacherQueryKeys.talks.all(teacherId), "refresher"] as const,
  },
  academicRecommendations: {
    all: (teacherId: number) => [...teacherQueryKeys.all, "academic-recommendations", teacherId] as const,
  },
}

// API Fetch Helper with cache-busting
const fetchAPI = async (url: string) => {
  // Add cache-busting parameter to prevent any caching
  const separator = url.includes('?') ? '&' : '?'
  const cacheBuster = `${separator}_cb=${Date.now()}`
  const response = await fetch(`${url}${cacheBuster}`, {
    cache: 'no-store', // Disable browser cache
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch data" }))
    throw new Error(error.error || "Failed to fetch data")
  }
  return response.json()
}

// Dashboard Hook
export function useTeacherDashboard() {
  const { user } = useAuth()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')

  return useQuery({
    queryKey: teacherQueryKeys.dashboard(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/dashboard?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Profile Hook
export function useTeacherProfile() {
  const { user } = useAuth()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')

  return useQuery({
    queryKey: teacherQueryKeys.profile(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/profile?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - profile changes less frequently
  })
}

// Publications Hooks - Parallel fetching
export function useTeacherPublications() {
  const { user } = useAuth()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')

  const journals = useQuery({
    queryKey: teacherQueryKeys.publications.journals(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/publication/journals?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 0, // Always consider data stale - force refetch after invalidation
    gcTime: 0, // Don't keep in cache - always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  })

  const books = useQuery({
    queryKey: teacherQueryKeys.publications.books(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/publication/books?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 0, // Always consider data stale - force refetch after invalidation
    gcTime: 0, // Don't keep in cache - always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  })

  const papers = useQuery({
    queryKey: teacherQueryKeys.publications.papers(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/publication/papers?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 0, // Always consider data stale - force refetch after invalidation
    gcTime: 0, // Don't keep in cache - always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  })

  return {
    journals,
    books,
    papers,
    isLoading: journals.isLoading || books.isLoading || papers.isLoading,
    isFetching: journals.isFetching || books.isFetching || papers.isFetching,
    isError: journals.isError || books.isError || papers.isError,
    data: {
      journals: journals.data?.journals || [],
      books: books.data?.books || [],
      papers: papers.data?.papers || [],
    }
  }
}

// Research Hook
export function useTeacherResearch() {
  const { user } = useAuth()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')

  return useQuery({
    queryKey: teacherQueryKeys.research(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/research?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })
}

// Research Contributions Hooks
export function useTeacherResearchContributions() {
  const { user } = useAuth()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')

  const patents = useQuery({
    queryKey: teacherQueryKeys.researchContributions.patents(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/research-contributions/patents?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const econtent = useQuery({
    queryKey: [...teacherQueryKeys.researchContributions.all(teacherId), "econtent"],
    queryFn: () => fetchAPI(`/api/teacher/research-contributions/e-content?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const consultancy = useQuery({
    queryKey: [...teacherQueryKeys.researchContributions.all(teacherId), "consultancy"],
    queryFn: () => fetchAPI(`/api/teacher/research-contributions/consultancy?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const collaborations = useQuery({
    queryKey: [...teacherQueryKeys.researchContributions.all(teacherId), "collaborations"],
    queryFn: () => fetchAPI(`/api/teacher/research-contributions/collaborations?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const phdguidance = useQuery({
    queryKey: [...teacherQueryKeys.researchContributions.all(teacherId), "phdguidance"],
    queryFn: () => fetchAPI(`/api/teacher/research-contributions/phd-guidance?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  return {
    patents,
    econtent,
    consultancy,
    collaborations,
    phdguidance,
    isLoading: patents.isLoading || econtent.isLoading || consultancy.isLoading || collaborations.isLoading || phdguidance.isLoading,
    isFetching: patents.isFetching || econtent.isFetching || consultancy.isFetching || collaborations.isFetching || phdguidance.isFetching,
    isError: patents.isError || econtent.isError || consultancy.isError || collaborations.isError || phdguidance.isError,
    data: {
      patents: patents.data?.patents || [],
      eContent: econtent.data?.eContent || [],
      consultancies: consultancy.data?.consultancies || [],
      collaborations: collaborations.data?.collaborations || [],
      phdStudents: phdguidance.data?.phdStudents || [],
    }
  }
}

// Awards & Recognition Hooks
export function useTeacherAwardsRecognition() {
  const { user } = useAuth()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')

  const awards = useQuery({
    queryKey: teacherQueryKeys.awards.awards(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/awards-recognition/awards-fellow?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const performance = useQuery({
    queryKey: teacherQueryKeys.awards.performance(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/awards-recognition/performance-teacher?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const extension = useQuery({
    queryKey: teacherQueryKeys.awards.extension(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/awards-recognition/extensions?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  return {
    awards,
    performance,
    extension,
    isLoading: awards.isLoading || performance.isLoading || extension.isLoading,
    isFetching: awards.isFetching || performance.isFetching || extension.isFetching,
    isError: awards.isError || performance.isError || extension.isError,
    data: {
      awardsFellows: awards.data?.awardsFellows || [],
      performanceTeacher: performance.data?.performanceTeacher || [],
      extensionActivities: extension.data?.extensionActivities || [],
    }
  }
}

// Talks & Events Hooks
export function useTeacherTalksEvents() {
  const { user } = useAuth()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')

  const talks = useQuery({
    queryKey: teacherQueryKeys.talks.talks(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/talks-events/teacher-talks?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const academicContri = useQuery({
    queryKey: [...teacherQueryKeys.talks.all(teacherId), "academic-contri"],
    queryFn: () => fetchAPI(`/api/teacher/talks-events/academic-contri?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const academicParticipation = useQuery({
    queryKey: [...teacherQueryKeys.talks.all(teacherId), "academic-participation"],
    queryFn: () => fetchAPI(`/api/teacher/talks-events/acad-bodies-parti?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const committees = useQuery({
    queryKey: [...teacherQueryKeys.talks.all(teacherId), "committees"],
    queryFn: () => fetchAPI(`/api/teacher/talks-events/parti-university-committes?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const refresher = useQuery({
    queryKey: teacherQueryKeys.talks.refresher(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/talks-events/refresher-details?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  return {
    talks,
    academicContri,
    academicParticipation,
    committees,
    refresher,
    isLoading: talks.isLoading || academicContri.isLoading || academicParticipation.isLoading || committees.isLoading || refresher.isLoading,
    isFetching: talks.isFetching || academicContri.isFetching || academicParticipation.isFetching || committees.isFetching || refresher.isFetching,
    isError: talks.isError || academicContri.isError || academicParticipation.isError || committees.isError || refresher.isError,
    data: {
      teacherTalks: talks.data?.teacherTalks || [],
      academicContributions: academicContri.data?.academicContributions || [],
      academicBodiesParticipation: academicParticipation.data?.academicBodiesParticipation || [],
      universityCommittees: committees.data?.universityCommittees || [],
      refresherDetails: refresher.data?.refresherDetails || [],
    }
  }
}

// Invalidation Helper
export function useInvalidateTeacherData() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const teacherId: number = user?.role_id ? parseInt(user.role_id.toString()) : parseInt(user?.id?.toString() || '0')

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: teacherQueryKeys.all }),
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: teacherQueryKeys.dashboard(teacherId) }),
    invalidateProfile: () => queryClient.invalidateQueries({ queryKey: teacherQueryKeys.profile(teacherId) }),
    invalidatePublications: () => queryClient.invalidateQueries({ queryKey: teacherQueryKeys.publications.all(teacherId) }),
    invalidateResearch: () => queryClient.invalidateQueries({ queryKey: teacherQueryKeys.research(teacherId) }),
  }
}

