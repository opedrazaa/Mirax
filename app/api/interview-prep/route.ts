import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface InterviewQuestion {
  question: string;
  category: "Technical" | "Behavioral" | "Gap" | "Company" | "Swiss-EU";
  why: string;
  angle: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface InterviewPrepResponse {
  questions: InterviewQuestion[];
  overallStrategy: string;
  keyThemesToPrepare: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvText, jobDescription, targetCountry = "CH", profile } = body;

    if (!cvText || !jobDescription) {
      return NextResponse.json(
        { error: "CV text and job description are required" },
        { status: 400 }
      );
    }

    // Extract specific details for personalization
    const candidateName = profile?.name || "the candidate";
    const candidateTitle = profile?.title || "professional";
    const candidateSkills = profile?.skills?.slice(0, 5)?.join(", ") || "various skills";
    const candidateYears = profile?.yearsOfExperience || "some";
    const candidateLanguages = profile?.languages?.join(", ") || "not specified";

    const systemPrompt = `You are an expert interview coach specializing in the Swiss and European job market. Generate HIGHLY PERSONALIZED interview questions.

CRITICAL: Every question MUST reference specific details from the candidate's CV or the job description. NO generic questions allowed.

For ${candidateName}, a ${candidateTitle} with ${candidateYears} years of experience:
- Their key skills: ${candidateSkills}
- Their languages: ${candidateLanguages}

Target country: ${targetCountry}

RULES FOR PERSONALIZATION:
1. Reference SPECIFIC technologies, tools, or methodologies from the CV
2. Reference SPECIFIC requirements from the job posting
3. Identify SPECIFIC gaps between CV and requirements
4. Use the candidate's ACTUAL past companies/projects in behavioral questions
5. For Swiss roles, consider work permit and language requirements

Generate questions that would ONLY make sense for THIS candidate applying to THIS role.`;

    const userPrompt = `## JOB DESCRIPTION:
${jobDescription}

## CANDIDATE CV:
${cvText}

${profile ? `## EXTRACTED PROFILE:
Name: ${profile.name || "Not specified"}
Title: ${profile.title || "Not specified"}
Experience: ${profile.yearsOfExperience || "Not specified"} years
Key Skills: ${profile.skills?.join(", ") || "Not specified"}
Languages: ${profile.languages?.join(", ") || "Not specified"}
Education: ${profile.education?.join("; ") || "Not specified"}
Industries: ${profile.industries?.join(", ") || "Not specified"}` : ""}

Generate 6 highly personalized interview questions. Each question must be specific to this exact match of candidate and role.

REQUIRED OUTPUT FORMAT (valid JSON only, no markdown):
{
  "questions": [
    {
      "question": "A specific question referencing actual CV/job details",
      "category": "Technical|Behavioral|Gap|Company|Swiss-EU",
      "why": "What signal the interviewer seeks",
      "angle": "How to answer using specific experience from the CV",
      "difficulty": "Easy|Medium|Hard"
    }
  ],
  "overallStrategy": "2-3 sentences on interview approach for this specific match",
  "keyThemesToPrepare": ["Specific theme 1", "Specific theme 2", "Specific theme 3"]
}

QUESTION REQUIREMENTS:
- Technical: Must reference specific tech stack from job or CV
- Behavioral: Must reference actual projects/roles from CV
- Gap: Must address specific skill/experience gaps identified
- Swiss-EU: Work permit, languages, relocation only if relevant
- Mix difficulties: 2 Easy, 2-3 Medium, 1-2 Hard

Return ONLY valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8, // Higher for more variety
      max_tokens: 2500,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    // Clean up the response
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.slice(7);
    }
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    let interviewPrep: InterviewPrepResponse;
    
    try {
      interviewPrep = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse interview prep response:", cleanedResponse);
      return NextResponse.json(
        { error: "Failed to generate interview questions. Please try again." },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!interviewPrep.questions || !Array.isArray(interviewPrep.questions)) {
      return NextResponse.json(
        { error: "Invalid response structure from AI" },
        { status: 500 }
      );
    }

    // Ensure all questions have required fields
    interviewPrep.questions = interviewPrep.questions.map((q, index) => ({
      question: q.question || `Question ${index + 1}`,
      category: q.category || "Behavioral",
      why: q.why || "Standard interview question",
      angle: q.angle || "Draw from your relevant experience",
      difficulty: q.difficulty || "Medium",
    }));

    return NextResponse.json({
      success: true,
      interviewPrep,
    });

  } catch (error: any) {
    console.error("Interview prep API error:", error);
    
    if (error?.code === "insufficient_quota") {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}