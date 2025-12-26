import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { teacherQueryKeys } from "./use-teacher-data"
import { useToast } from "@/components/ui/use-toast"
import { createAbortController } from "@/lib/request-controller"

// ==================== JOURNAL MUTATIONS ====================
export function useJournalMutations() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const teacherId: number = user?.role_id 
    ? parseInt(user.role_id.toString()) 
    : parseInt(user?.id?.toString() || '0')

  const handleUnauthorized = (error: Error) => {
    const message = error?.message || ""
    if (message.includes("Unauthorized") || message.includes("401")) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
        duration: 5000,
      })
      logout?.()
      return true
    }
    return false
  }

  const createJournal = useMutation({
    mutationFn: async (journalData: any) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/teacher/publication/journals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journal: journalData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to create journal article")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onSuccess: () => {
      // Invalidate all publication queries - triggers automatic refetch
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.publications.all(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      toast({ 
        title: "Success", 
        description: "Journal article added successfully!",
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      if (handleUnauthorized(error)) return
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add journal article. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const updateJournal = useMutation({
    mutationFn: async ({ journalId, journalData }: { journalId: number; journalData: any }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/teacher/publication/journals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journalId, journal: journalData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to update journal article")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    // Optimistic update for immediate UI feedback
    onMutate: async ({ journalId, journalData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: teacherQueryKeys.publications.journals(teacherId) 
      })
      
      // Snapshot previous value
      const previousJournals = queryClient.getQueryData(
        teacherQueryKeys.publications.journals(teacherId)
      )
      
      // Optimistically update cache
      queryClient.setQueryData(
        teacherQueryKeys.publications.journals(teacherId),
        (old: any) => {
          if (!old?.journals) return old
          return {
            ...old,
            journals: old.journals.map((j: any) =>
              j.id === journalId ? { ...j, ...journalData } : j
            ),
          }
        }
      )
      
      return { previousJournals }
    },
    onError: (err, variables, context) => {
      if (handleUnauthorized(err)) return
      // Rollback on error
      if (context?.previousJournals) {
        queryClient.setQueryData(
          teacherQueryKeys.publications.journals(teacherId),
          context.previousJournals
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update journal article. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data, variables) => {
      // Invalidate to ensure server state is synced
      // This ensures edit page will fetch fresh data when opened again
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.publications.all(teacherId),
        refetchType: 'active'
      })
      // Also invalidate any individual item queries
      queryClient.invalidateQueries({ 
        queryKey: [...teacherQueryKeys.publications.journals(teacherId), variables.journalId]
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      toast({ 
        title: "Success", 
        description: "Journal article updated successfully!",
        duration: 3000,
      })
    },
  })

  const deleteJournal = useMutation({
    mutationFn: async ({ journalId, imagePath }: { journalId: number; imagePath?: string | null }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch(`/api/teacher/publication/journals?journalId=${journalId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            journalId,
            image: imagePath || null,
          }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to delete journal article")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    // Optimistic update
    onMutate: async (journalId) => {
      await queryClient.cancelQueries({ 
        queryKey: teacherQueryKeys.publications.journals(teacherId) 
      })
      
      const previousJournals = queryClient.getQueryData(
        teacherQueryKeys.publications.journals(teacherId)
      )
      
      queryClient.setQueryData(
        teacherQueryKeys.publications.journals(teacherId),
        (old: any) => {
          if (!old?.journals) return old
          return {
            ...old,
            journals: old.journals.filter((j: any) => j.id !== journalId),
          }
        }
      )
      
      return { previousJournals }
    },
    onError: (err, { journalId }, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousJournals) {
        queryClient.setQueryData(
          teacherQueryKeys.publications.journals(teacherId),
          context.previousJournals
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to delete journal article. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.publications.all(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      // Show success message - handle different scenarios
      if (data.warning) {
        toast({
          title: "Success",
          description: data.message || "Journal article deleted successfully",
          duration: 5000,
        })
        toast({
          title: "Warning",
          description: data.warning,
          variant: "default",
          duration: 5000,
        })
      } else {
        toast({ 
          title: "Success", 
          description: data.message || "Journal article and document deleted successfully!",
          duration: 3000,
        })
      }
    },
  })

  return { createJournal, updateJournal, deleteJournal }
}

// ==================== BOOK MUTATIONS ====================
export function useBookMutations() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const teacherId: number = user?.role_id 
    ? parseInt(user.role_id.toString()) 
    : parseInt(user?.id?.toString() || '0')

  const handleUnauthorized = (error: Error) => {
    const message = error?.message || ""
    if (message.includes("Unauthorized") || message.includes("401")) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
        duration: 5000,
      })
      logout?.()
      return true
    }
    return false
  }

  const createBook = useMutation({
    mutationFn: async (bookData: any) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/teacher/publication/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book: bookData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to create book")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.publications.all(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      toast({ 
        title: "Success", 
        description: "Book/Book chapter added successfully!",
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      if (handleUnauthorized(error)) return
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add book. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const updateBook = useMutation({
    mutationFn: async ({ bookId, bookData }: { bookId: number; bookData: any }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/teacher/publication/books", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId, book: bookData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to update book")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ bookId, bookData }) => {
      await queryClient.cancelQueries({ 
        queryKey: teacherQueryKeys.publications.books(teacherId) 
      })
      
      const previousBooks = queryClient.getQueryData(
        teacherQueryKeys.publications.books(teacherId)
      )
      
      queryClient.setQueryData(
        teacherQueryKeys.publications.books(teacherId),
        (old: any) => {
          if (!old?.books) return old
          return {
            ...old,
            books: old.books.map((b: any) =>
              b.bid === bookId ? { ...b, ...bookData } : b
            ),
          }
        }
      )
      
      return { previousBooks }
    },
    onError: (err, variables, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousBooks) {
        queryClient.setQueryData(
          teacherQueryKeys.publications.books(teacherId),
          context.previousBooks
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update book. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.publications.all(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: [...teacherQueryKeys.publications.books(teacherId), variables.bookId]
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      toast({ 
        title: "Success", 
        description: "Book/Book chapter updated successfully!",
        duration: 3000,
      })
    },
  })

  const deleteBook = useMutation({
    mutationFn: async ({ bookId, imagePath }: { bookId: number; imagePath?: string | null }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch(`/api/teacher/publication/books?bookId=${bookId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookId,
            image: imagePath || null,
          }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to delete book")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ bookId }) => {
      await queryClient.cancelQueries({ 
        queryKey: teacherQueryKeys.publications.books(teacherId) 
      })
      
      const previousBooks = queryClient.getQueryData(
        teacherQueryKeys.publications.books(teacherId)
      )
      
      queryClient.setQueryData(
        teacherQueryKeys.publications.books(teacherId),
        (old: any) => {
          if (!old?.books) return old
          return {
            ...old,
            books: old.books.filter((b: any) => b.bid !== bookId),
          }
        }
      )
      
      return { previousBooks }
    },
    onError: (err, { bookId }, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousBooks) {
        queryClient.setQueryData(
          teacherQueryKeys.publications.books(teacherId),
          context.previousBooks
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to delete book. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.publications.all(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      // Show success message - handle different scenarios
      if (data.warning) {
        toast({
          title: "Success",
          description: data.message || "Book/Book chapter deleted successfully",
          duration: 5000,
        })
        toast({
          title: "Warning",
          description: data.warning,
          variant: "default",
          duration: 5000,
        })
      } else {
        toast({ 
          title: "Success", 
          description: data.message || "Book/Book chapter and document deleted successfully!",
          duration: 3000,
        })
      }
    },
  })

  return { createBook, updateBook, deleteBook }
}

// ==================== PAPER MUTATIONS ====================
export function usePaperMutations() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const teacherId: number = user?.role_id 
    ? parseInt(user.role_id.toString()) 
    : parseInt(user?.id?.toString() || '0')

  const handleUnauthorized = (error: Error) => {
    const message = error?.message || ""
    if (message.includes("Unauthorized") || message.includes("401")) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
        duration: 5000,
      })
      logout?.()
      return true
    }
    return false
  }

  const createPaper = useMutation({
    mutationFn: async (paperData: any) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/teacher/publication/papers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paper: paperData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to create paper")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.publications.all(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      toast({ 
        title: "Success", 
        description: "Paper presentation added successfully!",
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      if (handleUnauthorized(error)) return
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add paper. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const updatePaper = useMutation({
    mutationFn: async ({ paperId, paperData }: { paperId: number; paperData: any }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/teacher/publication/papers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paperId, paper: paperData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to update paper")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ paperId, paperData }) => {
      await queryClient.cancelQueries({ 
        queryKey: teacherQueryKeys.publications.papers(teacherId) 
      })
      
      const previousPapers = queryClient.getQueryData(
        teacherQueryKeys.publications.papers(teacherId)
      )
      
      queryClient.setQueryData(
        teacherQueryKeys.publications.papers(teacherId),
        (old: any) => {
          if (!old?.papers) return old
          return {
            ...old,
            papers: old.papers.map((p: any) =>
              p.papid === paperId ? { ...p, ...paperData } : p
            ),
          }
        }
      )
      
      return { previousPapers }
    },
    onError: (err, variables, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousPapers) {
        queryClient.setQueryData(
          teacherQueryKeys.publications.papers(teacherId),
          context.previousPapers
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update paper. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.publications.all(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: [...teacherQueryKeys.publications.papers(teacherId), variables.paperId]
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      toast({ 
        title: "Success", 
        description: "Paper presentation updated successfully!",
        duration: 3000,
      })
    },
  })

  const deletePaper = useMutation({
    mutationFn: async ({ paperId, imagePath }: { paperId: number; imagePath?: string | null }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch(`/api/teacher/publication/papers?paperId=${paperId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paperId,
            image: imagePath || null,
          }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to delete paper")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ paperId }) => {
      await queryClient.cancelQueries({ 
        queryKey: teacherQueryKeys.publications.papers(teacherId) 
      })
      
      const previousPapers = queryClient.getQueryData(
        teacherQueryKeys.publications.papers(teacherId)
      )
      
      queryClient.setQueryData(
        teacherQueryKeys.publications.papers(teacherId),
        (old: any) => {
          if (!old?.papers) return old
          return {
            ...old,
            papers: old.papers.filter((p: any) => p.papid !== paperId),
          }
        }
      )
      
      return { previousPapers }
    },
    onError: (err, { paperId }, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousPapers) {
        queryClient.setQueryData(
          teacherQueryKeys.publications.papers(teacherId),
          context.previousPapers
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to delete paper. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.publications.all(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      // Show success message - handle different scenarios
      if (data.warning) {
        toast({
          title: "Success",
          description: data.message || "Paper presentation deleted successfully",
          duration: 5000,
        })
        toast({
          title: "Warning",
          description: data.warning,
          variant: "default",
          duration: 5000,
        })
      } else {
        toast({ 
          title: "Success", 
          description: data.message || "Paper presentation and document deleted successfully!",
          duration: 3000,
        })
      }
    },
  })

  return { createPaper, updatePaper, deletePaper }
}

// ==================== RESEARCH MUTATIONS ====================
export function useResearchMutations() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const teacherId: number = user?.role_id 
    ? parseInt(user.role_id.toString()) 
    : parseInt(user?.id?.toString() || '0')

  const handleUnauthorized = (error: Error) => {
    const message = error?.message || ""
    if (message.includes("Unauthorized") || message.includes("401")) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
        duration: 5000,
      })
      logout?.()
      return true
    }
    return false
  }

  const createResearch = useMutation({
    mutationFn: async (projectData: any) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/teacher/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project: projectData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to create research project")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.research(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      toast({ 
        title: "Success", 
        description: "Research project added successfully!",
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      if (handleUnauthorized(error)) return
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add research project. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const updateResearch = useMutation({
    mutationFn: async ({ projectId, projectData }: { projectId: number; projectData: any }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/teacher/research", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, project: projectData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to update research project")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ projectId, projectData }) => {
      await queryClient.cancelQueries({ 
        queryKey: teacherQueryKeys.research(teacherId) 
      })
      
      const previousProjects = queryClient.getQueryData(
        teacherQueryKeys.research(teacherId)
      )
      
      queryClient.setQueryData(
        teacherQueryKeys.research(teacherId),
        (old: any) => {
          if (!old?.researchProjects) return old
          return {
            ...old,
            researchProjects: old.researchProjects.map((p: any) =>
              p.projid === projectId ? { ...p, ...projectData } : p
            ),
          }
        }
      )
      
      return { previousProjects }
    },
    onError: (err, variables, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousProjects) {
        queryClient.setQueryData(
          teacherQueryKeys.research(teacherId),
          context.previousProjects
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update research project. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.research(teacherId),
        refetchType: 'active'
      })
      // Invalidate individual project query if it exists
      queryClient.invalidateQueries({ 
        queryKey: [...teacherQueryKeys.research(teacherId), variables.projectId]
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      toast({ 
        title: "Success", 
        description: "Research project updated successfully!",
        duration: 3000,
      })
    },
  })

  const deleteResearch = useMutation({
    mutationFn: async ({ projectId, pdfPath }: { projectId: number; pdfPath?: string | null }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch(`/api/teacher/research?projectId=${projectId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            pdf: pdfPath || null,
          }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to delete research project")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ projectId }) => {
      await queryClient.cancelQueries({ 
        queryKey: teacherQueryKeys.research(teacherId) 
      })
      
      const previousProjects = queryClient.getQueryData(
        teacherQueryKeys.research(teacherId)
      )
      
      queryClient.setQueryData(
        teacherQueryKeys.research(teacherId),
        (old: any) => {
          if (!old?.researchProjects) return old
          return {
            ...old,
            researchProjects: old.researchProjects.filter((p: any) => p.projid !== projectId),
          }
        }
      )
      
      return { previousProjects }
    },
    onError: (err, variables, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousProjects) {
        queryClient.setQueryData(
          teacherQueryKeys.research(teacherId),
          context.previousProjects
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to delete research project. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.research(teacherId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: teacherQueryKeys.dashboard(teacherId) 
      })
      
      // Show success message - handle different scenarios
      if (data.warning) {
        // Database deleted but S3 deletion had issues
        toast({ 
          title: "Success", 
          description: data.message || "Research project deleted successfully",
          duration: 5000,
        })
        // Also show warning toast
        toast({ 
          title: "Warning", 
          description: data.warning,
          variant: "default",
          duration: 5000,
        })
      } else {
        // Complete success - both database and S3 deleted
        toast({ 
          title: "Success", 
          description: data.message || "Research project and document deleted successfully!",
          duration: 3000,
        })
      }
    },
  })

  return { createResearch, updateResearch, deleteResearch }
}

