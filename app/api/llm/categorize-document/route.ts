// app/api/llm/categorize-file/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null
    const subCategory = formData.get("subCategory") as string | null
    const isTargeted = formData.get("isTargeted") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create a new FormData to forward to LLM API
    const forwardFormData = new FormData();
    forwardFormData.append("file", file); // keep the same field name expected by LLM API
    
    if (isTargeted==="true" && category) {
      forwardFormData.append("category", category || "")
    }
    if (isTargeted==="true" && subCategory) {
      forwardFormData.append("subCategory", subCategory || "")
    }
    forwardFormData.append("isTargeted", isTargeted||"false")

    // Forward the request to your local LLM API (running on port 8000)
    const llmResponse = await fetch("http://localhost:8000/api", {
      method: "POST",
      body: forwardFormData,
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      let errorMessage = "Document analysis failed.";

      try {
        const parsedError = JSON.parse(errText);
        // handle shapes like { error: { message: "..." } }
        errorMessage = parsedError?.error?.message || parsedError?.message || errorMessage;
      } catch {
        errorMessage = errText || errorMessage;
      }

      return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }

    const result = await llmResponse.json();

    // Return the LLM API result to frontend
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("LLM route error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
