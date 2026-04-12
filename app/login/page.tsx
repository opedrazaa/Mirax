"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup"); // Default to signup for new users
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setStatus("Please enter email and password");
      return;
    }

    if (password.length < 6) {
      setStatus("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    if (mode === "signup") {
      setStatus("Creating account...");
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setStatus("Error: " + error.message);
      } else {
        setStatus("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      }
    } else {
      setStatus("Signing in...");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("Error: " + error.message);
      } else {
        setStatus("Success! Redirecting...");
        router.push("/app");
      }
    }
    
    setIsLoading(false);
  }

  async function signInWithGoogle() {
    setStatus("Redirecting to Google...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setStatus("Error: " + error.message);
  }

  async function signInWithMicrosoft() {
    setStatus("Redirecting to Microsoft...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "email profile openid",
      },
    });
    if (error) setStatus("Error: " + error.message);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1B2021', color: 'white' }}>
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="#EA638C"/>
              <path d="M8 26V10H11.5L18 20L24.5 10H28V26H24.5V16.5L18 26H18L11.5 16.5V26H8Z" fill="white"/>
            </svg>
            <span className="text-xl font-semibold tracking-tight">Mirax</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-white/50 text-lg">
              {mode === "signup" 
                ? "Start analyzing jobs smarter today" 
                : "Sign in to continue to Mirax"
              }
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-8" style={{ backgroundColor: '#30343F' }}>
            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3.5 px-4 rounded-xl hover:bg-white/90 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* <button
                onClick={signInWithMicrosoft}
                className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] text-white font-medium py-3.5 px-4 rounded-xl hover:bg-[#3F3F3F] transition-colors border border-white/10"
              >
                <svg width="20" height="20" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
                Continue with Microsoft
              </button> */}
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-white/40" style={{ backgroundColor: '#30343F' }}>or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#EA638C] focus:border-transparent transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#EA638C] focus:border-transparent transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
                {mode === "signup" && (
                  <p className="text-xs text-white/40 mt-1">Minimum 6 characters</p>
                )}
              </div>

              {status && (
                <div className={`text-sm p-4 rounded-xl ${
                  status.includes('Error') 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : status.includes('Success') || status.includes('created')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/10 text-white/70'
                }`}>
                  {status}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
                style={{ backgroundColor: '#EA638C' }}
              >
                {isLoading 
                  ? (mode === "signup" ? "Creating account..." : "Signing in...") 
                  : (mode === "signup" ? "Create account" : "Sign in")
                }
              </button>
            </form>

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              {mode === "signup" ? (
                <p className="text-white/50">
                  Already have an account?{" "}
                  <button 
                    onClick={() => { setMode("signin"); setStatus(""); }}
                    className="text-[#EA638C] hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="text-white/50">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => { setMode("signup"); setStatus(""); }}
                    className="text-[#EA638C] hover:underline font-medium"
                  >
                    Sign up free
                  </button>
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-white/30 mt-8">
            By continuing, you agree to Mirax's{" "}
            <Link href="/terms" className="text-white/50 hover:text-[#EA638C] underline transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-white/50 hover:text-[#EA638C] underline transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </main>
    </div>
  );
}