"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface TeachersARMSErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function TeachersARMSError({ error, reset }: TeachersARMSErrorProps) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong!</h2>
            <p className="text-gray-600 mb-4">Failed to load Teacher's ARMS status data.</p>
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
  )
}
