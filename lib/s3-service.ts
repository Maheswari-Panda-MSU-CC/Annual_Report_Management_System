import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET || '',
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'msuis-dsw';
const PRESIGNED_URL_EXPIRY = parseInt(process.env.S3_PRESIGNED_URL_EXPIRY || '3600');

// File naming pattern types
export type FileNamingPattern = 1 | 2 | 3 | 4 | 5 | 6;

// Pattern metadata interfaces
export interface Pattern1Metadata {
  patternType: 1;
  userId: number;
  recordId: number;
  folderName: string;
  fileExtension: string;
}

export interface Pattern2Metadata {
  patternType: 2;
  email: string;
  folderName: string; // typically "Profile"
  fileExtension: string;
}

export interface Pattern3Metadata {
  patternType: 3;
  recordId: number;
  fileNum: number;
  folderName: string;
  fileExtension: string;
}

export interface Pattern4Metadata {
  patternType: 4;
  recordId: number;
  folderName: string;
  fileExtension: string;
}

export interface Pattern5Metadata {
  patternType: 5;
  userId: number;
  recordId: number;
  metricName: string;
  folderName: string;
  fileExtension: string;
}

export interface Pattern6Metadata {
  patternType: 6;
  userId: number;
  folderName: string;
  fileExtension: string;
}

export type FilePatternMetadata = 
  | Pattern1Metadata 
  | Pattern2Metadata 
  | Pattern3Metadata 
  | Pattern4Metadata 
  | Pattern5Metadata 
  | Pattern6Metadata;

/**
 * Generate filename based on the specified pattern
 * Pattern 1: {UserID}_{RecordID}.{ext} → 1_69603.pdf
 * Pattern 2: {Email}.jpg → teacher@university.edu.in.jpg
 * Pattern 3: _{RecordID}_{FileNum}.{ext} → _2_1.jpg
 * Pattern 4: {RecordID}.{ext} → 1.jpg
 * Pattern 5: {UserID}_{RecordID}_{MetricName}.{ext} → 1_7_Metric1_1_1Document.pdf
 * Pattern 6: {UserID}_{FolderName}.{ext} → 1_MetricName.pdf
 */
export function generateFileName(metadata: FilePatternMetadata): string {
  const ext = metadata.fileExtension.startsWith('.') 
    ? metadata.fileExtension 
    : `.${metadata.fileExtension}`;

  switch (metadata.patternType) {
    case 1:
      return `${metadata.userId}_${metadata.recordId}${ext}`;
    
    case 2:
      // Email-based naming (for profile images)
      return `${metadata.email}${ext}`;
    
    case 3:
      // Online info pattern with underscore prefix
      return `_${metadata.recordId}_${metadata.fileNum}${ext}`;
    
    case 4:
      // Department-level uploads (record ID only)
      return `${metadata.recordId}${ext}`;
    
    case 5:
      // Metric documents with metric name
      return `${metadata.userId}_${metadata.recordId}_${metadata.metricName}${ext}`;
    
    case 6:
      // Qualitative matrix pattern
      return `${metadata.userId}_${metadata.folderName}${ext}`;
    
    default:
      throw new Error(`Invalid pattern type: ${(metadata as any).patternType}`);
  }
}

/**
 * Generate virtual path (S3 key) for file
 * Format: upload/{folderName}/{fileName}
 * Example: upload/Paper_Presented/1_69603.pdf
 */
export function generateVirtualPath(metadata: FilePatternMetadata): string {
  const fileName = generateFileName(metadata);
  const folderName = metadata.folderName;
  
  // Sanitize folder name (remove any path traversal attempts)
  const sanitizedFolder = folderName.replace(/\.\./g, '').replace(/^\/+|\/+$/g, '');
  
  return `upload/${sanitizedFolder}/${fileName}`;
}

/**
 * Validate and sanitize virtual path
 */
