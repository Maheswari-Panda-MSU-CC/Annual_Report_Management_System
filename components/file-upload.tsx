"use client"

import type React from "react"

import { Upload, FileText } from "lucide-react"
import { useState } from "react"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  acceptedTypes?: string
  multiple?: boolean
  className?: string
}

export function FileUpload({
  onFileSelect,
  acceptedTypes = ".pdf,.docx",
  multiple = false,
  className = "",
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    onFileSelect(file)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">Upload document to auto-fill form</span>
            <span className="mt-1 block text-xs text-gray-500">PDF, DOCX up to 1MB</span>
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept={acceptedTypes}
            multiple={multiple}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {selectedFile && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">{selectedFile.name}</span>
          <span className="text-xs text-gray-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
        </div>
      )}
    </div>
  )
}
