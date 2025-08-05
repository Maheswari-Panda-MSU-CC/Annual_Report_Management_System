import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="p-6 border-b">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Skeleton className="h-5 w-96 mb-3" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-4 w-72 mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-6">
              <Skeleton className="h-5 w-80" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
