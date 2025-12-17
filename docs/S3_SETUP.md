# AWS S3 Setup Guide for ARMS

This guide explains how to configure AWS S3 for document storage in the Annual Report Management System (ARMS).

## Overview

The system uses AWS S3 for secure, scalable document storage with the following features:
- **Virtual path mapping** - Database stores paths like `upload/Paper_Presented/1_7.pdf` which map directly to S3 keys
- **Backward compatibility** - Existing database structure requires no changes
- **6 naming patterns** - Supports all legacy file naming conventions
- **Presigned URLs** - Secure, temporary access to documents
- **Automatic cleanup** - Temporary local files are removed after S3 upload

## Architecture

```
Client → Local Upload → Temp Storage → S3 Upload → Database (virtual path)
                                    ↓
                              Cleanup Temp File
```

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# AWS S3 Configuration
AWS_KEY=your_aws_access_key_id
AWS_SECRET=your_aws_secret_access_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=arms-documents

# S3 Presigned URL Expiry (in seconds, default 1 hour)
S3_PRESIGNED_URL_EXPIRY=3600
```

## AWS Setup Steps

### 1. Create an S3 Bucket

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3** service
3. Click **Create bucket**
4. Configure:
   - **Bucket name**: `arms-documents` (or your preferred name)
   - **Region**: `ap-south-1` (Asia Pacific - Mumbai) or your preferred region
   - **Block Public Access**: Keep all blocks enabled (we use presigned URLs)
   - **Versioning**: Optional (recommended for production)
   - **Encryption**: Enable server-side encryption (recommended)

### 2. Create IAM User for S3 Access

1. Navigate to **IAM** service
2. Click **Users** → **Add users**
3. Configure:
   - **User name**: `arms-s3-user`
   - **Access type**: Programmatic access
4. Click **Next: Permissions**
5. Attach policies:
   - Create a custom policy (see below) OR
   - Attach `AmazonS3FullAccess` (not recommended for production)

### 3. Create Custom IAM Policy (Recommended)

Create a policy with minimum required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ARMSDocumentStorage",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::arms-documents",
        "arn:aws:s3:::arms-documents/*"
      ]
    }
  ]
}
```

### 4. Get Access Keys

1. After creating the user, **download the CSV** with credentials
2. Copy `Access key ID` → `AWS_KEY` in `.env.local`
3. Copy `Secret access key` → `AWS_SECRET` in `.env.local`

**⚠️ IMPORTANT**: Never commit `.env.local` to version control!

## File Naming Patterns

The system supports 6 legacy naming patterns for backward compatibility:

### Pattern 1: User ID + Record ID (Most Common)
**Format**: `{UserID}_{RecordID}.{ext}`  
**Example**: `upload/Paper_Presented/1_69603.pdf`  
**Used in**: Papers, Journals, Books, Research, Awards, etc.

### Pattern 2: Email-based (Profile Images)
**Format**: `{Email}.jpg`  
**Example**: `upload/Profile/teacher@university.edu.in.jpg`  
**Used in**: Profile images

### Pattern 3: Online Info
**Format**: `_{RecordID}_{FileNum}.{ext}`  
**Example**: `upload/online_info/_2_1.jpg`  
**Used in**: Online information uploads

### Pattern 4: Department-level
**Format**: `{RecordID}.{ext}`  
**Example**: `upload/dept events/1.jpg`  
**Used in**: Department events, faculty events

### Pattern 5: Metric Documents
**Format**: `{UserID}_{RecordID}_{MetricName}.{ext}`  
**Example**: `upload/Metric1_1_1Document/1_7_Metric1_1_1Document.pdf`  
**Used in**: NAAC metric documents

### Pattern 6: Qualitative Matrix
**Format**: `{UserID}_{FolderName}.{ext}`  
**Example**: `upload/QualitativeMatrix/1_MetricName.pdf`  
**Used in**: Qualitative assessments

## Folder Structure in S3

All files are stored with the prefix `upload/` followed by the category:

```
arms-documents/
├── upload/
│   ├── Paper_Presented/
│   │   ├── 1_69603.pdf
│   │   ├── 1_71768.pdf
│   │   └── ...
│   ├── Journal_Paper/
│   │   ├── 1_12345.pdf
│   │   └── ...
│   ├── book/
│   ├── research pdf/
│   ├── Profile/
│   │   ├── teacher1@university.edu.in.jpg
│   │   └── ...
│   ├── award/
│   ├── talks/
│   ├── Phd_Guidance/
│   ├── JRF_SRF/
│   ├── EContent/
│   ├── Fin_Support/
│   ├── Acad_ResearchVisit/
│   ├── Consultancy_Undertaken/
│   ├── Copyrights/
│   ├── patents/
│   ├── Policy_Document/
│   ├── Collaborations/
│   └── ...
```

## Database Storage

The database stores **virtual paths** that map directly to S3 keys:

```sql
-- Example database entries
Image VARCHAR(1000) = 'upload/Paper_Presented/1_69603.pdf'
ProfileImage NVARCHAR(MAX) = 'upload/Profile/teacher@university.edu.in.jpg'
doc VARCHAR(500) = 'upload/JRF_SRF/1_1234567890.pdf'
```

**No database changes required!** The existing paths work as-is.

## Usage in Code

### Upload Document (Pattern 1 - Most Common)

