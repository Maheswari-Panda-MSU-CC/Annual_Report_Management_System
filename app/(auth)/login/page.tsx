import { LoginForm } from "@/components/forms/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex-col justify-center items-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="flex justify-center">
          <Image
              src="/images/msu-logo.png"
              alt="MSU Baroda Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome to MSU Baroda</h1>
            <p className="text-base sm:text-lg text-gray-600">Annual Report Management System</p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Streamline your academic reporting process with our comprehensive management system designed for faculty
              and administrators.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center text-xs sm:text-sm text-gray-600">
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-semibold text-primary">500+</div>
              <div>Faculty Members</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-semibold text-primary">50+</div>
              <div>Departments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden">
            <Image src="/images/msu-logo.png" alt="MSU Baroda Logo" width={80} height={80} className="object-contain" />
          </div>

          <Card className="border-0 shadow-lg lg:shadow-xl">
            <CardHeader className="space-y-1 pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">Sign In</CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm text-gray-600">
                Access the Annual Report Management System
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <LoginForm />
            </CardContent>
          </Card>

          {/* Additional help text */}
          <div className="text-center text-xs text-gray-500 space-y-2">
            <p>
              Need help? Contact{" "}
              <a
                href="mailto:support@msubaroda.ac.in"
                className="text-primary hover:text-primary/80 transition-colors duration-200"
              >
                support@msubaroda.ac.in
              </a>
            </p>
            <p>© 2025 The Maharaja Sayajirao University of Baroda. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
