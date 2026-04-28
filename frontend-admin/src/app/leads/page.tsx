"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  DollarSign, 
  Clock,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  submitted_by: string;
  organization_name: string;
  contact_email: string;
  domain: string;
  estimated_value: number;
  pipeline_stage: string;
  submitted_at: string;
}

const STAGES = [
  "submitted",
  "under_review",
  "contacted",
  "proposal_sent",
  "won",
  "lost"
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/leads/")
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads);
        setLoading(false);
      });
  }, []);

  const updateStage = (leadId: string, stage: string) => {
    fetch("http://localhost:8000/api/admin/leads/update/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId, pipeline_stage: stage })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setLeads(leads.map(l => l.id === leadId ? { ...l, pipeline_stage: stage } : l));
        setUpdatingId(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Referral Leads</h1>
          <p className="text-muted mt-1">Manage leads submitted by consultants and track commissions.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-sm text-muted hover:text-white transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-card/30 border border-white/5 rounded-sm p-6 rounded-sm flex flex-col md:flex-row md:items-center gap-6 relative group overflow-hidden">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{lead.organization_name}</h3>
                  <p className="text-sm text-muted">Domain: <span className="text-white">{lead.domain}</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Contact</p>
                  <p className="text-sm text-white mt-1">{lead.contact_email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Value</p>
                  <p className="text-sm text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {lead.estimated_value.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Source</p>
                  <p className="text-sm text-white mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {lead.submitted_by}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Submitted</p>
                  <p className="text-sm text-muted mt-1">{new Date(lead.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
              <div className="relative">
                <button 
                  onClick={() => setUpdatingId(updatingId === lead.id ? null : lead.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold border transition-all",
                    lead.pipeline_stage === "won" ? "bg-success/10 text-success border-success/20" :
                    lead.pipeline_stage === "lost" ? "bg-danger/10 text-danger border-danger/20" :
                    "bg-white/5 text-white border-white/10"
                  )}
                >
                  <span className="capitalize">{lead.pipeline_stage.replace("_", " ")}</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </button>

                {updatingId === lead.id && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-card/30 border border-white/5 rounded-sm rounded-sm p-2 z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                    {STAGES.map(stage => (
                      <button 
                        key={stage}
                        onClick={() => updateStage(lead.id, stage)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-xs font-medium text-white capitalize"
                      >
                        {stage.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="p-3 bg-primary text-white rounded-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="absolute top-0 right-0 p-1">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                lead.pipeline_stage === "submitted" ? "bg-amber-400 animate-pulse" : "bg-white/10"
              )} />
            </div>
          </div>
        ))}

        {leads.length === 0 && !loading && (
          <div className="py-20 text-center bg-card/30 border border-white/5 rounded-sm rounded-sm border border-dashed border-white/10">
            <FileText className="w-16 h-16 text-white/5 mx-auto mb-4" />
            <p className="text-muted text-lg">No referral leads found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
