import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>

        <div className="space-y-4">
          <div className="border-b mb-4">
            <div className="flex space-x-2 pb-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-32" />
              ))}
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-8 gap-4 pb-2 border-b">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-8 gap-4 py-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
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
