# Mirax — Project Prompt

Use this prompt to continue development on Mirax in future sessions.

---

## Project Overview

**Mirax** is a job application intelligence tool for Swiss and EU job seekers. It provides pre-application briefings including match analysis, salary intelligence, cover letter generation, interview prep, and red flag detection.

**Live URL**: https://mirax-five.vercel.app

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Auth & Database**: Supabase
- **AI**: OpenAI GPT-4o
- **Payments**: Stripe (checkout, webhooks, customer portal)
- **Job Search**: Adzuna API (CH/EU coverage)
- **Hosting**: Vercel (auto-deploys from GitHub)

---

## Design Tokens

```
Colors:
- pink-accent: #EA638C
- pink-deep: #89023E
- dark-base: #30343F
- dark-deep: #1B2021

Font: Inter
Style: Dark theme, premium SaaS aesthetic, pink accents, glow effects
```

---

## Key File Paths

```
Landing Page:        app/page.tsx
Main App:            app/app/page.tsx
Login:               app/login/page.tsx
Privacy Policy:      app/privacy/page.tsx
Terms of Service:    app/terms/page.tsx
Auth Callback:       app/auth/callback/route.ts

API Routes:
- app/api/analyze/route.ts          → Job analysis (GPT-4o)
- app/api/extract-profile/route.ts  → CV parsing
- app/api/interview-prep/route.ts   → Interview questions
- app/api/cover-letter/route.ts     → Cover letter generation
- app/api/jobs/search/route.ts      → Adzuna job search
- app/api/user/status/route.ts      → Subscription status
- app/api/user/usage/route.ts       → Usage tracking
- app/api/stripe/checkout/route.ts  → Stripe checkout session
- app/api/stripe/webhook/route.ts   → Stripe webhook handler
- app/api/stripe/portal/route.ts    → Customer portal

Supabase:
- lib/supabase.ts                   → Client
- supabase/migrations/              → DB schema
```

---

## Database Schema (Supabase)

### user_profiles
- id (uuid, references auth.users)
- email
- full_name
- cv_text
- extracted_profile (jsonb)
- is_pro (boolean)
- stripe_customer_id
- stripe_subscription_id
- subscription_status
- subscription_end
- subscription_plan
- analyses_used (int)
- analyses_reset_date

### job_analyses
- id
- user_id
- job_title
- company
- job_description
- analysis_result (jsonb)
- created_at

---

## Features Built

### Free Tier (3 analyses/month)
- ✅ Match verdict with reasoning
- ✅ Gap analysis (strengths & weaknesses)
- ✅ Salary intelligence (CH/EU ranges)
- ✅ Red flag detection
- ✅ CV upload & profile extraction
- ✅ Job search via Adzuna

### Pro Tier ($12/mo or $45/6mo)
- ✅ Unlimited analyses
- ✅ Full cover letters (EN/FR/DE/ES)
- ✅ Professional & Enthusiastic versions
- ✅ PDF download for cover letters
- ✅ Personalized interview prep questions
- ✅ Salary trajectory chart
- ✅ Deep red flag analysis

### App Features
- ✅ Sidebar navigation (Dashboard, New Analysis, History, Profile)
- ✅ 6-section briefing layout
- ✅ Pro/Free gating with upgrade modals
- ✅ Welcome Pro celebration modal
- ✅ History page with past analyses
- ✅ CV persistence across sessions
- ✅ Google OAuth + Email auth

### Stripe Integration
- ✅ Checkout session creation
- ✅ Webhook handling (4 events)
- ✅ Customer portal for subscription management
- ✅ Pro status synced to Supabase

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
ADZUNA_APP_ID=xxx
ADZUNA_API_KEY=xxx
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_BUNDLE=price_...
NEXT_PUBLIC_APP_URL=https://mirax-five.vercel.app
```

---

## Deployment Workflow

```bash
# Make changes locally
npm run dev

# Test at localhost:3000

# Push to GitHub
git add .
git commit -m "Your message"
git push

# Vercel auto-deploys from main branch
```

---

## Pending / Future Ideas

- [ ] Usage tracking enforcement (decrement analyses_used)
- [ ] Email notifications (welcome, subscription)
- [ ] Application tracking dashboard
- [ ] Mobile app version
- [ ] Chrome extension for job boards

---

## Developer Notes

- Orlando is a non-expert developer — provide step-by-step guidance
- Use terminal `cat` commands for creating API routes (avoids encoding issues)
- Always add `Variants` type to Framer Motion animation objects
- Test Stripe webhooks locally with `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Supabase service role key starts with `eyJ`, NOT `sb_secret_`

---

## Author Context

Built by Orlando after 120+ job applications in Switzerland. The personal job search experience is the authentic marketing story and key differentiator.

---

*Last updated: April 2026*