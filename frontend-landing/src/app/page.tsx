"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DOMAIN_TAGS = [
  "Aerospace & Defense", "Agriculture & FoodTech", "Automotive & Mobility",
  "Chemicals & Materials", "Smart Infrastructure", "Consumer & Retail",
  "Digital Economy & ICT", "Energy & Utilities", "Financial Services",
  "Healthcare & Life Sciences", "Industrial & Manufacturing", "Media & Entertainment",
  "Private Equity", "Public Sector", "Telecommunications", "Transportation & Logistics",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What is Conssor?",
  "How does pricing work?",
  "What industries do you cover?",
  "How do I hire a consultant?",
];

const STEPS = [
  { label: "Identity" },
  { label: "Project" },
  { label: "Services" },
  { label: "Location & Budget" },
  { label: "Account Setup" },
];

const ENGAGEMENT_SCOPE = [
  "Strategy & Advisory", "Digital Transformation", "Financial Advisory",
  "Technical Architecture", "Market Research & Analysis", "Organizational Design",
  "M&A Due Diligence", "Product Development", "Operations Consulting",
];

const BUDGET_RANGES = [
  "Under $10,000", "$10,000 – $25,000", "$25,000 – $50,000",
  "$50,000 – $100,000", "$100,000 – $250,000", "$250,000+",
];

const PROJECT_STATUSES = [
  "Ideation", "Prototype / MVP", "Growth Stage", "Scale Stage", "M&A / Transaction",
];

interface FormData {
  fullName: string; email: string; phone: string;
  organizationName: string; projectIdea: string; project_status: string;
  domain_tags: string[]; engagement_scope: string[];
  country: string; budget_range: string;
  password: string; confirmPassword: string;
}

