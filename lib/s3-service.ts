import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET || '',
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'arms-documents';
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
 */
export async function getSignedUrl(
  virtualPath: string,
  expiresIn: number = PRESIGNED_URL_EXPIRY
): Promise<{ success: boolean; url: string; message: string }> {
  try {
    // Validate path
    if (!validateVirtualPath(virtualPath)) {
      throw new Error('Invalid virtual path');
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