export function validateVirtualPath(virtualPath: string): boolean {
  // Path should start with "upload/"
  if (!virtualPath.startsWith('upload/')) {
    return false;
  }

  // No path traversal attempts
  if (virtualPath.includes('..')) {
    return false;
  }

  // No multiple consecutive slashes
  if (virtualPath.includes('//')) {
    return false;
  }

  // Basic pattern validation
  const validPattern = /^upload\/[a-zA-Z0-9_\-\s]+\/[a-zA-Z0-9_\-\.@%]+\.(pdf|jpg|jpeg)$/i;
  return validPattern.test(virtualPath);
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  metadata: FilePatternMetadata,
  contentType?: string
): Promise<{ success: boolean; virtualPath: string; message: string }> {
  try {
    const virtualPath = generateVirtualPath(metadata);

    // Validate the generated path
    if (!validateVirtualPath(virtualPath)) {
      throw new Error('Invalid virtual path generated');
    }

    // Extract folder path from virtual path (e.g., "upload/MOU_Linkage/" from "upload/MOU_Linkage/1_123.pdf")
    const folderPath = virtualPath.substring(0, virtualPath.lastIndexOf('/') + 1);
    
    // Check if folder exists in S3 before uploading
    const folderCheck = await checkS3FolderExists(folderPath);
    if (!folderCheck.exists) {
      return {
        success: false,
        virtualPath: '',
        message: `Folder does not exist in S3: ${folderPath}. Please ensure the folder exists in S3 before uploading.`,
      };
    }

    // Determine content type
    const ext = metadata.fileExtension.toLowerCase().replace('.', '');
    const mimeType = contentType || getMimeType(ext);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: virtualPath,
      Body: fileBuffer,
      ContentType: mimeType,
      // Optional: Add metadata
      Metadata: {
        patternType: metadata.patternType.toString(),
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    return {
      success: true,
      virtualPath,
      message: 'File uploaded successfully to S3',
    };
  } catch (error: any) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      virtualPath: '',
      message: error.message || 'Failed to upload file to S3',
    };
  }
}

/**
 * Download file from S3
 */
export async function downloadFromS3(
  virtualPath: string
): Promise<{ success: boolean; buffer: Buffer | null; message: string; contentType?: string }> {
  // Extract folder path from virtual path
  const folderPath = virtualPath.substring(0, virtualPath.lastIndexOf('/') + 1);
  
  // Check if folder exists in S3 before downloading
  const folderCheck = await checkS3FolderExists(folderPath);
  if (!folderCheck.exists) {
    return {
      success: false,
      buffer: null,
      message: `Folder does not exist in S3: ${folderPath}. Cannot download file.`,
    };
  }
  try {
    // Validate path
    if (!validateVirtualPath(virtualPath)) {
      throw new Error('Invalid virtual path');
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: virtualPath,
    });

    const response = await s3Client.send(command);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const stream = response.Body as any;

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    return {
      success: true,
      buffer,
      contentType: response.ContentType,
      message: 'File downloaded successfully',
    };
  } catch (error: any) {
    console.error('S3 download error:', error);
    return {
      success: false,
      buffer: null,
      message: error.message || 'Failed to download file from S3',
    };
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(
  virtualPath: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate path
    if (!validateVirtualPath(virtualPath)) {
      throw new Error('Invalid virtual path');
    }

    // Extract folder path from virtual path
    const folderPath = virtualPath.substring(0, virtualPath.lastIndexOf('/') + 1);
    
    // Check if folder exists in S3 before deleting
    const folderCheck = await checkS3FolderExists(folderPath);
    if (!folderCheck.exists) {
      return {
        success: false,
        message: `Folder does not exist in S3: ${folderPath}. Cannot delete file.`,
      };
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: virtualPath,
    });

    await s3Client.send(command);

    return {
      success: true,
      message: 'File deleted successfully from S3',
    };
  } catch (error: any) {
    console.error('S3 delete error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete file from S3',
    };
  }
}

/**
 * Get presigned URL for secure file access
 * Checks if file exists in S3 before generating presigned URL
 */
