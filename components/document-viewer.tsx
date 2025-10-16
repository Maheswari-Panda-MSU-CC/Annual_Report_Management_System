// // "use client"

// // import { useState, useEffect } from "react"
// // import { Button } from "@/components/ui/button"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Badge } from "@/components/ui/badge"
// // import {
// //   Download,
// //   ZoomIn,
// //   ZoomOut,
// //   RotateCw,
// //   ChevronLeft,
// //   ChevronRight,
// //   FileText,
// //   ImageIcon,
// //   File,
// //   ExternalLink,
// // } from "lucide-react"
// // import { Document, Page, pdfjs } from "react-pdf"
// // pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`;
// // import 'react-pdf/dist/Page/AnnotationLayer.css';
// // import 'react-pdf/dist/Page/TextLayer.css';

// "use client"

// import { useState, useEffect } from "react"
// import dynamic from "next/dynamic"

// // 👇 dynamically import react-pdf components
// const PDFDocument = dynamic(
//   async () => (await import("react-pdf")).Document,
//   { ssr: false }
// )
// const PDFPage = dynamic(
//   async () => (await import("react-pdf")).Page,
//   { ssr: false }
// )

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, FileText, ImageIcon, File, ExternalLink } from "lucide-react"

// import "react-pdf/dist/Page/AnnotationLayer.css"
// import "react-pdf/dist/Page/TextLayer.css"


// interface DocumentViewerProps {
//   documentUrl: string
//   documentName?: string
//   documentType?: string
//   className?: string
// }

// export function DocumentViewer({
//   documentUrl,
//   documentName ="document",
//   documentType ="pdf",
//   className = "",
// }: DocumentViewerProps) {
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [zoom, setZoom] = useState(100)
//   const [rotation, setRotation] = useState(0)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [viewerType, setViewerType] = useState<"iframe" | "object" | "fallback">("iframe")

//   useEffect(() => {
//     const loadDocument = () => {
//       setLoading(true)
//       setError(null)

//       // Simulate loading time
//       const timer = setTimeout(() => {
//         setLoading(false)
//         // For demo purposes, set total pages for PDF
//         if (documentType === "pdf") {
//           setTotalPages(5)
//         }
//       }, 1000)

//       return () => clearTimeout(timer)
//     }

//     if (documentUrl) {
//       loadDocument()
//     }
//   }, [documentUrl, documentType])

//   const handleDownload = () => {
//     try {
//       const link = document.createElement("a")
//       link.href = documentUrl
//       link.download = documentName
//       link.target = "_blank"
//       link.rel = "noopener noreferrer"
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//     } catch (error) {
//       console.error("Download failed:", error)
//       window.open(documentUrl, "_blank", "noopener,noreferrer")
//     }
//   }

//   const handleViewInNewTab = () => {
//     window.open(documentUrl, "_blank", "noopener,noreferrer")
//   }

//   const handleZoomIn = () => {
//     setZoom((prev) => Math.min(prev + 25, 200))
//   }

//   const handleZoomOut = () => {
//     setZoom((prev) => Math.max(prev - 25, 50))
//   }

//   const handleRotate = () => {
//     setRotation((prev) => (prev + 90) % 360)
//   }

//   const handlePrevPage = () => {
//     setCurrentPage((prev) => Math.max(prev - 1, 1))
//   }

//   const handleNextPage = () => {
//     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//   }

//   const getFileIcon = () => {
//     switch (documentType.toLowerCase()) {
//       case "pdf":
//         return <FileText className="w-5 h-5 text-red-500" />
//       case "jpg":
//       case "jpeg":
//       case "png":
//       case "gif":
//         return <ImageIcon className="w-5 h-5 text-blue-500" />
//       default:
//         return <File className="w-5 h-5 text-gray-500" />
//     }
//   }