```typescript
import { uploadDocumentToS3 } from '@/lib/s3-upload-helper'

// After user uploads file to temp storage
const virtualPath = await uploadDocumentToS3(
  documentUrl,        // e.g., "/uploaded-document/1_1234567890.pdf"
  user.role_id,       // User ID
  recordId,           // Database record ID
  "Paper_Presented"   // Folder name
)

// virtualPath = "upload/Paper_Presented/1_69603.pdf"
// Save this to database
```

### Upload Profile Image (Pattern 2)

```typescript
import { uploadProfileImage } from '@/lib/s3-upload-helper'

const virtualPath = await uploadProfileImage(
  fileName,
  "teacher@university.edu.in",
  ".jpg"
)

// virtualPath = "upload/Profile/teacher@university.edu.in.jpg"
```

### Display Document

```typescript
import { S3DocumentViewer } from '@/components/s3-document-viewer'

// In your component
<S3DocumentViewer 
  virtualPath="upload/Paper_Presented/1_7.pdf"
  showDownload={true}
  displayMode="inline"
/>
```

### Get Signed URL Programmatically

```typescript
import { getDocumentUrl } from '@/lib/s3-upload-helper'

const result = await getDocumentUrl("upload/Paper_Presented/1_7.pdf")

if (result.success) {
  // result.url is a presigned URL valid for 1 hour
  window.open(result.url, '_blank')
}
```

### Delete Document

```typescript
import { deleteDocument } from '@/lib/s3-upload-helper'

const result = await deleteDocument("upload/Paper_Presented/1_7.pdf")

if (result.success) {
  console.log("Document deleted successfully")
}
```

## API Endpoints

### Upload to S3
**POST** `/api/s3/upload`

```json
{
  "fileName": "1_1234567890.pdf",
  "patternType": 1,
  "userId": 1,
  "recordId": 69603,
  "folderName": "Paper_Presented",
  "fileExtension": ".pdf"
}
```

Response:
```json
{
  "success": true,
  "virtualPath": "upload/Paper_Presented/1_69603.pdf",
  "message": "File uploaded successfully to S3"
}
```

### Get Signed URL
**POST** `/api/s3/get-signed-url`

```json
{
  "virtualPath": "upload/Paper_Presented/1_69603.pdf",
  "expiresIn": 3600
}
```

Response:
```json
{
  "success": true,
  "url": "https://arms-documents.s3.ap-south-1.amazonaws.com/upload/Paper_Presented/1_69603.pdf?X-Amz-Algorithm=...",
  "message": "Signed URL generated successfully"
}
```

### Delete from S3
**POST** `/api/s3/delete`

```json
{
  "virtualPath": "upload/Paper_Presented/1_69603.pdf"
}
```

Response:
```json
{
  "success": true,
  "message": "File deleted successfully from S3"
}
```

### Download from S3
**POST** `/api/s3/download`

```json
{
  "virtualPath": "upload/Paper_Presented/1_69603.pdf"
}
```

Response:
```json
{
  "success": true,
  "fileBase64": "JVBERi0xLjQKJeLjz9MK...",
  "contentType": "application/pdf",
  "message": "File downloaded successfully"
}
```

## Security Considerations

1. **Never expose AWS credentials** - Keep them in `.env.local` only
2. **Use presigned URLs** - Don't make S3 bucket public
3. **Set appropriate expiry** - Default 1 hour for presigned URLs
4. **Validate file types** - Only allow PDF, JPG, PNG (already implemented)
5. **Limit file sizes** - Max 1MB per file (already implemented)
6. **Enable S3 versioning** - Recover accidentally deleted files
7. **Enable S3 logging** - Track access and modifications
8. **Use HTTPS only** - All S3 URLs use HTTPS by default

## Cost Optimization

1. **S3 Standard** - For frequently accessed documents
2. **S3 Intelligent-Tiering** - Automatically moves infrequently accessed files to cheaper storage
3. **Lifecycle policies** - Archive old documents to Glacier after X years
4. **Monitor usage** - Use AWS Cost Explorer to track S3 costs

### Estimated Costs (as of 2024)

- **Storage**: $0.023 per GB/month (first 50 TB)
- **PUT requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests
- **Data transfer out**: $0.09 per GB (first 10 TB)

**Example**: 10,000 documents × 500KB = 5GB storage = ~$0.12/month

## Troubleshooting

### "S3 is not properly configured"
- Check that all AWS environment variables are set
- Verify credentials are correct
- Ensure bucket name matches `AWS_BUCKET_NAME`

### "Access Denied" errors
- Verify IAM user has correct permissions
- Check bucket policy doesn't block access
- Ensure bucket exists and is in the correct region

### "File not found" errors
- Verify the virtual path is correct
- Check the file was successfully uploaded to S3
- Use AWS Console to browse bucket contents

### Presigned URLs expire quickly
- Increase `S3_PRESIGNED_URL_EXPIRY` in `.env.local`
- Default is 3600 seconds (1 hour)
- Max recommended: 604800 seconds (7 days)

## Migration from Local Storage

If you have existing files in `/public/upload/`, use the migration script:

```bash
# TODO: Create migration script
npm run migrate:s3
```

This will:
1. Scan database for document paths
2. Check if files exist locally
3. Upload to S3 with same virtual path
4. Verify upload
5. Optionally delete local files

## Testing

Test S3 integration:

```bash
npm run test:s3
```

This will verify:
- AWS credentials are valid
- Bucket is accessible
- Upload/download/delete operations work
- Presigned URLs are generated correctly

## Support

For issues or questions:
1. Check this documentation
2. Review AWS S3 documentation
3. Contact the development team
4. Check application logs for detailed error messages

## References

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

