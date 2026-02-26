"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Mic, Loader2, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email, password
        });
        if (signInError) throw signInError;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Hero Branding */}
      <div className="relative mb-16 text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center group hover:from-emerald-500/30 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
            <Mic className="text-emerald-400 w-12 h-12 relative z-10" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-[#f5f5f7] tracking-tight">Speakly</h1>
          <p className="text-[#a8a8b0] max-w-sm text-lg leading-relaxed">
            Speak your tasks. Let AI organize your day.
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-[#1a1a21] border border-[#3a3a47] rounded-2xl p-8 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-[#f5f5f7] mb-2">
          {isSignUp ? "Create account" : "Welcome back"}
        </h2>
        <p className="text-[#a8a8b0] text-sm mb-6">
          {isSignUp 
            ? "Get started with voice-powered task management" 
            : "Sign in to continue to your dashboard"}
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-[#fca5a5] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a8a8b0] mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#262630] border border-[#3a3a47] rounded-lg px-4 py-3 text-[#f5f5f7] placeholder-[#6f7178] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a8a8b0] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#262630] border border-[#3a3a47] rounded-lg px-4 py-3 text-[#f5f5f7] placeholder-[#6f7178] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg px-4 py-3 transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isSignUp ? "Create account" : "Sign in"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-[#3a3a47] pt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#a8a8b0] hover:text-[#f5f5f7] transition-colors text-sm font-medium"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>

      {/* Footer hint */}
      <p className="text-[#6f7178] text-xs mt-8">
        Voice recognition works best in Chrome, Edge, or Safari
      </p>
    </div>
  );
}
