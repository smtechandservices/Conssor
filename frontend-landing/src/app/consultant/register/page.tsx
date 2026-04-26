"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConsultantRegister() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    linkedin: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/consultant/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Reset form or redirect
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="text-primary tracking-widest text-sm uppercase font-semibold mb-6">CONSSOR</div>
          <h2 className="text-3xl font-heading font-medium text-foreground mb-4">Application Submitted</h2>
          <p className="text-muted-foreground mb-8">
            Thank you for applying to join the CONSSOR network. You can now sign in to your dashboard.
          </p>
          <Link href="/consultant/login">
            <Button className="w-full bg-primary text-background hover:bg-primary/90 uppercase tracking-widest">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <div className="text-primary tracking-widest text-sm uppercase font-semibold text-center hover:opacity-80 transition-opacity">CONSSOR</div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-heading font-medium tracking-tight text-foreground">
          Join the Network
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground font-sans">
          Apply to become a vetted domain expert.
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
              <label htmlFor="full_name" className="block text-sm font-medium text-foreground tracking-wide uppercase text-[10px]">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors text-foreground"
                />
              </div>
            </div>

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
              <label htmlFor="linkedin" className="block text-sm font-medium text-foreground tracking-wide uppercase text-[10px]">
                LinkedIn URL
              </label>
              <div className="mt-1">
                <input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  required
                  value={formData.linkedin}
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
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors text-foreground"
                />
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-background bg-primary hover:bg-primary/90 focus:outline-none uppercase tracking-widest transition-all"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
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
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/consultant/login" className="font-medium text-primary hover:text-primary-hover">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
