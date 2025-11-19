import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      <div>
        <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
        <Skeleton className="h-4 sm:h-5 w-full sm:w-96 max-w-full mt-2" />
      </div>

      <div className="space-y-4">
        <div className="border-b mb-4">
          <div className="flex space-x-2 pb-2 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 sm:h-10 w-24 sm:w-32 flex-shrink-0" />
            ))}
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
              <Skeleton className="h-8 sm:h-10 w-24 sm:w-32" />
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4 pb-2 border-b">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-3 sm:h-4 w-full" />
                ))}
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4 py-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                    <Skeleton key={j} className="h-3 sm:h-4 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
