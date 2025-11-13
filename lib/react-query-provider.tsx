"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
            gcTime: 5 * 60 * 1000, // 5 minutes - cache time (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch on window focus
            retry: 1, // Retry failed requests once
            refetchOnMount: false, // Don't refetch if data exists in cache
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

