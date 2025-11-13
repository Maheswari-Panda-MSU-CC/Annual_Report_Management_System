"use client"

import React, { memo, useState } from "react"
import { User } from "lucide-react"

interface ProfileImageProps {
  imageUrl?: string | null
  name: string
  isProfessional?: boolean
  size?: "sm" | "md" | "lg"
}

/**
 * Profile Image Component with Fallback
 * Displays teacher profile image or placeholder icon
 */
export const ProfileImage = memo(({ 
  imageUrl, 
  name, 
  isProfessional = false,
  size = "md" 
}: ProfileImageProps) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-36 h-36",
    lg: "w-48 h-48"
  }

  const iconSizes = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-28 w-28"
  }

  if (imageUrl && !imageError) {
    return (
      <div className={`${sizeClasses[size]} mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl relative`}>
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <User className={`${iconSizes[size]} text-gray-400`} />
          </div>
        )}
        <img
          src={imageUrl}
          alt={name}
          className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
          onLoad={() => setImageLoading(false)}
        />
      </div>
    )
  }
  
  const iconColor = isProfessional ? "text-blue-200" : "text-blue-500"
  const bgGradient = isProfessional 
    ? "bg-gradient-to-br from-blue-700 to-blue-800" 
    : "bg-gradient-to-br from-blue-100 to-blue-200"
  
  return (
    <div className={`${sizeClasses[size]} mx-auto mb-6 rounded-full ${bgGradient} flex items-center justify-center border-4 border-white shadow-xl`}>
      <User className={`${iconSizes[size]} ${iconColor}`} />
    </div>
  )
})

ProfileImage.displayName = "ProfileImage"

