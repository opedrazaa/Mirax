# Mirax

**Job application intelligence for Switzerland & EU job seekers.**

Get instant salary intel, gap analysis, personalized interview prep, and tailored cover letters — in seconds.

🌐 **Live**: [mirax-five.vercel.app](https://mirax-five.vercel.app)

---

## Features

- 🎯 **Match Verdict** — Apply, apply with caution, or skip
- 💰 **Salary Intelligence** — CH/EU market rates for your experience
- 💪 **Gap Analysis** — What to highlight, what to address
- ✉️ **Cover Letters** — EN/FR/DE/ES, tailored to your CV (Pro)
- 🎤 **Interview Prep** — Personalized questions & strategies (Pro)
- 🚩 **Red Flags** — Ghost jobs, unrealistic requirements

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Auth & DB**: Supabase
- **AI**: OpenAI GPT-4o
- **Payments**: Stripe
- **Job Search**: Adzuna API
- **Hosting**: Vercel

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your keys

# Run dev server
npm run dev
```

Open [localhost:3000](http://localhost:3000)

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ADZUNA_APP_ID=
ADZUNA_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_BUNDLE=
NEXT_PUBLIC_APP_URL=
```

---

## Deploy

Push to `main` → Vercel auto-deploys.

---

## Author

Built by [Orlando](https://linkedin.com/in/orlando-pedraza) after 120+ job applications in Switzerland.

---

© 2025 Mirax