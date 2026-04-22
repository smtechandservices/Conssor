"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// MVP Options Data
const DOMAIN_TAGS = [
  "Aerospace & Defense", "Agriculture & FoodTech", "Automotive & Mobility", 
  "Chemicals & Materials", "Smart Infrastructure", "Consumer & Retail", 
  "Digital Economy & ICT", "Energy & Utilities", "Financial Services", 
  "Healthcare & Life Sciences", "Industrial & Manufacturing", "Media & Entertainment", 
  "Private Equity", "Public Sector", "Telecommunications", "Transportation & Logistics"
];
const SCOPES = ["Strategic Consulting", "Digital Transformation", "Financial Advisory", "Technical Consulting"];
const STAGES = ["Ideation / Early Stage", "Validation / Research", "Growth / Scaling", "Optimization / Turnaround", "M&A / Transaction Support"];
const BUDGETS = ["Under $10,000", "$10,000 – $50,000", "$50,000 – $200,000", "$200,000+", "Prefer not to disclose"];

export default function ClientOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    organizationName: "",
    email: "",
    phone: "",
    country: "",
    domain_tags: [] as string[],
    engagement_scope: [] as string[],
    description: "",
    project_stage: "",
    budget_range: "$50,000 – $200,000",
    engagement_type: "one_time"
  });

  const updateForm = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key: 'domain_tags' | 'engagement_scope', item: string, maxItems: number = 99) => {
    setFormData(prev => {
      const arr = prev[key];
      if (arr.includes(item)) return { ...prev, [key]: arr.filter(i => i !== item) };
      if (arr.length < maxItems) return { ...prev, [key]: [...arr, item] };
      return prev;
    });
  };

  const submitToGroq = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/quotes/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setQuoteResult(data);
    } catch (err) {
      console.error(err);
      // Mock failure UI
      setQuoteResult({ error: "Failed to connect to backend AI pricing engine." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="p-8 border-b border-white/10 flex justify-between items-center">
        <Link href="/">
          <div className="text-primary tracking-widest text-sm uppercase font-semibold hover:opacity-80 transition-opacity">CONSSOR</div>
        </Link>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Client Onboarding • Step {step} of 6</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          
          {quoteResult ? (
            <div className="bg-secondary/50 border border-primary/30 p-8 rounded-sm">
              <h2 className="text-3xl font-heading mb-4 text-primary">Onboarding Complete</h2>
              {quoteResult.error ? (
                <p className="text-destructive font-sans">{quoteResult.error}</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">Our AI engine has generated your preliminary engagement structure. An administrator is currently reviewing the scope.</p>
                  <div className="bg-background/80 p-6 rounded-sm border border-white/10">
                    <span className="text-primary uppercase tracking-widest text-[10px] block mb-2">AI Rationale</span>
                    <p className="text-sm italic text-muted-foreground mb-4">"{quoteResult.ai_rationale}"</p>
                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                      <span className="text-sm text-foreground">Estimated Engagement</span>
                      <span className="text-sm font-semibold">{quoteResult.ai_estimated_weeks} Weeks</span>
                    </div>
                  </div>
                </div>
              )}
              <Link href="/">
                <Button className="mt-8 bg-primary rounded-sm uppercase tracking-widest text-background w-full">Return Home</Button>
              </Link>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-3xl font-heading mb-2">Account Setup</h2>
                    <p className="text-muted-foreground font-sans">Provide your primary organization contact details.</p>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} className="w-full bg-secondary/50 border border-white/10 rounded-sm p-4 outline-none focus:border-primary/50" />
                    <input type="text" placeholder="Organization Name" value={formData.organizationName} onChange={e => updateForm('organizationName', e.target.value)} className="w-full bg-secondary/50 border border-white/10 rounded-sm p-4 outline-none focus:border-primary/50" />
                    <input type="email" placeholder="Email Address" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full bg-secondary/50 border border-white/10 rounded-sm p-4 outline-none focus:border-primary/50" />
                    <div className="flex gap-4">
                      <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full bg-secondary/50 border border-white/10 rounded-sm p-4 outline-none focus:border-primary/50" />
                      <input type="text" placeholder="Country" value={formData.country} onChange={e => updateForm('country', e.target.value)} className="w-full bg-secondary/50 border border-white/10 rounded-sm p-4 outline-none focus:border-primary/50" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-3xl font-heading mb-2">Industry Verticals</h2>
                    <p className="text-muted-foreground font-sans">Select up to 3 domains relevant to your organization.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DOMAIN_TAGS.map(tag => (
                      <button 
                        key={tag} 
                        onClick={() => toggleArrayItem('domain_tags', tag, 3)}
                        className={`text-xs uppercase tracking-wider px-4 py-2 rounded-sm border transition-all ${
                          formData.domain_tags.includes(tag) 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-background border-white/10 text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-3xl font-heading mb-2">Engagement Scope</h2>
                    <p className="text-muted-foreground font-sans">What services are you seeking?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {SCOPES.map(scope => (
                      <button 
                        key={scope} 
                        onClick={() => toggleArrayItem('engagement_scope', scope)}
                        className={`text-sm tracking-wide p-4 rounded-sm border transition-all text-left ${
                          formData.engagement_scope.includes(scope) 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-secondary/50 border-white/10 text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    placeholder="Briefly describe your challenge (500 chars max)..." 
                    value={formData.description}
                    onChange={e => updateForm('description', e.target.value)}
                    maxLength={500}
                    className="w-full bg-secondary/50 border border-white/10 rounded-sm p-4 outline-none focus:border-primary/50 min-h-[120px] resize-none"
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-3xl font-heading mb-2">Project Stage</h2>
                    <p className="text-muted-foreground font-sans">Where are you currently in your project lifecycle?</p>
                  </div>
                  <div className="space-y-3">
                    {STAGES.map(stage => (
                      <button 
                        key={stage} 
                        onClick={() => updateForm('project_stage', stage)}
                        className={`w-full text-left p-4 rounded-sm border transition-all ${
                          formData.project_stage === stage 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-secondary/50 border-white/10 text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-3xl font-heading mb-2">Budget & Terms</h2>
                    <p className="text-muted-foreground font-sans">Establish your preferred engagement model.</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <span className="block text-sm uppercase tracking-widest text-muted-foreground mb-3">Model</span>
                      <div className="flex gap-4">
                        <button onClick={() => updateForm('engagement_type', 'one_time')} className={`flex-1 p-4 rounded-sm border transition-all ${formData.engagement_type === 'one_time' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/50 border-white/10 text-muted-foreground'}`}>One-Time</button>
                        <button onClick={() => updateForm('engagement_type', 'retainer')} className={`flex-1 p-4 rounded-sm border transition-all ${formData.engagement_type === 'retainer' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/50 border-white/10 text-muted-foreground'}`}>Retainer</button>
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm uppercase tracking-widest text-muted-foreground mb-3">Budget Range</span>
                      <select 
                        className="w-full bg-secondary/50 border border-white/10 rounded-sm p-4 outline-none focus:border-primary/50 text-foreground appearance-none"
                        value={formData.budget_range}
                        onChange={e => updateForm('budget_range', e.target.value)}
                      >
                        {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-3xl font-heading mb-2">Review & Submit</h2>
                    <p className="text-muted-foreground font-sans">Verify your details before our AI evaluates the scope.</p>
                  </div>
                  <div className="bg-secondary/30 p-6 border border-white/5 rounded-sm space-y-4 text-sm font-sans">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Organization</span>
                      <span>{formData.organizationName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Verticals</span>
                      <span className="text-right">{formData.domain_tags.join(", ") || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Scope</span>
                      <span className="text-right">{formData.engagement_scope.join(", ") || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Stage</span>
                      <span>{formData.project_stage || "N/A"}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="text-primary">{formData.budget_range} ({formData.engagement_type === 'one_time' ? 'One Time' : 'Retainer'})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Bar */}
              <div className="mt-12 flex justify-between pt-6 border-t border-white/10">
                <Button 
                  variant="outline" 
                  disabled={step === 1} 
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  className="rounded-sm border-white/10 text-muted-foreground hover:text-foreground"
                >
                  Back
                </Button>
                
                {step < 6 ? (
                  <Button 
                    onClick={() => setStep(s => Math.min(6, s + 1))}
                    className="rounded-sm bg-primary text-background hover:bg-primary/90 px-8 uppercase tracking-widest"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={submitToGroq}
                    disabled={loading}
                    className="rounded-sm bg-primary text-background hover:bg-primary/90 px-8 uppercase tracking-widest"
                  >
                    {loading ? "Processing AI..." : "Submit to Groq"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
