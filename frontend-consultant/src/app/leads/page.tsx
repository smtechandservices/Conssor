"use client";

import { BaseLayout } from "@/components/BaseLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, ChevronRight } from "lucide-react";

export default function LeadsPage() {
  const leads = [
    { id: 1, name: "Nexus Systems", domain: "Cybersecurity", value: "$120,000", stage: "Proposal Sent", bonus: "$6,000", status: "Active" },
    { id: 2, name: "Vertex Labs", domain: "Web3", value: "$85,000", stage: "Contacted", bonus: "$4,250", status: "Active" },
    { id: 3, name: "EcoFlow", domain: "Energy", value: "$250,000", stage: "Under Review", bonus: "$12,500", status: "Active" },
  ];

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-primary/50 transition-all font-sans";
  const labelCls = "block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-semibold";

  return (
    <BaseLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-heading font-medium tracking-tight mb-2">Lead Generation</h1>
        <p className="text-muted-foreground text-sm font-sans">Submit new opportunities and track your referral bonuses.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 bg-[#112A42]/50 border-white/5 h-fit sticky top-10">
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
              <label className={labelCls}>Industry Vertical</label>
              <select className={inputCls}>
                <option value="" disabled selected>Select industry...</option>
                <option>Financial Services</option>
                <option>Healthcare</option>
                <option>Energy</option>
                <option>Technology</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Est. Deal Value (USD)</label>
              <input className={inputCls} type="number" placeholder="50000" />
            </div>
            <Button className="w-full mt-4">Submit Opportunity</Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#112A42]/30 border-white/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Pipeline Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-5 bg-white/5 rounded-sm border border-white/5 hover:border-primary/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">{lead.name}</h3>
                        <span className="text-[10px] uppercase tracking-widest bg-white/5 px-2 py-1 rounded-sm text-muted-foreground">
                          {lead.domain}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">{lead.value}</p>
                        <p className="text-[9px] uppercase tracking-widest text-green-400 mt-1">Bonus: {lead.bonus}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: lead.stage === "Proposal Sent" ? "75%" : lead.stage === "Under Review" ? "50%" : "25%" }} 
                        />
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-primary font-bold">{lead.stage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}
