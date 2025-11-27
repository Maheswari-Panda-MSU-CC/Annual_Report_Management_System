// Shared CV template styles for both frontend and backend
export const cvTemplateStyles = {
  academic: {
    // Preview styles (Tailwind classes) - Match PDF/Word exactly
    // Academic: Blue accents, Times New Roman, formal and scholarly
    previewStyles: {
      container: "bg-white text-gray-900 font-['Times_New_Roman','Times',serif]",
      leftColumn: "bg-blue-50 p-8 border-r-2 border-blue-900 min-h-full", // Light blue background to differentiate
      rightColumn: "p-8 bg-white min-h-full",
      header: "text-center mb-8 pb-5 border-b-2 border-blue-900",
      nameClass: "text-3xl font-bold text-gray-900 mb-3 leading-tight",
      titleClass: "text-lg text-gray-700 mb-2",
      sectionTitle: "text-base font-bold text-blue-900 mb-4 mt-8 uppercase tracking-wide border-b-2 border-blue-900 pb-2.5",
      itemClass: "mb-5 pb-4 border-b border-blue-100 last:border-b-0", // Blue border to differentiate
      itemTitle: "font-bold text-gray-900 mb-1.5 text-base",
      itemSubtitle: "text-sm italic text-blue-700 mb-1.5", // Blue italic for differentiation
      itemDetails: "text-sm text-gray-600 leading-relaxed",
      contactHeading: "font-bold text-base mb-4 text-blue-900 uppercase tracking-wide",
      contactText: "text-sm text-gray-700 leading-relaxed",
    },
    documentStyles: {
      body: "font-family: 'Times New Roman', serif; line-height: 1.6; margin: 1in; color: #333;",
      header: "text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px;",
      name: "font-size: 28px; font-weight: bold; margin-bottom: 8px; color: #1f2937;",
      title: "font-size: 18px; color: #4b5563; margin-bottom: 5px;",
      contact: "font-size: 12px; margin-top: 15px; color: #6b7280;",
      section: "margin-bottom: 25px; page-break-inside: avoid;",
      sectionTitle:
        "font-size: 16px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;",
      item: "margin-bottom: 15px;",
      itemTitle: "font-weight: bold; margin-bottom: 3px; color: #1f2937;",
      itemSubtitle: "font-style: italic; color: #4b5563; margin-bottom: 3px;",
      itemDetails: "font-size: 14px; margin-bottom: 5px; color: #6b7280;",
      table: "width: 100%; border-collapse: collapse; margin-bottom: 15px;",
      th: "border: 1px solid #d1d5db; background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold;",
      td: "border: 1px solid #d1d5db; padding: 8px;",
      publication: "margin-bottom: 12px; text-align: justify; line-height: 1.5;",
    },
  },
  professional: {
    // Preview styles (Tailwind classes) - Match PDF/Word exactly
    // Use exact hex colors: #1d4ed8 for left column, #2563eb to #1d4ed8 gradient for header
    previewStyles: {
      container: "bg-white text-gray-900 font-['Calibri','Arial',sans-serif]",
      leftColumn: "text-white p-8 min-h-full",
      rightColumn: "p-8 bg-white min-h-full",
      header: "text-center mb-8 pb-5 text-white rounded-lg px-8 py-6 border-b-0",
      nameClass: "text-3xl font-bold text-white mb-3 leading-tight",
      titleClass: "text-lg text-blue-100 mb-2 font-medium",
      sectionTitle: "text-base font-semibold text-blue-900 mb-4 mt-8 uppercase border-l-4 border-blue-900 pl-4",
      itemClass: "mb-5 pb-4 border-l-2 border-blue-200 pl-4 last:border-b-0",
      itemTitle: "font-semibold text-gray-900 mb-1.5 text-base",
      itemSubtitle: "text-sm italic text-blue-600 mb-1.5",
      itemDetails: "text-sm text-gray-600 leading-relaxed",
      contactHeading: "font-bold text-base mb-4 text-blue-100 uppercase tracking-wide",
      contactText: "text-sm text-white leading-relaxed",
    },
    documentStyles: {
      body: "font-family: Arial, sans-serif; line-height: 1.5; margin: 1in; color: #374151;",
      header:
        "background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; margin-bottom: 30px; border-radius: 8px;",
      name: "font-size: 32px; font-weight: 300; margin-bottom: 8px;",
      title: "font-size: 20px; font-weight: 500; margin-bottom: 5px; opacity: 0.9;",
      contact: "font-size: 12px; margin-top: 15px; opacity: 0.8;",
      section: "margin-bottom: 25px; page-break-inside: avoid;",
      sectionTitle:
        "font-size: 16px; font-weight: 600; color: #1d4ed8; border-left: 4px solid #2563eb; padding-left: 15px; margin-bottom: 15px; text-transform: uppercase;",
      item: "margin-bottom: 15px; padding-left: 15px; border-left: 2px solid #e5e7eb;",
      itemTitle: "font-weight: 600; margin-bottom: 3px; color: #111827;",
      itemSubtitle: "color: #2563eb; font-weight: 500; margin-bottom: 3px;",
      itemDetails: "font-size: 14px; margin-bottom: 5px; color: #4b5563;",
      table: "width: 100%; border-collapse: collapse; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);",
      th: "background-color: #eff6ff; padding: 12px; text-left; font-weight: 600; color: #1e40af; border-bottom: 1px solid #bfdbfe;",
      td: "padding: 12px; border-bottom: 1px solid #e5e7eb;",
      publication: "margin-bottom: 12px; padding-left: 15px; border-left: 1px solid #bfdbfe;",
    },
  },
  modern: {
    // Preview styles (Tailwind classes)
    previewStyles: {
      container: "bg-white text-gray-900 font-['Roboto','Calibri','Arial',sans-serif]",
      leftColumn: "bg-gradient-to-b from-blue-50 to-white p-8 border-r-2 border-blue-100 min-h-full",
      rightColumn: "p-8 bg-white min-h-full",
      header: "text-center mb-8 pb-5 border-b-2 border-blue-200",
      nameClass: "text-3xl font-bold text-gray-900 mb-3 leading-tight",
      titleClass: "text-lg text-gray-600 mb-2 font-medium",
      sectionTitle: "text-base font-semibold text-blue-700 mb-4 mt-8 uppercase tracking-wide border-b-2 border-blue-200 pb-2.5",
      itemClass: "mb-5 pb-4 border-b border-gray-100 last:border-b-0",
      itemTitle: "font-semibold text-gray-900 mb-1.5 text-base",
      itemSubtitle: "text-sm italic text-gray-600 mb-1.5",
      itemDetails: "text-sm text-gray-500 leading-relaxed",
      contactHeading: "font-bold text-base mb-4 text-gray-900 uppercase tracking-wide",
      contactText: "text-sm text-gray-700 leading-relaxed",
    },
    documentStyles: {
      body: "font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; margin: 1in; color: #111827; background-color: #f9fafb;",
      header:
        "background-color: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); padding: 30px; margin-bottom: 30px; border-radius: 12px;",
      name: "font-size: 32px; font-weight: 100; margin-bottom: 8px; color: #111827;",
      title: "font-size: 20px; color: #4b5563; margin-bottom: 5px; font-weight: 300;",
      contact: "font-size: 12px; margin-top: 15px; color: #6b7280;",
      section: "margin-bottom: 25px; page-break-inside: avoid;",
      sectionTitle:
        "font-size: 16px; font-weight: 500; color: #374151; background-color: #e5e7eb; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px; display: inline-block;",
      item: "margin-bottom: 15px; background-color: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);",
      itemTitle: "font-weight: 500; margin-bottom: 3px; color: #111827;",
      itemSubtitle: "color: #4b5563; margin-bottom: 3px;",
      itemDetails: "font-size: 14px; margin-bottom: 5px; color: #6b7280;",
      table:
        "width: 100%; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 15px;",
      th: "background-color: #f3f4f6; padding: 12px; text-left; font-weight: 500; color: #374151;",
      td: "padding: 12px; border-bottom: 1px solid #f3f4f6;",
      publication:
        "margin-bottom: 12px; background-color: white; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);",
    },
  },
  classic: {
    // Preview styles (Tailwind classes) - Match PDF/Word exactly, differentiate from academic
    // Classic: Gray/brown tones, Georgia font, traditional and elegant
    previewStyles: {
      container: "bg-white text-gray-900 font-['Georgia','Times_New_Roman','Times',serif]", // Georgia font to differentiate
      leftColumn: "bg-amber-50 p-8 border-r-2 border-amber-800 min-h-full", // Warm amber background to differentiate
      rightColumn: "p-8 bg-white min-h-full",
      header: "text-center mb-8 pb-5 border-b-2 border-amber-800", // Amber border instead of gray
      nameClass: "text-3xl font-bold text-gray-900 mb-3 leading-tight",
      titleClass: "text-lg text-gray-700 mb-2",
      sectionTitle: "text-base font-bold text-amber-900 mb-4 mt-8 uppercase border-b-2 border-amber-800 pb-2.5 tracking-wider", // Amber accents
      itemClass: "mb-5 pb-4 border-b border-amber-100 last:border-b-0", // Amber border
      itemTitle: "font-bold text-gray-900 mb-1.5 text-base",
      itemSubtitle: "text-sm italic text-amber-800 mb-1.5", // Amber italic
      itemDetails: "text-sm text-gray-600 leading-relaxed",
      contactHeading: "font-bold text-base mb-4 text-amber-900 uppercase tracking-wide", // Amber heading
      contactText: "text-sm text-gray-700 leading-relaxed",
    },
    documentStyles: {
      body: "font-family: 'Times New Roman', serif; line-height: 1.6; margin: 1in; color: #1f2937; background-color: #fefdf8;",
      header: "text-align: center; border-bottom: 1px solid #9ca3af; padding-bottom: 20px; margin-bottom: 30px;",
      name: "font-size: 28px; font-weight: bold; margin-bottom: 8px; color: #1f2937; letter-spacing: 1px;",
      title: "font-size: 18px; color: #374151; margin-bottom: 5px;",
      contact: "font-size: 12px; margin-top: 15px; color: #4b5563;",
      section: "margin-bottom: 25px; page-break-inside: avoid;",
      sectionTitle:
        "font-size: 16px; font-weight: bold; color: #374151; border-bottom: 1px solid #9ca3af; padding-bottom: 3px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;",
      item: "margin-bottom: 15px;",
      itemTitle: "font-weight: bold; margin-bottom: 3px; color: #1f2937;",
      itemSubtitle: "font-style: italic; color: #374151; margin-bottom: 3px;",
      itemDetails: "font-size: 14px; margin-bottom: 5px; color: #4b5563;",
      table: "width: 100%; border-collapse: collapse; border: 2px solid #9ca3af; margin-bottom: 15px;",
      th: "border: 1px solid #9ca3af; background-color: #e5e7eb; padding: 10px; text-align: left; font-weight: bold;",
      td: "border: 1px solid #9ca3af; padding: 10px;",
      publication: "margin-bottom: 12px; text-align: justify;",
    },
  },
} as const

export type CVTemplate = keyof typeof cvTemplateStyles

