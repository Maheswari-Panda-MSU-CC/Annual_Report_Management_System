import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
        <Skeleton className="h-4 sm:h-5 w-full sm:w-96 max-w-full" />
      </div>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 sm:h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function TableLoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
        <Skeleton className="h-4 sm:h-5 w-full sm:w-96 max-w-full" />
      </div>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 pb-2 border-b">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-3 sm:h-4 w-full" />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 py-2">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <Skeleton key={j} className="h-3 sm:h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

