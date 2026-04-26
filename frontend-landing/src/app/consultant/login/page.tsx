"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConsultantLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/consultant/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Store user info and redirect
        localStorage.setItem("conssor_user", JSON.stringify(data.user));
        localStorage.setItem("conssor_role", "consultant");
        
        // Redirect to consultant portal (localhost:3002 as per plan or current dashboard if shared)
        // For now, let's redirect to a success message or the client portal as a placeholder if 3002 is not up
        window.location.href = "http://localhost:3001/dashboard"; 
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <div className="text-primary tracking-widest text-sm uppercase font-semibold text-center hover:opacity-80 transition-opacity">CONSSOR</div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-heading font-medium tracking-tight text-foreground">
          Consultant Login
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground font-sans">
          Access your premium portal to manage engagements.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-secondary/50 py-8 px-4 shadow sm:rounded-sm sm:px-10 border border-white/5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2 px-3 rounded-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground tracking-wide uppercase text-[10px]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors text-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground tracking-wide uppercase text-[10px]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-hover">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-background bg-primary hover:bg-primary/90 focus:outline-none uppercase tracking-widest transition-all"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/consultant/register" className="font-medium text-primary hover:text-primary-hover">
                Apply as Expert
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
