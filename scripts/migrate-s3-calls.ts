/**
 * Migration Script: Replace old S3 API calls with new implementation
 * 
 * This script updates all teacher module files to use the new S3 API
 * with proper pattern support and virtual path generation.
 * 
 * Run manually or use as reference for batch updates.
 */

export const OLD_S3_PATTERN = `// Extract fileName from local URL
        const fileName = documentUrl.split("/").pop()
        
        if (fileName) {
          // Upload to S3 using the file in /public/uploaded-document/
          const s3Response = await fetch("/api/shared/s3", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName: fileName,
            }),
          })

          if (!s3Response.ok) {
            const s3Error = await s3Response.json()
            throw new Error(s3Error.error || "Failed to upload document to S3")
          }

          const s3Data = await s3Response.json()
          pdfPath = s3Data.url // Use S3 URL for database storage

          // Delete local file after successful S3 upload
          await fetch("/api/shared/local-document-upload", {
            method: "DELETE",
          })
        }`;

/**
 * Folder name mappings for different modules
 */
export const FOLDER_MAPPINGS: Record<string, string> = {
  'papers': 'Paper_Presented',
  'journal-articles': 'Journal_Paper',
  'books': 'book',
  'research': 'research pdf',
  'awards-recognition': 'award',
  'talks-events': 'talks',
  'phd': 'Phd_Guidance',
  'jrf-srf': 'JRF_SRF',
  'econtent': 'EContent',
  'financial': 'Fin_Support',
  'visits': 'Acad_ResearchVisit',
  'consultancy': 'Consultancy_Undertaken',
  'copyrights': 'Copyrights',
  'patents': 'patents',
  'policy': 'Policy_Doc',
  'collaborations': 'MOU_Linkage',
};

/**
 * Generate new S3 upload code for add pages (no record ID yet)
 */
export function generateNewUploadCodeForAdd(folderName: string): string {
  return `const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        // For new records, use timestamp as recordId since DB record doesn't exist yet
        const tempRecordId = Date.now()
        
        pdfPath = await uploadDocumentToS3(
          documentUrl,
          user.role_id,
          tempRecordId,
          "${folderName}"
        )`;
}

/**
 * Generate new S3 upload code for edit pages (has record ID)
 */
export function generateNewUploadCodeForEdit(folderName: string, recordIdVar: string = 'id'): string {
  return `const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
        
        const recordId = parseInt(${recordIdVar} as string, 10)
        
        pdfPath = await uploadDocumentToS3(
          documentUrl,
          user.role_id,
          recordId,
          "${folderName}"
        )`;
}

/**
 * Files to migrate with their folder mappings
 */
export const FILES_TO_MIGRATE = [
  // Publications - Papers
  { path: 'app/(dashboards)/teacher/publication/papers/add/page.tsx', folder: 'Paper_Presented', type: 'add' },
  { path: 'app/(dashboards)/teacher/publication/papers/[id]/edit/page.tsx', folder: 'Paper_Presented', type: 'edit', recordIdVar: 'id' },
  
  // Publications - Journal Articles
  { path: 'app/(dashboards)/teacher/publication/journal-articles/add/page.tsx', folder: 'Journal_Paper', type: 'add' },
  { path: 'app/(dashboards)/teacher/publication/journal-articles/[id]/edit/page.tsx', folder: 'Journal_Paper', type: 'edit', recordIdVar: 'id' },
  
  // Publications - Books
  { path: 'app/(dashboards)/teacher/publication/books/add/page.tsx', folder: 'book', type: 'add' },
  { path: 'app/(dashboards)/teacher/publication/books/[id]/edit/page.tsx', folder: 'book', type: 'edit', recordIdVar: 'id' },
  
  // Research
  { path: 'app/(dashboards)/teacher/research/add/page.tsx', folder: 'research pdf', type: 'add' },
  { path: 'app/(dashboards)/teacher/research/[id]/edit/page.tsx', folder: 'research pdf', type: 'edit', recordIdVar: 'projectId' },
  
  // Awards & Recognition
  { path: 'app/(dashboards)/teacher/awards-recognition/add/page.tsx', folder: 'award', type: 'add' },
  { path: 'app/(dashboards)/teacher/awards-recognition/page.tsx', folder: 'award', type: 'page' },
  
  // Talks & Events
  { path: 'app/(dashboards)/teacher/talks-events/add/page.tsx', folder: 'talks', type: 'add' },
  { path: 'app/(dashboards)/teacher/talks-events/page.tsx', folder: 'talks', type: 'page' },
  
  // Research Contributions
  { path: 'app/(dashboards)/teacher/research-contributions/page.tsx', folder: 'various', type: 'page' },
  { path: 'app/(dashboards)/teacher/research-contributions/phd/add/page.tsx', folder: 'Phd_Guidance', type: 'add' },
  { path: 'app/(dashboards)/teacher/research-contributions/jrf-srf/add/page.tsx', folder: 'JRF_SRF', type: 'add' },
  { path: 'app/(dashboards)/teacher/research-contributions/econtent/add/page.tsx', folder: 'EContent', type: 'add' },
  { path: 'app/(dashboards)/teacher/research-contributions/financial/add/page.tsx', folder: 'Fin_Support', type: 'add' },
  { path: 'app/(dashboards)/teacher/research-contributions/visits/add/page.tsx', folder: 'Acad_ResearchVisit', type: 'add' },
  { path: 'app/(dashboards)/teacher/research-contributions/consultancy/add/page.tsx', folder: 'Consultancy_Undertaken', type: 'add' },
  { path: 'app/(dashboards)/teacher/research-contributions/copyrights/add/page.tsx', folder: 'Copyrights', type: 'add' },
  { path: 'app/(dashboards)/teacher/research-contributions/patents/add/page.tsx', folder: 'patents', type: 'add' },
  { path: 'app/(dashboards)/teacher/research-contributions/policy/add/page.tsx', folder: 'Policy_Doc', type: 'add' },
  { path: 'app/(dashboards)/teacher/research-contributions/collaborations/add/page.tsx', folder: 'MOU_Linkage', type: 'add' },
];

console.log('S3 Migration Script - File mappings generated');
console.log(`Total files to migrate: ${FILES_TO_MIGRATE.length}`);

