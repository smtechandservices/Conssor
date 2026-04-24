"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
    // Clean the URL immediately so params never linger
    window.history.replaceState({}, "", "/login");
  }, [searchParams]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }
      localStorage.setItem("conssor_client", JSON.stringify(data.user));
      router.replace("/dashboard");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground tracking-wide uppercase text-[10px]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="client@gmail.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background/50 border-white/10 rounded-sm py-6"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground tracking-wide uppercase text-[10px]">
          Password
        </Label>
        <div className="relative group/password">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder=""
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background/50 border-white/10 rounded-sm py-6 pr-12 transition-all focus:border-primary/50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L3 3m6.07 6.07a3.5 3.5 0 114.95 4.95M17.35 17.35L21 21M9.88 9.88A9.45 9.45 0 1014.12 14.12M17.35 17.35a9.38 9.38 0 002.83-5.35c0-4.42-3.58-8-8-8a9.41 9.41 0 00-5.23 1.62"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-[10px] uppercase tracking-wider">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="#" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Forgot your password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-6 border border-transparent rounded-sm shadow-sm text-sm font-semibold text-background bg-primary hover:bg-primary/90 focus:outline-none uppercase tracking-widest transition-all disabled:opacity-60"
      >
        {loading ? "Authenticating..." : "Enter Portal"}
      </Button>
    </form>
  );
}

export default function ClientLogin() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1640027659327-96f1043e4278?crop=entropy&cs=srgb&fm=jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="http://localhost:3000">
          <div className="text-primary tracking-widest text-sm uppercase font-semibold text-center hover:opacity-80 transition-opacity">CONSSOR</div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-heading font-medium tracking-tight text-foreground">
          Client Portal
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground font-sans">
          Log in to track engagements, milestones, and quotes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-secondary/70 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-sm sm:px-10 border border-white/5">
          <Suspense fallback={<div className="h-48 flex items-center justify-center text-muted-foreground animate-pulse">Loading secure portal...</div>}>
            <LoginFormContent />
          </Suspense>

          <div className="mt-6 text-center text-xs text-muted-foreground pt-6 border-t border-white/10">
            Secure enterprise authentication provided by CONSSOR.
          </div>
        </div>
      </div>
    </div>
  );
}
