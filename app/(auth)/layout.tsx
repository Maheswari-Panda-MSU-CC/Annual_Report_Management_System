import type React from "react"
import { AuthProvider } from "@/app/api/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
      <Toaster />
    </AuthProvider>
  )
}
