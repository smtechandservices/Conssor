"use client";

import { useEffect, useState } from "react";
import { BaseLayout } from "@/components/BaseLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Plus, Info, Check, X, MessageSquare, AlertTriangle } from "lucide-react";

export default function LeadsPage() {
  const [assignedLeads, setAssignedLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [negotiating, setNegotiating] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [negotiationReason, setNegotiationReason] = useState("");

  const fetchLeads = async () => {
    const user = JSON.parse(localStorage.getItem("conssor_user") || "{}");
    if (!user.consultant_id) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/consultant/${user.consultant_id}/assigned-leads/`);
      const data = await res.json();
      setAssignedLeads(data.leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleResponse = async (engagementId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch(`http://localhost:8000/api/consultant/leads/respond/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagement_id: engagementId, action })
      });
      if (res.ok) {
        fetchLeads();
        setSelectedLead(null);
        alert(action === 'accept' ? "Lead accepted! You can now start messaging the client." : "Lead declined.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNegotiate = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/consultant/leads/negotiate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          engagement_id: selectedLead.id, 
          counter_price: counterPrice, 
          reason: negotiationReason 
        })
      });
      if (res.ok) {
        fetchLeads();
        setNegotiating(false);
        alert("Negotiation request sent to AI mediator.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const labelCls = "block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-semibold";
  const inputCls = "w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-primary/50 transition-all font-sans";

  return (
    <BaseLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-heading font-medium tracking-tight mb-2">Project Opportunities</h1>
        <p className="text-muted-foreground text-sm font-sans">Review and accept projects matched to your expertise by CONSSOR AI.</p>
      </header>

      <Tabs defaultValue="assigned" className="space-y-8">
        <TabsList className="bg-white/5 border border-white/5 p-1 rounded-sm">
          <TabsTrigger value="assigned" className="text-[10px] uppercase tracking-widest px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Assigned Projects ({assignedLeads.length})</TabsTrigger>
          <TabsTrigger value="referrals" className="text-[10px] uppercase tracking-widest px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Referral Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-6">
          {loading ? (
            <div className="text-center py-20 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Analyzing matching leads...</div>
          ) : assignedLeads.length === 0 ? (
            <div className="text-center py-20 bg-[#112A42]/30 border border-dashed border-white/10 rounded-sm">
              <Info className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">No new assignments at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignedLeads.map((lead) => (
                <Card key={lead.id} className="bg-[#112A42]/50 border-white/5 hover:border-primary/20 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-heading font-medium">{lead.client_name}</h3>
                          <span className="text-[9px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-sm border border-primary/20 font-bold">New Match</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                          "{lead.project_summary}"
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {lead.domain_tags.map((tag: string) => (
                            <span key={tag} className="text-[8px] uppercase tracking-widest bg-white/5 px-2 py-1 rounded-sm text-muted-foreground border border-white/5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="md:w-64 space-y-4 border-l border-white/5 pl-6">
                        <div className="space-y-1">
                          <p className={labelCls}>AI Suggested Fee</p>
                          <p className="text-2xl font-heading font-medium text-primary">${lead.price_info?.final_price.toLocaleString()}</p>
                          <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Est. Duration: {lead.stage}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" className="w-full gap-2 text-[10px] uppercase tracking-widest" onClick={() => setSelectedLead(lead)}>
                            <Info className="w-3 h-3" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="w-full gap-2 text-[10px] uppercase tracking-widest hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20" onClick={() => handleResponse(lead.id, 'decline')}>
                            <X className="w-3 h-3" />
                            Decline Lead
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="referrals">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 bg-[#112A42]/50 border-white/5 h-fit">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Submit New Lead
                </CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-widest">Register a new client opportunity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={labelCls}>Organization Name</label>
                  <input className={inputCls} placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className={labelCls}>Primary Contact Email</label>
                  <input className={inputCls} type="email" placeholder="contact@company.com" />
                </div>
                <div>
                  <label className={labelCls}>Est. Deal Value (USD)</label>
                  <input className={inputCls} type="number" placeholder="50000" />
                </div>
                <Button className="w-full mt-4 text-[10px] uppercase tracking-widest">Submit Opportunity</Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
               <Card className="bg-[#112A42]/30 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Pipeline Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-[10px] uppercase tracking-widest text-muted-foreground italic">
                    Your submitted leads will appear here...
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-[#0B1C2C]/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl bg-[#112A42] border-white/10 shadow-2xl overflow-hidden max-height-[90vh] flex flex-col">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-heading font-medium">{selectedLead.client_name}</CardTitle>
                  <CardDescription className="text-[10px] uppercase tracking-widest mt-1">Project Assignment Details</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setSelectedLead(null); setNegotiating(false); }} className="text-muted-foreground hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 overflow-y-auto">
              <div className="space-y-4">
                <h4 className={labelCls}>Project Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {selectedLead.project_summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className={labelCls}>Engagement Scope</h4>
                  <ul className="space-y-2">
                    {selectedLead.scope.map((s: string) => (
                      <li key={s} className="text-xs text-white flex items-center gap-2">
                        <Check className="w-3 h-3 text-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className={labelCls}>Project Stage</h4>
                  <p className="text-xs text-white uppercase tracking-widest font-bold">{selectedLead.stage}</p>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-sm border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className={labelCls}>AI Suggested Cost</h4>
                    <p className="text-2xl font-heading font-medium text-primary">${selectedLead.price_info?.final_price.toLocaleString()}</p>
                  </div>
                  {selectedLead.price_info?.status === 'negotiating' ? (
                    <div className="flex items-center gap-2 text-amber-400">
                       <AlertTriangle className="w-4 h-4" />
                       <span className="text-[9px] uppercase tracking-widest font-bold">Negotiation Pending</span>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="text-[9px] uppercase tracking-widest gap-2" onClick={() => setNegotiating(!negotiating)}>
                      <TrendingUp className="w-3 h-3" />
                      Request Revision
                    </Button>
                  )}
                </div>

                {negotiating && (
                  <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[9px] uppercase tracking-widest text-amber-400 font-bold leading-relaxed">
                      If you believe the AI-suggested cost is lower than expected, our AI mediator can resolve the conflict if you provide a clear rationale.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className={labelCls}>Your Proposed Fee (USD)</label>
                        <input 
                          type="number" 
                          className={inputCls} 
                          placeholder="Enter your expected amount" 
                          value={counterPrice}
                          onChange={e => setCounterPrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Rationale for Revision</label>
                        <textarea 
                          className={`${inputCls} h-24 resize-none`} 
                          placeholder="e.g. Scope complexity requires additional technical audit..."
                          value={negotiationReason}
                          onChange={e => setNegotiationReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button className="w-full text-[10px] uppercase tracking-widest" onClick={handleNegotiate}>Submit to AI Mediator</Button>
                  </div>
                )}
              </div>

              {!negotiating && selectedLead.price_info?.status !== 'negotiating' && (
                <div className="flex gap-4 pt-4">
                  <Button className="flex-1 gap-2 text-[10px] uppercase tracking-widest py-6" onClick={() => handleResponse(selectedLead.id, 'accept')}>
                    <Check className="w-4 h-4" />
                    Accept Project
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 text-[10px] uppercase tracking-widest py-6 border-red-400/20 text-red-400 hover:bg-red-400/5 hover:border-red-400/40" onClick={() => handleResponse(selectedLead.id, 'decline')}>
                    <X className="w-4 h-4" />
                    Decline Lead
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </BaseLayout>
  );
}
