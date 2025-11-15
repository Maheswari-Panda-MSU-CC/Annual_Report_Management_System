/**
 * DocumentUpload Component Usage Examples
 * 
 * This file demonstrates how to use the centralized DocumentUpload component
 * in various scenarios across the ARMS project.
 */

import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { useState } from "react"

// Example 1: Basic Usage
export function BasicDocumentUploadExample() {
  const [documentUrl, setDocumentUrl] = useState<string>("")

  return (
    <DocumentUpload
      documentUrl={documentUrl}
      onChange={(url) => {
        setDocumentUrl(url)
        console.log("Document uploaded:", url)
      }}
    />
  )
}

// Example 2: With Category and Subcategory
export function CategoryDocumentUploadExample() {
  const [documentUrl, setDocumentUrl] = useState<string>("")
  const [formData, setFormData] = useState<any>({})

  return (
    <DocumentUpload
      documentUrl={documentUrl}
      category="research"
      subCategory="research-project"
      onChange={(url) => setDocumentUrl(url)}
      onExtract={(fields) => {
        // Auto-fill form with extracted fields
        setFormData((prev: any) => ({ ...prev, ...fields }))
        console.log("Extracted fields:", fields)
      }}
    />
  )
}

// Example 3: With Pre-existing Document
export function ExistingDocumentExample() {
  const existingUrl = "http://localhost:3000/assets/demo_document.pdf"

  return (
    <DocumentUpload
      documentUrl={existingUrl}
      onChange={(url) => console.log("Document updated:", url)}
    />
  )
}

// Example 4: Smart Document Analyzer Redirect
export function SmartAnalyzerRedirectExample() {
  // These props would come from URL params after Smart Document Analyzer redirect
  const searchParams = new URLSearchParams(window.location.search)
  
  return (
    <DocumentUpload
      documentUrl={searchParams.get("documentUrl") || undefined}
      category={searchParams.get("category") || undefined}
      subCategory={searchParams.get("subCategory") || undefined}
      predictedCategory={searchParams.get("predictedCategory") || undefined}
      predictedSubCategory={searchParams.get("predictedSubCategory") || undefined}
      extractedFields={searchParams.get("extractedFields") ? JSON.parse(searchParams.get("extractedFields")!) : undefined}
      onChange={(url) => {
        // Save document URL to form
        console.log("Document URL:", url)
      }}
      onExtract={(fields) => {
        // Auto-fill form fields
        console.log("Extracted fields:", fields)
      }}
    />
  )
}

// Example 5: Custom File Types and Size
export function CustomFileTypesExample() {
  return (
    <DocumentUpload
      allowedFileTypes={["pdf", "doc", "docx"]}
      maxFileSize={5 * 1024 * 1024} // 5MB
      onChange={(url) => console.log("Document uploaded:", url)}
    />
  )
}

// Example 6: In a Form (React Hook Form)
export function FormIntegrationExample() {
  const { register, setValue, watch } = require("react-hook-form")
  const documentUrl = watch("documentUrl")

  return (
    <div>
      <DocumentUpload
        documentUrl={documentUrl}
        category="publication"
        subCategory="journal-articles"
        onChange={(url) => {
          setValue("documentUrl", url)
        }}
        onExtract={(fields) => {
          // Auto-fill all form fields
          Object.keys(fields).forEach((key) => {
            setValue(key, fields[key])
          })
        }}
      />
      <input type="hidden" {...register("documentUrl")} />
    </div>
  )
}

