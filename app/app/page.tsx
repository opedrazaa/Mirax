"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence} from "framer-motion";

// Types
type Screen = "dashboard" | "newApplication" | "briefing" | "history" | "analyzing" | "profile";
type Country = "CH" | "DE" | "FR" | "AT" | "NL" | "BE" | "IT" | "ES" | "GB";
type Language = "EN" | "FR" | "DE" | "ES";

interface Profile {
  name: string | null;
  title: string | null;
  yearsOfExperience: string;
  skills: string[];
  languages: string[];
  education: string[];
  certifications: string[];
  industries: string[];
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_text: string;
  url: string;
  created: string;
  contract_type: string | null;
  category: string | null;
}

interface JobWithMatch extends Job {
  matchScore: number;
  matchedSkills: string[];
  missingKeywords: string[];
  matchLevel: "strong" | "good" | "partial" | "weak";
}

interface Briefing {
  verdict: { decision: "APPLY" | "APPLY_WITH_CAUTION" | "THINK_TWICE"; summary: string };
  matchAnalysis: {
    dealbreakers: Array<{ requirement: string; yourSituation: string; assessment: string; suggestion: string }>;
    niceToHaves: string[];
    strongAngles: string[];
  };
  salaryIntelligence: { estimatedRange: string; marketContext: string; negotiationTips: string[]; trajectoryData?: number[]; trajectoryInterpretation?: string };
  coverLetter: string;
  coverLetterAlt?: string; // Second version
  redFlags: Array<{ flag: string; severity: "LOW" | "MEDIUM" | "HIGH"; explanation: string }>;
  interviewQuestions?: Array<{ question: string; why: string; angle: string; category: string; difficulty?: string }>;
}

interface SavedBriefing {
  id: string;
  created_at: string;
  job_description: string;
  job_title: string | null;
  company_name: string | null;
  target_country: string;
  verdict: Briefing["verdict"];
  match_analysis: Briefing["matchAnalysis"];
  salary_intelligence: Briefing["salaryIntelligence"];
  cover_letter: string;
  red_flags: Briefing["redFlags"];
}

// Constants
const ANALYSIS_STEPS = [
  { label: "Reading job description", icon: "📄" },
  { label: "Analyzing requirements", icon: "🔍" },
  { label: "Matching your experience", icon: "⚖️" },
  { label: "Calculating salary range", icon: "💰" },
  { label: "Drafting cover letter", icon: "✉️" },
  { label: "Checking for red flags", icon: "🚩" },
];

const COUNTRIES = [
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
];

const FREE_ANALYSES_LIMIT = 3;

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

// Upgrade Modal Component
function UpgradeModal({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  checkingOut 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onUpgrade: (plan: "pro_monthly" | "pro_bundle") => void;
  checkingOut: boolean;
}) {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-2xl border border-[#EA638C]/30 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1B2021 0%, #30343F 100%)", boxShadow: "0 0 60px rgba(234,99,140,0.15)" }}
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-start" style={{ background: "linear-gradient(135deg, rgba(137,2,62,0.4) 0%, rgba(234,99,140,0.2) 100%)" }}>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg, #EA638C, #89023E)" }}>✨</div>
              <div>
                <h2 className="text-xl font-bold text-white">Upgrade to Pro</h2>
                <p className="text-white/60 text-sm">Unlock unlimited analyses & all features</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center text-xl">×</button>
          </div>
          
          {/* Pricing Cards */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Monthly */}
              <div className="rounded-xl border-2 border-[#EA638C] p-5 relative" style={{ background: "rgba(234,99,140,0.05)" }}>
                <div className="absolute -top-3 left-4">
                  <span className="bg-[#EA638C] text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-2">Pro Monthly</h3>
                <div className="text-3xl font-bold text-white my-3">$12<span className="text-sm text-white/50 font-normal">/month</span></div>
                <ul className="space-y-2 text-sm text-white/70 mb-4">
                  <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Unlimited analyses</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Cover letters (4 languages)</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Interview prep</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Full salary trajectory</li>
                </ul>
                <button
                  onClick={() => onUpgrade("pro_monthly")}
                  disabled={checkingOut}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  style={{ backgroundColor: "#EA638C" }}
                >
                  {checkingOut ? "Redirecting..." : "Subscribe Monthly"}
                </button>
              </div>
              
              {/* Bundle */}
              <div className="rounded-xl border border-emerald-500/30 p-5 relative" style={{ background: "rgba(16,185,129,0.05)" }}>
                <div className="absolute -top-3 right-4">
                  <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">SAVE 38%</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-2">6-Month Bundle</h3>
                <div className="text-3xl font-bold text-white my-3">$45<span className="text-sm text-white/50 font-normal"> one-time</span></div>
                <ul className="space-y-2 text-sm text-white/70 mb-4">
                  <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Everything in Pro</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>6 months of access</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Priority support</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>No auto-renewal</li>
                </ul>
                <button
                  onClick={() => onUpgrade("pro_bundle")}
                  disabled={checkingOut}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 bg-emerald-500"
                >
                  {checkingOut ? "Redirecting..." : "Get 6-Month Bundle"}
                </button>
              </div>
            </div>
            
            <p className="text-center text-white/40 text-xs">
              🔒 Secure payment via Stripe • Cancel anytime • 7-day money-back guarantee
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Pro Badge Component
function ProBadge({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 rounded-full text-xs font-semibold bg-[#EA638C]/20 text-[#EA638C] border border-[#EA638C]/30 hover:bg-[#EA638C]/30 transition-colors"
    >
      PRO
    </button>
  );
}

// Free Badge Component
function FreeBadge() {
  return (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
      FREE
    </span>
  );
}

// Welcome Pro Modal (Celebration after payment!)
function WelcomeProModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1B2021 0%, #30343F 100%)", boxShadow: "0 0 100px rgba(234,99,140,0.3)" }}
        >
          {/* Confetti/sparkle effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -20, x: Math.random() * 400 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: [0, 300],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
                className="absolute text-2xl"
                style={{ left: `${Math.random() * 100}%` }}
              >
                {["✨", "🎉", "⭐", "💫", "🌟"][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
          
          {/* Header with gradient */}
          <div className="relative p-8 text-center" style={{ background: "linear-gradient(135deg, rgba(234,99,140,0.3) 0%, rgba(137,2,62,0.3) 100%)" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4"
              style={{ background: "linear-gradient(135deg, #EA638C, #89023E)", boxShadow: "0 8px 30px rgba(234,99,140,0.4)" }}
            >
              🚀
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Welcome to Pro!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60"
            >
              You've unlocked the full power of Mirax
            </motion.p>
          </div>
          
          {/* Unlocked features */}
          <div className="p-8 space-y-4">
            <p className="text-sm text-white/50 uppercase tracking-wider font-medium mb-4">What you've unlocked</p>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-[#EA638C]/10 border border-[#EA638C]/30"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EA638C]/20 flex items-center justify-center text-2xl">✉️</div>
              <div>
                <h4 className="font-semibold text-white">Cover Letters</h4>
                <p className="text-sm text-white/50">In English, French, German & Spanish</p>
              </div>
              <span className="ml-auto text-emerald-400 text-xl">✓</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">💰</div>
              <div>
                <h4 className="font-semibold text-white">Salary Trajectory</h4>
                <p className="text-sm text-white/50">2-year growth forecast with market data</p>
              </div>
              <span className="ml-auto text-emerald-400 text-xl">✓</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">🎤</div>
              <div>
                <h4 className="font-semibold text-white">Interview Prep</h4>
                <p className="text-sm text-white/50">Personalized questions based on your CV & the job</p>
              </div>
              <span className="ml-auto text-emerald-400 text-xl">✓</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">∞</div>
              <div>
                <h4 className="font-semibold text-white">Unlimited Analyses</h4>
                <p className="text-sm text-white/50">No more monthly limits</p>
              </div>
              <span className="ml-auto text-emerald-400 text-xl">✓</span>
            </motion.div>
          </div>
          
          {/* CTA */}
          <div className="p-8 pt-0">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onClick={onClose}
              className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #EA638C, #89023E)", boxShadow: "0 4px 20px rgba(234,99,140,0.4)" }}
            >
              Start Analyzing Jobs →
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Active Pro Member Badge (shown in sidebar when user is Pro)
function ProMemberBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#EA638C]/20 to-[#89023E]/20 border border-[#EA638C]/30">
      <span className="text-lg">👑</span>
      <span className="text-sm font-semibold text-[#EA638C]">Pro Member</span>
    </div>
  );
}

// Navigation Item
function NavItem({ icon, label, active, onClick, badge }: { icon: string; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
        active ? "bg-[#EA638C]/20 text-[#EA638C]" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-white/10">{badge}</span>
      )}
    </button>
  );
}

// Usage Counter Component
function UsageCounter({ used, limit, isPro }: { used: number; limit: number; isPro: boolean }) {
  if (isPro) {
    return (
      <div className="bg-gradient-to-r from-[#EA638C]/20 to-[#89023E]/20 rounded-xl p-4 border border-[#EA638C]/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">✨</span>
          <span className="text-sm font-medium text-[#EA638C]">Pro Member</span>
        </div>
        <p className="text-white/50 text-xs">Unlimited analyses</p>
      </div>
    );
  }
  
  const remaining = limit - used;
  const percentage = (used / limit) * 100;
  
  return (
    <div className="bg-[#30343F] rounded-xl p-4 border border-white/10">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-white/60">Free analyses</span>
        <span className="text-sm font-medium">{remaining} left</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: remaining === 0 ? "#ef4444" : "#EA638C" }}
        />
      </div>
      {remaining === 0 && (
        <p className="text-xs text-[#EA638C] mt-2">Upgrade for unlimited →</p>
      )}
    </div>
  );
}