//   const renderPDFViewer = () => {
//     return (
//       <div className="flex justify-center bg-gray-100 rounded-lg min-h-[600px]">
//         {/* <Document
//           file={documentUrl}
//           onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
//           onLoadError={(err) => {
//             console.error(err)
//             setError("Failed to load PDF")
//           }}
//           loading={
//             <div className="flex items-center justify-center h-[600px]">
//               <p className="text-gray-500">Loading PDF...</p>
//             </div>
//           }
//         >
//           <Page
//             pageNumber={currentPage}
//             scale={zoom / 100}
//             rotate={rotation}
//           />
//         </Document> */}

// {/* <PDFDocument
//   file={documentUrl}
//   onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
//   onLoadError={(err) => {
//     console.error(err)
//     setError("Failed to load PDF")
//   }}
//   loading={
//     <div className="flex items-center justify-center h-[600px]">
//       <p className="text-gray-500">Loading PDF...</p>
//     </div>
//   }
// >
//   <PDFPage
//     pageNumber={currentPage}
//     scale={zoom / 100}
//     rotate={rotation}
//   />
// </PDFDocument> */}

//   <iframe
//     // src={documentUrl}
//     src='../../public/images/msu-logo.png'
//     className="w-full h-[600px] rounded-lg border"
//     title={documentName}
//   />


//       </div>
//     )
//   }
  

//   const renderDocumentContent = () => {
//     if (loading) {
//       return (
//         <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
//             <p className="text-gray-600">Loading document...</p>
//           </div>
//         </div>
//       )
//     }

//     if (error) {
//       return (
//         <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
//           <div className="text-center">
//             <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//             <p className="text-gray-600 mb-4">{error}</p>
//             <div className="flex gap-2 justify-center">
//               <Button onClick={handleViewInNewTab} variant="outline" size="sm">
//                 <ExternalLink className="w-4 h-4 mr-2" />
//                 View in New Tab
//               </Button>
//               <Button onClick={handleDownload} variant="outline" size="sm">
//                 <Download className="w-4 h-4 mr-2" />
//                 Download Document
//               </Button>
//             </div>
//           </div>
//         </div>
//       )
//     }

//     const isImage = ["jpg", "jpeg", "png", "gif"].includes(documentType.toLowerCase())
//     const isPdf = documentType.toLowerCase() === "pdf"

//     if (isImage) {
//       console.log("CHECK IS IMAGE flag: ",isImage);
//       return (
//         <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden min-h-[600px]">
//           <img
//             src={documentUrl || "/placeholder.svg"}
//             alt={documentName}
//             className="max-w-full max-h-[600px] object-contain"
//             style={{
//               transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
//               transition: "transform 0.3s ease",
//             }}
//             onError={() => setError("Failed to load image")}
//           />
//         </div>
//       )
//     }

//     if (isPdf) {
//       return <div className="bg-gray-100 rounded-lg overflow-hidden">{renderPDFViewer()}</div>
//     }

//     // For other document types
//     return (
//       <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
//         <div className="text-center">
//           <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//           <p className="text-gray-600 mb-2">Document preview not available</p>
//           <p className="text-sm text-gray-500 mb-4">Click download to view the document</p>
//           <Button onClick={handleDownload} variant="outline" size="sm">
//             <Download className="w-4 h-4 mr-2" />
//             Download Document
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <Card className={className}>
//       <CardHeader>
//         <div className="flex items-center justify-between flex-wrap gap-4">
//           <CardTitle className="flex items-center gap-2">
//             {getFileIcon()}
//             Document Preview
//           </CardTitle>
//           <div className="flex items-center gap-2">
//             <Badge variant="outline" className="text-xs">
//               {documentType.toUpperCase()}
//             </Badge>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleViewInNewTab}
//               className="flex items-center gap-1 bg-transparent"
//             >
//               <ExternalLink className="w-4 h-4" />
//               New Tab
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleDownload}
//               className="flex items-center gap-1 bg-transparent"
//             >
//               <Download className="w-4 h-4" />
//               Download
//             </Button>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {/* Document Controls */}
//         <div className="flex items-center justify-between flex-wrap gap-4 p-3 bg-gray-50 rounded-lg">
//           <div className="flex items-center gap-2 flex-wrap">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleZoomOut}
//               disabled={zoom <= 50 || loading || !!error || viewerType === "fallback"}
//             >
//               <ZoomOut className="w-4 h-4" />
//             </Button>
//             <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleZoomIn}
//               disabled={zoom >= 200 || loading || !!error || viewerType === "fallback"}
//             >
//               <ZoomIn className="w-4 h-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleRotate}
//               disabled={loading || !!error || viewerType === "fallback"}
//             >
//               <RotateCw className="w-4 h-4" />
//             </Button>
//           </div>