export async function getSignedUrl(
  virtualPath: string,
  expiresIn: number = PRESIGNED_URL_EXPIRY
): Promise<{ success: boolean; url: string; message: string }> {
  try {
    // Validate path
    if (!validateVirtualPath(virtualPath)) {
      return {
        success: false,
        url: '',
        message: 'Invalid virtual path',
      };
    }

    // Extract folder path from virtual path
    const folderPath = virtualPath.substring(0, virtualPath.lastIndexOf('/') + 1);
    
    // Check if folder exists in S3 before generating presigned URL
    const folderCheck = await checkS3FolderExists(folderPath);
    if (!folderCheck.exists) {
      return {
        success: false,
        url: '',
        message: `Folder does not exist in S3: ${folderPath}. Cannot generate signed URL.`,
      };
    }

    // Check if file exists in S3 before generating presigned URL
    const existsCheck = await checkS3ObjectExists(virtualPath);
    if (!existsCheck.exists) {
      return {
        success: false,
        url: '',
        message: existsCheck.message || 'Object not found in S3',
      };
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: virtualPath,
    });

    const signedUrl = await getS3SignedUrl(s3Client, command, { expiresIn });

    return {
      success: true,
      url: signedUrl,
      message: 'Signed URL generated successfully',
    };
  } catch (error: any) {
    console.error('S3 signed URL error:', error);
    return {
      success: false,
      url: '',
      message: error.message || 'Failed to generate signed URL',
    };
  }
}

/**
 * Check if a folder (prefix) exists in S3 by listing objects with that prefix
 * Returns true if at least one object exists with the given prefix
 */
export async function checkS3FolderExists(
  folderPath: string
): Promise<{ exists: boolean; message: string }> {
  try {
    // Ensure folder path ends with / and starts with upload/
    let normalizedPath = folderPath;
    if (!normalizedPath.startsWith('upload/')) {
      normalizedPath = normalizedPath.startsWith('/') 
        ? `upload${normalizedPath}`
        : `upload/${normalizedPath}`;
    }
    if (!normalizedPath.endsWith('/')) {
      normalizedPath = `${normalizedPath}/`;
    }

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: normalizedPath,
      MaxKeys: 1, // We only need to know if at least one object exists
    });

    const response = await s3Client.send(command);

    // If Contents array exists and has at least one item, folder exists
    const exists = response.Contents && response.Contents.length > 0;

    return {
      exists: exists || false,
      message: exists 
        ? `Folder exists in S3: ${normalizedPath}` 
        : `Folder does not exist in S3: ${normalizedPath}`,
    };
  } catch (error: any) {
    console.error('S3 folder existence check error:', error);
    return {
      exists: false,
      message: error.message || 'Failed to check folder existence in S3',
    };
  }
}

/**
 * Check if an S3 object exists
 */
export async function checkS3ObjectExists(
  virtualPath: string
): Promise<{ exists: boolean; message: string }> {
  try {
    // Validate path
    if (!validateVirtualPath(virtualPath)) {
      return {
        exists: false,
        message: 'Invalid virtual path',
      };
    }

    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: virtualPath,
    });

    await s3Client.send(command);

    return {
      exists: true,
      message: 'Object exists in S3',
    };
  } catch (error: any) {
    // If error code is NotFound, the object doesn't exist
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return {
        exists: false,
        message: 'Object not found in S3',
      };
    }
    
    // Other errors (permissions, network, etc.)
    console.error('S3 object existence check error:', error);
    return {
      exists: false,
      message: error.message || 'Failed to check object existence',
    };
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Parse virtual path to extract components
 */
export function parseVirtualPath(virtualPath: string): {
  folder: string;
  fileName: string;
  extension: string;
} | null {
  const match = virtualPath.match(/^upload\/([^\/]+)\/(.+)\.([^.]+)$/);
  
  if (!match) {
    return null;
  }

  return {
    folder: match[1],
    fileName: match[2],
    extension: match[3],
  };
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_KEY &&
    process.env.AWS_SECRET &&
    process.env.AWS_REGION &&
    process.env.AWS_BUCKET_NAME
  );
}

