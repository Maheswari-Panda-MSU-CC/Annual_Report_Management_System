"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DepartmentLearningResources() {
  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
        <Card>
          <CardHeader>
            <CardTitle>Resource Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage learning resources and educational materials.</p>
          </CardContent>
        </Card>
      </div>
  )
}
