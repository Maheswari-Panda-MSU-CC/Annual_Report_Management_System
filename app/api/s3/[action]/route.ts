// Enhanced S3 API Route with Pattern Support (App Router)
import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  uploadToS3,
  downloadFromS3,
  deleteFromS3,
  getSignedUrl,
  FilePatternMetadata,
  isS3Configured,
} from '@/lib/s3-service';

const TEMP_UPLOAD_DIR = join(process.cwd(), 'public', 'uploaded-document');

// Request interfaces
interface UploadRequest {
  fileBase64?: string;
  fileName?: string; // For reading from temp storage
  patternType: 1 | 2 | 3 | 4 | 5 | 6;
  userId?: number;
  recordId?: number;
  email?: string;
  folderName: string;
  metricName?: string;
  fileNum?: number;
  fileExtension: string;
}

interface DownloadRequest {
  virtualPath: string;
}

interface DeleteRequest {
  virtualPath: string;
}

interface SignedUrlRequest {
  virtualPath: string;
  expiresIn?: number;
}

// Response interfaces
interface UploadResponse {
  success: boolean;
  virtualPath?: string;
  message: string;
}

interface DownloadResponse {
  success: boolean;
  fileBase64?: string;
  contentType?: string;
  message: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

interface SignedUrlResponse {
  success: boolean;
  url?: string;
  message: string;
}

/**
 * Build pattern metadata from request
 */
function buildPatternMetadata(data: UploadRequest): FilePatternMetadata {
  const { patternType, userId, recordId, email, folderName, metricName, fileNum, fileExtension } = data;

  switch (patternType) {
    case 1:
      if (!userId || !recordId) {
        throw new Error('Pattern 1 requires userId and recordId');
      }
      return { patternType: 1, userId, recordId, folderName, fileExtension };

    case 2:
      if (!email) {
        throw new Error('Pattern 2 requires email');
      }
      return { patternType: 2, email, folderName, fileExtension };

    case 3:
      if (!recordId || fileNum === undefined) {
        throw new Error('Pattern 3 requires recordId and fileNum');
      }
      return { patternType: 3, recordId, fileNum, folderName, fileExtension };

    case 4:
      if (!recordId) {
        throw new Error('Pattern 4 requires recordId');
      }
      return { patternType: 4, recordId, folderName, fileExtension };

    case 5:
      if (!userId || !recordId || !metricName) {
        throw new Error('Pattern 5 requires userId, recordId, and metricName');
      }
      return { patternType: 5, userId, recordId, metricName, folderName, fileExtension };

    case 6:
      if (!userId) {
        throw new Error('Pattern 6 requires userId');
      }
      return { patternType: 6, userId, folderName, fileExtension };

    default:
      throw new Error(`Invalid pattern type: ${patternType}`);
  }
}

/**
 * Handle file upload to S3
 */
async function handleUpload(data: UploadRequest): Promise<UploadResponse> {
  try {
    // Check if S3 is configured
    if (!isS3Configured()) {
      return {
        success: false,
        message: 'S3 is not properly configured. Please check environment variables.',
      };
    }

    let fileBuffer: Buffer;

    // Get file buffer from either base64 or temp storage
    if (data.fileBase64) {
      fileBuffer = Buffer.from(data.fileBase64, 'base64');
    } else if (data.fileName) {
      // Read from temporary storage
      const tempFilePath = join(TEMP_UPLOAD_DIR, data.fileName);
      
      if (!existsSync(tempFilePath)) {
        return {
          success: false,
          message: `Temporary file not found: ${data.fileName}`,
        };
      }

      fileBuffer = await readFile(tempFilePath);
    } else {
      return {
        success: false,
        message: 'Either fileBase64 or fileName must be provided',
      };
    }

    // Build pattern metadata
    const metadata = buildPatternMetadata(data);

    // Upload to S3
    const result = await uploadToS3(fileBuffer, metadata);

    // Clean up temp file if it was used
    if (data.fileName) {
      try {
        const tempFilePath = join(TEMP_UPLOAD_DIR, data.fileName);
        if (existsSync(tempFilePath)) {
          await unlink(tempFilePath);
        }
      } catch (cleanupErr) {
        console.warn('Failed to cleanup temp file:', cleanupErr);
        // Don't fail the request if cleanup fails
      }
    }

    return result;
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return {
      success: false,
      message: error.message || 'Failed to process upload request',
    };
  }
}

/**
 * Handle file download from S3
 */
async function handleDownload(data: DownloadRequest): Promise<DownloadResponse> {
  try {
    if (!isS3Configured()) {
      return {
        success: false,
        message: 'S3 is not properly configured',
      };
    }

    const result = await downloadFromS3(data.virtualPath);

    if (!result.success || !result.buffer) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      fileBase64: result.buffer.toString('base64'),
      contentType: result.contentType,
      message: result.message,
    };
  } catch (error: any) {
    console.error('Download handler error:', error);
    return {
      success: false,
      message: error.message || 'Failed to download file',
    };
  }
}

/**
 * Handle file deletion from S3
 */
async function handleDelete(data: DeleteRequest): Promise<DeleteResponse> {
  try {
    if (!isS3Configured()) {
      return {
        success: false,
        message: 'S3 is not properly configured',
      };
    }

    return await deleteFromS3(data.virtualPath);
  } catch (error: any) {
    console.error('Delete handler error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete file',
    };
  }
}

/**
 * Handle signed URL generation
 */
async function handleSignedUrl(data: SignedUrlRequest): Promise<SignedUrlResponse> {
  try {
    if (!isS3Configured()) {
      return {
        success: false,
        message: 'S3 is not properly configured',
      };
    }

    return await getSignedUrl(data.virtualPath, data.expiresIn);
  } catch (error: any) {
    console.error('Signed URL handler error:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate signed URL',
    };
  }
}

// App Router API Handler
export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  const { action } = params;

  try {
    const body = await request.json();

    switch (action) {
      case 'upload': {
        const result = await handleUpload(body as UploadRequest);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'download': {
        const result = await handleDownload(body as DownloadRequest);
        return NextResponse.json(result, { status: result.success ? 200 : 404 });
      }

      case 'delete': {
        const result = await handleDelete(body as DeleteRequest);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'get-signed-url': {
        const result = await handleSignedUrl(body as SignedUrlRequest);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      default:
        return NextResponse.json(
          { 
            success: false, 
            message: `Invalid action: ${action}. Valid actions: upload, download, delete, get-signed-url` 
          },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error('S3 API error:', err);
    return NextResponse.json(
      { 
        success: false, 
        message: err.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

