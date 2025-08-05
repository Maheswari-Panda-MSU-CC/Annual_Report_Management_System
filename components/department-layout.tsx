"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/sidebar"

interface DepartmentLayoutProps {
  children: React.ReactNode
}

export function DepartmentLayout({ children }: DepartmentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMobileMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64 pt-16">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
