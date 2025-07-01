"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PublicationsList } from "@/components/publications-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function PublicationsPage() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Publications Management</h1>
            <p className="text-gray-600">Manage research publications, journals, books and other scholarly works</p>
          </div>

          <Button onClick={() => router.push("/add-publication")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Publication
          </Button>
        </div>

        <PublicationsList key={refreshKey} />
      </div>
    </DashboardLayout>
  )
}
