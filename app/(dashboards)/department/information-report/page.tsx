"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DepartmentInformationReport() {
  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Information Report</h1>
        <Card>
          <CardHeader>
            <CardTitle>Information Report Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage department information reports and data.</p>
          </CardContent>
        </Card>
      </div>
  )
}
