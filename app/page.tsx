"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Float animation handled via CSS keyframes instead of variants

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-white bg-dark-deep">
      {/* Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-dark-deep/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-6 lg:px-12 xl:px-20 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ rotate: 5, scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
              <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="10" fill="#EA638C"/>
                <path d="M8 26V10H11.5L18 20L24.5 10H28V26H24.5V16.5L18 26H18L11.5 16.5V26H8Z" fill="white"/>
              </svg>
            </motion.div>
            <span className="text-2xl font-bold tracking-tight">Mirax</span>
          </Link>
          
          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#how-it-works" className="text-white/60 hover:text-white transition-colors text-sm font-medium">How it works</a>
            <a href="#interview-prep" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Interview Prep</a>
            <a href="#pricing" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-white/70 hover:text-white transition-colors font-medium">
              Log in
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-xl font-medium bg-pink-accent hover:bg-pink-accent/90 transition-all shadow-lg shadow-pink-accent/25"
              >
                Get started free
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 lg:pt-40">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-deep/30 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-pink-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-pink-deep/20 rounded-full blur-[100px]" />
        
        <div className="w-full px-6 lg:px-12 xl:px-20 py-16 lg:py-55">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-10"
            >
              {/* Floating badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-sm font-medium px-4 py-2 rounded-full text-pink-accent border border-pink-accent/20 animate-float"
                >
                  <span className="w-2 h-2 rounded-full bg-pink-accent animate-pulse" />
                  Built for Switzerland & EU
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="inline-flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm text-sm font-medium px-4 py-2 rounded-full text-emerald-400 border border-emerald-500/20 animate-float-delayed"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  15-second briefings
                </motion.div>
              </div>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight mb-8"
              >
                Apply smarter. <br />
                <span className="text-pink-accent">Land it faster.</span>
              </motion.h1>
              
              <motion.p
                variants={fadeInUp}
                className="text-xl lg:text-2xl text-white/60 leading-relaxed mb-10 max-w-xl"
              >
                Get instant salary intel, gap analysis, personalized interview prep, and tailored cover letters based on your own CV. In seconds.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center text-white text-lg font-semibold px-10 py-5 rounded-2xl bg-pink-deep hover:bg-pink-deep/90 transition-all shadow-xl shadow-pink-deep/30"
                  >
                    Get your first briefing free
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.p variants={fadeIn} className="text-white/40 mt-5 text-sm">
                No credit card required • 3 free analyses per month
              </motion.p>
            </motion.div>

            {/* Preview card - Strategic Value Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative lg:ml-auto"
            >
              {/* Animated gradient glow */}
              <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/0 via-pink-accent/10 to-purple-500/20 rounded-3xl blur-[80px] animate-pulse" />
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-3xl blur-[40px]" />
              
              <div className="relative bg-dark-base border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                {/* Subtle animated border glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-pink-accent/10 to-purple-500/10 animate-pulse" style={{ animationDuration: '3s' }} />
                
                <div className="relative">
                  {/* Header - Strong Match */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <span className="text-3xl">✨</span>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-emerald-400">Strong Match</div>
                      <div className="text-white/50 text-sm">Senior Data Analyst • Zurich</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Your Edge */}
                    <motion.div 
                      className="bg-dark-deep rounded-2xl p-4 border border-white/5 hover:border-emerald-500/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-xs text-emerald-400 uppercase tracking-wider mb-2 font-medium">Your edge</div>
                      <div className="text-white/80 text-sm leading-relaxed">Your SQL and data pipeline work bridges the Python gap, highlight your ETL projects.</div>
                    </motion.div>
                    
                    {/* Salary Intel */}
                    <motion.div 
                      className="bg-dark-deep rounded-2xl p-4 border border-white/5 hover:border-pink-accent/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Salary intel</div>
                      <div className="text-2xl font-bold text-pink-accent">CHF 115,000 – 135,000</div>
                      <div className="text-xs text-emerald-400 mt-1">+12% above market for Zurich</div>
                    </motion.div>
                    
                    {/* Cover Letter Preview - THE WOW */}
                    <motion.div 
                      className="bg-gradient-to-br from-pink-deep/20 to-purple-500/10 rounded-2xl p-4 border border-pink-accent/30 hover:border-pink-accent/50 transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-xs text-pink-accent uppercase tracking-wider mb-2 font-medium flex items-center gap-2">
                        Cover letter ready
                        <span className="text-[10px] bg-pink-accent/20 px-2 py-0.5 rounded-full normal-case">Based on YOUR CV</span>
                      </div>
                      <div className="text-white/70 text-sm italic leading-relaxed">"With 3 years optimizing data pipelines at Acme Corp, I bring the analytical rigor your team needs..."</div>
                    </motion.div>
                    
                    {/* Interview Prep Hint */}
                    <motion.div 
                      className="bg-gradient-to-br from-purple-500/15 to-pink-deep/10 rounded-2xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-xs text-purple-400 uppercase tracking-wider mb-2 font-medium">Interview prep</div>
                      <div className="text-white/70 text-sm">"How have you handled data quality issues in production?"</div>
                      <div className="text-purple-400 text-xs mt-2">→ Use your Acme Corp migration as an example</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust logos marquee */}
      <section className="border-y border-white/5 bg-dark-base/50 py-8 overflow-hidden">
        <div className="flex items-center gap-4 animate-marquee-left">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex items-center gap-12 px-6">
              {["Trusted by job seekers landing roles at", "Nestlé", "UBS", "Novartis", "Google", "CERN", "Roche", "Credit Suisse", "ABB"].map((text, i) => (
                <span key={i} className={`text-sm whitespace-nowrap ${i === 0 ? "text-white/30" : "text-white/50 font-medium"}`}>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-dark-base">
        <div className="w-full px-6 lg:px-12 xl:px-20 py-24 lg:py-85">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold mb-4">
              How it works
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/50 mb-16 max-w-2xl">
              From CV upload to complete briefing in under 30 seconds.
            </motion.p>
            
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                { step: "01", title: "Upload your CV once", description: "We extract your experience, skills, and languages. Update it whenever you need.", icon: "📄" },
                { step: "02", title: "Paste a job posting", description: "Just copy the job description URL or text. We analyze every requirement against your background.", icon: "🔗" },
                { step: "03", title: "Get your briefing", description: "Match verdict, gap analysis, salary intel, cover letter draft, red flags. All in 15 seconds.", icon: "⚡" },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <div className="absolute -inset-px bg-gradient-to-b from-pink-accent/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-dark-deep border border-white/10 rounded-3xl p-8 h-full group-hover:border-pink-accent/30 transition-colors">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl">{item.icon}</span>
                      <span className="text-6xl font-black text-white/[0.05] group-hover:text-pink-accent/20 transition-colors">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-white/50 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-dark-deep border-t border-white/10">
        <div className="w-full px-6 lg:px-12 xl:px-20 py-24 lg:py-75">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="max-w-3xl mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">What you get in each briefing</h2>
              <p className="text-xl text-white/50">Not another ATS score. Real intelligence you can act on.</p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: "🎯", title: "Match Verdict", description: "Apply, apply with caution, or think twice — with clear reasoning", tag: "FREE" },
                { icon: "⚖️", title: "Gap Analysis", description: "Dealbreakers vs nice-to-haves, with nuanced experience matching", tag: "FREE" },
                { icon: "💰", title: "Salary Intelligence", description: "Realistic range for the role, city, and your experience level", tag: "FREE" },
                { icon: "🚩", title: "Red Flag Detector", description: "Ghost jobs, unrealistic requirements, bad employer signals", tag: "FREE" },
                { icon: "✉️", title: "Cover Letter Draft", description: "Ready to send, tailored to the job, in EN/FR/DE/ES", tag: "PRO" },
                { icon: "💬", title: "Interview Prep", description: "Likely questions based on the role and your background", tag: "PRO" },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group bg-dark-base border border-white/10 rounded-2xl p-6 hover:border-pink-accent/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{item.icon}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.tag === "FREE" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-pink-accent/20 text-pink-accent"
                    }`}>
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Letter Preview Section */}
      <section className="bg-dark-base border-t border-white/10">
        <div className="w-full px-6 lg:px-12 xl:px-20 py-24 lg:py-70">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-pink-accent/10 text-pink-accent text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span>✨</span> Pro Feature
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Cover letters that actually get read
              </h2>
              <p className="text-xl text-white/60 leading-relaxed mb-8">
                Generated in <strong className="text-white">English, French, German, or Spanish</strong> — tailored to the exact job requirements and your real experience. No generic templates.
              </p>
              <ul className="space-y-4 text-white/70">
                {[
                  "Matches your CV to the specific job requirements",
                  "Addresses gaps proactively with spin strategies",
                  "Respects Swiss/EU professional norms",
                  "Ready to send — just review and personalize"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-pink-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Cover letter preview cards */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="absolute -inset-8 bg-gradient-to-r from-pink-deep/40 to-pink-accent/20 rounded-3xl blur-[60px]" />
              <div className="relative space-y-4">
                {/* English preview */}
                <div className="bg-dark-deep border border-white/10 rounded-2xl p-6 hover:border-pink-accent/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🇬🇧</span>
                    <span className="font-semibold">English</span>
                    <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">Generated</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed italic">
                    "Dear Hiring Team, With 3 years of Python experience and a proven track record in data pipeline optimization at Acme Corp, I am excited to apply for the Senior Data Analyst position..."
                  </p>
                </div>
                
                {/* French preview */}
                <div className="bg-dark-deep border border-white/10 rounded-2xl p-6 hover:border-pink-accent/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🇫🇷</span>
                    <span className="font-semibold">Français</span>
                    <span className="ml-auto text-xs bg-white/10 text-white/50 px-2 py-1 rounded-full">1-click switch</span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed italic">
                    "Madame, Monsieur, Fort de 3 années d'expérience en Python et d'un parcours réussi dans l'optimisation de pipelines de données chez Acme Corp..."
                  </p>
                </div>
                
                {/* German preview */}
                <div className="bg-dark-deep border border-white/10 rounded-2xl p-6 hover:border-pink-accent/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🇩🇪</span>
                    <span className="font-semibold">Deutsch</span>
                    <span className="ml-auto text-xs bg-white/10 text-white/50 px-2 py-1 rounded-full">1-click switch</span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed italic">
                    "Sehr geehrte Damen und Herren, mit 3 Jahren Python-Erfahrung und einer erfolgreichen Laufbahn in der Optimierung von Datenpipelines bei Acme Corp..."
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interview Prep Section */}
      <section id="interview-prep" className="bg-dark-deep border-t border-white/10">
        <div className="w-full px-6 lg:px-12 xl:px-20 py-24 lg:py-70">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            {/* Interview Questions Preview */}
            <motion.div variants={fadeInUp} className="relative order-2 lg:order-1">
              <div className="absolute -inset-8 bg-gradient-to-r from-purple-600/30 to-pink-accent/20 rounded-3xl blur-[60px]" />
              <div className="relative space-y-4">
                {/* Question cards */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-dark-base border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Technical</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Medium</span>
                  </div>
                  <p className="font-semibold text-white mb-2">"How have you applied Power BI and REST APIs in your previous roles?"</p>
                  <p className="text-sm text-white/50">Why they'll ask: Verifying core competencies</p>
                  <p className="text-sm text-pink-accent mt-2">→ Highlight specific dashboards you developed at IFRC</p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-dark-base border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Behavioral</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Easy</span>
                  </div>
                  <p className="font-semibold text-white mb-2">"Tell me about a challenging stakeholder situation."</p>
                  <p className="text-sm text-white/50">Why they'll ask: Assessing soft skills</p>
                  <p className="text-sm text-pink-accent mt-2">→ Use your cross-regional governance work as an example</p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-dark-base border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Swiss-EU</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Hard</span>
                  </div>
                  <p className="font-semibold text-white mb-2">"How will you leverage your French B2 in our Zurich team?"</p>
                  <p className="text-sm text-white/50">Why they'll ask: Gauging cultural fit</p>
                  <p className="text-sm text-pink-accent mt-2">→ Mention multilingual project coordination experience</p>
                </motion.div>

                {/* Blurred preview */}
                <div className="relative">
                  <div className="bg-dark-base border border-purple-500/20 rounded-2xl p-5 blur-[4px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-purple-400">GAP</span>
                    </div>
                    <p className="font-semibold text-white/50">"What areas would you need..."</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/60 text-sm font-medium bg-dark-base/80 px-4 py-2 rounded-full">+3 more personalized questions</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Text content */}
            <motion.div variants={fadeInUp} className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span>🎤</span> Pro Feature
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Walk into interviews prepared
              </h2>
              <p className="text-xl text-white/60 leading-relaxed mb-8">
                Not generic questions. <strong className="text-white">Personalized to YOUR CV</strong> and the specific job you're applying for. Know exactly what they'll ask — and how to answer.
              </p>
              <ul className="space-y-4 text-white/70 mb-8">
                {[
                  "Questions based on YOUR actual experience and skills",
                  "Identifies gaps between your CV and job requirements",
                  "Explains WHY interviewers ask each question",
                  "Gives you a personalized angle for each answer",
                  "Includes Swiss/EU-specific questions (permits, languages)",
                  "Regenerate for fresh questions anytime"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <span className="text-3xl">💡</span>
                <div>
                  <p className="font-semibold text-white">Your Strategy Included</p>
                  <p className="text-sm text-white/60">Get a personalized interview strategy and key themes to prepare based on the match analysis.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-dark-base border-t border-white/10">
        <div className="w-full px-6 lg:px-12 xl:px-20 py-24 lg:py-50">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-xl text-white/50">Start free. Upgrade when you're applying seriously.</p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Free tier */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-dark-deep border border-white/10 rounded-2xl p-8"
              >
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <div className="text-5xl font-bold mb-2">
                  $0<span className="text-lg text-white/50 font-normal">/forever</span>
                </div>
                <p className="text-white/50 mb-8">Get started with core intelligence</p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    { text: "3 job analyses per month", included: true },
                    { text: "Match verdict & reasoning", included: true },
                    { text: "Salary intelligence (CH/EU)", included: true },
                    { text: "Basic red flag detection", included: true },
                    { text: "Cover letter drafts", included: false },
                    { text: "Interview prep questions", included: false },
                  ].map((item, i) => (
                    <li key={i} className={`flex items-center gap-3 ${item.included ? "text-white/70" : "text-white/30"}`}>
                      {item.included ? (
                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white/20 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      {item.text}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/login"
                  className="block w-full py-4 rounded-xl font-semibold text-center border border-white/20 hover:bg-white/5 transition-colors"
                >
                  Get started free
                </Link>
              </motion.div>

              {/* Pro tier */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="relative bg-dark-deep border-2 border-pink-accent rounded-2xl p-8 shadow-xl shadow-pink-accent/10"
              >
                {/* Glow effect */}
                <div className="absolute -inset-px bg-gradient-to-b from-pink-accent/20 via-transparent to-transparent rounded-2xl pointer-events-none" />
                
                {/* Badges */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <span className="bg-pink-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                
                <div className="relative">
                  <h3 className="text-xl font-semibold mb-2">Pro</h3>
                  <div className="text-5xl font-bold mb-2">
                    $12<span className="text-lg text-white/50 font-normal">/month</span>
                  </div>
                  <p className="text-white/50 mb-8">Everything you need to land the job</p>
                  
                  <ul className="space-y-4 mb-10">
                    {[
                      { text: "Unlimited job analyses", included: true },
                      { text: "Advanced match insights", included: true },
                      { text: "Full salary intelligence", included: true },
                      { text: "Deep red flag analysis", included: true },
                      { text: "Cover letters (EN/FR/DE/ES)", included: true },
                      { text: "Interview prep questions", included: true },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/70">
                        <svg className="w-5 h-5 text-pink-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/login"
                      className="block w-full py-4 rounded-xl font-semibold text-center bg-pink-accent hover:bg-pink-accent/90 transition-all shadow-lg shadow-pink-accent/25"
                    >
                      Start 7-day free trial
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Job Search Plan */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="relative bg-dark-deep border border-white/10 rounded-2xl p-8 md:col-span-2 lg:col-span-1"
              >
                <div className="absolute -top-3 right-4">
                  <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    SAVE 25%
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">Job Search Bundle</h3>
                <div className="text-5xl font-bold mb-2">
                  $45<span className="text-lg text-white/50 font-normal">/6 months</span>
                </div>
                <p className="text-white/50 mb-8">For your entire job search journey</p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    { text: "Everything in Pro", included: true },
                    { text: "Job search & recommendations", included: true },
                    { text: "Application tracking", included: true },
                    { text: "Priority support", included: true },
                    { text: "Early access to new features", included: true },
                    { text: "6 months of full access", included: true },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item.text}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/login"
                  className="block w-full py-4 rounded-xl font-semibold text-center bg-pink-deep hover:bg-pink-deep/90 transition-colors"
                >
                  Get Job Search Bundle
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meet the Maker */}
      <section className="bg-dark-deep border-t border-white/10">
        <div className="w-full px-6 lg:px-12 xl:px-20 py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full mb-8 bg-pink-accent/15 text-pink-accent">
                Meet the maker
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-10">
                I applied to 120+ jobs in Switzerland.<br />
                <span className="text-white/50">So I built what I wished I had.</span>
              </h2>
              <div className="text-xl text-white/60 space-y-6 leading-relaxed">
                <p>Hi, I'm Orlando. As an international moving to Switzerland, I spent months tailoring CVs, writing cover letters in three languages, and constantly wondering: do I even have a chance before clicking apply?</p>
                <p>Most tools just rewrite your CV or spam applications. I wanted something different. A tool that tells you the truth before you invest hours. Should you bother? What's the realistic salary? What gaps should you address?</p>
                <p><strong className="text-white">Mirax is the briefing I wish I had.</strong> I hope it helps you land the <strong className="text-white">role you deserve.</strong> </p>
              </div>
              <div className="flex gap-6 mt-10">
                <a href="https://linkedin.com/in/orlando-pedraza" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-pink-accent transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
                <a href="https://www.youtube.com/channel/UCAUC0EY3bt0mnZgjdaiT1yQ" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-pink-accent transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-deep">
        <div className="w-full px-6 lg:px-12 xl:px-20 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="relative overflow-hidden rounded-3xl p-12 lg:p-20"
            style={{ background: 'linear-gradient(135deg, #89023E, #EA638C)' }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl lg:text-6xl font-bold mb-6">Ready to apply smarter?</h2>
              <p className="text-xl text-white/80 mb-10">Stop wasting time on jobs you won't get. Start with 3 free analyses per month.</p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link href="/login" className="inline-flex items-center justify-center bg-white font-bold text-lg px-10 py-5 rounded-2xl hover:bg-white/90 transition-colors text-pink-deep">
                  Get started free
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-dark-deep">
        <div className="w-full px-6 lg:px-12 xl:px-20 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-6">
                <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="36" rx="10" fill="#EA638C"/>
                  <path d="M8 26V10H11.5L18 20L24.5 10H28V26H24.5V16.5L18 26H18L11.5 16.5V26H8Z" fill="white"/>
                </svg>
                <span className="font-bold text-lg">Mirax</span>
              </Link>
              <p className="text-sm text-white/40 leading-relaxed">Application intelligence for Swiss and EU job seekers.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Get started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><a href="https://linkedin.com/in/orlando-pedraza" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="https://www.youtube.com/channel/UCAUC0EY3bt0mnZgjdaiT1yQ" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">© 2025 Mirax. Made with ❤️ for job seekers.</p>
          </div>
        </div>
      </footer>
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(-8px); }
          50% { transform: translateY(8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-left {
          animation: marquee-left 30s linear infinite;
        }
      `}</style>
    </div>
  );
}