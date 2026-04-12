import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const client = new OpenAI({ apiKey });

  try {
    const body = await req.json();
    const { cvText, jobDescription, targetCountry, language } = body ?? {};

    if (!cvText || cvText.length < 50) {
      return NextResponse.json({ error: "CV text is too short or missing" }, { status: 400 });
    }
    if (!jobDescription || jobDescription.length < 50) {
      return NextResponse.json({ error: "Job description is too short or missing" }, { status: 400 });
    }

    const languageNames: Record<string, string> = {
      EN: "English",
      FR: "French",
      DE: "German",
      ES: "Spanish",
    };
    const outputLanguage = languageNames[language] || "English";

    const systemPrompt = `You are a senior recruiter with 15 years of experience hiring in Switzerland and the European Union. You give brutally honest, actionable advice. You think like a human, not a keyword scanner.

Your task: Analyze this candidate's CV against the job description and produce a comprehensive briefing.

CRITICAL RULES FOR EXPERIENCE MATCHING:
- Do NOT do simple math like "they want 5 years, you have 2 = gap"
- Consider transferable experience: adjacent technologies, similar roles, academic research, side projects
- Example: "5 years Python" can be satisfied by "3 years Python + 2 years data engineering with SQL/Pandas"
- Be nuanced: if someone has 4 years but strong project depth, that often beats 5 years of shallow experience
- Flag true dealbreakers only when there's no reasonable path to argue equivalence

CONTEXT:
- Target country: ${targetCountry === "CH" ? "Switzerland" : "European Union"}
- Output language: ${outputLanguage}
- For Switzerland: Consider work permit requirements, language expectations (German/French/Italian regions), photo CV conventions, salary expectations in CHF
- For EU: Consider country-specific norms, Europass CV format awareness, language requirements

OUTPUT FORMAT:
Return a JSON object with exactly these 6 keys:

{
  "jobTitle": "The exact job title from the posting (e.g., 'Senior Data Analyst', 'Product Manager'). Extract from the job description.",
  "companyName": "The company name from the posting. If not found, use 'Unknown Company'.",  "verdict": {
    "decision": "APPLY" | "APPLY_WITH_CAUTION" | "THINK_TWICE",
    "summary": "2-3 sentence explanation of the decision"
  },
  "matchAnalysis": {
    "dealbreakers": [
      {
        "requirement": "what they asked for",
        "yourSituation": "what you have",
        "assessment": "why this is/isn't a problem, considering transferable experience",
        "suggestion": "how to address this in your application"
      }
    ],
    "niceToHaves": ["list of missing nice-to-haves that won't kill your application"],
    "strongAngles": ["your 3-4 strongest selling points to emphasize"]
  },
  "salaryIntelligence": {
    "estimatedRange": "e.g., CHF 95,000 - 115,000 or €55,000 - 70,000",
    "marketContext": "how this compares to market rate for this role/city",
    "negotiationTips": ["2-3 specific tips for this situation"]
  },
  "coverLetter": "A complete, ready-to-use cover letter tailored to this specific job. Written in ${outputLanguage}. Professional but human. 250-350 words. Address specific requirements from the JD and connect them to the candidate's experience.",
  "redFlags": [
    {
      "flag": "what you noticed",
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "explanation": "why this matters"
    }
  ]
}

RED FLAGS TO LOOK FOR:
- Unrealistic requirements (e.g., "10 years experience in 5-year-old technology")
- Vague role descriptions (sign of undefined scope or ghost job)
- "Fast-paced environment" + long requirements list (potential burnout culture)
- Salary not mentioned + very senior role (potential lowball)
- "Wear many hats" for specialized role (understaffed team)
- Reposted frequently (high turnover or fake listing)
- Entry-level title with senior requirements

Return ONLY the JSON object. No markdown, no code fences, no explanation outside the JSON.`;

    const userPrompt = `CANDIDATE'S CV:
${cvText}

JOB DESCRIPTION:
${jobDescription}

Analyze and return the JSON briefing.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";

    function extractJson(text: string): string {
      const cleaned = text.replace(/```json|```/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return cleaned.slice(firstBrace, lastBrace + 1);
      }
      return cleaned;
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(extractJson(text));
    } catch {
      return NextResponse.json(
        { error: "AI response was not valid JSON", raw: text },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      briefing: parsed,
      jobTitle: parsed.jobTitle || "Untitled Position",
      companyName: parsed.companyName || null,
    });
  } catch (e: any) {
    console.error("Analyze API error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}