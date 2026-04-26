"use client";

import { useEffect, useState } from "react";
import { BaseLayout } from "@/components/BaseLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, MessageSquare, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("conssor_user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    fetch(`http://localhost:8000/api/consultant/${user.consultant_id}/clients/`)
      .then(res => res.json())
      .then(data => {
        setClients(data.clients || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <BaseLayout><div className="flex items-center justify-center h-64 text-primary uppercase tracking-[0.3em] text-xs">Loading Clients...</div></BaseLayout>;
  return (
    <BaseLayout>
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-medium tracking-tight mb-2">Client Roster</h1>
          <p className="text-muted-foreground text-sm font-sans">Manage your active and past consulting engagements.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Search clients..." 
              className="bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-2 text-xs outline-none focus:border-primary/50 transition-all w-64"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-3 h-3" />
            Filter
          </Button>
        </div>
      </header>

      <Card className="bg-[#112A42]/30 border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Organization</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Domain</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Stage</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Start Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium">{client.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{client.contact}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-sm">
                      {client.domain}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{client.stage}</td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{client.start}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[9px] uppercase tracking-[0.15em] font-bold",
                      client.status === "Active" ? "text-green-400" : "text-amber-400"
                    )}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </BaseLayout>
  );
}
