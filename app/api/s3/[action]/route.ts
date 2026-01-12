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
import { logActivity, logActivityFromRequest } from '@/lib/activity-log';
import { authenticateRequest } from '@/lib/api-auth';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

const TEMP_UPLOAD_DIR = join(process.cwd(), 'public', 'uploaded-document');

/**
 * Helper function to get userType from database when userId is available
 * This is used as a fallback when authentication fails but we have userId
 */
async function getUserTypeFromDatabase(userId: number): Promise<number | null> {
  try {
    const pool = await connectToDatabase();
    const userResult = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query('SELECT user_type FROM users WHERE role_id = @userId');
    
    return userResult.recordset?.[0]?.user_type || null;
  } catch (error) {
    console.warn('Failed to get userType from database:', error);
    return null;
  }
}

/**
 * Helper function to extract userId from virtual path filename
 * Supports patterns: userId_recordId.ext, userId_timestamp.ext
 */
function extractUserIdFromVirtualPath(virtualPath: string): number | null {
  if (!virtualPath.startsWith('upload/')) {
    return null;
  }
  
  const pathWithoutUpload = virtualPath.substring(7); // Remove 'upload/'
  const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
  
  if (lastSlashIndex <= 0) {
    return null;
  }
  
  const fileName = pathWithoutUpload.substring(lastSlashIndex + 1);
  
  // Pattern 1: userId_recordId.ext -> extract userId
  const pattern1Match = fileName.match(/^(\d+)_\d+\./);
  if (pattern1Match) {
    return parseInt(pattern1Match[1], 10) || null;
  }
  
  // Pattern: userId_timestamp.ext -> extract userId
  const timestampMatch = fileName.match(/^(\d+)_\d+\./);
  if (timestampMatch) {
    return parseInt(timestampMatch[1], 10) || null;
  }
  
  return null;
}

/**
 * Helper function to determine if entityId is a timestamp (temporary ID used during CREATE)
 * Timestamps are typically >= 1000000000 (year 2001 in milliseconds)
 * Real record IDs are usually much smaller (< 1000000)
 * 
 * This helps us skip logging in S3 route for CREATE operations,
 * letting the page route handle logging with the correct recordId
 */