//           {/* PDF Pagination */}
//           {documentType.toLowerCase() === "pdf" &&
//             totalPages > 1 &&
//             !loading &&
//             !error &&
//             viewerType !== "fallback" && (
//               <div className="flex items-center gap-2">
//                 <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage <= 1}>
//                   <ChevronLeft className="w-4 h-4" />
//                 </Button>
//                 <span className="text-sm font-medium min-w-[80px] text-center">
//                   {currentPage} of {totalPages}
//                 </span>
//                 <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages}>
//                   <ChevronRight className="w-4 h-4" />
//                 </Button>
//               </div>
//             )}
//         </div>

//         {/* Document Content */}
//         <div className="relative">{renderDocumentContent()}</div>

//         {/* Document Info */}
//         <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
//             <p>
//               <strong>File:</strong> {documentName}
//             </p>
//             <p>
//               <strong>Type:</strong> {documentType.toUpperCase()}
//             </p>
//             {documentType.toLowerCase() === "pdf" && !error && (
//               <p>
//                 <strong>Pages:</strong> {totalPages}
//               </p>
//             )}
//           </div>
//           {viewerType === "fallback" && (
//             <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
//               <strong>Note:</strong> PDF preview is blocked by your browser. Use "View in New Tab" or "Download" to
//               access the document.
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }


"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, FileText, ImageIcon, File } from "lucide-react"

interface DocumentViewerProps {
  documentUrl: string
  documentName?: string
  documentType?: string
  className?: string
}

export function DocumentViewer({
  documentUrl,
  documentName = "document",
  documentType = "pdf",
  className = "",
}: DocumentViewerProps) {

  const getFileIcon = () => {
    switch (documentType.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="w-5 h-5 text-blue-500" />
      default:
        return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = documentUrl
    link.download = documentName
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewInNewTab = () => {
    window.open(documentUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Card className={className}>
  <CardHeader>
    <div className="flex items-center justify-between flex-wrap gap-4">
      <CardTitle className="flex items-center gap-2">
        {getFileIcon()} Document Preview
      </CardTitle>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {documentType.toUpperCase()}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewInNewTab}
          className="flex items-center gap-1 bg-transparent"
        >
          <ExternalLink className="w-4 h-4" /> New Tab
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-1 bg-transparent"
        >
          <Download className="w-4 h-4" /> Download
        </Button>
      </div>
    </div>
  </CardHeader>

  <CardContent>
    <div className="w-full h-[600px] bg-white rounded-lg border-2 border-blue-500 overflow-hidden flex items-center justify-center">
      {["jpg", "jpeg", "png", "gif"].includes(documentType.toLowerCase()) ? (
        <img
          src={documentUrl}
          alt={documentName}
          className="h-full w-auto object-contain"
        />
      ) : (
        <iframe
          src={documentUrl}
          title={documentName}
          className="w-full h-full"
          style={{ border: "none", backgroundColor: "white" }}
        />
      )}
    </div>

    {/* Document Info */}
    <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <p><strong>File:</strong> {documentName}</p>
        <p><strong>Type:</strong> {documentType.toUpperCase()}</p>
      </div>
    </div>
  </CardContent>
</Card>

  )
}
