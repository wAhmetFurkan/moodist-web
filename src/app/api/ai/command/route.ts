import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebaseAdmin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { command } = await req.json();

        if (!command) {
            return NextResponse.json({ error: "Command is required" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API Key is missing" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const systemPrompt = `
You are an AI assistant that helps users modify their portfolio website through natural language commands.

Your task is to interpret user commands and generate JSON configurations for portfolio sections.

Available section types:
1. "hero" - Hero section with name, title, bio
2. "projects" - Projects gallery
3. "skills" - Skills/technologies list
4. "about" - Detailed about section
5. "contact" - Contact form
6. "testimonials" - Customer testimonials
7. "custom" - Custom HTML content

User commands examples:
- "Add a testimonials section with 3 customer reviews"
- "Update my hero section to include my new job title"
- "Add a skills section showing React, Next.js, Firebase"
- "Create a contact form"

You must respond with a JSON object in this exact format:
{
  "action": "add" | "update" | "delete",
  "sectionType": "hero" | "projects" | "skills" | "about" | "contact" | "testimonials" | "custom",
  "sectionId": "unique-id-for-this-section",
  "data": {
    // Section-specific data based on type
  },
  "explanation": "Brief explanation of what you did"
}

Examples:

Command: "Add a skills section with React, TypeScript, Firebase"
Response:
{
  "action": "add",
  "sectionType": "skills",
  "sectionId": "skills-main",
  "data": {
    "title": "My Skills",
    "skills": [
      { "name": "React", "level": "Advanced" },
      { "name": "TypeScript", "level": "Advanced" },
      { "name": "Firebase", "level": "Intermediate" }
    ],
    "layout": "grid"
  },
  "explanation": "Added a skills section displaying React, TypeScript, and Firebase with proficiency levels."
}

Command: "Add testimonials section"
Response:
{
  "action": "add",
  "sectionType": "testimonials",
  "sectionId": "testimonials-main",
  "data": {
    "title": "What Clients Say",
    "testimonials": [
      {
        "name": "Sample Client",
        "role": "CEO, Company",
        "text": "Excellent work! Highly recommended.",
        "avatar": ""
      }
    ]
  },
  "explanation": "Added a testimonials section. You can edit the sample testimonial in the admin panel."
}

IMPORTANT: 
- Always return valid JSON
- Be creative but practical
- If the command is unclear, make reasonable assumptions
- For "update" actions, include only the fields that need to change
`;

        const result = await model.generateContent([
            systemPrompt,
            `User command: ${command}`,
        ]);

        const responseText = result.response.text();

        // Extract JSON from markdown code blocks if present
        let jsonText = responseText;
        const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1];
        }

        const aiResponse = JSON.parse(jsonText);

        // Validate response structure
        if (!aiResponse.action || !aiResponse.sectionType || !aiResponse.data) {
            throw new Error("Invalid AI response structure");
        }

        // Save to Firestore
        const sectionRef = db
            .collection("portfolios")
            .doc("default")
            .collection("sections")
            .doc(aiResponse.sectionId);

        if (aiResponse.action === "delete") {
            await sectionRef.delete();
        } else {
            await sectionRef.set({
                type: aiResponse.sectionType,
                content: aiResponse.data,
                visible: true,
                order: Date.now(), // Use timestamp for ordering
                createdAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({
            success: true,
            action: aiResponse.action,
            sectionType: aiResponse.sectionType,
            explanation: aiResponse.explanation,
            data: aiResponse.data,
        });

    } catch (error: any) {
        console.error("AI Command Error:", error);
        return NextResponse.json(
            {
                error: error.message || "Failed to process command",
                details: error.toString()
            },
            { status: 500 }
        );
    }
}
