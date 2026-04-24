"use client";

import { useEffect, useState } from "react";
import { useClient } from "@/hooks/useClient";
import PortalShell from "@/components/PortalShell";
import type { Engagement } from "@/lib/types";

const API = "http://localhost:8000/api";

const ENGAGEMENT_STATUS: Record<string, { label: string; cls: string }> = {
  active:    { label: "Active",    cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  on_hold:   { label: "On Hold",   cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  completed: { label: "Completed", cls: "bg-primary/20 text-primary border-primary/30" },
  cancelled: { label: "Cancelled", cls: "bg-white/5 text-muted-foreground border-white/10" },
};

const MILESTONE_DOT: Record<string, string> = {
  not_started: "border-white/20 bg-transparent",
  in_progress: "border-primary bg-primary/20",
  completed:   "border-green-400 bg-green-400/20",
  overdue:     "border-red-400 bg-red-400/20",
};

const MILESTONE_BADGE: Record<string, string> = {
  not_started: "bg-white/5 text-muted-foreground",
  in_progress: "bg-primary/15 text-primary",
  completed:   "bg-green-500/15 text-green-300",
  overdue:     "bg-red-500/15 text-red-300",
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function EngagementsPage() {
  const { client, ready } = useClient();
  const [engagements, setEngagements] = useState<Engagement[] | null>(null);

  useEffect(() => {
    if (!ready || !client) return;
    fetch(`${API}/client/${client.client_id}/engagements/`)
      .then(r => r.json())
      .then(d => setEngagements(d.engagements ?? []));
  }, [ready, client]);

  return (
    <PortalShell heading="Engagements">
      {(!ready || engagements === null) ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-[10px] uppercase tracking-widest text-primary animate-pulse">Loading engagements…</span>
        </div>
      ) : (
        <div className="p-8 mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">

          {engagements.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground">
              <div className="text-5xl mb-6 opacity-20">◈</div>
              <p className="text-[10px] uppercase tracking-widest">No active engagements. Engagements begin once a quote is accepted and a consultant is assigned.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {engagements.map(e => {
                const s = ENGAGEMENT_STATUS[e.status] ?? { label: e.status, cls: "bg-white/5 text-muted-foreground border-white/10" };
                const done = e.milestones.filter(m => m.status === "completed").length;
                const total = e.milestones.length;

                return (
                  <div key={e.id} className="bg-secondary/20 border border-white/5 rounded-sm overflow-hidden">

                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-sm font-bold border ${s.cls}`}>
                            {s.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Started {e.start_date}
                          </span>
                          {e.end_date && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              Ends {e.end_date}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {e.scope.map(sc => (
                            <span key={sc} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-background/60 border border-white/10 text-muted-foreground rounded-sm">
                              {sc}
                            </span>
                          ))}
                        </div>
                      </div>
                      {total > 0 && (
                        <div className="text-right shrink-0">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Milestones</div>
                          <div className="text-2xl font-heading text-primary">
                            {done}<span className="text-muted-foreground text-base">/{total}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Consultant */}
                    <div className="p-6 border-b border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Assigned Consultant</div>
                      {e.consultant ? (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-sm bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/10 shrink-0">
                            {initials(e.consultant.full_name)}
                          </div>
                          <div>
                            <div className="font-heading text-lg">{e.consultant.full_name}</div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                              {e.consultant.years_experience} yrs exp · {e.consultant.rating.toFixed(1)} ★
                            </div>
                            <p className="text-sm text-muted-foreground font-sans mt-2 leading-relaxed max-w-xl">
                              {e.consultant.bio}
                            </p>
                            {e.consultant.domain_expertise?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {e.consultant.domain_expertise.map(d => (
                                  <span key={d} className="text-[10px] px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm uppercase tracking-wider">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            )}
                            {e.consultant.linkedin_url && (
                              <a
                                href={e.consultant.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-widest text-primary hover:underline mt-3 inline-block"
                              >
                                LinkedIn →
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground font-sans flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                          Consultant assignment in progress, our team is matching the right expert for your project.
                        </div>
                      )}
                    </div>

                    {/* Milestones */}
                    {total > 0 && (
                      <div className="p-6">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">Milestones</div>
                        <div className="space-y-1">
                          {e.milestones.map((m, i) => (
                            <div key={m.id} className="flex items-start gap-4">
                              <div className="flex flex-col items-center shrink-0 pt-0.5">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${MILESTONE_DOT[m.status] ?? "border-white/20"}`}>
                                  {m.status === "completed" && (
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  )}
                                  {m.status === "in_progress" && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  )}
                                </div>
                                {i < total - 1 && <div className="w-px flex-1 min-h-[1.5rem] bg-white/10 mt-1" />}
                              </div>
                              <div className="pb-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-sm font-sans">{m.name}</span>
                                  <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${MILESTONE_BADGE[m.status] ?? "bg-white/5 text-muted-foreground"}`}>
                                    {m.status.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                                  Due {m.due_date} · {m.owner}
                                </div>
                                {m.notes && (
                                  <p className="text-xs text-muted-foreground font-sans mt-1">{m.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
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
