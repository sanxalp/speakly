"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 md:p-4 relative overflow-hidden">
      {/* Subtle background accent - hidden on mobile */}
      <div className="hidden md:block absolute top-0 right-1/4 w-96 h-96 bg-[#d4af37]/3 rounded-full blur-3xl pointer-events-none" />

      {/* Logo and Branding */}
      <div className="relative mb-12 md:mb-20 text-center space-y-6 md:space-y-8 z-10">
        <div className="flex justify-center">
          <div className="relative group">
            <div className="hidden md:block absolute inset-0 bg-[#d4af37]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image
              src="/speakly-logo.jpg"
              alt="Speakly"
              width={64}
              height={64}
              className="relative z-10 rounded-2xl md:w-20 md:h-20"
              priority
            />
          </div>
        </div>
        <div className="space-y-2 md:space-y-3">
          <h1 className="text-4xl md:text-6xl font-light text-[#f5f5f5] tracking-tight">Speakly</h1>
          <p className="text-[#a8a8a8] max-w-sm text-sm md:text-base leading-relaxed font-light">
            The art of organized productivity through voice
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 md:p-10 shadow-2xl relative z-10">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-light text-[#f5f5f5] mb-2">
            {isSignUp ? "Create Account" : "Welcome"}
          </h2>
          <div className="w-12 h-1 bg-[#d4af37]" />
        </div>
        
        <p className="text-[#a8a8a8] text-xs md:text-sm mb-6 md:mb-8 font-light leading-relaxed">
          {isSignUp 
            ? "Begin your journey with intelligent voice-powered task management" 
            : "Access your personalized task dashboard"}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-[#a8736b]/10 border border-[#a8736b]/30 rounded-lg text-[#d9a8a0] text-xs md:text-sm font-light">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-xs font-light text-[#a8a8a8] mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#242424] border border-[#333333] rounded-md px-4 py-3 text-[#f5f5f5] placeholder-[#707070] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all duration-300 font-light text-sm"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-light text-[#a8a8a8] mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#242424] border border-[#333333] rounded-md px-4 py-3 text-[#f5f5f5] placeholder-[#707070] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all duration-300 font-light text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#e8c547] text-[#0a0a0a] font-light rounded-md px-4 py-3 transition-all duration-300 flex items-center justify-center gap-2 mt-4 md:mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#d4af37]/20 text-sm md:text-base"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 md:mt-8 text-center border-t border-[#333333] pt-4 md:pt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#a8a8a8] hover:text-[#d4af37] transition-colors text-xs md:text-sm font-light"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[#707070] text-xs mt-8 md:mt-12 font-light text-center">
        Optimized for Chrome, Edge, and Safari
      </p>
    </div>
  );
}
