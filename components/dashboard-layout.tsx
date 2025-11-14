"use client"

import type React from "react"
import { useAuth } from "../app/api/auth/auth-provider"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Use unified sidebar for all roles
  const renderSidebar = () => {
    return <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMobileMenuToggle={toggleMobileMenu} />

      <div className="flex h-screen pt-14 sm:pt-16">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">{renderSidebar()}</div>

        {/* Mobile sidebar */}
        <div className="lg:hidden">{renderSidebar()}</div>

        {/* Main content */}
        <div className="flex-1 lg:pl-64 overflow-x-hidden">
          <main className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full max-w-full">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
