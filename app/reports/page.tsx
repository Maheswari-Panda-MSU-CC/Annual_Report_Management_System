"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportGenerator } from "@/components/report-generator"
import { ReportsList } from "@/components/reports-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Annual Reports</h1>
          <p className="text-gray-600">Generate and manage annual reports</p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="existing">Existing Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <ReportGenerator />
          </TabsContent>

          <TabsContent value="existing">
            <ReportsList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
