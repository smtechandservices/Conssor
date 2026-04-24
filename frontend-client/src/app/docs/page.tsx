"use client";

import { useEffect, useState } from "react";
import { useClient } from "@/hooks/useClient";
import PortalShell from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Upload, ShieldCheck } from "lucide-react";
import type { ClientProfile } from "@/lib/types";

const API = "http://localhost:8000/api";

export default function DocsPage() {
  const { client, ready } = useClient();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ndaStatus, setNdaStatus] = useState<'pending' | 'signed' | 'none'>('none');

  useEffect(() => {
    if (!ready || !client) return;
    fetch(`${API}/client/${client.client_id}/overview/`)
      .then(r => r.json())
      .then(d => setProfile(d.client))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [ready, client]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleNDAUpload = () => {
    alert("NDA Upload functionality would go here. Integrating with document storage...");
  };

  const handleNDAApply = () => {
    setNdaStatus('pending');
    alert("Application for Conssor NDA submitted. Our legal team will review it.");
  };

  return (
    <PortalShell heading="Documentation & Compliance">
      {(!ready || loading) ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-[10px] uppercase tracking-widest text-primary animate-pulse">Loading…</span>
        </div>
      ) : (
        <div className="p-8 mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">

          {/* Scope of Work Section */}
          <section id="sow-section" className="space-y-6 print:p-0">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 print:hidden">
              <div>
                <h2 className="text-lg font-heading tracking-tight">Scope of Work</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Project Definitions & Deliverables</p>
              </div>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="rounded-sm border-primary/20 text-primary hover:bg-primary/5 gap-2 text-[10px] uppercase tracking-widest"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>
            </div>

            <div className="bg-secondary/10 border border-white/5 rounded-sm p-8 space-y-8 print:bg-white print:text-black print:border-0 print:shadow-none">
              <div className="hidden print:block mb-8">
                <div className="text-2xl font-bold uppercase tracking-tighter">CONSSOR</div>
                <div className="text-sm text-gray-500 uppercase tracking-widest">Master Service Agreement - Scope of Work</div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground print:text-gray-400">Client Organization</label>
                  <p className="text-sm font-medium">{profile?.organization_name || "—"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground print:text-gray-400">Engagement Date</label>
                  <p className="text-sm font-medium">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-widest font-semibold border-l-2 border-primary pl-4 print:border-black">1. Objectives</h3>
                <p className="text-sm text-muted-foreground leading-relaxed print:text-gray-700">
                  Conssor shall provide strategic investigative advisory and technical consulting services to {profile?.organization_name}.
                  The primary objective is to identify, validate, and execute on high-impact growth opportunities within the {profile?.domain_tags?.join(", ") || "specified"} sectors.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-widest font-semibold border-l-2 border-primary pl-4 print:border-black">2. Deliverables</h3>
                <ul className="grid md:grid-cols-2 gap-4">
                  {(profile?.engagement_scope || ["Strategic Roadmap", "Risk Assessment", "Market Intelligence", "Execution Framework"]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3 p-4 bg-background/50 border border-white/5 rounded-sm print:bg-gray-50 print:border-gray-200">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5 print:text-black" />
                      <span className="text-sm print:text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-widest font-semibold border-l-2 border-primary pl-4 print:border-black">3. Commercial Terms</h3>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-sm print:bg-gray-50 print:border-gray-200">
                  <p className="text-sm">
                    Pricing is based on the selected engagement tier: <span className="font-bold text-primary print:text-black">{profile?.budget_range || "Standard"}</span>.
                    All engagements are subject to Conssor's standard investigative advisory protocols.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* NDA Section */}
          <section className="space-y-6 pt-6 border-t border-white/5 print:hidden">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading tracking-tight">Compliance & Legal</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Non-Disclosure Agreements & Data Safety</p>
              </div>
              <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-widest font-bold">Coming Soon</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 opacity-50 grayscale pointer-events-none">
              <div className="p-6 bg-secondary/20 border border-white/5 rounded-sm flex flex-col justify-between relative">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Upload your NDA</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Already have a standard NDA? Upload it here for our legal team to review and counter-sign.
                    </p>
                  </div>
                </div>
                <Button 
                  disabled
                  variant="outline" 
                  className="mt-6 rounded-sm w-full uppercase tracking-widest text-[10px] h-10"
                >
                  Choose File
                </Button>
              </div>

              <div className="p-6 bg-secondary/20 border border-white/5 rounded-sm flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Apply for Conssor NDA</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Request our standard investigative advisory NDA. This is the fastest way to get started.
                    </p>
                  </div>
                </div>
                <Button 
                  disabled
                  className="mt-6 rounded-sm w-full uppercase tracking-widest text-[10px] h-10"
                >
                  Apply Now
                </Button>
              </div>
            </div>
          </section>

        </div>
      )}
    </PortalShell>
  );
}
