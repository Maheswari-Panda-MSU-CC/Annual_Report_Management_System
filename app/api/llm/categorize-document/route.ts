// import { NextResponse } from 'next/server';

// // Mock LLM API for document categorization
// export async function POST(request: Request) {
//   try {
//     const { fileName, fileType, fileSize } = await request.json();

//     if (!fileName) {
//       return NextResponse.json({ error: 'File name is required' }, { status: 400 });
//     }

//     // Simulate LLM processing delay
//     await new Promise(resolve => setTimeout(resolve, 2000));

//     // Mock LLM categorization based on file name and type
//     const categorization = categorizeDocument(fileName, fileType);
    
//     return NextResponse.json({
//       success: true,
//       category: categorization.category,
//       confidence: categorization.confidence,
//       extractedData: categorization.extractedData,
//       recommendations: categorization.recommendations,
//       suggestedPages: categorization.suggestedPages
//     });

//   } catch (error) {
//     console.error('LLM Categorization Error:', error);
//     return NextResponse.json({ error: 'Failed to categorize document' }, { status: 500 });
//   }
// }

// // Mock document categorization logic
// function categorizeDocument(fileName: string, fileType: string) {
//   const fileNameLower = fileName.toLowerCase();
  
//   // Research-related keywords
//   const researchKeywords = ['research', 'study', 'analysis', 'investigation', 'experiment', 'thesis', 'dissertation', 'project'];
//   // Publication keywords
//   const publicationKeywords = ['paper', 'article', 'journal', 'conference', 'proceedings', 'publication', 'manuscript'];
//   // Award keywords
//   const awardKeywords = ['award', 'recognition', 'prize', 'honor', 'certificate', 'achievement', 'excellence'];
//   // Teaching keywords
//   const teachingKeywords = ['teaching', 'course', 'syllabus', 'curriculum', 'lesson', 'education', 'pedagogy'];
//   // Conference keywords
//   const conferenceKeywords = ['conference', 'seminar', 'workshop', 'symposium', 'presentation', 'talk'];

//   let category = 'general';
//   let confidence = 0.7;
//   let extractedData = {};
//   let recommendations = [];
//   let suggestedPages = [];

