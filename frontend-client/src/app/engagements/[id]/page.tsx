"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useClient } from "@/hooks/useClient";
import PortalShell from "@/components/PortalShell";
import type { Engagement } from "@/lib/types";
import { Button } from "@/components/ui/button";

const API = "http://localhost:8000/api";

const ENGAGEMENT_STATUS: Record<string, { label: string; cls: string }> = {
  active:    { label: "Active",    cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  on_hold:   { label: "On Hold",   cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  completed: { label: "Completed", cls: "bg-primary/20 text-primary border-primary/30" },
  cancelled: { label: "Cancelled", cls: "bg-white/5 text-muted-foreground border-white/10" },
};

const MILESTONE_DOT: Record<string, string> = {
  not_started: "border-white/20 bg-transparent",
  in_progress: "border-primary bg-primary/20 shadow-[0_0_8px_rgba(200,169,106,0.3)]",
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

export default function EngagementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { client, ready } = useClient();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!ready || !params.id) return;
    fetch(`${API}/engagement/${params.id}/`)
      .then(r => r.json())
      .then(d => {
        if (d.engagement) setEngagement(d.engagement);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready, params.id]);

  const handlePayment = async (installments: number) => {
    if (!engagement) return;
    const res = await fetch(`${API}/payments/process/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engagement_id: engagement.id, installments })
    });
    if (res.ok) window.location.reload();
  };

  if (!ready || loading) {
    return (
      <PortalShell heading="Project Details">
        <div className="flex items-center justify-center h-64">
          <span className="text-[10px] uppercase tracking-widest text-primary animate-pulse">Loading project details…</span>
        </div>
      </PortalShell>
    );
  }

  if (!engagement) {
    return (
      <PortalShell heading="Project Not Found">
        <div className="p-8 text-center py-32">
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">We couldn't find the requested engagement.</p>
          <Button onClick={() => router.push("/engagements")} variant="outline" className="uppercase tracking-widest text-[10px]">
            Back to Engagements
          </Button>
        </div>
      </PortalShell>
    );
  }

  const s = ENGAGEMENT_STATUS[engagement.status] ?? { label: engagement.status, cls: "bg-white/5 text-muted-foreground border-white/10" };
  const done = engagement.milestones.filter(m => m.status === "completed").length;
  const total = engagement.milestones.length;
  const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <PortalShell heading={engagement.scope[0] || "Project Details"}>
      <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
        
        {/* Lock System: Matching takes priority, then Payment */}
        {!engagement.consultant ? (
          <div className="fixed inset-0 z-[100] bg-[#0B1C2C]/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-8 shadow-[0_0_30px_rgba(200,169,106,0.3)]">
               <span className="text-4xl animate-pulse">◈</span>
            </div>
            <h3 className="text-3xl font-heading mb-4">Strategic Matching in Progress</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-widest max-w-md mb-12 leading-relaxed">
              Our vetting engine is currently analyzing over 1,200 domain experts to find the perfect strategic match for your specific scope.
            </p>
            
            <div className="flex flex-col gap-4 w-full max-w-sm">
               <div className="bg-white/5 border border-white/10 p-6 rounded-sm mb-6">
                  <div className="flex items-center justify-between mb-4 text-left">
                     <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Matching Status</span>
                     <span className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse">Scanning Global Network</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-2/3" />
                  </div>
               </div>
               
               <Button 
                onClick={() => router.push("/engagements")} 
                variant="outline" 
                className="text-[10px] uppercase tracking-widest border-white/10 h-14"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        ) : engagement.payment_status === "unpaid" ? (
          <div className="fixed inset-0 z-[100] bg-[#0B1C2C]/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-[0_0_20px_rgba(200,169,106,0.2)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className="text-2xl font-heading mb-3">Project Activation Required</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] max-w-sm mb-10 leading-relaxed">
              Complete your activation payment to secure your strategic expert and unlock project milestones.
            </p>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="bg-primary text-secondary hover:bg-primary/90 rounded-sm uppercase tracking-widest text-[11px] font-bold h-14 px-12 shadow-xl"
              >
                Unlock Project →
              </Button>
              <Button 
                onClick={() => router.push("/engagements")} 
                variant="ghost" 
                className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-white"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        ) : null}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
            <div className="bg-secondary/95 border border-white/10 w-full max-w-lg rounded-sm overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
               <div className="p-8 border-b border-white/5 text-left">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xl font-heading">Activation Plans</h3>
                     <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                     </button>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
                     Select a funding structure for your engagement. Fully secured payments via Stripe.
                  </p>
               </div>
               
               <div className="p-8 space-y-4">
                  <button 
                    onClick={() => handlePayment(1)}
                    className="w-full p-6 bg-primary/5 border border-primary/20 hover:border-primary/50 transition-all rounded-sm group text-left"
                  >
                     <div className="flex items-center justify-between">
                        <div>
                           <div className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold mb-1">Single Payment</div>
                           <div className="text-base font-sans font-medium">Full Project Funding</div>
                        </div>
                        <div className="text-primary opacity-0 group-hover:opacity-100 transition-all">→</div>
                     </div>
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => handlePayment(2)}
                       className="p-6 bg-white/5 border border-white/5 hover:border-white/20 transition-all rounded-sm group text-left"
                     >
                        <div className="text-sm font-sans font-medium mb-1 text-foreground/90">2-Part</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Initial 50%</div>
                     </button>
                     <button 
                       onClick={() => handlePayment(3)}
                       className="p-6 bg-white/5 border border-white/5 hover:border-white/20 transition-all rounded-sm group text-left"
                     >
                        <div className="text-sm font-sans font-medium mb-1 text-foreground/90">3-Part</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Initial 33%</div>
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Navigation / Actions */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={() => router.push("/engagements")} 
            variant="ghost" 
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all p-0 h-auto"
          >
            ← Back to Engagements
          </Button>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-sm uppercase tracking-widest text-[9px] border-white/10 hover:border-primary/40 transition-all">
                Project Logs
             </Button>
             <Button className="rounded-sm uppercase tracking-widest text-[9px] bg-primary text-secondary hover:bg-primary/90 transition-all">
                Contact Consultant
             </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Project Overview Card */}
            <div className="bg-secondary/20 border border-white/5 rounded-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-sm font-bold border ${s.cls}`}>
                  {s.label}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Engagement ID: {engagement.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <h2 className="text-3xl font-heading mb-4 leading-tight">{engagement.scope.join(" & ")}</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-8 border-t border-white/5 pt-8">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Start Date</div>
                  <div className="text-sm font-sans font-medium">{engagement.start_date}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">End Date</div>
                  <div className="text-sm font-sans font-medium">{engagement.end_date || "Continuous"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Milestones</div>
                  <div className="text-sm font-sans font-medium text-primary">{done} of {total} Complete</div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Overall Progress</div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(200,169,106,0.3)]" 
                    style={{ width: `${progressPercent}%` }}
                   />
                </div>
              </div>
            </div>

            {/* Milestones Card */}
            <div className="bg-secondary/20 border border-white/5 rounded-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Strategic Milestones</h3>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Project Roadmap & Execution Timeline</p>
              </div>
              <div className="p-8">
                {total === 0 ? (
                  <p className="text-sm text-muted-foreground italic font-sans">No milestones defined for this engagement yet.</p>
                ) : (
                  <div className="space-y-0 relative">
                    {/* Vertical line through dots */}
                    <div className="absolute left-[7.5px] top-2 bottom-6 w-px bg-white/5" />
                    
                    {engagement.milestones.map((m, i) => (
                      <div key={m.id} className="flex items-start gap-6 relative pb-10 last:pb-0">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${MILESTONE_DOT[m.status] ?? "border-white/20"}`}>
                          {m.status === "completed" && (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 -mt-1">
                          <div className="flex items-center justify-between gap-4 mb-2">
                             <div className="flex items-center gap-3">
                                <h4 className="text-base font-sans font-medium">{m.name}</h4>
                                <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-bold ${MILESTONE_BADGE[m.status] ?? "bg-white/5 text-muted-foreground"}`}>
                                  {m.status.replace(/_/g, " ")}
                                </span>
                             </div>
                             <div className="text-[10px] text-muted-foreground uppercase tracking-widest shrink-0">
                                Due {m.due_date}
                             </div>
                          </div>
                          <div className="text-[10px] text-primary uppercase tracking-widest mb-3">Owner: {m.owner}</div>
                          {m.notes && (
                            <p className="text-sm text-muted-foreground/80 leading-relaxed font-sans border-l border-white/10 pl-4">
                              {m.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-8">
            
            {/* Consultant Profile */}
            <div className="bg-secondary/20 border border-white/5 rounded-sm overflow-hidden">
               <div className="px-6 py-5 border-b border-white/5">
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Assigned Consultant</h3>
               </div>
               <div className="p-6">
                 {engagement.consultant ? (
                    <div className="flex flex-col items-center text-center">
                       <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20 mb-4 shadow-inner">
                         {initials(engagement.consultant.full_name)}
                       </div>
                       <h4 className="text-lg font-heading mb-1">{engagement.consultant.full_name}</h4>
                       <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
                         Expert Consultant · {engagement.consultant.years_experience} yrs exp
                       </div>
                       
                       <p className="text-xs text-muted-foreground font-sans leading-relaxed mb-6 italic">
                         "{engagement.consultant.bio.length > 120 ? engagement.consultant.bio.slice(0, 120) + "..." : engagement.consultant.bio}"
                       </p>

                       <div className="flex flex-wrap justify-center gap-2 mb-6">
                         {engagement.consultant.domain_expertise?.slice(0, 3).map(d => (
                           <span key={d} className="text-[8px] px-2 py-0.5 bg-background/40 text-muted-foreground border border-white/10 rounded-full uppercase tracking-wider">
                             {d}
                           </span>
                         ))}
                       </div>

                       <Button variant="outline" className="w-full rounded-sm uppercase tracking-widest text-[9px] h-10 border-white/10 hover:border-primary/40 transition-all">
                         View Full Profile
                       </Button>
                    </div>
                 ) : (
                    <div className="text-center py-6">
                       <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 animate-pulse">
                         <span className="text-muted-foreground">◈</span>
                       </div>
                       <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
                         Consultant assignment<br/>in progress...
                       </p>
                    </div>
                 )}
               </div>
            </div>

            {/* Project Details Sidebar Card */}
            <div className="bg-secondary/20 border border-white/5 rounded-sm p-6">
               <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-6">Engagement Context</h3>
               
               <div className="space-y-6">
                 <div>
                   <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Primary Domain</div>
                   <div className="flex flex-wrap gap-2">
                     {engagement.client.domain_tags?.map(t => (
                        <span key={t} className="text-[9px] uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 text-muted-foreground rounded-sm">{t}</span>
                     ))}
                   </div>
                 </div>

                 <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Project Summary</div>
                    <p className="text-xs text-foreground/70 font-sans leading-relaxed line-clamp-6">
                      {engagement.client.project_summary}
                    </p>
                 </div>
               </div>
            </div>

          </div>

        </div>
      </div>
    </PortalShell>
  );
}
