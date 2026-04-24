"use client";

import { useEffect, useState } from "react";
import { useClient } from "@/hooks/useClient";
import PortalShell from "@/components/PortalShell";
import type { Quote, ClientProfile } from "@/lib/types";

const API = "http://localhost:8000/api";

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}


const QUOTE_STATUS: Record<string, { label: string; cls: string }> = {
  pending_admin:      { label: "Under Review",       cls: "bg-white/5 text-muted-foreground border-white/10" },
  sent_to_client:     { label: "Awaiting Decision",  cls: "bg-primary/20 text-primary border-primary/30" },
  revision_requested: { label: "Revision Requested", cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  accepted:           { label: "Accepted",            cls: "bg-green-500/20 text-green-300 border-green-500/30" },
};

function ConfidenceBar({ score }: { score: number }) {
  const pctVal = Math.round(score * 100);
  const color = pctVal >= 80 ? "bg-green-400" : pctVal >= 60 ? "bg-primary" : "bg-yellow-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${pctVal}%` }} />
      </div>
      <span className="text-sm font-sans font-medium shrink-0">{pctVal}%</span>
    </div>
  );
}

export default function QuotesPage() {
  const { client, ready } = useClient();
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);

  useEffect(() => {
    if (!ready || !client) return;
    fetch(`${API}/client/${client.client_id}/quotes/`)
      .then(r => r.json())
      .then(d => {
        setQuotes(d.quotes ?? []);
        setProfile(d.client ?? null);
      });
  }, [ready, client]);

  return (
    <PortalShell heading="Quotes & Pricing">
      {(!ready || quotes === null) ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-[10px] uppercase tracking-widest text-primary animate-pulse">Loading quotes…</span>
        </div>
      ) : (
        <div className="p-8 mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-10">

          {/* ── Project submission recap ── */}
          {profile && (
            <div className="bg-secondary/20 border border-white/5 rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Your Project Submission</div>
              </div>

              <div className="px-6 py-5 border-b border-white/5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Project Description</div>
                {profile.project_summary
                  ? <p className="text-sm font-sans leading-relaxed text-foreground/90 whitespace-pre-wrap">{profile.project_summary}</p>
                  : <p className="text-sm font-sans text-muted-foreground">—</p>
                }
              </div>

              <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-3 gap-6 border-b border-white/5">
                {([
                  ["Organisation",  profile.organization_name],
                  ["Contact",       profile.contact_name],
                  ["Country",       profile.country],
                  ["Project Stage", profile.project_stage],
                  ["Budget Range",  profile.budget_range],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
                    <div className="text-sm font-sans">{value || "—"}</div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.domain_tags?.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Industry Verticals</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.domain_tags.map(t => (
                        <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.engagement_scope?.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Services Requested</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.engagement_scope.map(s => (
                        <span key={s} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-background/60 border border-white/10 text-muted-foreground rounded-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Quotes ── */}
          {quotes.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <div className="text-5xl mb-6 opacity-20">◈</div>
              <p className="text-[10px] uppercase tracking-widest">No quotes yet. Your AI-generated quote will appear here once your engagement is processed.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {quotes.map(q => {
                const s = QUOTE_STATUS[q.status] ?? { label: q.status, cls: "bg-white/5 text-muted-foreground border-white/10" };
                return (
                  <div key={q.id} className="bg-secondary/20 border border-white/5 rounded-sm overflow-hidden">

                    {/* Quote header */}
                    <div className="px-6 py-5 border-b border-white/5 flex items-start justify-between gap-6 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-sm font-bold border ${s.cls}`}>
                          {s.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {new Date(q.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                          Final Price
                        </div>
                        <div className="text-3xl font-heading text-primary">{fmt(q.final_price)}</div>
                      </div>
                    </div>

                    {/* Scope tags */}
                    {q.scope.length > 0 && (
                      <div className="px-6 py-4 border-b border-white/5 flex flex-wrap gap-2">
                        {q.scope.map(sc => (
                          <span key={sc} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-background/60 border border-white/10 text-muted-foreground rounded-sm">
                            {sc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI pricing metrics */}
                    <div className="px-6 py-6 border-b border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">AI Pricing Analysis</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">AI Recommended</div>
                          <div className="text-xl font-heading text-primary">{fmt(q.ai_recommended_price)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Price Range</div>
                          <div className="text-sm font-sans font-medium">{fmt(q.ai_price_range_low)} – {fmt(q.ai_price_range_high)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Est. Duration</div>
                          <div className="text-sm font-sans font-medium">{q.ai_estimated_weeks} weeks</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Project Stage</div>
                          <div className="text-sm font-sans font-medium">{q.stage || "—"}</div>
                        </div>
                      </div>

                      {/* Confidence bar */}
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">AI Confidence Score</div>
                        <ConfidenceBar score={q.ai_confidence_score} />
                      </div>
                    </div>

                    {/* AI rationale — always visible */}
                    <div className="px-6 py-6 border-b border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">AI Pricing Rationale</div>
                      <p className="text-sm text-foreground/80 font-sans leading-relaxed border-l-2 border-primary/40 pl-4 italic">
                        {q.ai_rationale}
                      </p>
                    </div>

                    {/* AI Scope of Work — Only if rationale is defined */}
                    {q.ai_rationale && q.ai_scope_of_work && (
                      <div className="px-6 py-8 border-b border-white/5 bg-primary/5">
                        <div className="mb-6">
                          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">AI Strategic Scope of Work</h4>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Understanding & Engagement Architecture</p>
                        </div>
                        <div className="text-sm text-foreground/90 font-sans leading-relaxed">
                          {q.ai_scope_of_work}
                        </div>
                      </div>
                    )}


                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </PortalShell>
  );
}