// Salary Line Chart Component
function SalaryLineChart({ 
  data, 
  isPro, 
  onUnlock,
  salaryRange,
  interpretation 
}: { 
  data: number[]; 
  isPro: boolean; 
  onUnlock: () => void;
  salaryRange?: string;
  interpretation?: string;
}) {
  const points = data || [85000, 92000, 100000, 108000, 118000];
  const min = Math.min(...points) * 0.85;
  const max = Math.max(...points) * 1.1;
  const range = max - min;
  
  // Wider chart for better visibility
  const width = 500;
  const height = 140;
  const paddingX = 50;
  const paddingY = 20;
  
  const getY = (val: number) => height - paddingY - ((val - min) / range) * (height - paddingY * 2);
  const getX = (i: number) => paddingX + (i / (points.length - 1)) * (width - paddingX * 2);
  
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p)}`).join(' ');
  const areaPath = `${pathData} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;
  
  const growthPercent = Math.round(((points[points.length - 1] - points[0]) / points[0]) * 100);
  const startSalary = Math.round(points[0] / 1000);
  const endSalary = Math.round(points[points.length - 1] / 1000);
  
  // Generate dynamic interpretation if not provided
  const dynamicInterpretation = interpretation || `Starting at CHF ${startSalary}k, you could reach CHF ${endSalary}k within 2 years. This ${growthPercent}% growth assumes consistent performance, skill development in high-demand areas, and potential role advancement. Senior specialists in the Swiss market typically see 8-12% annual increases when moving into leadership or specialized technical tracks.`;
  
  return (
    <div className="relative mt-4 rounded-xl overflow-hidden border border-[#EA638C]/30" style={{ background: "linear-gradient(135deg, rgba(234,99,140,0.1), rgba(137,2,62,0.1))" }}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">📈</span>
            <p className="text-base font-semibold text-[#EA638C]">2-Year Salary Trajectory</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-emerald-400">+{growthPercent}%</span>
            <p className="text-xs text-white/50">projected growth</p>
          </div>
        </div>
        
        {/* SVG Line Chart - Now wider */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36" preserveAspectRatio="xMidYMid meet">
          {/* Gradient fill */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EA638C" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#EA638C" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EA638C" />
              <stop offset="100%" stopColor="#89023E" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct, i) => (
            <line key={i} x1={paddingX} y1={paddingY + pct * (height - paddingY * 2)} x2={width - paddingX} y2={paddingY + pct * (height - paddingY * 2)} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          ))}
          
          {/* Y-axis labels */}
          <text x={paddingX - 8} y={getY(points[points.length - 1]) + 4} fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="end">{endSalary}k</text>
          <text x={paddingX - 8} y={getY(points[0]) + 4} fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="end">{startSalary}k</text>
          
          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          
          {/* Line with glow effect */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* Data points with labels */}
          {points.map((p, i) => (
            <g key={i}>
              <motion.circle
                cx={getX(i)}
                cy={getY(p)}
                r="6"
                fill="#1B2021"
                stroke="#EA638C"
                strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
              />
            </g>
          ))}
        </svg>
        
        <div className="flex justify-between mt-3 text-xs text-white/50 px-8">
          <span>Now</span>
          <span>6 mo</span>
          <span>1 yr</span>
          <span>18 mo</span>
          <span>2 yr</span>
        </div>
        
        {/* Interpretation section - only for Pro users */}
        {isPro && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">💡</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">Market Insight</p>
                <p className="text-sm text-white/70 leading-relaxed">{dynamicInterpretation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Lock overlay */}
      {!isPro && (
        <div className="absolute inset-0 bg-[#1B2021]/70 backdrop-blur-[3px] flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-xl bg-[#EA638C]/20 flex items-center justify-center mb-3">
            <span className="text-3xl">🔓</span>
          </div>
          <p className="text-white/80 text-base font-medium mb-2">See your growth potential</p>
          <p className="text-white/50 text-sm mb-4">Unlock trajectory + market insights</p>
          <button onClick={onUnlock} className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105" style={{ backgroundColor: "#EA638C", boxShadow: "0 4px 20px rgba(234,99,140,0.3)" }}>
            Unlock trajectory
          </button>
        </div>
      )}
    </div>
  );
}

// Transform cover letter to enthusiastic version
function transformToEnthusiastic(letter: string): string {
  // This function creates a genuinely different enthusiastic version
  const transformations: [RegExp | string, string][] = [
    // Opening transformations
    [/I am writing to express my interest in/gi, "I am thrilled to apply for"],
    [/I am writing to apply for/gi, "I couldn't be more excited to apply for"],
    [/I would like to apply/gi, "I am eager to bring my skills to"],
    [/I am interested in/gi, "I am genuinely excited about"],
    
    // Confidence boosters
    [/I believe I would be/gi, "I am confident I would be"],
    [/I think I could/gi, "I know I can"],
    [/I feel I am/gi, "I am"],
    [/I hope to/gi, "I am eager to"],
    
    // Enthusiasm markers
    [/I would welcome the opportunity/gi, "I would absolutely love the opportunity"],
    [/I am keen to/gi, "I am passionate about"],
    [/I look forward to/gi, "I am excited about the possibility of"],
    [/opportunity to discuss/gi, "chance to share my enthusiasm and discuss"],
    
    // Strong closings
    [/Thank you for considering/gi, "Thank you so much for considering"],
    [/I appreciate your time/gi, "I truly appreciate your time"],
    [/please feel free to contact/gi, "please don't hesitate to reach out – I'd love to connect"],
    
    // Skill descriptions
    [/I have experience in/gi, "I have developed strong expertise in"],
    [/I worked on/gi, "I had the exciting opportunity to work on"],
    [/I was responsible for/gi, "I took ownership of"],
    [/I contributed to/gi, "I played a key role in"],
    
    // Impact statements
    [/which resulted in/gi, "which led to impressive results including"],
    [/successfully/gi, "successfully and proudly"],
    [/achieved/gi, "exceeded expectations by achieving"],
    
    // Company enthusiasm
    [/your company/gi, "your innovative company"],
    [/your team/gi, "your talented team"],
    [/your organization/gi, "your forward-thinking organization"],
    [/the position/gi, "this exciting position"],
    [/the role/gi, "this fantastic role"],
  ];
  
  let result = letter;
  
  for (const [pattern, replacement] of transformations) {
    result = result.replace(pattern, replacement);
  }
  
  // Add exclamation points to key sentences (not every one)
  const sentences = result.split('. ');
  const enthusiasticIndices = [0, Math.floor(sentences.length / 2), sentences.length - 2];
  
  result = sentences.map((sentence, i) => {
    if (enthusiasticIndices.includes(i) && !sentence.endsWith('!') && !sentence.endsWith('?')) {
      return sentence.replace(/\.$/, '!');
    }
    return sentence;
  }).join('. ');
  
  return result;
}