//   // Determine category based on keywords
//   if (researchKeywords.some(keyword => fileNameLower.includes(keyword))) {
//     category = 'research';
//     confidence = 0.9;
//     extractedData = {
//       title: extractTitle(fileName),
//       type: 'Research Project',
//       description: 'Research document detected'
//     };
//     recommendations = [
//       'This appears to be a research document. You can add it to your research projects.',
//       'Consider adding research metrics and contributions.'
//     ];
//     suggestedPages = [
//       { name: 'Research Projects', path: '/teacher/research/add', description: 'Add research projects and contributions' },
//       { name: 'Research Metrics', path: '/teacher/research-contributions', description: 'Track research metrics and impact' }
//     ];
//   } else if (publicationKeywords.some(keyword => fileNameLower.includes(keyword))) {
//     category = 'publication';
//     confidence = 0.95;
//     extractedData = {
//       title: extractTitle(fileName),
//       type: 'Publication',
//       description: 'Publication document detected'
//     };
//     recommendations = [
//       'This appears to be a publication document. You can add it to your publications.',
//       'Consider adding publication details and metrics.'
//     ];
//     suggestedPages = [
//       { name: 'Journal Articles', path: '/teacher/publication/journal-articles/add', description: 'Add journal articles and papers' },
//       { name: 'Conference Papers', path: '/teacher/publication/papers/add', description: 'Add conference papers and proceedings' },
//       { name: 'Books', path: '/teacher/publication/books/add', description: 'Add books and book chapters' },
//       { name: 'Publication Certificate', path: '/teacher/publication-certificate', description: 'Upload publication certificates' }
//     ];
//   } else if (awardKeywords.some(keyword => fileNameLower.includes(keyword))) {
//     category = 'award';
//     confidence = 0.85;
//     extractedData = {
//       title: extractTitle(fileName),
//       type: 'Award/Recognition',
//       description: 'Award or recognition document detected'
//     };
//     recommendations = [
//       'This appears to be an award or recognition document. You can add it to your awards.',
//       'Consider adding award details and recognition information.'
//     ];
//     suggestedPages = [
//       { name: 'Awards & Recognition', path: '/teacher/awards-recognition/add', description: 'Add awards, honors, and recognitions' }
//     ];
//   } else if (teachingKeywords.some(keyword => fileNameLower.includes(keyword))) {
//     category = 'teaching';
//     confidence = 0.8;
//     extractedData = {
//       title: extractTitle(fileName),
//       type: 'Teaching Material',
//       description: 'Teaching-related document detected'
//     };
//     recommendations = [
//       'This appears to be a teaching document. You can add it to your teaching materials.',
//       'Consider adding course details and teaching methodologies.'
//     ];
//     suggestedPages = [
//       { name: 'Online Engagement', path: '/teacher/online-engagement/add', description: 'Add online teaching materials and engagement' }
//     ];
//   } else if (conferenceKeywords.some(keyword => fileNameLower.includes(keyword))) {
//     category = 'conference';
//     confidence = 0.85;
//     extractedData = {
//       title: extractTitle(fileName),
//       type: 'Conference/Talk',
//       description: 'Conference or presentation document detected'
//     };
//     recommendations = [
//       'This appears to be a conference or presentation document. You can add it to your talks and events.',
//       'Consider adding conference details and presentation information.'
//     ];
//     suggestedPages = [
//       { name: 'Talks & Events', path: '/teacher/talks-events/add', description: 'Add conference presentations, talks, and events' }
//     ];
//   } else {
//     // General document
//     category = 'general';
//     confidence = 0.6;
//     extractedData = {
//       title: extractTitle(fileName),
//       type: 'General Document',
//       description: 'General document detected'
//     };
//     recommendations = [
//       'This document could be added to multiple categories. Please review and select the most appropriate one.',
//       'Consider the document content to determine the best category.'
//     ];
//     suggestedPages = [
//       { name: 'Research Projects', path: '/teacher/research/add', description: 'Add research projects and contributions' },
//       { name: 'Journal Articles', path: '/teacher/publication/journal-articles/add', description: 'Add journal articles and papers' },
//       { name: 'Conference Papers', path: '/teacher/publication/papers/add', description: 'Add conference papers and proceedings' },
//       { name: 'Books', path: '/teacher/publication/books/add', description: 'Add books and book chapters' },
//       { name: 'Awards & Recognition', path: '/teacher/awards-recognition/add', description: 'Add awards and recognitions' },
//       { name: 'Talks & Events', path: '/teacher/talks-events/add', description: 'Add conference presentations and talks' },
//       { name: 'Online Engagement', path: '/teacher/online-engagement/add', description: 'Add online teaching materials' }
//     ];
//   }

//   return {
//     category,
//     confidence,
//     extractedData,
//     recommendations,
//     suggestedPages
//   };
// }

// // Helper function to extract title from filename
// function extractTitle(fileName: string): string {
//   // Remove file extension
//   const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
//   // Replace underscores and hyphens with spaces
//   const title = nameWithoutExt.replace(/[_-]/g, ' ');
//   // Capitalize first letter of each word
//   return title.replace(/\b\w/g, l => l.toUpperCase());
// }


// app/api/llm/categorize-file/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create a new FormData to forward to LLM API
    const forwardFormData = new FormData();
    forwardFormData.append("file", file); // keep the same field name expected by LLM API

    // Forward the request to your local LLM API (running on port 8000)
    const llmResponse = await fetch("http://localhost:8000/api", {
      method: "POST",
      body: forwardFormData,
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      return NextResponse.json({ error: "LLM API failed", details: errText }, { status: 500 });
    }

    const result = await llmResponse.json();

    // Return the LLM API result to frontend
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("LLM route error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
