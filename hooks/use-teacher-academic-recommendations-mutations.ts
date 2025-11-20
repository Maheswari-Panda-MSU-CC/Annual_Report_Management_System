import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { teacherQueryKeys } from "./use-teacher-data"
import { useToast } from "@/components/ui/use-toast"

type AcademicRecommendationsSectionId = "articles" | "books" | "magazines" | "technical"

// API Endpoints
const API_ENDPOINTS: Record<AcademicRecommendationsSectionId, string> = {
  articles: "/api/teacher/academic-recommendations/journal-articles",
  books: "/api/teacher/academic-recommendations/books",
  magazines: "/api/teacher/academic-recommendations/magazines",
  technical: "/api/teacher/academic-recommendations/tech-reports",
}

// Delete endpoint configurations
const DELETE_CONFIG: Record<AcademicRecommendationsSectionId, { param: string; successMessage: string }> = {
  articles: {
    param: "journalId",
    successMessage: "Journal article deleted successfully!",
  },
  books: {
    param: "bookId",
    successMessage: "Book deleted successfully!",
  },
  magazines: {
    param: "magazineId",
    successMessage: "Magazine deleted successfully!",
  },
  technical: {
    param: "techReportId",
    successMessage: "Technical report deleted successfully!",
  },
}

// Get query key for a section
const getQueryKey = (teacherId: number, sectionId: AcademicRecommendationsSectionId) => {
  if (sectionId === "articles") {
    return teacherQueryKeys.academicRecommendations.articles(teacherId)
  } else if (sectionId === "books") {
    return teacherQueryKeys.academicRecommendations.books(teacherId)
  } else if (sectionId === "magazines") {
    return teacherQueryKeys.academicRecommendations.magazines(teacherId)
  } else if (sectionId === "technical") {
    return teacherQueryKeys.academicRecommendations.technical(teacherId)
  }
  return teacherQueryKeys.academicRecommendations.all(teacherId)
}

// Get request body key for a section
const getRequestBodyKey = (sectionId: AcademicRecommendationsSectionId): string => {
  const keyMap: Record<AcademicRecommendationsSectionId, string> = {
    articles: "journal",
    books: "book",
    magazines: "magazine",
    technical: "techReport",
  }
  return keyMap[sectionId]
}

// Get update request body for a section
const getUpdateRequestBody = (sectionId: AcademicRecommendationsSectionId, id: number, teacherId: number, data: any) => {
  if (sectionId === "articles") {
    return {
      journalId: id,
      teacherId,
      journal: data,
    }
  } else if (sectionId === "books") {
    return {
      bookId: id,
      teacherId,
      book: data,
    }
  } else if (sectionId === "magazines") {
    return {
      magazineId: id,
      teacherId,
      magazine: data,
    }
  } else if (sectionId === "technical") {
    return {
      techReportId: id,
      teacherId,
      techReport: data,
    }
  }
  return { teacherId, data }
}

/**
 * Generic mutation hook for academic-recommendations sections
 */
export function useAcademicRecommendationsMutations(sectionId: AcademicRecommendationsSectionId) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const teacherId: number = user?.role_id
    ? parseInt(user.role_id.toString())
    : parseInt(user?.id?.toString() || "0")

  const queryKey = getQueryKey(teacherId, sectionId)
  const requestBodyKey = getRequestBodyKey(sectionId)

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = API_ENDPOINTS[sectionId]
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, [requestBodyKey]: data }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || `Failed to create ${sectionId} record`)
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data - use "all" to ensure queries refetch even if not currently active
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "all",
      })
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.academicRecommendations.all(teacherId),
        refetchType: "all",
      })
      toast({
        title: "Success",
        description: `"${variables.title || sectionId}" has been added successfully!`,
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to add ${sectionId}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const endpoint = API_ENDPOINTS[sectionId]
      const requestBody = getUpdateRequestBody(sectionId, id, teacherId, data)
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || `Failed to update ${sectionId} record`)
      }
      return res.json()
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        const dataKey = sectionId === "articles" ? "journals" :
          sectionId === "books" ? "books" :
          sectionId === "magazines" ? "magazines" :
          "techReports"
        
        const items = old[dataKey] || []
        return {
          ...old,
          [dataKey]: items.map((item: any) =>
            (item.id === id || item.Id === id) ? { ...item, ...data } : item
          ),
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast({
        title: "Error",
        description: err.message || `Failed to update ${sectionId}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (_, variables) => {
      // Invalidate to refetch fresh data - use "all" to ensure queries refetch even if not currently active
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "all",
      })
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.academicRecommendations.all(teacherId),
        refetchType: "all",
      })
      toast({
        title: "Success",
        description: `"${variables.data.title || sectionId}" has been updated successfully!`,
        duration: 3000,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const config = DELETE_CONFIG[sectionId]
      const endpoint = API_ENDPOINTS[sectionId]
      const res = await fetch(`${endpoint}?${config.param}=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || `Failed to delete ${sectionId} record`)
      }
      return res.json()
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        const dataKey = sectionId === "articles" ? "journals" :
          sectionId === "books" ? "books" :
          sectionId === "magazines" ? "magazines" :
          "techReports"
        
        const items = old[dataKey] || []
        return {
          ...old,
          [dataKey]: items.filter((item: any) => (item.id !== id && item.Id !== id)),
        }
      })

      return { previousData }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast({
        title: "Error",
        description: err.message || `Failed to delete ${sectionId}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: () => {
      // Invalidate to refetch fresh data - use "all" to ensure queries refetch even if not currently active
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "all",
      })
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.academicRecommendations.all(teacherId),
        refetchType: "all",
      })
      toast({
        title: "Success",
        description: DELETE_CONFIG[sectionId].successMessage,
        duration: 3000,
      })
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  }
}

// Individual section mutation hooks for convenience
export function useArticlesMutations() {
  return useAcademicRecommendationsMutations("articles")
}

export function useBooksMutations() {
  return useAcademicRecommendationsMutations("books")
}

export function useMagazinesMutations() {
  return useAcademicRecommendationsMutations("magazines")
}

export function useTechReportsMutations() {
  return useAcademicRecommendationsMutations("technical")
}

