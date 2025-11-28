import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const category = formData.get("category") as string | null
    const subCategory = formData.get("subCategory") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    // Create a new FormData to forward to LLM API
    const forwardFormData = new FormData()
    forwardFormData.append("file", file)
    forwardFormData.append("category", category)
    if (subCategory) {
      forwardFormData.append("subCategory", subCategory)
    }

    // Forward the request to your local LLM API (running on port 8000)
    const llmResponse = await fetch("http://localhost:8000/api/targeted", {
      method: "POST",
      body: forwardFormData,
    })

    if (!llmResponse.ok) {
      const errText = await llmResponse.text()
      let errorMessage = "Document field extraction failed."

      try {
        const parsedError = JSON.parse(errText)
        // handle shapes like { error: { message: "..." } }
        errorMessage = parsedError?.error?.message || parsedError?.message || parsedError?.error || errorMessage
      } catch {
        errorMessage = errText || errorMessage
      }

      return NextResponse.json({ success: false, error: errorMessage }, { status: llmResponse.status })
    }

    const result = await llmResponse.json()

    // Return the LLM API result directly (it already has the correct format)
    // The response format matches what DocumentUpload expects:
    // {
    //   success: true,
    //   category: "Awards/Performance",
    //   subCategory: "Awards/Fellowship/Recognition",
    //   dataFields: { ... },
    //   expectedFields: [ ... ],
    //   extractedText: "...",
    //   fileType: ".pdf",
    //   fileName: "19_1.pdf",
    //   timestamp: "...",
    //   textQuality: { score: 100, isReadable: true, wordCount: 60 }
    // }
    return NextResponse.json(result)

  } catch (error: any) {
    console.error("LLM route error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
