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

// API Fetch Helper
const fetchAPI = async (url: string) => {
  const response = await fetch(url)
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
    staleTime: 3 * 60 * 1000,
  })

  const books = useQuery({
    queryKey: teacherQueryKeys.publications.books(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/publication/books?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
  })

  const papers = useQuery({
    queryKey: teacherQueryKeys.publications.papers(teacherId),
    queryFn: () => fetchAPI(`/api/teacher/publication/papers?teacherId=${teacherId}`),
    enabled: !!teacherId && teacherId > 0,
    staleTime: 3 * 60 * 1000,
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

