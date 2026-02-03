import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebaseAdmin";
import defaultTokens from "@/styles/design-tokens.json";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API Key is missing" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `
      You are an expert UI/UX designer. Your task is to generate a JSON object representing design tokens based on a user's description.
      The output MUST be valid JSON and strictly follow this schema:
      {
        "themeName": "string",
        "colors": {
          "background": "hex color",
          "foreground": "hex color",
          "primary": "hex color",
          "primary-foreground": "hex color",
          "secondary": "hex color",
          "secondary-foreground": "hex color",
          "accent": "hex color",
          "accent-foreground": "hex color",
          "muted": "hex color",
          "border": "hex color"
        },
        "spacing": {
          "base": "1rem (or similar)",
          "scale": number
        },
        "typography": {
          "font-sans": "font stack string",
          "font-heading": "font stack string"
        }
      }
      
      Ensure high contrast and accessibility. Return ONLY the JSON, no markdown formatting or backticks.
    `;

        const result = await model.generateContent([systemPrompt, `Description: ${prompt}`]);
        const responseText = result.response.text();

        // Clean up potential markdown code blocks
        const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let tokens;
        try {
            tokens = JSON.parse(cleanedJson);
        } catch (e) {
            console.error("Failed to parse Gemini output:", responseText);
            return NextResponse.json({ error: "Failed to generate valid JSON" }, { status: 500 });
        }

        // Validate minimal structure (optional but good practice)
        if (!tokens.colors || !tokens.themeName) {
            return NextResponse.json({ error: "Generated JSON is missing required fields" }, { status: 500 });
        }

        // Update Firestore
        await db.collection("themes").doc("active_theme").set(tokens);

        return NextResponse.json({ success: true, themeName: tokens.themeName });

    } catch (error: any) {
        console.error("Error generating theme:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
