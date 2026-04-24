"use client";

import { useEffect, useState } from "react";
import { useClient } from "@/hooks/useClient";
import PortalShell from "@/components/PortalShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ClientProfile, Stats } from "@/lib/types";

const API = "http://localhost:8000/api";

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function DashboardPage() {
  const { client, ready } = useClient();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !client) return;
    fetch(`${API}/client/${client.client_id}/overview/`)
      .then(r => r.json())
      .then(d => { setProfile(d.client); setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready, client]);

  const displayName = profile?.organization_name || profile?.contact_name || "Client";

  return (
    <PortalShell heading="Overview" badge={profile?.assignment_status}>
      {(!ready || loading) ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-[10px] uppercase tracking-widest text-primary animate-pulse">Loading…</span>
        </div>
      ) : (
        <div className="p-8 mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">

          <div>
            <h2 className="text-4xl font-heading mb-3 tracking-tight">
              Welcome, <span className="text-primary italic">{displayName}.</span>
            </h2>
            <p className="text-muted-foreground font-sans leading-relaxed max-w-2xl">
              {(stats?.pending_quotes ?? 0) > 0
                ? `You have ${stats!.pending_quotes} pending quote${stats!.pending_quotes > 1 ? "s" : ""} from the CONSSOR AI pricing engine awaiting your review.`
                : "Your advisory portal is active. Use the sidebar to track your engagements and quotes."}
            </p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-secondary/40 border-white/5 rounded-sm overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">Active Engagements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-heading text-primary group-hover:scale-105 transition-transform duration-500">
                  {stats?.active_engagements ?? 0}
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-secondary/40 rounded-sm overflow-hidden group ${(stats?.pending_quotes ?? 0) > 0 ? "border-primary/30 shadow-xl" : "border-white/5"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-primary font-sans flex justify-between items-center">
                  Pending Quotes
                  {(stats?.pending_quotes ?? 0) > 0 && <span className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-heading group-hover:scale-105 transition-transform duration-500">
                  {stats?.pending_quotes ?? 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/40 border-white/5 rounded-sm overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">Total Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-heading group-hover:scale-105 transition-transform duration-500">
                  {fmt(stats?.total_spend_usd ?? 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending quote action banner */}
          {(stats?.pending_quotes ?? 0) > 0 && (
            <div className="p-8 bg-secondary/20 border border-primary/30 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
              <div>
                <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-sm uppercase tracking-widest font-bold">Action Required</span>
                <h4 className="text-xl font-heading mt-3">You have a pending engagement quote</h4>
                <p className="text-sm text-muted-foreground font-sans mt-1">Review the AI-generated pricing and scope breakdown before it expires.</p>
              </div>
              <Link href="/quotes">
                <Button className="bg-primary hover:bg-primary/90 text-background font-bold rounded-sm uppercase tracking-widest text-[10px] px-8 h-12 shrink-0 transition-all hover:-translate-y-0.5">
                  Review Quote →
                </Button>
              </Link>
            </div>
          )}

          {/* Profile snapshot */}
          {profile && (
            <div className="p-6 bg-secondary/20 border border-white/5 rounded-sm space-y-5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Organisation Profile</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {([
                  ["Contact",       profile.contact_name],
                  ["Email",         profile.email],
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
              {profile.domain_tags?.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Industry Verticals</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.domain_tags.map(t => (
                      <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </PortalShell>
  );
}