export default function LandingPage() {
  const [mode, setMode] = useState<"chat" | "onboarding">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Onboarding state
  const [step, setStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [isExistingEmail, setIsExistingEmail] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState<FormData>({
    fullName: "", email: "", phone: "", organizationName: "", projectIdea: "",
    project_status: "", domain_tags: [], engagement_scope: [],
    country: "", budget_range: "", password: "", confirmPassword: "",
  });

  const setField = (f: keyof FormData, v: string) => setForm(p => ({ ...p, [f]: v }));
  const toggleArr = (f: "domain_tags" | "engagement_scope", v: string) =>
    setForm(p => { const a = p[f] as string[]; return { ...p, [f]: a.includes(v) ? a.filter(x => x !== v) : [...a, v] }; });

  useEffect(() => { fetchAIReply([]); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const email = form.email.trim();
    setIsExistingEmail(false);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/check-email/", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setIsExistingEmail(data.exists === true);
      } catch { /* silent */ }
    }, 500);
  }, [form.email]);

  const fetchAIReply = async (msgs: ChatMessage[]) => {
    setIsTyping(true);
    try {
      const res = await fetch("http://localhost:8000/api/advisory/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages([...msgs, { role: "assistant", content: data.message }]);
      }
    } catch {
      setMessages([...msgs, { role: "assistant", content: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? chatInput).trim();
    if (!content || isTyping) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setChatInput("");
    await fetchAIReply(next);
  };

  const progress = isCompleted ? 100 : Math.round((step / STEPS.length) * 100);

  const canAdvance = () => {
    if (step === 0) return !!(form.fullName.trim() && form.email.trim() && form.phone.trim()) && !isExistingEmail;
    if (step === 1) return !!(form.projectIdea.trim() && form.project_status);
    if (step === 2) return form.domain_tags.length > 0 && form.engagement_scope.length > 0;
    if (step === 3) return !!(form.country.trim() && form.budget_range);
    if (step === 4) return form.password.length >= 8 && form.password === form.confirmPassword;
    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); setSubmitError("");
    try {
      const res = await fetch("http://localhost:8000/api/quotes/generate/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName, email: form.email, phone: form.phone,
          organizationName: form.organizationName,
          projectName: form.projectIdea.slice(0, 80), description: form.projectIdea,
          project_stage: form.project_status, domain_tags: form.domain_tags,
          engagement_scope: form.engagement_scope, country: form.country,
          budget_range: form.budget_range, password: form.password,
        }),
      });
      const result = await res.json();
      if (!res.ok) { setSubmitError(result.error || "Registration failed."); return; }
      setIsCompleted(true);
      setTimeout(() => {
        window.location.href = `http://localhost:3001/login?email=${encodeURIComponent(form.email)}`;
      }, 2000);
    } catch { setSubmitError("Something went wrong. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  const inputCls = "w-full bg-[#0B1C2C]/60 border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C8A96A]/60 transition-all font-sans";

  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 h-screen overflow-hidden bg-[#0B1C2C] text-white">

      {/* ── LEFT PANEL ── */}
      <div className="flex flex-col h-full overflow-y-auto p-8 hide-scrollbar bg-[#0B1C2C]">
        <div className="mx-auto flex-1 flex flex-col justify-center">
          <header className="mb-16">
            <div className="mb-6">
              <img
                src="https://customer-assets.emergentagent.com/job_c13d24bf-1e73-40e8-af88-f21bcf07446a/artifacts/xr9oswxa_g.png"
                alt="CONSSOR"
                className="h-8 w-auto"
              />
            </div>
            <h1 className="text-5xl lg:text-6xl font-heading mb-6 leading-tight tracking-tight font-medium">
              Collaborative Intelligence<br />
              <span className="text-[#C8A96A] italic">for the Future.</span>
            </h1>
            <p className="text-[#A1B0C0] text-lg leading-relaxed mb-10 font-sans tracking-wide">
              A premium, three-portal consulting marketplace connecting world-class
              organizations with vetted domain experts. Powered by our proprietary AI engagement pricing engine.
            </p>
            <div className="mb-4">
              <Button
                className="bg-[#C8A96A] text-[#0B1C2C] hover:bg-[#DCC48F] px-8 py-6 rounded-sm uppercase tracking-widest font-semibold transition-all shadow-lg border-none outline-none"
                onClick={() => document.getElementById("chat-input")?.focus()}
              >
                Find Your Consultant
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/consultant/login">
                <Button variant="outline" className="border-[#C8A96A] text-[#C8A96A] hover:bg-[#C8A96A]/10 px-6 py-6 rounded-sm uppercase tracking-widest font-semibold transition-all">
                  Consultant Login
                </Button>
              </Link>
              <Link href="/consultant/register">
                <Button variant="outline" className="border-[#C8A96A] text-[#C8A96A] hover:bg-[#C8A96A]/10 px-6 py-6 rounded-sm uppercase tracking-widest font-semibold transition-all">
                  Register
                </Button>
              </Link>
            </div>
          </header>

          <section className="mt-8 border-t border-white/10 pt-8">
            <h3 className="font-heading text-2xl mb-6 tracking-tight font-medium">Expertise Driven by AI.</h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {["Strategic Consulting", "Digital Transformation", "Financial Advisory", "Technical Consulting"].map(s => (
                <div key={s} className="p-6 bg-[#112A42]/50 border border-white/10 hover:border-[#C8A96A]/30 transition-all rounded-sm group cursor-default">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] group-hover:text-[#C8A96A] transition-colors">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-white/10 pt-8">
              <h4 className="font-heading text-xl mb-6 tracking-tight font-medium">16+ Global Industry Verticals</h4>
              <div className="flex flex-wrap gap-2">
                {DOMAIN_TAGS.map(v => (
                  <span key={v} className="text-[10px] uppercase tracking-[0.2em] bg-[#0B1C2C] border border-white/10 text-[#A1B0C0] px-3 py-1.5 rounded-sm hover:border-[#C8A96A]/50 hover:text-[#C8A96A] transition-colors cursor-default">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/10 text-[10px] text-[#A1B0C0] uppercase tracking-[0.2em] flex justify-between font-sans">
          <span>© 2026 CONSSOR</span>
          <span className="flex gap-4">
            <a href="#" className="hover:text-[#C8A96A] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#C8A96A] transition-colors">Terms</a>
          </span>
        </footer>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="relative hidden lg:flex flex-col h-full bg-[#112A42] border-l border-white/5 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1640027659327-96f1043e4278?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxkYXJrJTIwbmF2eSUyMGJsdWUlMjBhYnN0cmFjdCUyMGdvbGQlMjB0ZXh0dXJlfGVufDB8fHx8MTc3NTA3NzExM3ww&ixlib=rb-4.1.0&q=85')",
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        />

        {/* Vertical progress bar — onboarding only */}
        {mode === "onboarding" && (
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/5 z-40">
            <div
              className="absolute top-0 left-0 w-full bg-[#C8A96A] transition-all duration-700 shadow-[0_0_10px_rgba(200,169,106,0.3)]"
              style={{ height: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex flex-col h-full px-10 lg:px-14 py-12 relative z-10">

          {/* Top bar */}
          <div className="flex-none flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#C8A96A] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8A96A]">
                {mode === "chat" ? "Conssor AI — Ask me anything" : `Onboarding — ${STEPS[step]?.label}`}
              </span>
            </div>
            {mode === "chat" ? (
              <button
                onClick={() => setMode("onboarding")}
                className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 bg-[#C8A96A] text-[#0B1C2C] rounded-sm hover:bg-[#DCC48F] transition-all"
              >
                Start Journey →
              </button>
            ) : (
              <button
                onClick={() => setMode("chat")}
                className="text-[9px] uppercase tracking-widest text-[#A1B0C0] hover:text-[#C8A96A] border border-white/10 px-3 py-1.5 rounded-sm hover:border-[#C8A96A]/30 transition-all"
              >
                ← Back to chat
              </button>
            )}
          </div>

          {/* ── CHAT MODE ── */}
          {mode === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 hide-scrollbar pr-1">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[82%] px-4 py-3 rounded-sm text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#C8A96A] text-[#0B1C2C] font-medium"
                        : "bg-[#0B1C2C]/60 border border-white/10 text-[#D0DCE8]"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#0B1C2C]/60 border border-white/10 px-4 py-3 rounded-sm flex gap-1 items-center">
                      {[0, 150, 300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 bg-[#C8A96A]/60 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {messages.filter(m => m.role === "user").length === 0 && !isTyping && (
                <div className="flex-none flex flex-wrap gap-2 mb-3">
                  {QUICK_PROMPTS.map(q => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-sm border border-white/10 text-[#A1B0C0] hover:border-[#C8A96A]/40 hover:text-[#C8A96A] transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-none flex gap-2">
                <input
                  id="chat-input"
                  className="flex-1 bg-[#0B1C2C]/60 border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C8A96A]/60 transition-all disabled:opacity-40"
                  placeholder="Ask about Conssor…"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                  disabled={isTyping}
                />
                <button onClick={() => sendMessage()} disabled={isTyping || !chatInput.trim()}
                  className="px-4 py-3 bg-[#C8A96A] text-[#0B1C2C] rounded-sm hover:bg-[#DCC48F] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <SendIcon />
                </button>
              </div>
            </>
          )}

          {/* ── ONBOARDING MODE ── */}
          {mode === "onboarding" && (
            <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar">
              {isCompleted ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-[#C8A96A] text-[#0B1C2C] p-8 rounded-sm font-bold flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                    <div className="text-xl tracking-widest uppercase">Onboarding Complete</div>
                    <p className="text-[10px] opacity-70 tracking-widest">Redirecting to your portal...</p>
                    <div className="w-12 h-0.5 bg-[#0B1C2C] animate-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Step breadcrumb */}
                  <div className="flex-none flex items-center gap-2 mb-8">
                    {STEPS.map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                          i < step ? "bg-[#C8A96A] text-[#0B1C2C]"
                          : i === step ? "bg-[#C8A96A]/20 border border-[#C8A96A] text-[#C8A96A]"
                          : "bg-white/5 border border-white/10 text-white/30"
                        }`}>
                          {i < step
                            ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            : i + 1}
                        </div>
                        {i < STEPS.length - 1 && <div className={`h-[1px] w-5 ${i < step ? "bg-[#C8A96A]" : "bg-white/10"}`} />}
                      </div>
                    ))}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-y-auto hide-scrollbar">

                    {step === 0 && (
                      <div className="space-y-5">
                        <div className="mb-6">
                          <h2 className="text-xl font-heading font-medium tracking-tight">Let's start with your details</h2>
                          <p className="text-[#A1B0C0] text-xs tracking-wide mt-1">We'll use this to set up your advisory profile.</p>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Full Name</label>
                          <input className={inputCls} placeholder="Jane Smith" value={form.fullName} onChange={e => setField("fullName", e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Email Address</label>
                          <input className={inputCls} type="email" placeholder="jane@company.com" value={form.email} onChange={e => setField("email", e.target.value)} />
                        </div>
                        {isExistingEmail && (
                          <div className="flex items-start gap-4 bg-[#C8A96A]/10 border border-[#C8A96A]/30 rounded-sm p-4 animate-in fade-in duration-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96A] mt-1.5 shrink-0 animate-pulse" />
                            <div className="flex-1">
                              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C8A96A] font-bold mb-1">Account Found</p>
                              <p className="text-[#A1B0C0] text-xs leading-relaxed">This email is already registered.</p>
                            </div>
                            <a href={`http://localhost:3001/login?email=${encodeURIComponent(form.email)}`}
                              className="shrink-0 px-4 py-2 bg-[#C8A96A] text-[#0B1C2C] text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#DCC48F] transition-all">
                              Login →
                            </a>
                          </div>
                        )}
                        {!isExistingEmail && (
                          <div>
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Phone Number</label>
                            <input className={inputCls} type="tel" placeholder="9876543210" value={form.phone} onChange={e => setField("phone", e.target.value)} />
                          </div>
                        )}
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-5">
                        <div className="mb-6">
                          <h2 className="text-xl font-heading font-medium tracking-tight">Tell us about your project</h2>
                          <p className="text-[#A1B0C0] text-xs tracking-wide mt-1">Give us context on what you're building or solving.</p>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Organization Name <span className="text-white/30 normal-case">(optional)</span></label>
                          <input className={inputCls} placeholder="Acme Corp" value={form.organizationName} onChange={e => setField("organizationName", e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Project / Idea Description</label>
                          <textarea className={inputCls + " resize-none min-h-[90px]"} placeholder="Describe your project vision..." value={form.projectIdea} onChange={e => setField("projectIdea", e.target.value)} rows={3} />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Current Stage</label>
                          <select className={inputCls + " cursor-pointer"} value={form.project_status} onChange={e => setField("project_status", e.target.value)}>
                            <option value="" disabled>Select stage...</option>
                            {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-7">
                        <div className="mb-2">
                          <h2 className="text-xl font-heading font-medium tracking-tight">Industry & Services</h2>
                          <p className="text-[#A1B0C0] text-xs tracking-wide mt-1">Select all that apply.</p>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-3">Industry Verticals</label>
                          <div className="flex flex-wrap gap-2">
                            {DOMAIN_TAGS.map(tag => (
                              <button key={tag} type="button" onClick={() => toggleArr("domain_tags", tag)}
                                className={`text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-sm border transition-all duration-150 ${
                                  form.domain_tags.includes(tag) ? "bg-[#C8A96A] border-[#C8A96A] text-[#0B1C2C] font-bold" : "bg-transparent border-white/10 text-[#A1B0C0] hover:border-[#C8A96A]/40 hover:text-[#C8A96A]"
                                }`}>{tag}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-3">Consulting Services Needed</label>
                          <div className="flex flex-wrap gap-2">
                            {ENGAGEMENT_SCOPE.map(svc => (
                              <button key={svc} type="button" onClick={() => toggleArr("engagement_scope", svc)}
                                className={`text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-sm border transition-all duration-150 ${
                                  form.engagement_scope.includes(svc) ? "bg-[#C8A96A] border-[#C8A96A] text-[#0B1C2C] font-bold" : "bg-transparent border-white/10 text-[#A1B0C0] hover:border-[#C8A96A]/40 hover:text-[#C8A96A]"
                                }`}>{svc}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-5">
                        <div className="mb-6">
                          <h2 className="text-xl font-heading font-medium tracking-tight">Location & Budget</h2>
                          <p className="text-[#A1B0C0] text-xs tracking-wide mt-1">Helps us match the right consultant and price the engagement.</p>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Country / Region</label>
                          <input className={inputCls} placeholder="United States" value={form.country} onChange={e => setField("country", e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Approximate Budget Range</label>
                          <select className={inputCls + " cursor-pointer"} value={form.budget_range} onChange={e => setField("budget_range", e.target.value)}>
                            <option value="" disabled>Select range...</option>
                            {BUDGET_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-5">
                        <div className="mb-6">
                          <h2 className="text-xl font-heading font-medium tracking-tight">Create your account</h2>
                          <p className="text-[#A1B0C0] text-xs tracking-wide mt-1">Set a password to access your client portal.</p>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Password</label>
                          <div className="relative">
                            <input type={showPw ? "text" : "password"} className={inputCls + " pr-10"} placeholder="Min. 8 characters" value={form.password} onChange={e => setField("password", e.target.value)} />
                            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1B0C0] hover:text-[#C8A96A] transition-colors">
                              {showPw ? <EyeOff /> : <EyeOn />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A1B0C0] mb-2">Confirm Password</label>
                          <div className="relative">
                            <input type={showCpw ? "text" : "password"} className={inputCls + " pr-10"} placeholder="Re-enter password" value={form.confirmPassword} onChange={e => setField("confirmPassword", e.target.value)} />
                            <button type="button" onClick={() => setShowCpw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1B0C0] hover:text-[#C8A96A] transition-colors">
                              {showCpw ? <EyeOff /> : <EyeOn />}
                            </button>
                          </div>
                        </div>
                        {form.confirmPassword && form.password !== form.confirmPassword && (
                          <p className="text-red-400 text-[10px] uppercase tracking-wider">Passwords do not match.</p>
                        )}
                        {submitError && <p className="text-red-400 text-[10px] uppercase tracking-wider">{submitError}</p>}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex-none flex justify-between items-center mt-8">
                    <button onClick={() => { setStep(s => s - 1); setSubmitError(""); }} disabled={step === 0}
                      className="text-[10px] uppercase tracking-[0.3em] text-[#A1B0C0] hover:text-[#C8A96A] disabled:opacity-0 disabled:pointer-events-none transition-all">
                      ← Back
                    </button>
                    {step < STEPS.length - 1 ? (
                      <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
                        className="bg-[#C8A96A] text-[#0B1C2C] hover:bg-[#DCC48F] px-8 py-3 rounded-sm uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        Continue →
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={!canAdvance() || isSubmitting}
                        className="bg-[#C8A96A] text-[#0B1C2C] hover:bg-[#DCC48F] px-8 py-3 rounded-sm uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        {isSubmitting ? "Processing..." : "Complete Onboarding →"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>

    </main>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function EyeOn() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88L3 3m6.07 6.07a3.5 3.5 0 114.95 4.95M17.35 17.35L21 21M9.88 9.88A9.45 9.45 0 1014.12 14.12M17.35 17.35a9.38 9.38 0 002.83-5.35c0-4.42-3.58-8-8-8a9.41 9.41 0 00-5.23 1.62" />
    </svg>
  );
}
