# CV App — Project Context Prompt

Use this prompt to give Claude full context about this project before asking for improvements or edits.

---

## Project Overview

This is a **Next.js 15 (App Router) web app** called `cv-ch-eu` — an AI-powered CV tailoring tool. Users upload or paste their CV, paste a job description, and the app scores the keyword match and rewrites the CV using OpenAI to better fit the role.

**Tech stack:**
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Auth + DB:** Supabase (email/password + Google OAuth)
- **AI:** OpenAI API (`gpt-5`, Responses API)
- **File parsing:** `pdf-parse` (PDFs), `mammoth` (DOCX)

---

## File Structure

```
app/
  page.tsx                  # Landing page — links to /login and /app
  layout.tsx                # Root layout (Geist font, global CSS)
  globals.css               # Tailwind CSS entry
  supabase.ts               # (legacy location, moved to lib/)

  login/
    page.tsx                # Auth page — email/password sign up + sign in + Google OAuth

  app/
    page.tsx                # Main app UI (protected, requires auth)

  api/
    extract/
      route.ts              # POST /api/extract — parses uploaded PDF/DOCX, returns plain text
    rewrite/
      route.ts              # POST /api/rewrite — calls OpenAI to rewrite CV for a JD

  auth/
    callback/
      route.ts              # GET /auth/callback — redirects to /app after OAuth

lib/
  supabase.ts               # Supabase client (uses NEXT_PUBLIC_SUPABASE_URL + ANON_KEY)
```

---

## Key Files Explained

### `app/app/page.tsx` — Main App (client component)
The core of the product. State includes:
- `targetRole` — the job title the user is targeting (default: "Data Analyst")
- `country` — "CH" (Switzerland) or "EU"
- `language` — "EN" or "FR" (passed to OpenAI prompt)
- `cvText` — the CV text (auto-filled from upload or manually pasted)
- `extraSkills` — optional extra keywords to add to the CV text before scoring
- `jobDescription` — the pasted job description
- `matchScore`, `foundKeywords`, `missingKeywords` — keyword match results
- `generatedCv`, `rewriteFeedback` — AI rewrite output
- `lastResumeId` — Supabase row ID used to update the same row after rewrite

**Main user flow:**
1. Upload PDF/DOCX → `/api/extract` → fills `cvText` textarea
2. Paste job description
3. Click **Save + Score** → runs local keyword extraction + match scoring → saves row to Supabase `resumes` table
4. Click **Rewrite my CV for this JD** → calls `/api/rewrite` → shows AI-rewritten CV + feedback → updates same Supabase row

**Keyword logic (local, no AI):**
- `extractKeywordsFromJD(jd)` — extracts up to 20 keywords from the JD using multi-word phrases, a hardcoded hard-skills list, and single-word fallback with a stop-word filter
- `computeMatchScore(cv, keywords)` — checks which keywords appear in the CV, returns `score`, `found`, `missing`

### `app/api/extract/route.ts` — File Parser
Accepts a `multipart/form-data` POST with a `file` field. Supports `.pdf` (via `pdf-parse`) and `.docx` (via `mammoth`). Returns `{ text: string }`.

### `app/api/rewrite/route.ts` — AI Rewrite
Accepts JSON body: `{ targetRole, country, language, cvText, jobDescription, extraSkills }`.  
Calls OpenAI `gpt-5` (Responses API) with a system instruction to act as a recruiter/ATS expert.  
Returns JSON: `{ rewritten_cv, feedback, top_keywords_to_add }`.

### `app/login/page.tsx` — Auth
Email/password sign up + sign in via Supabase. Google OAuth via `signInWithOAuth` with redirect to `/auth/callback`. Currently has a JSX syntax bug (a `<button>` is rendered outside the `return` block).

### `lib/supabase.ts` — Supabase Client
```ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## Supabase `resumes` Table Schema (inferred from code)

| Column              | Type      | Notes                              |
|---------------------|-----------|------------------------------------|
| id                  | uuid      | Primary key                        |
| user_id             | uuid      | Foreign key to auth.users          |
| target_role         | text      |                                    |
| target_country      | text      | "CH" or "EU"                       |
| language            | text      | "EN" or "FR"                       |
| raw_cv              | text      | CV text + extra skills combined    |
| job_description     | text      |                                    |
| match_score         | int       | 0–100                              |
| found_keywords      | text      | Comma-separated                    |
| missing_keywords    | text      | Comma-separated                    |
| source_file_name    | text      | Original uploaded filename         |
| generated_cv        | text      | AI rewrite output                  |
| rewrite_feedback    | text      | AI feedback / keywords to add      |
| rewrite_status      | text      | "draft" or "done"                  |
| rewrite_created_at  | timestamp |                                    |

---

## Known Issues / Areas for Improvement

1. **`app/login/page.tsx` syntax bug** — the Google OAuth `<button>` is placed outside the `return (...)` block, causing a compile error.
2. **Duplicate `if (!res.ok)` check** in `rewriteWithAI()` in `app/app/page.tsx` (lines ~306 and ~311).
3. **Keyword extraction is hardcoded** — the `extractKeywordsFromJD` function uses a fixed list of hard skills and phrases. Could be improved with a more dynamic approach.
4. **No loading skeleton or error boundary** in the main app.
5. **`app/supabase.ts`** appears to be a stale file; the canonical client is in `lib/supabase.ts`.
6. **`layout.tsx` metadata** still has the default "Create Next App" title/description.

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```