// Download Cover Letter Function - Now generates PDF!
function downloadCoverLetter(content: string, filename: string, format: 'pdf' | 'txt' = 'pdf') {
  if (format === 'pdf') {
    // Generate PDF using HTML-to-PDF approach
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 50px 60px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #EA638C;
    }
    
    .date {
      color: #666;
      font-size: 10pt;
      margin-bottom: 25px;
    }
    
    .greeting {
      font-weight: 600;
      margin-bottom: 20px;
    }
    
    .paragraph {
      margin-bottom: 16px;
      text-align: justify;
    }
    
    .signature {
      margin-top: 30px;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 9pt;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="date">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>
  ${content.split('\n').map(line => {
    if (line.startsWith('Dear')) return `<p class="greeting">${line}</p>`;
    if (line.startsWith('Sincerely') || line.startsWith('Best regards') || line.startsWith('Kind regards')) return `<p class="signature">${line}</p>`;
    if (line.trim() === '') return '';
    return `<p class="paragraph">${line}</p>`;
  }).join('')}
  <div class="footer">Generated with Mirax • mirax.app</div>
</body>
</html>`;

    // Create blob and trigger print dialog (PDF save)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
    return;
  }
  
  // Plain text fallback
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Main Component
export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [cvText, setCvText] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [extractingProfile, setExtractingProfile] = useState(false);
  const [country, setCountry] = useState<Country>("CH");
  const [language, setLanguage] = useState<Language>("EN");
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCountry, setSearchCountry] = useState<Country>("CH");
  const [searching, setSearching] = useState(false);
  const [jobs, setJobs] = useState<JobWithMatch[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [error, setError] = useState("");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [history, setHistory] = useState<SavedBriefing[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SavedBriefing | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [analysesUsed, setAnalysesUsed] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingInterviewPrep, setLoadingInterviewPrep] = useState(false);
  const [interviewPrepStrategy, setInterviewPrepStrategy] = useState<string>("");
  const [interviewPrepThemes, setInterviewPrepThemes] = useState<string[]>([]);
  const [currentJobDescription, setCurrentJobDescription] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeCoverLetter, setActiveCoverLetter] = useState<1 | 2>(1);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showWelcomeProModal, setShowWelcomeProModal] = useState(false);

  // Stripe checkout function
  async function handleUpgrade(plan: "pro_monthly" | "pro_bundle" = "pro_monthly") {
    if (!user) return;
    
    setCheckingOut(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          plan,
        }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
        setCheckingOut(false);
      }
    } catch (error: any) {
      setError(error.message || "Checkout failed");
      setCheckingOut(false);
    }
  }

  // Auth & Load saved profile + Pro status
  useEffect(() => {
    async function initAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        router.push("/login");
        return;
      }
      setUser(data.session.user);
      
      // Load saved CV and Pro status from user_profiles
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", data.session.user.id)
        .single();
      
      if (profileData) {
        setCvText(profileData.cv_text || "");
        setProfile(profileData.profile_data || null);
        setFileName(profileData.cv_filename || "");
        setCountry(profileData.target_country || "CH");
        setLanguage(profileData.cover_letter_language || "EN");
        
        // Load Pro status!
        setIsPro(profileData.is_pro || false);
        
        // Check subscription hasn't expired
        if (profileData.subscription_end) {
          const endDate = new Date(profileData.subscription_end);
          if (endDate < new Date()) {
            setIsPro(false);
          }
        }
      }
      
      // Check for successful checkout return
      const params = new URLSearchParams(window.location.search);
      if (params.get("checkout") === "success") {
        // Re-fetch to get updated Pro status
        setTimeout(async () => {
          const { data: updatedProfile } = await supabase
            .from("user_profiles")
            .select("is_pro")
            .eq("user_id", data.session.user.id)
            .single();
          
          if (updatedProfile?.is_pro) {
            setIsPro(true);
            setShowWelcomeProModal(true);
          }
        }, 1500); // Give webhook time to process
        
        // Clean URL
        window.history.replaceState({}, "", "/app");
      }
      
      setLoadingProfile(false);
    }
    
    initAuth();
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.push("/login");
      else setUser(session.user);
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  // Analysis steps animation
  useEffect(() => {
    if (screen === "analyzing") {
      const interval = setInterval(() => {
        setAnalysisStep((prev) => (prev >= ANALYSIS_STEPS.length - 1 ? prev : prev + 1));
      }, 1200);
      return () => clearInterval(interval);
    } else {
      setAnalysisStep(0);
    }
  }, [screen]);

  // Load history on mount
  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  // Save profile to Supabase when it changes
  async function saveProfileToDb(newProfile: Profile, newCvText: string, newFileName: string) {
    if (!user) return;
    
    const { error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        cv_text: newCvText,
        cv_filename: newFileName,
        profile_data: newProfile,
        target_country: country,
        cover_letter_language: language,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    
    if (error) console.error("Failed to save profile:", error);
  }

  // Helpers
  function calculateMatch(job: Job): JobWithMatch {
    if (!profile || profile.skills.length === 0) {
      return { ...job, matchScore: 0, matchedSkills: [], missingKeywords: [], matchLevel: "weak" };
    }
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const matchedSkills: string[] = [];
    profile.skills.forEach((skill) => {
      if (jobText.includes(skill.toLowerCase())) matchedSkills.push(skill);
    });
    const commonKeywords = ["machine learning", "aws", "azure", "docker", "kubernetes", "agile", "phd"];
    const missingKeywords = commonKeywords.filter((kw) => jobText.includes(kw) && !profile.skills.some((s) => s.toLowerCase().includes(kw))).slice(0, 3);
    const matchScore = Math.round((matchedSkills.length / profile.skills.length) * 100);
    let matchLevel: "strong" | "good" | "partial" | "weak" = "weak";
    if (matchScore >= 60) matchLevel = "strong";
    else if (matchScore >= 40) matchLevel = "good";
    else if (matchScore >= 20) matchLevel = "partial";
    return { ...job, matchScore, matchedSkills: [...new Set(matchedSkills)], missingKeywords, matchLevel };
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function getFirstName() {
    // Priority: profile name from CV
    if (profile?.name) {
      return profile.name.split(" ")[0];
    }
    // Fallback: try to get display name from user metadata
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0];
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(" ")[0];
    }
    // Final fallback
    return "there";
  }

  // API calls
  async function searchJobs() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setJobs([]);
    setError("");
    try {
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, country: searchCountry }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Search failed");
      } else {
        const jobsWithMatch = (data.jobs || []).map((job: Job) => calculateMatch(job));
        jobsWithMatch.sort((a: JobWithMatch, b: JobWithMatch) => b.matchScore - a.matchScore);
        setJobs(jobsWithMatch);
      }
    } catch (e: any) {
      setError(e.message || "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function extractProfile(text: string) {
    setExtractingProfile(true);
    try {
      const res = await fetch("/api/extract-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile && (data.profile.skills?.length > 0 || data.profile.name)) {
          setProfile(data.profile);
          // Save to database
          await saveProfileToDb(data.profile, text, fileName);
        }
      }
    } catch (e) {
      console.error("Profile extraction failed:", e);
    } finally {
      setExtractingProfile(false);
    }
  }

  async function loadHistory() {
    if (!user) return;
    setLoadingHistory(true);
    const { data } = await supabase.from("briefings").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setHistory(data);
    setLoadingHistory(false);
  }

  async function deleteBriefing(id: string) {
    setDeletingId(id);
    await supabase.from("briefings").delete().eq("id", id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
    setDeletingId(null);
  }

  async function generateInterviewPrep(jobDesc: string) {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    
    setLoadingInterviewPrep(true);
    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          jobDescription: jobDesc,
          targetCountry: country,
          profile,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.interviewPrep) {
        setBriefing((prev) => prev ? {
          ...prev,
          interviewQuestions: data.interviewPrep.questions.map((q: any) => ({
            question: q.question,
            why: q.why,
            angle: q.angle,
            category: q.category,
            difficulty: q.difficulty,
          })),
        } : null);
        setInterviewPrepStrategy(data.interviewPrep.overallStrategy || "");
        setInterviewPrepThemes(data.interviewPrep.keyThemesToPrepare || []);
      }
    } catch (error) {
      console.error("Interview prep generation failed:", error);
    } finally {
      setLoadingInterviewPrep(false);
    }
  }

  async function handleCvFile(file: File) {
    setUploading(true);
    setProfile(null);
    const newFileName = file.name;
    setFileName(newFileName);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(`Could not read file: ${json?.error || "unknown"}`);
      } else {
        const extracted = (json?.text || "").trim();
        if (extracted.length < 80) {
          setError("Could not extract enough text.");
        } else {
          setCvText(extracted);
          await extractProfile(extracted);
        }
      }
    } catch (e: any) {
      setError(`Upload failed: ${e?.message || "unknown"}`);
    } finally {
      setUploading(false);
    }
  }

  async function analyzeApplication(jobDesc?: string, jobTitle?: string, company?: string) {
    if (!isPro && analysesUsed >= FREE_ANALYSES_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }
    
    const desc = jobDesc || jobDescription;
    setCurrentJobDescription(desc);
    setError("");
    setScreen("analyzing");
    setAnalysisStep(0);
    setInterviewPrepStrategy("");
    setInterviewPrepThemes([]);
    setActiveCoverLetter(1);
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobDescription: desc, targetCountry: country, language }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong");
        setScreen("newApplication");
      } else if (data.briefing) {
        // Generate personalized interview questions based on actual CV and job
        const skillsList = profile?.skills?.slice(0, 5).join(", ") || "your technical skills";
        const title = profile?.title || "your current role";
        const experience = profile?.yearsOfExperience || "your experience";
        
        data.briefing.interviewQuestions = [
          { 
            question: `Walk me through how you've used ${profile?.skills?.[0] || "your main skill"} in a recent project.`, 
            why: "They want to verify hands-on experience with core requirements", 
            angle: `Reference your work as ${title} and give specific metrics`, 
            category: "Technical",
            difficulty: "Medium"
          },
          { 
            question: `You mention ${experience} - what's the most complex problem you've solved?`, 
            why: "Testing problem-solving depth and seniority level", 
            angle: "Pick a challenge that matches this role's complexity level", 
            category: "Behavioral",
            difficulty: "Medium"
          },
          { 
            question: `How do you stay current with ${profile?.skills?.[1] || "industry trends"}?`, 
            why: "Assessing growth mindset and continuous learning", 
            angle: "Mention specific courses, communities, or side projects", 
            category: "Technical",
            difficulty: "Easy"
          },
          { 
            question: "Looking at the requirements, what would you need to learn in the first 90 days?", 
            why: "They're probing self-awareness about gaps", 
            angle: "Be honest about gaps but show you have a learning plan", 
            category: "Gap",
            difficulty: "Hard"
          },
          { 
            question: `With ${profile?.languages?.join(", ") || "your language skills"}, how comfortable are you working in a multilingual team?`, 
            why: "Swiss/EU roles often require language flexibility", 
            angle: "Give examples of cross-cultural collaboration", 
            category: "Swiss-EU",
            difficulty: "Easy"
          },
          { 
            question: "Describe a time when you had to influence stakeholders without direct authority.", 
            why: "Testing soft skills and leadership potential", 
            angle: "Use STAR format with measurable outcomes", 
            category: "Behavioral",
            difficulty: "Medium"
          },
        ];
        
        // Add second cover letter version (truly enthusiastic tone!)
        data.briefing.coverLetterAlt = transformToEnthusiastic(data.briefing.coverLetter);
        
        // Add salary trajectory data and interpretation
        const baseMin = parseInt(data.briefing.salaryIntelligence.estimatedRange.replace(/[^0-9]/g, '').slice(0, -3)) * 1000 || 85000;
        const growthRate = 1.08; // 8% annual growth
        data.briefing.salaryIntelligence.trajectoryData = [
          baseMin,
          Math.round(baseMin * Math.pow(growthRate, 0.5)),
          Math.round(baseMin * growthRate),
          Math.round(baseMin * Math.pow(growthRate, 1.5)),
          Math.round(baseMin * Math.pow(growthRate, 2))
        ];
        data.briefing.salaryIntelligence.trajectoryInterpretation = 
          `Based on Swiss market data for this role level, you can expect 6-10% annual growth through skill advancement and role progression. Top performers in ${data.companyName || 'similar companies'} often see accelerated growth through leadership responsibilities or specialized expertise.`;
        
        setBriefing(data.briefing);
        setCurrentJobTitle(jobTitle || data.jobTitle || "Untitled Position");
        setCurrentCompany(company || data.companyName || "");
        setScreen("briefing");
        setAnalysesUsed((prev) => prev + 1);
        
        if (isPro) {
          generateInterviewPrep(desc);
        }
        
        await supabase.from("briefings").insert({
          user_id: user.id,
          cv_text: cvText,
          job_description: desc,
          job_title: jobTitle || data.jobTitle || null,
          company_name: company || data.companyName || null,
          target_country: country,
          output_language: language,
          verdict: data.briefing.verdict,
          match_analysis: data.briefing.matchAnalysis,
          salary_intelligence: data.briefing.salaryIntelligence,
          cover_letter: data.briefing.coverLetter,
          red_flags: data.briefing.redFlags,
        });
      }
    } catch (e: any) {
      setError(e?.message || "Network error");
      setScreen("newApplication");
    }
  }

  function startNewApplication() {
    setJobDescription("");
    setBriefing(null);
    setError("");
    setSelectedHistoryItem(null);
    setCurrentJobTitle("");
    setCurrentCompany("");
    setCurrentJobDescription("");
    setInterviewPrepStrategy("");
    setInterviewPrepThemes([]);
    setJobs([]);
    setExpandedJobId(null);
    setActiveCoverLetter(1);
    setScreen("newApplication");
  }

  function viewHistoryItem(item: SavedBriefing) {
    setSelectedHistoryItem(item);
    setCurrentJobTitle(item.job_title || "Untitled Position");
    setCurrentCompany(item.company_name || "");
    setCurrentJobDescription(item.job_description || "");
    setInterviewPrepStrategy("");
    setInterviewPrepThemes([]);
    setActiveCoverLetter(1);
    
    const skillsList = profile?.skills?.slice(0, 3).join(", ") || "your skills";
    
    // Calculate salary trajectory from saved data
    const baseMin = parseInt(item.salary_intelligence?.estimatedRange?.replace(/[^0-9]/g, '').slice(0, -3)) * 1000 || 85000;
    const growthRate = 1.08;
    
    setBriefing({
      verdict: item.verdict,
      matchAnalysis: item.match_analysis,
      salaryIntelligence: { 
        ...item.salary_intelligence, 
        trajectoryData: [
          baseMin,
          Math.round(baseMin * Math.pow(growthRate, 0.5)),
          Math.round(baseMin * growthRate),
          Math.round(baseMin * Math.pow(growthRate, 1.5)),
          Math.round(baseMin * Math.pow(growthRate, 2))
        ],
        trajectoryInterpretation: `Based on Swiss market data for this role level, you can expect 6-10% annual growth through skill advancement and role progression.`
      },
      coverLetter: item.cover_letter,
      coverLetterAlt: transformToEnthusiastic(item.cover_letter),
      redFlags: item.red_flags,
      interviewQuestions: [
        { question: `How have you applied ${skillsList} in your previous roles?`, why: "Verifying core competencies", angle: "Use specific examples with results", category: "Technical", difficulty: "Medium" },
        { question: "Tell me about a challenging project and how you handled it.", why: "Assessing problem-solving abilities", angle: "Pick a relevant challenge that shows growth", category: "Behavioral", difficulty: "Medium" },
        { question: "What areas would you need to develop for this role?", why: "Testing self-awareness", angle: "Show you've thought about the learning curve", category: "Gap", difficulty: "Hard" },
        { question: "How do you see yourself contributing in the first 6 months?", why: "Understanding expectations alignment", angle: "Be realistic but show ambition", category: "Behavioral", difficulty: "Easy" },
        { question: "What draws you to working in Switzerland/this region?", why: "Gauging long-term commitment", angle: "Show genuine interest in the market", category: "Swiss-EU", difficulty: "Easy" },
        { question: "Describe your experience working with cross-functional teams.", why: "Evaluating collaboration skills", angle: "Reference specific team structures you've worked in", category: "Behavioral", difficulty: "Medium" },
      ],
    });
    setScreen("briefing");
  }

  const stats = {
    total: history.length,
    apply: history.filter((h) => h.verdict.decision === "APPLY").length,
    caution: history.filter((h) => h.verdict.decision === "APPLY_WITH_CAUTION").length,
    avoid: history.filter((h) => h.verdict.decision === "THINK_TWICE").length,
  };

  const cvReady = cvText.length >= 50 && profile !== null;

  if (!user || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1B2021" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#EA638C] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex" style={{ backgroundColor: "#1B2021" }}>
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 border-r border-white/10 flex flex-col transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`} style={{ backgroundColor: "#1B2021" }}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#EA638C" />
              <path d="M8 26V10H11.5L18 20L24.5 10H28V26H24.5V16.5L18 26H18L11.5 16.5V26H8Z" fill="white" />
            </svg>
            <span className="text-xl font-bold">Mirax</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon="🏠" label="Dashboard" active={screen === "dashboard"} onClick={() => setScreen("dashboard")} />
          <NavItem icon="✨" label="New Analysis" active={screen === "newApplication"} onClick={startNewApplication} />
          <NavItem icon="📋" label="History" active={screen === "history"} onClick={() => { loadHistory(); setScreen("history"); }} badge={history.length} />
          <NavItem icon="👤" label="My Profile" active={screen === "profile"} onClick={() => setScreen("profile")} />
        </nav>
        
        {/* Pro Status Section */}
        <div className="p-4 border-t border-white/10">
          {isPro ? (
            <div className="rounded-xl p-4 border border-[#EA638C]/30" style={{ background: "linear-gradient(135deg, rgba(234,99,140,0.15) 0%, rgba(137,2,62,0.15) 100%)" }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">👑</span>
                <span className="font-bold text-white">Pro Member</span>
              </div>
              <p className="text-xs text-white/50 mb-3">Unlimited analyses • All features unlocked</p>
              <button
                onClick={async () => {
                  const res = await fetch("/api/stripe/portal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.id }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="text-xs text-[#EA638C] hover:text-[#EA638C]/80 transition-colors"
              >
                Manage subscription →
              </button>
            </div>
          ) : (
            <div>
              <UsageCounter used={analysesUsed} limit={FREE_ANALYSES_LIMIT} isPro={isPro} />
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-3 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #EA638C, #89023E)", boxShadow: "0 4px 15px rgba(234,99,140,0.3)" }}
              >
                ✨ Upgrade to Pro
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EA638C]/20 flex items-center justify-center text-[#EA638C] font-medium">
              {getFirstName()[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getFirstName()}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
            className="w-full mt-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
      
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#30343F] rounded-lg flex items-center justify-center border border-white/10"
      >
        ☰
      </button>
      
      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="w-full px-6 lg:px-12 py-8">
          
          {/* DASHBOARD */}
          {screen === "dashboard" && (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
              <motion.div variants={fadeIn}>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  {getGreeting()}, {getFirstName()}
                </h1>
                <p className="text-lg text-white/50">Here's your job search overview</p>
              </motion.div>
              
              <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl p-5 border border-white/10" style={{ backgroundColor: "#30343F" }}>
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <div className="text-sm text-white/50">Jobs analyzed</div>
                </div>
                <div className="rounded-xl p-5 bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-3xl font-bold text-emerald-400">{stats.apply}</div>
                  <div className="text-sm text-emerald-400/70">Strong matches</div>
                </div>
                <div className="rounded-xl p-5 bg-amber-500/10 border border-amber-500/20">
                  <div className="text-3xl font-bold text-amber-400">{stats.caution}</div>
                  <div className="text-sm text-amber-400/70">Worth considering</div>
                </div>
                <div className="rounded-xl p-5 bg-red-500/10 border border-red-500/20">
                  <div className="text-3xl font-bold text-red-400">{stats.avoid}</div>
                  <div className="text-sm text-red-400/70">Skip these</div>
                </div>
              </motion.div>
              
              <motion.div variants={fadeIn} className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: "#30343F" }}>
                  <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
                  {profile ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-400">
                        <span className="text-xl">✓</span>
                        <span className="font-medium">CV ready</span>
                      </div>
                      {profile.name && <p className="text-white/70">{profile.name}</p>}
                      {profile.title && <p className="text-white/50 text-sm">{profile.title}</p>}
                      {profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.slice(0, 5).map((skill, i) => (
                            <span key={i} className="px-2 py-1 rounded text-xs bg-[#EA638C]/20 text-[#EA638C]">{skill}</span>
                          ))}
                          {profile.skills.length > 5 && (
                            <span className="px-2 py-1 rounded text-xs bg-white/10 text-white/50">+{profile.skills.length - 5}</span>
                          )}
                        </div>
                      )}
                      <button onClick={() => setScreen("profile")} className="text-sm text-[#EA638C] hover:underline">Edit profile →</button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-3">📄</div>
                      <p className="text-white/50 mb-4">Upload your CV to get started</p>
                      <button onClick={() => setScreen("profile")} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#EA638C" }}>
                        Upload CV
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="rounded-2xl border border-[#EA638C]/30 p-6 relative overflow-hidden" style={{ backgroundColor: "#30343F" }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#EA638C]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <h3 className="text-lg font-semibold mb-2">Ready to apply smarter?</h3>
                    <p className="text-white/50 text-sm mb-6">Paste a job description or search for opportunities</p>
                    <button
                      onClick={startNewApplication}
                      disabled={!cvReady}
                      className="w-full py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{ backgroundColor: "#89023E" }}
                    >
                      + New Analysis
                    </button>
                    {!cvReady && <p className="text-xs text-white/40 mt-2 text-center">Upload your CV first</p>}
                  </div>
                </div>
              </motion.div>
              
              {/* Pro/Free Status Card */}
              <motion.div variants={fadeIn}>
                {isPro ? (
                  <div className="rounded-2xl p-6 border border-[#EA638C]/30 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(234,99,140,0.1) 0%, rgba(137,2,62,0.1) 100%)" }}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#EA638C]/20 rounded-full blur-3xl" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg, #EA638C, #89023E)" }}>
                          👑
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">You're a Pro Member!</h3>
                          <p className="text-white/50">All features unlocked • Unlimited analyses</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✓ Cover Letters</span>
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">✓ Interview Prep</span>
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">✓ Salary Intel</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setShowUpgradeModal(true)}
                    className="rounded-2xl p-6 border border-[#EA638C]/30 cursor-pointer group hover:border-[#EA638C]/50 transition-all relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, rgba(137,2,62,0.2) 0%, rgba(234,99,140,0.1) 100%)" }}
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#EA638C]/20 rounded-full blur-3xl group-hover:bg-[#EA638C]/30 transition-all" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg, #EA638C, #89023E)", boxShadow: "0 4px 20px rgba(234,99,140,0.3)" }}>
                            ✨
                          </div>
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-[#EA638C] transition-colors">Upgrade to Pro</h3>
                            <p className="text-white/50">Unlock the full power of Mirax</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">$12<span className="text-sm text-white/50">/mo</span></div>
                          <span className="text-xs text-emerald-400">or $45 for 6 months</span>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                          <span className="text-xl">✉️</span>
                          <div>
                            <p className="text-sm font-medium">Cover Letters</p>
                            <p className="text-xs text-white/40">EN, FR, DE, ES</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                          <span className="text-xl">🎤</span>
                          <div>
                            <p className="text-sm font-medium">Interview Prep</p>
                            <p className="text-xs text-white/40">Personalized Q&A</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                          <span className="text-xl">💰</span>
                          <div>
                            <p className="text-sm font-medium">Salary Trajectory</p>
                            <p className="text-xs text-white/40">2-year forecast</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/40">{FREE_ANALYSES_LIMIT - analysesUsed} of {FREE_ANALYSES_LIMIT} free analyses remaining</span>
                        <span className="text-[#EA638C] font-semibold group-hover:translate-x-1 transition-transform">Upgrade now →</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
              
              {history.length > 0 && (
                <motion.div variants={fadeIn}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Recent analyses</h3>
                    <button onClick={() => setScreen("history")} className="text-sm text-[#EA638C] hover:underline">View all →</button>
                  </div>
                  <div className="grid gap-3">
                    {history.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => viewHistoryItem(item)}
                        className="rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between"
                        style={{ backgroundColor: "#30343F" }}
                      >
                        <div>
                          <p className="font-medium">{item.job_title || "Untitled"}</p>
                          <p className="text-sm text-white/50">{item.company_name} · {new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.verdict.decision === "APPLY" ? "bg-emerald-500/20 text-emerald-400" :
                          item.verdict.decision === "APPLY_WITH_CAUTION" ? "bg-amber-500/20 text-amber-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {item.verdict.decision === "APPLY" ? "Apply" : item.verdict.decision === "APPLY_WITH_CAUTION" ? "Caution" : "Skip"}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          
          {/* PROFILE SCREEN */}
          {screen === "profile" && (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
              <motion.div variants={fadeIn}>
                <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                <p className="text-white/50">Your CV is saved automatically — no need to re-upload!</p>
              </motion.div>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <motion.div variants={fadeIn} className="lg:col-span-2 space-y-6">
                  <div className="rounded-2xl border border-white/10 p-6 lg:p-8" style={{ backgroundColor: "#30343F" }}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50"
                        style={{ backgroundColor: "#89023E" }}
                      >
                        {uploading ? "Reading CV…" : profile ? "Upload new CV" : "Upload PDF or DOCX"}
                      </button>
                      {fileName && (
                        <div className="flex items-center gap-2 text-white/60">
                          <span className="text-[#EA638C]">📄</span>
                          <span>{fileName}</span>
                        </div>
                      )}
                    </div>
                    
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setError("");
                          await handleCvFile(file);
                          if (fileRef.current) fileRef.current.value = "";
                        }
                      }}
                    />
                    
                    {extractingProfile && (
                      <div className="flex items-center gap-3 py-4">
                        <div className="w-5 h-5 border-2 border-[#EA638C] border-t-transparent rounded-full animate-spin" />
                        <span className="text-white/60">Analyzing your experience...</span>
                      </div>
                    )}
                    
                    {profile && !extractingProfile && (
                      <div className="space-y-5">
                        <div className="flex items-center gap-3 text-emerald-400">
                          <span className="text-xl">✓</span>
                          <span className="font-medium">CV attached and ready</span>
                        </div>
                        
                        {(profile.name || profile.title) && (
                          <div className="pb-4 border-b border-white/10">
                            {profile.name && <div className="text-2xl font-bold">{profile.name}</div>}
                            {profile.title && <div className="text-lg text-white/60">{profile.title}</div>}
                            {profile.yearsOfExperience && <div className="text-sm text-[#EA638C] mt-1 font-medium">{profile.yearsOfExperience} experience</div>}
                          </div>
                        )}
                        
                        {profile.skills.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Skills</div>
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#EA638C]/30" style={{ backgroundColor: "rgba(234, 99, 140, 0.1)" }}>{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {profile.languages.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Languages</div>
                            <div className="flex flex-wrap gap-2">
                              {profile.languages.map((lang, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-white/10">{lang}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {profile.education.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Education</div>
                            <div className="space-y-2">
                              {profile.education.map((edu, i) => (
                                <div key={i} className="text-white/70 flex gap-2"><span>🎓</span>{edu}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {profile.certifications.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Certifications</div>
                            <div className="flex flex-wrap gap-2">
                              {profile.certifications.map((cert, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-amber-500/10 text-amber-400 border border-amber-500/30">{cert}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!profile && !extractingProfile && !uploading && (
                      <>
                        <div className="relative py-4">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                          <div className="relative flex justify-center text-sm"><span className="px-4 text-white/40" style={{ backgroundColor: "#30343F" }}>or paste your CV</span></div>
                        </div>
                        <textarea
                          value={cvText}
                          onChange={(e) => setCvText(e.target.value)}
                          onBlur={() => { if (cvText.length >= 100) extractProfile(cvText); }}
                          placeholder="Paste your CV content here..."
                          className="w-full h-40 rounded-xl px-4 py-3 text-base resize-none border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#EA638C]"
                        />
                      </>
                    )}
                    
                    {error && <div className="mt-4 bg-red-500/20 text-red-300 px-4 py-3 rounded-xl">{error}</div>}
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 p-5" style={{ backgroundColor: "#30343F" }}>
                      <label className="block text-sm font-medium text-white/70 mb-3">Target Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value as Country)}
                        className="w-full rounded-xl px-4 py-3 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#EA638C]"
                      >
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                      </select>
                    </div>
                    <div className="rounded-xl border border-white/10 p-5" style={{ backgroundColor: "#30343F" }}>
                      <label className="block text-sm font-medium text-white/70 mb-3">Cover Letter Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="w-full rounded-xl px-4 py-3 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#EA638C]"
                      >
                        <option value="EN">English</option>
                        <option value="FR">Français</option>
                        <option value="DE">Deutsch</option>
                        <option value="ES">Español</option>
                      </select>
                    </div>
                  </div>
                  
                  {cvReady && (
                    <button
                      onClick={startNewApplication}
                      className="px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                      style={{ backgroundColor: "#89023E" }}
                    >
                      Start analyzing jobs →
                    </button>
                  )}
                </motion.div>
                
                <motion.div variants={fadeIn} className="space-y-5">
                  {history.length > 0 && (
                    <div className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: "#30343F" }}>
                      <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Your Stats</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Jobs analyzed</span>
                          <span className="text-xl font-bold">{stats.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Strong matches</span>
                          <span className="text-xl font-bold text-emerald-400">{stats.apply}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Worth considering</span>
                          <span className="text-xl font-bold text-amber-400">{stats.caution}</span>
                        </div>
                        <button onClick={() => setScreen("history")} className="w-full mt-2 py-2 text-sm text-[#EA638C] hover:bg-white/5 rounded-lg transition-colors">
                          View all history →
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: "#30343F" }}>
                    <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Tips for better results</h3>
                    <ul className="space-y-3 text-sm text-white/60">
                      <li className="flex gap-3"><span className="text-[#EA638C]">✓</span>Use a text-based PDF, not a scanned image</li>
                      <li className="flex gap-3"><span className="text-[#EA638C]">✓</span>Include specific tools and technologies</li>
                      <li className="flex gap-3"><span className="text-[#EA638C]">✓</span>Mention certifications and languages</li>
                      <li className="flex gap-3"><span className="text-[#EA638C]">✓</span>Keep your CV up to date</li>
                    </ul>
                  </div>
                  
                  <div className="rounded-2xl border border-[#EA638C]/30 p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #30343F, rgba(234,99,140,0.1))" }}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#EA638C]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <h3 className="text-sm font-semibold text-[#EA638C] uppercase tracking-wider mb-4">What you'll get</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex gap-3 items-center">
                          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-sm">✅</span>
                          <span className="text-white/80">Match verdict</span>
                          <span className="ml-auto text-xs text-emerald-400 font-medium">FREE</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-sm">⚖️</span>
                          <span className="text-white/80">Gap analysis</span>
                          <span className="ml-auto text-xs text-emerald-400 font-medium">FREE</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <span className="w-8 h-8 rounded-lg bg-[#EA638C]/20 flex items-center justify-center text-sm">💰</span>
                          <span className="text-white/80">Salary intel</span>
                          <span className="ml-auto text-xs text-emerald-400 font-medium">FREE</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">🎤</span>
                          <span className="text-white/80">Interview prep</span>
                          <span className="ml-auto text-xs text-[#EA638C] font-medium">PRO</span>
                        </li>
                        <li className="flex gap-3 items-center">
                          <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">✉️</span>
                          <span className="text-white/80">Cover letter</span>
                          <span className="ml-auto text-xs text-[#EA638C] font-medium">PRO</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {!isPro && (
                    <div className="rounded-2xl border border-purple-500/30 p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(234,99,140,0.1))" }}>
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">✨</span>
                        <h3 className="font-semibold text-white mb-1">Upgrade to Pro</h3>
                        <p className="text-sm text-white/50 mb-3">Unlimited analyses + all features</p>
                        <button onClick={() => setShowUpgradeModal(true)} className="w-full py-2.5 rounded-xl font-medium text-sm text-white transition-all hover:scale-105" style={{ backgroundColor: "#EA638C" }}>
                          Learn more
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* NEW APPLICATION */}
          {screen === "newApplication" && (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
              <motion.div variants={fadeIn}>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">Analyze a job</h1>
                <p className="text-lg text-white/50">Search for opportunities or paste a job description</p>
              </motion.div>
              
              <motion.div variants={fadeIn} className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ backgroundColor: "#30343F" }}>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    🔍 Search Jobs
                    {!isPro && <ProBadge onClick={() => setShowUpgradeModal(true)} />}
                  </h2>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") searchJobs(); }}
                    placeholder="e.g. Product Manager, Data Engineer..."
                    className="w-full rounded-xl px-4 py-3 border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#EA638C]"
                  />
                  <select
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value as Country)}
                    className="w-full rounded-xl px-4 py-3 border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#EA638C]"
                  >
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                  <button
                    onClick={searchJobs}
                    disabled={searching || !searchQuery.trim()}
                    className="w-full py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-40"
                    style={{ backgroundColor: "#89023E" }}
                  >
                    {searching ? "Searching..." : "Search Jobs"}
                  </button>
                </div>
                
                <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ backgroundColor: "#30343F" }}>
                  <h2 className="text-lg font-semibold">📋 Paste Description</h2>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste a job description from LinkedIn, Indeed, or any job portal..."
                    className="w-full h-36 rounded-xl px-4 py-3 resize-none border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#EA638C]"
                  />
                  <button
                    onClick={() => analyzeApplication()}
                    disabled={!jobDescription.trim() || !cvReady}
                    className="w-full py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-40"
                    style={{ backgroundColor: "#89023E" }}
                  >
                    Analyze this job
                  </button>
                  {!cvReady && <p className="text-sm text-white/40 text-center">Upload your CV first in Profile</p>}
                </div>
              </motion.div>
              
              {error && <div className="bg-red-500/20 text-red-300 px-4 py-3 rounded-xl">{error}</div>}
              
              {/* Animated Job Carousel - shows when no search results */}
              {jobs.length === 0 && !searching && (
                <motion.div variants={fadeIn} className="space-y-6 overflow-hidden">
                  <div className="text-center">
                    <p className="text-white/40 text-base">
                      {profile?.title 
                        ? `Suggested matches for "${profile.title}" in ${COUNTRIES.find(c => c.code === searchCountry)?.name || "Switzerland"}`
                        : `Popular jobs in ${COUNTRIES.find(c => c.code === searchCountry)?.name || "Switzerland"}`
                      }
                    </p>
                  </div>
                  
                  {/* Row 1 - scrolls left */}
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#1B2021] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#1B2021] to-transparent z-10 pointer-events-none" />
                    <div className="flex gap-4 animate-[marqueeLeft_40s_linear_infinite] hover:[animation-play-state:paused]">
                      {[
                        { title: "Senior Product Manager", company: "Tech Corp", location: "Zurich" },
                        { title: "Data Engineer", company: "Finance AG", location: "Geneva" },
                        { title: "UX Designer", company: "Design Studio", location: "Basel" },
                        { title: "Software Engineer", company: "Startup Inc", location: "Lausanne" },
                        { title: "Marketing Manager", company: "Brand Co", location: "Bern" },
                        { title: "DevOps Engineer", company: "Cloud Systems", location: "Zurich" },
                        { title: "Senior Product Manager", company: "Tech Corp", location: "Zurich" },
                        { title: "Data Engineer", company: "Finance AG", location: "Geneva" },
                        { title: "UX Designer", company: "Design Studio", location: "Basel" },
                        { title: "Software Engineer", company: "Startup Inc", location: "Lausanne" },
                        { title: "Marketing Manager", company: "Brand Co", location: "Bern" },
                        { title: "DevOps Engineer", company: "Cloud Systems", location: "Zurich" },
                      ].map((job, i) => (
                        <div
                          key={i}
                          onClick={() => { setSearchQuery(job.title); }}
                          className="flex-shrink-0 w-64 rounded-xl border border-white/10 p-4 cursor-pointer hover:border-[#EA638C]/50 hover:bg-[#EA638C]/5 transition-all hover:scale-[1.02]"
                          style={{ backgroundColor: "#30343F" }}
                        >
                          <div className="font-semibold text-sm mb-1">{job.title}</div>
                          <div className="text-sm text-white/50">{job.company} · {job.location}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 2 - scrolls right */}
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#1B2021] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#1B2021] to-transparent z-10 pointer-events-none" />
                    <div className="flex gap-4 animate-[marqueeRight_40s_linear_infinite] hover:[animation-play-state:paused]">
                      {[
                        { title: "Business Analyst", company: "Consulting Group", location: "Zurich" },
                        { title: "Frontend Developer", company: "Web Agency", location: "Winterthur" },
                        { title: "Project Manager", company: "Enterprise Ltd", location: "Lucerne" },
                        { title: "Data Scientist", company: "AI Labs", location: "Zurich" },
                        { title: "HR Manager", company: "People First", location: "Geneva" },
                        { title: "Backend Engineer", company: "Platform Co", location: "Basel" },
                        { title: "Business Analyst", company: "Consulting Group", location: "Zurich" },
                        { title: "Frontend Developer", company: "Web Agency", location: "Winterthur" },
                        { title: "Project Manager", company: "Enterprise Ltd", location: "Lucerne" },
                        { title: "Data Scientist", company: "AI Labs", location: "Zurich" },
                        { title: "HR Manager", company: "People First", location: "Geneva" },
                        { title: "Backend Engineer", company: "Platform Co", location: "Basel" },
                      ].map((job, i) => (
                        <div
                          key={i}
                          onClick={() => { setSearchQuery(job.title); }}
                          className="flex-shrink-0 w-64 rounded-xl border border-white/10 p-4 cursor-pointer hover:border-[#EA638C]/50 hover:bg-[#EA638C]/5 transition-all hover:scale-[1.02]"
                          style={{ backgroundColor: "#30343F" }}
                        >
                          <div className="font-semibold text-sm mb-1">{job.title}</div>
                          <div className="text-sm text-white/50">{job.company} · {job.location}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-center text-white/30 text-sm">Click any card to search for similar jobs</p>
                </motion.div>
              )}
              
              {/* Job Results */}
              {(jobs.length > 0 || searching) && (
                <motion.div variants={fadeIn} className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {searching && jobs.length === 0 && <div className="text-white/50 py-8 text-center">Searching...</div>}
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                        className={`rounded-xl border p-4 cursor-pointer transition-all ${expandedJobId === job.id ? "border-[#EA638C]/50 bg-[#EA638C]/5" : "border-white/10 hover:border-white/20"}`}
                        style={expandedJobId !== job.id ? { backgroundColor: "#30343F" } : undefined}
                      >
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-white/50 mt-1">{job.company} · {job.location}</div>
                        {/* Removed salary_text since it's always "Salary not listed" */}
                        {job.matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {job.matchedSkills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-xs bg-[#EA638C]/20 text-[#EA638C]">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    {expandedJobId ? (() => {
                      const job = jobs.find((j) => j.id === expandedJobId);
                      if (!job) return null;
                      return (
                        <div className="rounded-2xl border border-white/10 p-6 space-y-4 sticky top-8" style={{ backgroundColor: "#30343F" }}>
                          <div>
                            <h2 className="text-xl font-bold">{job.title}</h2>
                            <p className="text-white/50">{job.company} · {job.location}</p>
                          </div>
                          <div className="text-white/70 whitespace-pre-wrap max-h-72 overflow-y-auto text-sm leading-relaxed">
                            {job.description}
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => analyzeApplication(job.description, job.title, job.company)}
                              disabled={!cvReady}
                              className="flex-1 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-40"
                              style={{ backgroundColor: "#89023E" }}
                            >
                              Analyze this job
                            </button>
                            {job.url && (
                              <a href={job.url} target="_blank" rel="noopener noreferrer" className="px-4 py-3 rounded-xl border border-white/20 hover:bg-white/5 text-sm font-medium">
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="rounded-2xl border border-white/10 p-8 text-center text-white/30" style={{ backgroundColor: "#30343F" }}>
                        Select a job to see details
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          
          {/* ANALYZING */}
          {screen === "analyzing" && (
            <div className="flex flex-col items-center justify-center py-16 max-w-xl mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-[#EA638C]/50 rounded-2xl blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #89023E, #EA638C)" }}>
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Analyzing your match</h2>
              <p className="text-white/50 mb-10">This usually takes 10-15 seconds</p>
              <div className="w-full space-y-3">
                {ANALYSIS_STEPS.map((step, index) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      index < analysisStep ? "bg-emerald-500/10 border-emerald-500/30" :
                      index === analysisStep ? "bg-[#EA638C]/10 border-[#EA638C]/30" :
                      "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      index < analysisStep ? "bg-emerald-500/20" :
                      index === analysisStep ? "bg-[#EA638C]/20 animate-bounce" :
                      "bg-white/10"
                    }`}>
                      {index < analysisStep ? "✓" : step.icon}
                    </div>
                    <span className={`font-medium ${
                      index < analysisStep ? "text-emerald-400" :
                      index === analysisStep ? "text-[#EA638C]" :
                      "text-white/30"
                    }`}>
                      {step.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* BRIEFING - 6 Sections */}
          {screen === "briefing" && briefing && (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
              {/* Header */}
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">{currentJobTitle}</h1>
                  {currentCompany && <p className="text-lg text-white/50">{currentCompany}</p>}
                </div>
                <button onClick={startNewApplication} className="px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105" style={{ backgroundColor: "#89023E" }}>
                  + New Analysis
                </button>
              </motion.div>
              
              {/* Section 1: Match Verdict - Full Width */}
              <motion.div variants={fadeIn}>
                <div className={`rounded-2xl p-6 lg:p-8 border ${
                  briefing.verdict.decision === "APPLY" ? "bg-emerald-500/5 border-emerald-500/20" :
                  briefing.verdict.decision === "APPLY_WITH_CAUTION" ? "bg-amber-500/5 border-amber-500/20" :
                  "bg-red-500/5 border-red-500/20"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                        briefing.verdict.decision === "APPLY" ? "bg-emerald-500/20" :
                        briefing.verdict.decision === "APPLY_WITH_CAUTION" ? "bg-amber-500/20" :
                        "bg-red-500/20"
                      }`}>
                        {briefing.verdict.decision === "APPLY" ? "✅" : briefing.verdict.decision === "APPLY_WITH_CAUTION" ? "⚠️" : "❌"}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {briefing.verdict.decision === "APPLY" ? "Apply" : briefing.verdict.decision === "APPLY_WITH_CAUTION" ? "Apply with caution" : "Think twice"}
                        </h2>
                        <p className="text-white/50 text-sm">Match Verdict</p>
                      </div>
                    </div>
                    <FreeBadge />
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed">{briefing.verdict.summary}</p>
                </div>
              </motion.div>
              
              {/* Grid: 2 columns - Gap Analysis & Salary */}
              <div className="grid lg:grid-cols-2 gap-5">
                {/* Section 2: Gap Analysis */}
                <motion.div variants={fadeIn} className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: "#30343F" }}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2">⚖️ Gap Analysis</h2>
                    <FreeBadge />
                  </div>
                  <div className="space-y-4">
                    {briefing.matchAnalysis.dealbreakers.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Gaps to address</h3>
                        {briefing.matchAnalysis.dealbreakers.map((item, i) => (
                          <div key={i} className="rounded-xl p-4 bg-[#1B2021]">
                            <div className="font-semibold text-base">{item.requirement}</div>
                            <div className="text-sm text-white/60 mt-2 leading-relaxed">{item.assessment}</div>
                            <div className="text-sm font-medium mt-3 text-[#EA638C]">→ {item.suggestion}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {briefing.matchAnalysis.strongAngles.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Your strengths</h3>
                        {briefing.matchAnalysis.strongAngles.map((s, i) => (
                          <div key={i} className="text-base text-white/80 flex gap-3 py-2"><span className="text-emerald-400">✓</span>{s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
                
                {/* Section 3: Salary Intelligence with Line Chart */}
                <motion.div variants={fadeIn} className="rounded-2xl border border-white/10 p-6 relative overflow-hidden" style={{ backgroundColor: "#30343F" }}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#EA638C]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-bold flex items-center gap-2">💰 Salary Intelligence</h2>
                      <FreeBadge />
                    </div>
                    <div className="text-4xl font-bold mb-3 text-[#EA638C]">{briefing.salaryIntelligence.estimatedRange}</div>
                    <p className="text-white/70 text-base leading-relaxed mb-5">{briefing.salaryIntelligence.marketContext}</p>
                    
                    {/* Line Chart */}
                    <SalaryLineChart 
                      data={briefing.salaryIntelligence.trajectoryData || [85000, 92000, 100000, 108000, 118000]}
                      isPro={isPro}
                      onUnlock={() => setShowUpgradeModal(true)}
                      salaryRange={briefing.salaryIntelligence.estimatedRange}
                      interpretation={briefing.salaryIntelligence.trajectoryInterpretation}
                    />
                  </div>
                </motion.div>
              </div>
              
              {/* Grid: 2 columns - Red Flags & Interview Prep */}
              <div className="space-y-5">
                {/* Section 4: Interview Prep - NOW FULL WIDTH */}
                <motion.div variants={fadeIn} className="rounded-2xl border border-purple-500/30 p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #30343F, rgba(139,92,246,0.1))" }}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-bold flex items-center gap-2">🎤 Interview Prep</h2>
                      <div className="flex items-center gap-2">
                        {isPro && !loadingInterviewPrep && (
                          <button
                            onClick={() => generateInterviewPrep(currentJobDescription)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                          >
                            ↻ Regenerate
                          </button>
                        )}
                        <ProBadge onClick={() => !isPro && setShowUpgradeModal(true)} />
                      </div>
                    </div>
                    
                    {loadingInterviewPrep && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white/60 text-sm">Generating personalized questions...</p>
                      </div>
                    )}
                    
                    {isPro && !loadingInterviewPrep && interviewPrepStrategy && (
                      <div className="mb-5 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <h3 className="text-sm font-semibold text-purple-400 mb-2">📋 Your Strategy</h3>
                        <p className="text-white/80 text-sm leading-relaxed">{interviewPrepStrategy}</p>
                        {interviewPrepThemes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {interviewPrepThemes.map((theme, i) => (
                              <span key={i} className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300">{theme}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!loadingInterviewPrep && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {isPro ? (
                          <>
                            {(briefing.interviewQuestions || []).map((q, i) => (
                              <div key={i} className="rounded-xl p-4 bg-[#1B2021] border border-purple-500/20">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{q.category}</div>
                                  {q.difficulty && (
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      q.difficulty === "Hard" ? "bg-red-500/20 text-red-400" :
                                      q.difficulty === "Medium" ? "bg-amber-500/20 text-amber-400" :
                                      "bg-emerald-500/20 text-emerald-400"
                                    }`}>
                                      {q.difficulty}
                                    </span>
                                  )}
                                </div>
                                <div className="font-semibold text-base text-white mb-2">"{q.question}"</div>
                                <div className="text-sm text-white/60 mb-2">Why they'll ask: {q.why}</div>
                                <div className="text-sm font-medium text-[#EA638C]">→ {q.angle}</div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {/* Show first 3 questions in grid for free users */}
                            {(briefing.interviewQuestions || []).slice(0, 3).map((q, i) => (
                              <div key={i} className="rounded-xl p-4 bg-[#1B2021] border border-purple-500/20">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{q.category}</div>
                                  {q.difficulty && (
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      q.difficulty === "Hard" ? "bg-red-500/20 text-red-400" :
                                      q.difficulty === "Medium" ? "bg-amber-500/20 text-amber-400" :
                                      "bg-emerald-500/20 text-emerald-400"
                                    }`}>
                                      {q.difficulty}
                                    </span>
                                  )}
                                </div>
                                <div className="font-semibold text-base text-white mb-2">"{q.question}"</div>
                                <div className="text-sm text-white/60 mb-2">Why they'll ask: {q.why}</div>
                                <div className="text-sm font-medium text-[#EA638C]">→ {q.angle}</div>
                              </div>
                            ))}
                            
                            {/* Locked preview card */}
                            <div className="rounded-xl p-4 bg-[#1B2021]/50 border border-purple-500/20 relative overflow-hidden">
                              <div className="blur-[6px] pointer-events-none">
                                <div className="text-xs text-purple-400 mb-1">TECHNICAL</div>
                                <div className="font-medium text-base mb-2">"Your personalized question here..."</div>
                                <div className="text-sm text-white/50">Unlock to see more</div>
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1B2021]/60">
                                <p className="text-white/80 text-sm font-medium mb-2">+{Math.max(0, (briefing.interviewQuestions?.length || 6) - 3)} more questions</p>
                                <button onClick={() => setShowUpgradeModal(true)} className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-all hover:scale-105" style={{ backgroundColor: "#8b5cf6" }}>
                                  Unlock all
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
                
                {/* Section 5: Red Flags - Now below Interview Prep */}
                <motion.div variants={fadeIn} className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: "#30343F" }}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2">🚩 Red Flags</h2>
                    <FreeBadge />
                  </div>
                  {briefing.redFlags.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {briefing.redFlags.map((f, i) => (
                        <div key={i} className={`rounded-xl p-4 ${
                          f.severity === "HIGH" ? "bg-red-500/10 border border-red-500/20" :
                          f.severity === "MEDIUM" ? "bg-amber-500/10 border border-amber-500/20" :
                          "bg-white/5 border border-white/10"
                        }`}>
                          <div className="font-semibold text-base flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              f.severity === "HIGH" ? "bg-red-500" :
                              f.severity === "MEDIUM" ? "bg-amber-500" :
                              "bg-white/40"
                            }`} />
                            {f.flag}
                          </div>
                          <p className="text-sm text-white/60 mt-2 leading-relaxed">{f.explanation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/40">
                      <span className="text-4xl mb-3 block">✨</span>
                      <p className="text-base">No major red flags detected</p>
                    </div>
                  )}
                </motion.div>
              </div>
              
              {/* Section 6: Cover Letter - 2 versions with download */}
              <motion.div variants={fadeIn} className="rounded-2xl border border-[#EA638C]/30 p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #30343F, rgba(234,99,140,0.1))" }}>
                <div className="absolute top-0 left-1/2 w-64 h-64 bg-[#EA638C]/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2">✉️ Cover Letter</h2>
                    <div className="flex items-center gap-3">
                      <ProBadge onClick={() => !isPro && setShowUpgradeModal(true)} />
                      {isPro && (
                        <>
                          <button
                            onClick={() => { navigator.clipboard.writeText(activeCoverLetter === 1 ? briefing.coverLetter : (briefing.coverLetterAlt || briefing.coverLetter)); alert("Copied to clipboard!"); }}
                            className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 text-[#EA638C] flex items-center gap-1"
                          >
                            📋 Copy
                          </button>
                          <button
                            onClick={() => downloadCoverLetter(
                              activeCoverLetter === 1 ? briefing.coverLetter : (briefing.coverLetterAlt || briefing.coverLetter),
                              `cover-letter-${currentJobTitle.toLowerCase().replace(/\s+/g, '-')}-v${activeCoverLetter}.pdf`,
                              'pdf'
                            )}
                            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-[#EA638C]/20 hover:bg-[#EA638C]/30 text-[#EA638C] flex items-center gap-1"
                          >
                            📄 Download PDF
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Version toggle */}
                  {isPro && (
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setActiveCoverLetter(1)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCoverLetter === 1 ? 'bg-[#EA638C] text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                      >
                        ✍️ Professional
                      </button>
                      <button
                        onClick={() => setActiveCoverLetter(2)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCoverLetter === 2 ? 'bg-[#EA638C] text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                      >
                        🔥 Enthusiastic
                      </button>
                    </div>
                  )}
                  
                  <div className="rounded-xl p-6 bg-[#1B2021] border border-[#EA638C]/20">
                    {/* Format cover letter with proper spacing */}
                    {(() => {
                      const letterContent = activeCoverLetter === 1 ? briefing.coverLetter : (briefing.coverLetterAlt || briefing.coverLetter);
                      const lines = letterContent.split('\n');
                      
                      // Show first 4 lines for free users (greeting + opening paragraph)
                      const visibleLines = isPro ? lines : lines.slice(0, 4);
                      const hiddenLines = isPro ? [] : lines.slice(4, 10);
                      
                      return (
                        <>
                          <div className="text-white/90 text-base leading-relaxed space-y-4">
                            {visibleLines.map((line, i) => (
                              <p key={i} className={line.startsWith('Dear') ? 'mb-4' : ''}>{line}</p>
                            ))}
                          </div>
                          
                          {!isPro && (
                            <>
                              <div className="relative mt-4">
                                <div className="text-white/90 text-base leading-relaxed blur-[6px] pointer-events-none space-y-4">
                                  {hiddenLines.map((line, i) => (
                                    <p key={i}>{line}</p>
                                  ))}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1B2021]" />
                              </div>
                              <div className="flex flex-col items-center justify-center pt-6 pb-2">
                                <p className="text-white/70 mb-3">Ready-to-send cover letter tailored to this role</p>
                                <div className="flex gap-3 mb-3">
                                  <span className="px-3 py-1 rounded-full text-xs bg-white/10">🇬🇧 English</span>
                                  <span className="px-3 py-1 rounded-full text-xs bg-white/10">🇫🇷 Français</span>
                                  <span className="px-3 py-1 rounded-full text-xs bg-white/10">🇩🇪 Deutsch</span>
                                  <span className="px-3 py-1 rounded-full text-xs bg-white/10">🇪🇸 Español</span>
                                </div>
                                <button onClick={() => setShowUpgradeModal(true)} className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105" style={{ backgroundColor: "#EA638C", boxShadow: "0 4px 20px rgba(234,99,140,0.3)" }}>
                                  Unlock full cover letter
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
              
              {/* Action Buttons */}
              <motion.div variants={fadeIn} className="flex gap-4 pt-4">
                <button onClick={startNewApplication} className="px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all" style={{ backgroundColor: "#89023E" }}>
                  Analyze another job
                </button>
                <button onClick={() => setScreen("history")} className="px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/5 transition-all">
                  View history
                </button>
              </motion.div>
            </motion.div>
          )}
          
          {/* HISTORY - Improved layout */}
          {screen === "history" && (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2">Your history</h1>
                  <p className="text-lg text-white/50">View past analyses</p>
                </div>
                <button onClick={startNewApplication} className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105" style={{ backgroundColor: "#89023E" }}>
                  + New Analysis
                </button>
              </motion.div>
              
              {/* Stats - Full width, larger when few items */}
              <motion.div variants={fadeIn}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl p-6 lg:p-8 border border-white/10 text-center" style={{ backgroundColor: "#30343F" }}>
                    <div className="text-4xl lg:text-5xl font-bold mb-2">{stats.total}</div>
                    <div className="text-base text-white/50">Jobs analyzed</div>
                  </div>
                  <div className="rounded-2xl p-6 lg:p-8 bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">{stats.apply}</div>
                    <div className="text-base text-emerald-400/70">Strong matches</div>
                  </div>
                  <div className="rounded-2xl p-6 lg:p-8 bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="text-4xl lg:text-5xl font-bold text-amber-400 mb-2">{stats.caution}</div>
                    <div className="text-base text-amber-400/70">Worth considering</div>
                  </div>
                  <div className="rounded-2xl p-6 lg:p-8 bg-red-500/10 border border-red-500/20 text-center">
                    <div className="text-4xl lg:text-5xl font-bold text-red-400 mb-2">{stats.avoid}</div>
                    <div className="text-base text-red-400/70">Skip these</div>
                  </div>
                </div>
              </motion.div>
              
              {loadingHistory ? (
                <div className="text-white/50 py-12 text-center">Loading...</div>
              ) : history.length === 0 ? (
                <motion.div variants={fadeIn} className="text-center py-16 rounded-2xl border border-white/10" style={{ backgroundColor: "#30343F" }}>
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-2xl font-medium mb-2">No applications yet</h3>
                  <p className="text-white/50 mb-6">Start analyzing jobs to build your history</p>
                  <button onClick={startNewApplication} className="px-8 py-4 rounded-xl font-semibold text-lg" style={{ backgroundColor: "#89023E" }}>
                    Analyze your first job
                  </button>
                </motion.div>
              ) : (
                <motion.div variants={fadeIn} className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => viewHistoryItem(item)}
                      className="border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all cursor-pointer group"
                      style={{ backgroundColor: "#30343F" }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-lg mb-1">{item.job_title || "Untitled"}</div>
                          <div className="text-sm text-white/50">
                            {item.company_name && `${item.company_name} · `}
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                            item.verdict.decision === "APPLY" ? "bg-emerald-500/20 text-emerald-400" :
                            item.verdict.decision === "APPLY_WITH_CAUTION" ? "bg-amber-500/20 text-amber-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {item.verdict.decision === "APPLY" ? "Apply" : item.verdict.decision === "APPLY_WITH_CAUTION" ? "Caution" : "Avoid"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this analysis?")) deleteBriefing(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 p-2 transition-all"
                          >
                            {deletingId === item.id ? "..." : "🗑️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
          
        </div>
      </main>
      
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        checkingOut={checkingOut}
      />
      
      <WelcomeProModal
        isOpen={showWelcomeProModal}
        onClose={() => setShowWelcomeProModal(false)}
      />
      
      <style jsx global>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}