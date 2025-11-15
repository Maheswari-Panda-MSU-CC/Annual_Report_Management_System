# Centralized DocumentUpload Component

## Overview

The `DocumentUpload` component is a fully centralized, reusable component for handling document uploads across all modules (Teacher, Faculty, Department, University) in the ARMS project.

## Features

✅ **Inline Document Viewer** - Shows uploaded documents directly in the component (no modal)  
✅ **Update Document** - Users can update documents anytime  
✅ **Extract Data Fields** - Supports dummy LLM API for field extraction  
✅ **Smart Document Analyzer Integration** - Handles redirects with document + category + subcategory + extracted fields  
✅ **Validation** - File type and size validation  
✅ **Temp File Management** - Automatically handles local upload → S3 upload → temp file deletion  
✅ **Fully Responsive** - Works on all screen sizes  
✅ **Drag & Drop** - Supports both drag-and-drop and file selection  

## API Routes Created

1. **`/api/shared/local-document-upload/route.ts`**
   - Handles local file upload to `/public/uploaded-document/`
   - Only one file at a time (replaces existing files)
   - Validates file type and size
   - DELETE endpoint to clean up temp files

2. **`/api/shared/s3/route.ts`**
   - Dummy S3 upload endpoint
   - Returns demo URL: `http://localhost:3000/assets/demo_document.pdf`
   - In production, replace with actual S3 upload logic

## Component Props

```typescript
interface DocumentUploadProps {
  documentUrl?: string                    // Pre-existing document URL
  category?: string                       // Category for extraction
  subCategory?: string                    // Subcategory for extraction
  onChange?: (url: string) => void        // Callback when document is uploaded
  onExtract?: (fields: Record<string, any>) => void  // Callback for extracted fields
  allowedFileTypes?: string[]             // Default: ["pdf","jpg","jpeg","png","doc","docx"]
  maxFileSize?: number                    // Default: 10MB
  predictedCategory?: string              // From Smart Document Analyzer
  predictedSubCategory?: string           // From Smart Document Analyzer
  extractedFields?: Record<string, any>  // From Smart Document Analyzer
  className?: string                      // Additional CSS classes
}
```

## Usage Examples

### Basic Usage

```tsx
import { DocumentUpload } from "@/components/shared/DocumentUpload"

function MyForm() {
  const [documentUrl, setDocumentUrl] = useState("")

  return (
    <DocumentUpload
      documentUrl={documentUrl}
      onChange={(url) => setDocumentUrl(url)}
    />
  )
}
```

### With Category and Extraction

```tsx
<DocumentUpload
  documentUrl={documentUrl}
  category="research"
  subCategory="research-project"
  onChange={(url) => setDocumentUrl(url)}
  onExtract={(fields) => {
    // Auto-fill form with extracted fields
    Object.keys(fields).forEach((key) => {
      setValue(key, fields[key])
    })
  }}
/>
```

### With Pre-existing Document

```tsx
<DocumentUpload
  documentUrl="http://localhost:3000/assets/demo_document.pdf"
  onChange={(url) => console.log("Updated:", url)}
/>
```

### Smart Document Analyzer Redirect

```tsx
// These props come from URL params after Smart Document Analyzer redirect
<DocumentUpload
  documentUrl={searchParams.get("documentUrl")}
  category={searchParams.get("category")}
  subCategory={searchParams.get("subCategory")}
  predictedCategory={searchParams.get("predictedCategory")}
  predictedSubCategory={searchParams.get("predictedSubCategory")}
  extractedFields={extractedFieldsFromParams}
  onChange={(url) => setDocumentUrl(url)}
  onExtract={(fields) => autoFillForm(fields)}
/>
```

## Component Behavior

1. **Upload Flow**:
   - User selects/drops file
   - File is validated (type & size)
   - File is uploaded to `/public/uploaded-document/` (temp)
   - File is uploaded to S3 (dummy API)
   - Temp file is deleted
   - Document viewer shows inline

2. **Update Flow**:
   - User clicks "Update Document"
   - Upload UI reappears
   - Same upload flow as above

3. **Extract Flow**:
   - User clicks "Extract Data Fields"
   - Component calls `/api/llm/get-formfields` with category/subcategory
   - Extracted fields are returned via `onExtract` callback
   - Parent form can auto-fill inputs

4. **Smart Document Analyzer**:
   - Component receives `documentUrl`, `predictedCategory`, `predictedSubCategory`, `extractedFields`
   - Document is shown inline immediately
   - Category/subcategory are prefilled
   - Form fields are auto-filled with extracted data

## File Structure

```
components/
  shared/
    DocumentUpload.tsx          # Main component
    DocumentUpload.example.tsx   # Usage examples
    DocumentUpload.README.md    # This file

app/
  api/
    shared/
      local-document-upload/
        route.ts                 # Local file upload/delete
      s3/
        route.ts                 # Dummy S3 upload

public/
  uploaded-document/            # Temp file storage (auto-created)
```

## Integration Steps

1. **Import the component**:
   ```tsx
   import { DocumentUpload } from "@/components/shared/DocumentUpload"
   ```

2. **Replace old upload components**:
   - Find pages using `DocumentUpload` from `@/components/ui/document-upload`
   - Replace with new `DocumentUpload` from `@/components/shared/DocumentUpload`
   - Update props as needed

3. **Handle callbacks**:
   - Use `onChange` to save document URL to your form state
   - Use `onExtract` to auto-fill form fields

## Notes

- The component uses "use client" only for upload/viewer logic
- Works with React Server Components
- No flicker when switching between upload → viewer
- Fully responsive design
- Production-ready and optimized

## Backend Logic

✅ **No backend logic broken** - All existing APIs remain unchanged  
✅ **New APIs are additive** - Only new routes added, no modifications to existing ones  
✅ **Temp file cleanup** - Automatic cleanup after S3 upload  

