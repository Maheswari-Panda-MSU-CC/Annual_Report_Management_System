"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutes - default stale time
            gcTime: 5 * 60 * 1000, // 5 minutes - default cache time
            refetchOnWindowFocus: false, // Don't refetch on window focus
            retry: 1, // Retry failed requests once
            refetchOnMount: true, // ✅ CRITICAL: Refetch when component mounts (after invalidation)
            // Show cached data immediately while refetching in background
            placeholderData: (previousData: unknown) => previousData,
            // Optimize for fast initial renders
            structuralSharing: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

