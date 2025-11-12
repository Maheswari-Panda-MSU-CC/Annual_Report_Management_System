import { Upload } from "lucide-react"

interface FileUploadProps {
    onFileSelect: (files: FileList | null) => void
    acceptedTypes?: string
    multiple?: boolean
  }

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png", multiple = true }: FileUploadProps) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
            <span className="mt-1 block text-xs text-gray-500">PDF, JPG, PNG up to 1MB each</span>
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept={acceptedTypes}
            multiple={multiple}
            onChange={(e) => onFileSelect(e.target.files)}
          />
        </div>
      </div>
    )
  }

  export default FileUpload;