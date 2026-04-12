"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1B2021", color: "white" }}>
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#EA638C"/>
              <path d="M8 26V10H11.5L18 20L24.5 10H28V26H24.5V16.5L18 26H18L11.5 16.5V26H8Z" fill="white"/>
            </svg>
            <span className="text-xl font-semibold">Mirax</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-white/50 mb-12">Last updated: April 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">1. Acceptance of Terms</h2>
            <p className="text-white/70 leading-relaxed">
              By accessing or using Mirax ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">2. Description of Service</h2>
            <p className="text-white/70 leading-relaxed">
              Mirax is a job application intelligence platform that provides CV-to-job matching analysis, cover letter generation, salary intelligence, and interview preparation tools. The Service uses artificial intelligence to analyze your CV and job descriptions to provide personalized recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">3. User Accounts</h2>
            <div className="space-y-3 text-white/70 leading-relaxed">
              <p>To use the Service, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">4. Subscription & Payments</h2>
            <div className="space-y-3 text-white/70 leading-relaxed">
              <p><strong className="text-white">Free Tier:</strong> Limited to 3 job analyses per month with restricted access to Pro features.</p>
              <p><strong className="text-white">Pro Subscription:</strong> $12/month or $45 for 6 months. Includes unlimited analyses, full cover letters, salary trajectory, and personalized interview prep.</p>
              <p><strong className="text-white">Billing:</strong> Subscriptions are billed in advance. You can cancel at any time, and your access will continue until the end of your billing period.</p>
              <p><strong className="text-white">Refunds:</strong> We offer refunds within 7 days of purchase if you're not satisfied with the Service.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">5. User Content</h2>
            <div className="space-y-3 text-white/70 leading-relaxed">
              <p>You retain ownership of all content you upload (CVs, job descriptions). By using the Service, you grant us a limited license to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process your content to provide the Service</li>
                <li>Store your content securely on our servers</li>
                <li>Use anonymized, aggregated data to improve our algorithms</li>
              </ul>
              <p>We will never sell your personal content to third parties or use it for purposes other than providing the Service.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">6. Acceptable Use</h2>
            <p className="text-white/70 leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li>Use the Service for any illegal purpose</li>
              <li>Upload malicious content or attempt to compromise security</li>
              <li>Share your account with others or resell access</li>
              <li>Scrape, copy, or reproduce the Service</li>
              <li>Misrepresent the AI-generated content as human-written in contexts where disclosure is required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">7. AI-Generated Content Disclaimer</h2>
            <p className="text-white/70 leading-relaxed">
              The Service uses artificial intelligence to generate cover letters, interview questions, and recommendations. While we strive for accuracy, AI-generated content may contain errors or may not perfectly match your situation. You are responsible for reviewing and editing all generated content before use. Mirax is not responsible for outcomes resulting from the use of AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">8. Intellectual Property</h2>
            <p className="text-white/70 leading-relaxed">
              The Service, including its design, features, and content (excluding user-uploaded content), is owned by Mirax and protected by intellectual property laws. You may not copy, modify, or distribute any part of the Service without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">9. Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed">
              To the maximum extent permitted by law, Mirax shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or employment opportunities, arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">10. Termination</h2>
            <p className="text-white/70 leading-relaxed">
              We may terminate or suspend your account at any time for violations of these Terms. Upon termination, your right to use the Service will immediately cease. You may also delete your account at any time from your profile settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">11. Changes to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">12. Governing Law</h2>
            <p className="text-white/70 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Switzerland, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">13. Contact</h2>
            <p className="text-white/70 leading-relaxed">
              For questions about these Terms, please contact us at:<br />
              <a href="mailto:legal@mirax.app" className="text-[#EA638C] hover:underline">legal@mirax.app</a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link href="/" className="text-[#EA638C] hover:underline">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
}