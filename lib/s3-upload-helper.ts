/**
 * Frontend/API Helper utilities for S3 uploads
 * Simplifies S3 integration across teacher modules
 */

import type { FilePatternMetadata } from './s3-service';

// Upload response type
export interface S3UploadResponse {
  success: boolean;
  virtualPath?: string;
  message: string;
}

// Signed URL response type
export interface S3SignedUrlResponse {
  success: boolean;
  url?: string;
  message: string;
}

// Delete response type
export interface S3DeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Generic upload function with pattern support
 */
export async function uploadWithPattern(
  fileBuffer: Buffer | string, // Buffer or base64 string
  patternMetadata: FilePatternMetadata
): Promise<S3UploadResponse> {
  try {
    // Convert buffer to base64 if needed
    const fileBase64 = Buffer.isBuffer(fileBuffer)
      ? fileBuffer.toString('base64')
      : fileBuffer;

    const response = await fetch('/api/s3/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Ensure cookies are sent for authentication
      body: JSON.stringify({
        fileBase64,
        ...patternMetadata,
      }),
    });

    const data = await response.json();
    
    // If S3 upload failed, still return success:false but don't throw
    if (!data.success) {
      console.warn('S3 upload failed:', data.message);
    }
    
    return data;
  } catch (error: any) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload to S3',
    };
  }
}

/**
 * Upload file from temporary storage (after local-document-upload)
 */
export async function uploadFromTempStorage(
  fileName: string,
  patternMetadata: FilePatternMetadata
): Promise<S3UploadResponse> {
  try {
    const response = await fetch('/api/s3/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Ensure cookies are sent for authentication
      body: JSON.stringify({
        fileName,
        ...patternMetadata,
      }),
    });

    const data = await response.json();
    
    // If S3 upload failed, still return the response but don't throw
    if (!data.success) {
      console.warn('S3 upload from temp storage failed:', data.message);
    }
    
    return data;
  } catch (error: any) {
    console.error('S3 upload from temp storage error:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload to S3',
    };
  }
}

/**
 * Pattern 1: Research/Publication uploads (UserID_RecordID.ext)
 * Used for: Paper_Presented, Journal_Paper, Book_Pub, etc.
 */
export async function uploadResearchPaper(
  fileName: string,
  userId: number,
  recordId: number,
  folderName: string,
  fileExtension: string
): Promise<S3UploadResponse> {
  return uploadFromTempStorage(fileName, {
    patternType: 1,
    userId,
    recordId,
    folderName,
    fileExtension,
  });
}

/**
 * Pattern 2: Profile image upload (Email.jpg)
 */
export async function uploadProfileImage(
  fileName: string,
  email: string,
  fileExtension: string = '.jpg'
): Promise<S3UploadResponse> {
  return uploadFromTempStorage(fileName, {
    patternType: 2,
    email,
    folderName: 'Profile',
    fileExtension,
  });
}

/**
 * Pattern 3: Online info upload (_RecordID_FileNum.ext)
 */
export async function uploadOnlineInfo(
  fileName: string,
  recordId: number,
  fileNum: number,
  fileExtension: string
): Promise<S3UploadResponse> {
  return uploadFromTempStorage(fileName, {
    patternType: 3,
    recordId,
    fileNum,
    folderName: 'online_info',
    fileExtension,
  });
}

/**
 * Pattern 4: Department-level upload (RecordID.ext)
 */
export async function uploadDepartmentDocument(
  fileName: string,
  recordId: number,
  folderName: string,
  fileExtension: string
): Promise<S3UploadResponse> {
  return uploadFromTempStorage(fileName, {
    patternType: 4,
    recordId,
    folderName,
    fileExtension,
  });
}

/**
 * Pattern 5: Metric document upload (UserID_RecordID_MetricName.ext)
 */
export async function uploadMetricDocument(
  fileName: string,
  userId: number,
  recordId: number,
  metricName: string,
  folderName: string,
  fileExtension: string
): Promise<S3UploadResponse> {
  return uploadFromTempStorage(fileName, {
    patternType: 5,
    userId,
    recordId,
    metricName,
    folderName,
    fileExtension,
  });
}

/**
 * Pattern 6: Qualitative matrix upload (UserID_FolderName.ext)
 */
export async function uploadQualitativeMatrix(
  fileName: string,
  userId: number,
  folderName: string,
  fileExtension: string
): Promise<S3UploadResponse> {
  return uploadFromTempStorage(fileName, {
    patternType: 6,
    userId,
    folderName,
    fileExtension,
  });
}

/**
 * Get signed URL for document display/download
 */
