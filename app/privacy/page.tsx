"use client";

import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/50 mb-12">Last updated: April 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">1. Introduction</h2>
            <p className="text-white/70 leading-relaxed">
              Mirax ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job application intelligence platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">2. Information We Collect</h2>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <p><strong className="text-white">Account Information:</strong> Email address, name, and password when you create an account.</p>
              <p><strong className="text-white">CV/Resume Data:</strong> The CV or resume you upload for analysis. This data is processed to provide personalized job matching and interview preparation.</p>
              <p><strong className="text-white">Job Descriptions:</strong> Job postings you submit for analysis.</p>
              <p><strong className="text-white">Usage Data:</strong> Information about how you use our service, including analyses performed and features accessed.</p>
              <p><strong className="text-white">Payment Information:</strong> When you subscribe to Pro, payment is processed securely through Stripe. We do not store your credit card details.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li>To provide and improve our job application intelligence services</li>
              <li>To generate personalized match analyses, cover letters, and interview questions</li>
              <li>To process your subscription and payments</li>
              <li>To send service-related communications</li>
              <li>To analyze usage patterns and improve our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">4. Data Storage & Security</h2>
            <p className="text-white/70 leading-relaxed">
              Your data is stored securely using Supabase (hosted on AWS in the EU). We implement industry-standard security measures including encryption in transit (TLS) and at rest. Your CV data is only used to provide our services and is never sold to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">5. Third-Party Services</h2>
            <div className="space-y-2 text-white/70 leading-relaxed">
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong className="text-white">Supabase:</strong> Authentication and database hosting</li>
                <li><strong className="text-white">OpenAI:</strong> AI-powered analysis (CV data is sent for processing)</li>
                <li><strong className="text-white">Stripe:</strong> Payment processing</li>
                <li><strong className="text-white">Vercel:</strong> Application hosting</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">6. Your Rights (GDPR)</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              If you are in the European Economic Area, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@mirax.app
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">7. Data Retention</h2>
            <p className="text-white/70 leading-relaxed">
              We retain your data for as long as your account is active. You can delete your account and all associated data at any time from your profile settings. Upon deletion, your data will be permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">8. Cookies</h2>
            <p className="text-white/70 leading-relaxed">
              We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">9. Changes to This Policy</h2>
            <p className="text-white/70 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#EA638C]">10. Contact Us</h2>
            <p className="text-white/70 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:<br />
              <a href="mailto:privacy@mirax.app" className="text-[#EA638C] hover:underline">privacy@mirax.app</a>
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