function isTimestampEntityId(entityId: number | null): boolean {
  if (!entityId) return false;
  // Timestamps are >= 1000000000 (milliseconds since epoch for dates after 2001)
  // Real database IDs are typically much smaller
  return entityId >= 1000000000;
}

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
async function handleUpload(data: UploadRequest, request: NextRequest): Promise<UploadResponse> {
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

    // Log activity if upload was successful (non-blocking)
    if (result.success && result.virtualPath) {
      // Extract entity_id from virtual path filename
      // Priority: recordId from metadata > recordId from filename > timestamp from filename > null
      let entityId: number | null = null;
      
      // First, try to get recordId from metadata
      if ('recordId' in metadata) {
        entityId = metadata.recordId || null;
      }
      if (!entityId) {
        entityId = data.recordId || null;
      }
      
      // If no recordId, try to extract from filename
      if (!entityId && result.virtualPath.startsWith('upload/')) {
        const pathWithoutUpload = result.virtualPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        if (lastSlashIndex > 0) {
          const fileName = pathWithoutUpload.substring(lastSlashIndex + 1);
          
          // Pattern 1: userId_recordId.ext -> extract recordId
          const pattern1Match = fileName.match(/^\d+_(\d+)\./);
          if (pattern1Match) {
            entityId = parseInt(pattern1Match[1], 10) || null;
          } else {
            // Pattern: userId_timestamp.ext -> extract timestamp
            const timestampMatch = fileName.match(/^(\d+)_(\d+)\./);
            if (timestampMatch) {
              const timestamp = parseInt(timestampMatch[2], 10);
              // Only use timestamp if it's a valid integer within SQL INT range
              if (!isNaN(timestamp) && timestamp >= -2147483648 && timestamp <= 2147483647) {
                entityId = timestamp;
              }
            } else {
              // Pattern 4: recordId.ext -> extract recordId
              const pattern4Match = fileName.match(/^(\d+)\./);
              if (pattern4Match) {
                entityId = parseInt(pattern4Match[1], 10) || null;
              }
            }
          }
        }
      }
      
      // Extract entity name from virtual path (objectKey)
      // Format: upload/Category/SubCategory/filename.ext
      // Entity name: S3_Category_SubCategory
      let entityName = 'S3_Document';
      if (result.virtualPath.startsWith('upload/')) {
        const pathWithoutUpload = result.virtualPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          // Extract folder path (everything before the filename)
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          // Replace slashes with underscores and add S3_ prefix
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          // No subfolder, just use the folder name
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Only log if entityId is a real record ID (not a timestamp)
      // For CREATE operations, entityId will be a timestamp, so we skip logging here
      // The page route will log with the correct recordId after database insertion
      // For UPDATE operations, entityId will be a real ID, so we log here
      if (!isTimestampEntityId(entityId)) {
        // Try to authenticate request to get user info for activity logging
        try {
          const authResult = await authenticateRequest(request);
          if (authResult && !authResult.error && authResult.user) {
            // Use authenticated user info for logging
            logActivityFromRequest(request, authResult.user, 'S3_UPLOAD', entityName, entityId).catch(() => {});
          } else {
            // Fallback: use userId from request if authentication fails
            const userId = data.userId || null;
            if (userId) {
              // Try to get userType from database
              const userType = await getUserTypeFromDatabase(userId);
              if (userType) {
                logActivity(request, 'S3_UPLOAD', entityName, entityId, userId, userType).catch(() => {});
              } else {
                // If we can't get userType, still try to log (logActivity will attempt to extract it)
                logActivity(request, 'S3_UPLOAD', entityName, entityId, userId, null).catch(() => {});
              }
            }
          }
        } catch (authError) {
          // If authentication fails, try to log with userId from metadata
          const userId = data.userId || null;
          if (userId) {
            // Try to get userType from database
            const userType = await getUserTypeFromDatabase(userId);
            if (userType) {
              logActivity(request, 'S3_UPLOAD', entityName, entityId, userId, userType).catch(() => {});
            } else {
              logActivity(request, 'S3_UPLOAD', entityName, entityId, userId, null).catch(() => {});
            }
          }
        }
      } else {
        // EntityId is a timestamp (CREATE operation) - skip logging here
        // The page route will handle logging with the correct recordId
        console.log(`[S3 Upload] Skipping activity log for CREATE operation (timestamp entityId: ${entityId}). Page route will log with correct recordId.`);
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
async function handleDownload(data: DownloadRequest, request: NextRequest): Promise<DownloadResponse> {
  try {
    if (!isS3Configured()) {
      return {
        success: false,
        message: 'S3 is not properly configured',
      };
    }

    const result = await downloadFromS3(data.virtualPath);

    // Log activity if download was successful (non-blocking)
    if (result.success && result.buffer) {
      // Extract entity_id from virtual path filename
      let entityId: number | null = null;
      
      if (data.virtualPath.startsWith('upload/')) {
        const pathWithoutUpload = data.virtualPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        if (lastSlashIndex > 0) {
          const fileName = pathWithoutUpload.substring(lastSlashIndex + 1);
          
          // Pattern 1: userId_recordId.ext -> extract recordId
          const pattern1Match = fileName.match(/^\d+_(\d+)\./);
          if (pattern1Match) {
            entityId = parseInt(pattern1Match[1], 10) || null;
          } else {
            // Pattern: userId_timestamp.ext -> extract timestamp
            const timestampMatch = fileName.match(/^(\d+)_(\d+)\./);
            if (timestampMatch) {
              const timestamp = parseInt(timestampMatch[2], 10);
              // Only use timestamp if it's a valid integer within SQL INT range
              if (!isNaN(timestamp) && timestamp >= -2147483648 && timestamp <= 2147483647) {
                entityId = timestamp;
              }
            } else {
              // Pattern 4: recordId.ext -> extract recordId
              const pattern4Match = fileName.match(/^(\d+)\./);
              if (pattern4Match) {
                entityId = parseInt(pattern4Match[1], 10) || null;
              }
            }
          }
        }
      }
      
      // Extract entity name from virtual path (objectKey)
      // Format: upload/Category/SubCategory/filename.ext
      // Entity name: S3_Category_SubCategory
      let entityName = 'S3_Document';
      if (data.virtualPath.startsWith('upload/')) {
        const pathWithoutUpload = data.virtualPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          // Extract folder path (everything before the filename)
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          // Replace slashes with underscores and add S3_ prefix
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          // No subfolder, just use the folder name
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Try to authenticate request to get user info for activity logging
      try {
        const authResult = await authenticateRequest(request);
        if (authResult && !authResult.error && authResult.user) {
          logActivityFromRequest(request, authResult.user, 'S3_DOWNLOAD', entityName, entityId).catch((err) => {
            console.error('[S3_DOWNLOAD] Failed to log activity:', err);
          });
        } else {
          // Fallback: try to extract userId from virtual path and get userType
          const userId = extractUserIdFromVirtualPath(data.virtualPath);
          if (userId) {
            const userType = await getUserTypeFromDatabase(userId);
            if (userType) {
              logActivity(request, 'S3_DOWNLOAD', entityName, entityId, userId, userType).catch((err) => {
                console.error('[S3_DOWNLOAD] Failed to log activity (with userId/userType):', err);
              });
            } else {
              logActivity(request, 'S3_DOWNLOAD', entityName, entityId).catch((err) => {
                console.error('[S3_DOWNLOAD] Failed to log activity (with userId, no userType):', err);
              });
            }
          } else {
            logActivity(request, 'S3_DOWNLOAD', entityName, entityId).catch((err) => {
              console.error('[S3_DOWNLOAD] Failed to log activity (no userId):', err);
            });
          }
        }
      } catch (authError) {
        console.error('[S3_DOWNLOAD] Authentication error, using fallback logging:', authError);
        // Fallback: try to extract userId from virtual path and get userType
        const userId = extractUserIdFromVirtualPath(data.virtualPath);
        if (userId) {
          const userType = await getUserTypeFromDatabase(userId);
          if (userType) {
            logActivity(request, 'S3_DOWNLOAD', entityName, entityId, userId, userType).catch((err) => {
              console.error('[S3_DOWNLOAD] Failed to log activity (fallback with userId/userType):', err);
            });
          } else {
            logActivity(request, 'S3_DOWNLOAD', entityName, entityId).catch((err) => {
              console.error('[S3_DOWNLOAD] Failed to log activity (fallback with userId, no userType):', err);
            });
          }
        } else {
          logActivity(request, 'S3_DOWNLOAD', entityName, entityId).catch((err) => {
            console.error('[S3_DOWNLOAD] Failed to log activity (fallback no userId):', err);
          });
        }
      }
    } else {
      console.warn('[S3_DOWNLOAD] Download not successful or no buffer, skipping activity log:', {
        success: result.success,
        hasBuffer: !!result.buffer,
        message: result.message,
        virtualPath: data.virtualPath
      });
    }

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
async function handleDelete(data: DeleteRequest, request: NextRequest): Promise<DeleteResponse> {
  try {
    if (!isS3Configured()) {
      return {
        success: false,
        message: 'S3 is not properly configured',
      };
    }

    const result = await deleteFromS3(data.virtualPath);
    
    // Log activity if delete was successful (non-blocking)
    if (result.success) {
      // Extract entity_id from virtual path filename
      let entityId: number | null = null;
      
      if (data.virtualPath.startsWith('upload/')) {
        const pathWithoutUpload = data.virtualPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        if (lastSlashIndex > 0) {
          const fileName = pathWithoutUpload.substring(lastSlashIndex + 1);
          
          // Pattern 1: userId_recordId.ext -> extract recordId
          const pattern1Match = fileName.match(/^\d+_(\d+)\./);
          if (pattern1Match) {
            entityId = parseInt(pattern1Match[1], 10) || null;
          } else {
            // Pattern: userId_timestamp.ext -> extract timestamp
            const timestampMatch = fileName.match(/^(\d+)_(\d+)\./);
            if (timestampMatch) {
              const timestamp = parseInt(timestampMatch[2], 10);
              // Only use timestamp if it's a valid integer within SQL INT range
              if (!isNaN(timestamp) && timestamp >= -2147483648 && timestamp <= 2147483647) {
                entityId = timestamp;
              }
            } else {
              // Pattern 4: recordId.ext -> extract recordId
              const pattern4Match = fileName.match(/^(\d+)\./);
              if (pattern4Match) {
                entityId = parseInt(pattern4Match[1], 10) || null;
              }
            }
          }
        }
      }
      
      // Extract entity name from virtual path (objectKey)
      // Format: upload/Category/SubCategory/filename.ext
      // Entity name: S3_Category_SubCategory
      let entityName = 'S3_Document';
      if (data.virtualPath.startsWith('upload/')) {
        const pathWithoutUpload = data.virtualPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          // Extract folder path (everything before the filename)
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          // Replace slashes with underscores and add S3_ prefix
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          // No subfolder, just use the folder name
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Only log if entityId is a real record ID (not a timestamp)
      // DELETE operations usually happen after record exists, but check anyway
      // If it's a timestamp, the page route will handle logging
      if (!isTimestampEntityId(entityId)) {
        // Try to authenticate request to get user info for activity logging
        try {
          const authResult = await authenticateRequest(request);
          if (authResult && !authResult.error && authResult.user) {
            logActivityFromRequest(request, authResult.user, 'S3_DELETE', entityName, entityId).catch(() => {});
          } else {
            // Fallback: try to extract userId from virtual path and get userType
            const userId = extractUserIdFromVirtualPath(data.virtualPath);
            if (userId) {
              const userType = await getUserTypeFromDatabase(userId);
              if (userType) {
                logActivity(request, 'S3_DELETE', entityName, entityId, userId, userType).catch(() => {});
              } else {
                logActivity(request, 'S3_DELETE', entityName, entityId).catch(() => {});
              }
            } else {
              logActivity(request, 'S3_DELETE', entityName, entityId).catch(() => {});
            }
          }
        } catch (authError) {
          // Fallback: try to extract userId from virtual path and get userType
          const userId = extractUserIdFromVirtualPath(data.virtualPath);
          if (userId) {
            const userType = await getUserTypeFromDatabase(userId);
            if (userType) {
              logActivity(request, 'S3_DELETE', entityName, entityId, userId, userType).catch(() => {});
            } else {
              logActivity(request, 'S3_DELETE', entityName, entityId).catch(() => {});
            }
          } else {
            logActivity(request, 'S3_DELETE', entityName, entityId).catch(() => {});
          }
        }
      } else {
        // EntityId is a timestamp - skip logging here
        // The page route will handle logging with the correct recordId
        console.log(`[S3 Delete] Skipping activity log (timestamp entityId: ${entityId}). Page route will log with correct recordId.`);
      }
    }
    
    return result;
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
async function handleSignedUrl(data: SignedUrlRequest, request: NextRequest): Promise<SignedUrlResponse> {
  try {
    if (!isS3Configured()) {
      return {
        success: false,
        message: 'S3 is not properly configured',
      };
    }

    const result = await getSignedUrl(data.virtualPath, data.expiresIn);
    
    // Log activity if signed URL generation was successful (non-blocking)
    if (result.success) {
      // Extract entity_id from virtual path filename
      let entityId: number | null = null;
      
      if (data.virtualPath.startsWith('upload/')) {
        const pathWithoutUpload = data.virtualPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        if (lastSlashIndex > 0) {
          const fileName = pathWithoutUpload.substring(lastSlashIndex + 1);
          
          // Pattern 1: userId_recordId.ext -> extract recordId
          const pattern1Match = fileName.match(/^\d+_(\d+)\./);
          if (pattern1Match) {
            entityId = parseInt(pattern1Match[1], 10) || null;
          } else {
            // Pattern: userId_timestamp.ext -> extract timestamp
            const timestampMatch = fileName.match(/^(\d+)_(\d+)\./);
            if (timestampMatch) {
              const timestamp = parseInt(timestampMatch[2], 10);
              // Only use timestamp if it's a valid integer within SQL INT range
              if (!isNaN(timestamp) && timestamp >= -2147483648 && timestamp <= 2147483647) {
                entityId = timestamp;
              }
            } else {
              // Pattern 4: recordId.ext -> extract recordId
              const pattern4Match = fileName.match(/^(\d+)\./);
              if (pattern4Match) {
                entityId = parseInt(pattern4Match[1], 10) || null;
              }
            }
          }
        }
      }
      
      // Extract entity name from virtual path (objectKey)
      // Format: upload/Category/SubCategory/filename.ext
      // Entity name: S3_Category_SubCategory
      let entityName = 'S3_Document';
      if (data.virtualPath.startsWith('upload/')) {
        const pathWithoutUpload = data.virtualPath.substring(7); // Remove 'upload/'
        const lastSlashIndex = pathWithoutUpload.lastIndexOf('/');
        
        if (lastSlashIndex > 0) {
          // Extract folder path (everything before the filename)
          const folderPath = pathWithoutUpload.substring(0, lastSlashIndex);
          // Replace slashes with underscores and add S3_ prefix
          entityName = 'S3_' + folderPath.replace(/\//g, '_');
        } else {
          // No subfolder, just use the folder name
          entityName = 'S3_' + pathWithoutUpload.split('/')[0];
        }
      }
      
      // Try to authenticate request to get user info for activity logging
      try {
        const authResult = await authenticateRequest(request);
        if (authResult && !authResult.error && authResult.user) {
          logActivityFromRequest(request, authResult.user, 'S3_GET_SIGNED_URL', entityName, entityId).catch(() => {});
        } else {
          // Fallback: try to extract userId from virtual path and get userType
          const userId = extractUserIdFromVirtualPath(data.virtualPath);
          if (userId) {
            const userType = await getUserTypeFromDatabase(userId);
            if (userType) {
              logActivity(request, 'S3_GET_SIGNED_URL', entityName, entityId, userId, userType).catch(() => {});
            } else {
              logActivity(request, 'S3_GET_SIGNED_URL', entityName, entityId).catch(() => {});
            }
          } else {
            logActivity(request, 'S3_GET_SIGNED_URL', entityName, entityId).catch(() => {});
          }
        }
      } catch (authError) {
        // Fallback: try to extract userId from virtual path and get userType
        const userId = extractUserIdFromVirtualPath(data.virtualPath);
        if (userId) {
          const userType = await getUserTypeFromDatabase(userId);
          if (userType) {
            logActivity(request, 'S3_GET_SIGNED_URL', entityName, entityId, userId, userType).catch(() => {});
          } else {
            logActivity(request, 'S3_GET_SIGNED_URL', entityName, entityId).catch(() => {});
          }
        } else {
          logActivity(request, 'S3_GET_SIGNED_URL', entityName, entityId).catch(() => {});
        }
      }
    }
    
    return result;
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
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  try {
    const body = await request.json();

    switch (action) {
      case 'upload': {
        const result = await handleUpload(body as UploadRequest, request);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'download': {
        const result = await handleDownload(body as DownloadRequest, request);
        return NextResponse.json(result, { status: result.success ? 200 : 404 });
      }

      case 'delete': {
        const result = await handleDelete(body as DeleteRequest, request);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'get-signed-url': {
        const result = await handleSignedUrl(body as SignedUrlRequest, request);
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