export async function getDocumentUrl(
  virtualPath: string,
  expiresIn: number = 3600
): Promise<S3SignedUrlResponse> {
  try {
    const response = await fetch('/api/s3/get-signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Ensure cookies are sent for authentication
      body: JSON.stringify({
        virtualPath,
        expiresIn,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error getting signed URL:', error);
    return {
      success: false,
      message: error.message || 'Failed to get signed URL',
    };
  }
}

/**
 * Check if an S3 document exists (client-side helper)
 */
export async function checkDocumentExists(
  virtualPath: string
): Promise<{ exists: boolean; message: string }> {
  try {
    // Use the get-signed-url endpoint to check existence
    // If it returns success, the file exists
    const response = await fetch('/api/s3/get-signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Ensure cookies are sent for authentication
      body: JSON.stringify({
        virtualPath,
      }),
    });

    const data = await response.json();
    
    // If we get a success response, the file exists
    // If we get "Object not found", it doesn't exist
    if (data.success) {
      return {
        exists: true,
        message: 'Document exists in S3',
      };
    }
    
    const isNotFound = data.message?.toLowerCase().includes('not found') || 
                       data.message?.toLowerCase().includes('object not found');
    
    return {
      exists: false,
      message: isNotFound ? 'Document not found in S3' : data.message || 'Unknown error',
    };
  } catch (error: any) {
    console.error('Error checking document existence:', error);
    return {
      exists: false,
      message: error.message || 'Failed to check document existence',
    };
  }
}

/**
 * Delete document from S3
 */
export async function deleteDocument(
  virtualPath: string
): Promise<S3DeleteResponse> {
  try {
    const response = await fetch('/api/s3/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Ensure cookies are sent for authentication
      body: JSON.stringify({
        virtualPath,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete document',
    };
  }
}

/**
 * Extract file extension from file name
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '.pdf';
}

/**
 * Extract file name from temporary URL
 * e.g., /uploaded-document/1_1234567890.pdf -> 1_1234567890.pdf
 */
export function extractFileNameFromUrl(url: string): string | null {
  const match = url.match(/\/uploaded-document\/([^/]+)$/);
  return match ? match[1] : null;
}

/**
 * Check if path is a temporary local path
 */
export function isTempLocalPath(path: string): boolean {
  return path.startsWith('/uploaded-document/');
}

/**
 * Check if path is a virtual S3 path
 */
export function isVirtualS3Path(path: string): boolean {
  return path.startsWith('upload/');
}

/**
 * Unified upload handler for common use case:
 * 1. File was uploaded to temp storage
 * 2. Need to upload to S3 with Pattern 1 (most common)
 * 3. Clean up temp file
 * 
 * Usage in forms/pages:
 * ```typescript
 * const result = await uploadDocumentToS3(
 *   documentUrl,  // from DocumentUpload component
 *   user.role_id,
 *   recordId,
 *   'Paper_Presented'
 * );
 * ```
 */
export async function uploadDocumentToS3(
  documentUrl: string | undefined,
  userId: number,
  recordId: number,
  folderName: string
): Promise<string> {
  const DUMMY_DOCUMENT_URL = 'http://localhost:3000/assets/dummy_document.pdf';

  // If no document URL, return default/demo URL
  if (!documentUrl) {
    return DUMMY_DOCUMENT_URL;
  }

  // If it's a temp local path, upload to S3
  if (isTempLocalPath(documentUrl)) {
    const fileName = extractFileNameFromUrl(documentUrl);
    
    if (!fileName) {
      console.error('Invalid document URL, returning dummy URL');
      return DUMMY_DOCUMENT_URL;
    }

    const fileExtension = getFileExtension(fileName);

    try {
      // Check if this is a department-level upload (Pattern 4)
      // Department folders: dept events, dept student academic activities, dept student body events, etc.
      const folderNameLower = folderName.toLowerCase();
      const isDepartmentUpload = folderNameLower.startsWith('dept ') || 
                                 folderNameLower.includes('dept ') ||
                                 folderNameLower === 'visitors dept' ||
                                 folderNameLower === 'visitors other' ||
                                 folderNameLower.includes('dept development programs') ||
                                 folderNameLower.includes('dept extension act') ||
                                 folderNameLower.includes('dept event student body') ||
                                 folderNameLower.includes('dept student body events') ||
                                 folderNameLower.includes('dept student academic');
      
      let result: S3UploadResponse;
      
      if (isDepartmentUpload) {
        // Use Pattern 4: {RecordID}.{ext} for department-level uploads
        result = await uploadDepartmentDocument(
          fileName,
          recordId,
          folderName,
          fileExtension
        );
      } else {
        // Use Pattern 1: {UserID}_{RecordID}.{ext} for other uploads
        result = await uploadResearchPaper(
          fileName,
          userId,
          recordId,
          folderName,
          fileExtension
        );
      }
    
      // Clean up temp file
      try {
        await fetch('/api/shared/local-document-upload', {
          method: 'DELETE',
          credentials: 'include', // Ensure cookies are sent for authentication
        });
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
        // Don't throw - upload was successful
      }

      if (!result.success || !result.virtualPath) {
        console.warn('S3 upload failed:', result.message, '- returning dummy URL');
        return DUMMY_DOCUMENT_URL;
      }


      return result.virtualPath;
    } catch (error) {
      console.error('S3 upload error:', error, '- returning dummy URL');
      return DUMMY_DOCUMENT_URL;
    }
  }

  // If it's already a virtual path or external URL, return as-is
  return documentUrl;
}

/**
 * Batch upload multiple documents
 */
export async function uploadMultipleDocuments(
  uploads: Array<{
    fileName: string;
    userId: number;
    recordId: number;
    folderName: string;
  }>
): Promise<Array<{ success: boolean; virtualPath?: string; error?: string }>> {
  const results = await Promise.allSettled(
    uploads.map(({ fileName, userId, recordId, folderName }) => {
      const fileExtension = getFileExtension(fileName);
      return uploadResearchPaper(fileName, userId, recordId, folderName, fileExtension);
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return {
        success: result.value.success,
        virtualPath: result.value.virtualPath,
        error: result.value.success ? undefined : result.value.message,
      };
    } else {
      return {
        success: false,
        error: result.reason?.message || 'Upload failed',
      };
    }
  });
}

/**
 * Download document as blob for client-side processing
 */
export async function downloadDocumentAsBlob(
  virtualPath: string
): Promise<Blob | null> {
  try {
    const signedUrlResult = await getDocumentUrl(virtualPath);
    
    if (!signedUrlResult.success || !signedUrlResult.url) {
      console.error('Failed to get signed URL:', signedUrlResult.message);
      return null;
    }

    const response = await fetch(signedUrlResult.url);
    
    if (!response.ok) {
      console.error('Failed to download document');
      return null;
    }

    return await response.blob();
  } catch (error) {
    console.error('Error downloading document:', error);
    return null;
  }
}

