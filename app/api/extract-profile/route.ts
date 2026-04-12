import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cvText } = body;

    if (!cvText || cvText.length < 50) {
      return NextResponse.json({ 
        success: false, 
        error: "CV text too short",
        profile: null 
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a CV analyzer. Extract key profile information from the CV and return ONLY valid JSON with this exact structure:
{
  "name": "Person's full name or null if not found",
  "title": "Current/most recent job title or null",
  "yearsOfExperience": "Estimated total years (e.g., '5+ years', '2-3 years')",
  "skills": ["skill1", "skill2", "skill3"],
  "languages": ["language1", "language2"],
  "education": ["Degree, University"],
  "certifications": ["cert1", "cert2"],
  "industries": ["industry1", "industry2"]
}

Rules:
- Extract maximum 12 skills (most relevant/prominent ones)
- Keep skill names short (1-3 words each)
- Languages should include proficiency if mentioned (e.g., "French (Native)", "English (Fluent)")
- If something isn't found, use an empty array [] or null
- Return ONLY the JSON object, no markdown, no backticks, no explanation`
        },
        {
          role: "user",
          content: cvText.slice(0, 8000)
        }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "";
    
    let profile;
    try {
      const cleanContent = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
      
      profile = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      profile = {
        name: null,
        title: null,
        yearsOfExperience: "Unknown",
        skills: [],
        languages: [],
        education: [],
        certifications: [],
        industries: []
      };
    }

    return NextResponse.json({ success: true, profile });
    
  } catch (error: any) {
    console.error("Profile extraction error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to extract profile",
      profile: null
    });
  }
}