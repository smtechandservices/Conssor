"use client";

import { useEffect, useState } from "react";
import { useClient } from "@/hooks/useClient";
import PortalShell from "@/components/PortalShell";
import type { Engagement } from "@/lib/types";
import { Button } from "@/components/ui/button";

const API = "http://localhost:8000/api";

const ENGAGEMENT_STATUS: Record<string, { label: string; cls: string }> = {
  assigned:  { label: "Assigned",  cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
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
  const [payments, setPayments] = useState<any[] | null>(null);
  const [selectedForPayment, setSelectedForPayment] = useState<Engagement | null>(null);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!ready || !client) return;
    
    // Fetch Engagements
    fetch(`${API}/client/${client.client_id}/engagements/`)
      .then(r => r.json())
      .then(d => setEngagements(d.engagements ?? []));

    // Fetch Payments
    fetch(`${API}/client/${client.client_id}/payments/`)
      .then(r => r.json())
      .then(d => setPayments(d.payments ?? []));
  }, [ready, client]);

  const handlePayment = async (engagementId: string, installments: number, action: string = 'initial') => {
    const res = await fetch(`${API}/payments/process/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engagement_id: engagementId, installments, action })
    });
    if (res.ok) {
      setIsPaymentSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

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
                const isUnpaid = e.payment_status === "unpaid";
                const isMatching = !e.consultant && e.status !== "assigned";
                const isLocked = isUnpaid || (isMatching && e.status !== "assigned");
                const s = ENGAGEMENT_STATUS[e.status] ?? { label: e.status, cls: "bg-white/5 text-muted-foreground border-white/10" };
                const done = e.milestones.filter(m => m.status === "completed").length;
                const total = e.milestones.length;
                const isPartiallyPaid = e.payment_status === "partially_paid";

                return (
                  <div key={e.id} className={`bg-secondary/20 border border-white/5 rounded-sm overflow-hidden relative transition-all duration-500 ${isLocked ? "grayscale-[0.8] opacity-70" : ""}`}>
                    
                    {/* Matching Lock Overlay (Takes priority: Matching first, then Payment) */}
                    {isMatching ? (
                      <div className="absolute inset-0 z-50 bg-[#0B1C2C]/90 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                        <h3 className="text-lg font-heading mb-2">Matching in Progress</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] max-w-sm mb-4 leading-relaxed">
                          Our AI is finalizing the selection of best expert for your specific project needs.
                        </p>
                        <div className="flex items-center gap-2 text-[9px] text-primary uppercase tracking-widest font-bold">
                           <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                           Analyzing 100+ Experts
                        </div>
                      </div>
                    ) : isUnpaid ? (
                      /* Payment Lock Overlay */
                      <div className="absolute inset-0 z-40 bg-[#0B1C2C]/90 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                        <h3 className="text-lg font-heading mb-2">Activation Required</h3>
                        <p className="text-[10px] text-primary uppercase tracking-[0.2em] max-w-xs mb-8 leading-relaxed">
                          Initialize project funding to secure your consultant and unlock milestones.
                        </p>
                        
                        <Button 
                          onClick={() => setSelectedForPayment(e)}
                          className="cursor-pointer bg-primary text-secondary hover:bg-primary/90 rounded-sm uppercase tracking-widest text-[10px] font-bold h-12 px-10 shadow-lg transition-all"
                        >
                          Unlock Project →
                        </Button>
                      </div>
                    ) : null}

                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-sm font-bold border ${s.cls}`}>
                            {s.label}
                          </span>
                          <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-sm font-bold border ${e.payment_status === 'paid' ? 'bg-green-500/20 text-green-300 border-green-500/30' : e.payment_status === 'partially_paid' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                            {e.payment_status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Started {e.start_date}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {e.scope.map(sc => (
                            <span key={sc} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-background/60 border border-white/10 text-muted-foreground rounded-sm">
                              {sc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {isPartiallyPaid && (
                          <div className="shrink-0">
                             <Button 
                               onClick={() => setSelectedForPayment(e)}
                               variant="outline" 
                               className="rounded-sm uppercase tracking-widest text-[9px] border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 transition-all"
                             >
                               Pay Balance →
                             </Button>
                          </div>
                        )}
                        {total > 0 && (
                          <div className="text-right shrink-0">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Milestones</div>
                            <div className="text-2xl font-heading text-primary">
                              {done}<span className="text-muted-foreground text-base">/{total}</span>
                            </div>
                          </div>
                        )}
                      </div>
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
                              {e.consultant.years_experience || 0} yrs exp · {(e.consultant.rating || 0).toFixed(1)} ★
                            </div>
                            <p className="text-sm text-muted-foreground font-sans mt-2 leading-relaxed max-w-xl">
                              {e.consultant.bio || "No bio available."}
                            </p>
                            {(e.consultant.domain_expertise?.length ?? 0) > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {e.consultant.domain_expertise?.map(d => (
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

          {/* Transaction History Section */}
          <div className="mt-16 pt-12 border-t border-white/5">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-heading tracking-tight">Transaction History</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Payment logs & Funding status</p>
               </div>
            </div>

            {payments && payments.length > 0 ? (
               <div className="bg-secondary/10 border border-white/5 rounded-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                           <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Date</th>
                           <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Project</th>
                           <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Installment</th>
                           <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold text-right">Amount</th>
                           <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold text-center">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {payments.map(p => (
                           <tr key={p.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-5 text-sm font-sans text-muted-foreground">{p.paid_at}</td>
                              <td className="px-6 py-5">
                                 <div className="text-sm font-sans font-medium text-foreground/90">{p.engagement_scope[0] || "Consulting Services"}</div>
                                 <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">ID: {p.gateway_payment_id}</div>
                              </td>
                              <td className="px-6 py-5 text-sm font-sans text-muted-foreground">{p.installment}</td>
                              <td className="px-6 py-5 text-sm font-sans font-medium text-right text-primary">
                                 {p.currency} {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-5 text-center">
                                 <span className={`text-[8px] uppercase tracking-widest px-2 py-1 rounded-sm font-bold bg-green-500/10 text-green-400 border border-green-500/20`}>
                                    {p.status}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            ) : (
               <div className="p-12 border border-dashed border-white/10 rounded-sm text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">No transaction history found.</p>
               </div>
            )}
          </div>

        </div>
      )}

      {/* Payment Modal */}
      {selectedForPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#0B1C2C]/80 backdrop-blur-md" onClick={() => !isPaymentSuccess && setSelectedForPayment(null)} />
          <div className="bg-secondary/95 border border-white/10 w-full max-w-lg rounded-sm overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
             
             {isPaymentSuccess ? (
                <div className="p-16 text-center animate-in fade-in zoom-in duration-500">
                   <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                         <polyline points="20 6 9 17 4 12"/>
                      </svg>
                   </div>
                   <h3 className="text-2xl font-heading mb-3">Payment Successful</h3>
                   <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                      Your engagement has been funded.<br/>The portal is updating...
                   </p>
                </div>
             ) : (
                <>
             <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-heading">Select Payment Plan</h3>
                   <button onClick={() => setSelectedForPayment(null)} className="text-muted-foreground hover:text-white transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                   </button>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-8 bg-white/5 p-5 rounded-sm border border-white/5">
                   <div>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Total Amount</div>
                      <div className="text-lg font-heading text-white">
                        ${(selectedForPayment.financials?.total_price || 0).toLocaleString()}
                      </div>
                   </div>
                   <div>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Status</div>
                      <div className="text-lg font-heading text-primary">
                        {selectedForPayment.financials?.paid_count || 0}/{selectedForPayment.financials?.total_parts || 1} <span className="text-[10px] text-muted-foreground uppercase">Paid</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                   <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Funding Progress</div>
                   <div className="text-[10px] text-primary font-bold uppercase tracking-widest">
                      ${(selectedForPayment.financials?.paid_amount || 0).toLocaleString()} of ${(selectedForPayment.financials?.total_price || 0).toLocaleString()}
                   </div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                   <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${((selectedForPayment.financials?.paid_amount || 0) / (selectedForPayment.financials?.total_price || 1)) * 100}%` }}
                   />
                </div>

                <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
                   {selectedForPayment.payment_status === "unpaid" 
                    ? "Choose how you would like to fund this engagement. All payments are secured."
                    : `Remaining balance: $${(selectedForPayment.financials?.remaining_amount || 0).toLocaleString()}.`}
                </p>
             </div>
             
             <div className="p-8 space-y-4">
                {selectedForPayment.payment_status === "unpaid" ? (
                  <>
                    <button 
                      onClick={() => handlePayment(selectedForPayment.id, 1, 'initial')}
                      className="w-full p-6 bg-primary/5 border border-primary/20 hover:border-primary/50 transition-all rounded-sm group text-left"
                    >
                       <div className="flex items-center justify-between">
                          <div>
                             <div className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold mb-1">Recommended</div>
                             <div className="text-base font-sans font-medium">Pay in Full</div>
                          </div>
                          <div className="text-primary opacity-0 group-hover:opacity-100 transition-all">→</div>
                       </div>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => handlePayment(selectedForPayment.id, 2, 'initial')}
                         className="p-6 bg-white/5 border border-white/5 hover:border-white/20 transition-all rounded-sm group text-left"
                       >
                          <div className="text-sm font-sans font-medium mb-1 text-foreground/90">2 Installments</div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">50% upfront</div>
                       </button>
                       <button 
                         onClick={() => handlePayment(selectedForPayment.id, 3, 'initial')}
                         className="p-6 bg-white/5 border border-white/5 hover:border-white/20 transition-all rounded-sm group text-left"
                       >
                          <div className="text-sm font-sans font-medium mb-1 text-foreground/90">3 Installments</div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">33% upfront</div>
                       </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handlePayment(selectedForPayment.id, 0, 'settle')}
                      className="w-full p-6 bg-primary/10 border border-primary/30 hover:border-primary/60 transition-all rounded-sm group text-left"
                    >
                       <div className="flex items-center justify-between">
                          <div>
                             <div className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold mb-1">Settle Account</div>
                             <div className="text-base font-sans font-medium">Clear Outstanding Balance</div>
                             <div className="text-[9px] text-primary/70 uppercase tracking-widest mt-1">Full Activation</div>
                          </div>
                          <div className="text-primary opacity-0 group-hover:opacity-100 transition-all">→</div>
                       </div>
                    </button>

                    <button 
                      onClick={() => handlePayment(selectedForPayment.id, 0, 'next')}
                      className="w-full p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-sm group text-left"
                    >
                       <div className="flex items-center justify-between">
                          <div>
                             <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">Subscription</div>
                             <div className="text-base font-sans font-medium">Pay Next Installment</div>
                             <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Keep Engagement Active</div>
                          </div>
                          <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">→</div>
                       </div>
                    </button>
                  </>
                )}
             </div>
             
             <div className="px-8 py-6 bg-background/40 flex items-center gap-3 border-t border-white/5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em]">Secured Gateway Active</span>
             </div>
             </>
             )}
          </div>
        </div>
      )}
    </PortalShell>
  );
}
