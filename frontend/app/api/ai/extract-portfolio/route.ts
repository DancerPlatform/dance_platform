import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse-fork";
import { GoogleGenAI } from "@google/genai";


// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const ai = new GoogleGenAI({});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as "artist" | "team";
    const text = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;

    if (!type || (!text && !file)) {
      return NextResponse.json(
        { error: "Missing required fields: type and either text or file" },
        { status: 400 }
      );
    }

    // Extract text from PDF if file is provided
    let inputText = text || "";
    if (file) {
      const buffer = await file.arrayBuffer();
      const data = await pdfParse(Buffer.from(buffer));
      inputText = data.text;
    }

    if (!inputText.trim()) {
      return NextResponse.json(
        { error: "No text content found to process" },
        { status: 400 }
      );
    }

    // Load the appropriate template
    const templatePath =
      type === "artist"
        ? "/templates/artist_template.json"
        : "/templates/team_template.json";

    const templateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${templatePath}`
    );
    const template = await templateResponse.json();

    // Create prompt for Gemini
    const prompt = `You are a data extraction assistant. Extract portfolio information from the following text and format it according to the provided JSON template.

IMPORTANT INSTRUCTIONS:
1. Extract only information that is explicitly mentioned in the text
2. Leave fields empty ("") if the information is not found
3. For arrays, only include items that have actual data
4. For dates, use YYYY-MM-DD format
5. For boolean fields (is_highlight), set to false by default unless explicitly mentioned as highlighted/featured
6. For display_order, assign sequential numbers starting from 1
7. Keep URLs and social media handles exactly as mentioned
8. Do NOT make up or infer information that isn't in the text
9. If the provided dates don't contain all the required info fill in the dates with the first day of january.
10. Make sure none of the fields in the template are null. For example if there are no dates provided you can fill it in with the date 9999-01-01.
11. Translate all information to english before extraction except the name of the song or singers.

VALIDATION INSTRUCTIONS:
11. Each item in the arrays contains a "_validation" object that tracks field validity
12. For each field in "_validation", set the value to either "valid" or "invalid":
    - "valid": The field has complete, accurate information extracted from the text
    - "invalid": The field is empty, incomplete (e.g., year-only date like "2023"), or contains placeholder data
13. Examples of INVALID fields:
    - Empty strings: ""
    - Dates with only year: "2023" (should be "2023-01-01" or complete date)
    - Dates with year-month: "2023-08" (missing day)
    - Placeholder dates: "1111-01-01"
    - Missing or unavailable information
14. Examples of VALID fields:
    - Complete dates: "2023-08-15"
    - Complete information: "Swan Lake", "John Doe", "https://youtube.com/..."
15. The _validation object should reflect the actual completeness of the data, helping users identify what needs to be filled in manually

Template structure to follow:
${JSON.stringify(template, null, 2)}

Text to extract from:
${inputText}

Respond ONLY with valid JSON matching the template structure. Do not include any explanations or additional text.`;

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `${prompt}`
    })

    if (!response || !response.text) {
      throw new Error("Invalid response from AI model");
    }

    const extractedText = response.text;

    // Parse the JSON response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = extractedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          details: extractedText.substring(0, 500),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      type,
    });
  } catch (error) {
    console.error("Error extracting portfolio data:", error);
    return NextResponse.json(
      {
        error: "Failed to extract portfolio data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
