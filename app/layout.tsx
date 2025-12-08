import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/app/api/auth/auth-provider"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { DropdownsProvider } from "@/contexts/dropdowns-provider"
import { DocumentAnalysisProvider } from "@/contexts/document-analysis-context"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "MSU Annual Report Management System",
  description: "Comprehensive annual report management for The Maharaja Sayajirao University of Baroda",
  keywords: ["university", "annual report", "faculty management", "research"],
  authors: [{ name: "MSU Development Team" }],
  generator: 'v0.dev',
  icons: {
    icon: '/images/msu-icon.ico',
    shortcut: '/images/msu-icon.ico',
    apple: '/images/msu-icon.ico',
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ReactQueryProvider>
          <AuthProvider>
            <DropdownsProvider>
              <DocumentAnalysisProvider>
                {children}
                <Toaster />
              </DocumentAnalysisProvider>
            </DropdownsProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
