"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  total_revenue: number;
  total_clients: number;
  total_consultants: number;
  active_projects: number;
  unassigned_projects: number;
  pending_leads: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/stats/")
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats:", err);
        setLoading(false);
      });
  }, []);

  const statCards = [
    { 
      label: "Total Revenue", 
      value: stats ? `$${stats.total_revenue.toLocaleString()}` : "$0", 
      icon: DollarSign, 
      color: "text-emerald-400", 
      bg: "bg-emerald-400/10",
      trend: "+12.5%" 
    },
    { 
      label: "Active Projects", 
      value: stats?.active_projects || 0, 
      icon: Briefcase, 
      color: "text-blue-400", 
      bg: "bg-blue-400/10",
      trend: "+4" 
    },
    { 
      label: "Consultants", 
      value: stats?.total_consultants || 0, 
      icon: Users, 
      color: "text-purple-400", 
      bg: "bg-purple-400/10",
      trend: "+2 this week" 
    },
    { 
      label: "Pending Leads", 
      value: stats?.pending_leads || 0, 
      icon: FileText, 
      color: "text-amber-400", 
      bg: "bg-amber-400/10",
      trend: "Action required" 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight font-heading font-heading">Platform Governance</h1>
        <p className="text-[10px] text-primary uppercase tracking-[0.3em] mt-2 font-bold">Real-time platform performance & metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card/50 border border-white/5 p-6 rounded-sm relative group overflow-hidden transition-all hover:border-primary/30">
            <div className="flex justify-between items-start">
              <div className={cn("p-2 rounded-sm bg-primary/10")}>
                <stat.icon className={cn("w-5 h-5 text-primary")} />
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-sm bg-primary/5 text-primary uppercase tracking-widest")}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-heading">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Projects Section */}
        <div className="lg:col-span-2 bg-card/30 border border-white/5 rounded-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold text-white font-heading uppercase tracking-widest">Unassigned Projects</h2>
            </div>
            <button className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">View All →</button>
          </div>
          
          <div className="space-y-4">
            {stats?.unassigned_projects === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-10 h-10 text-primary/20 mb-3" />
                <p className="text-[10px] text-muted uppercase tracking-widest italic">All clear! No projects awaiting assignment.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white text-lg font-medium font-heading">{stats?.unassigned_projects} Projects waiting for matching</p>
                <button className="mt-4 px-8 py-3 bg-primary text-[#0B1C2C] rounded-sm font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-primary-hover transition-all">
                  Initialize Matching Engine
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card/30 border border-white/5 rounded-sm p-6">
          <h2 className="text-lg font-bold text-white mb-6 font-heading uppercase tracking-widest">System Integrity</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">API Services</p>
                <p className="text-[10px] text-muted uppercase tracking-widest">Operational</p>
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">AI Pricing Engine</p>
                <p className="text-[10px] text-muted uppercase tracking-widest">Active (v2.4)</p>
              </div>
              <Zap className="w-4 h-4 text-primary" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">Governance Tools</h3>
            <div className="grid grid-cols-1 gap-2">
              <button className="p-3 rounded-sm bg-white/5 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all text-left border border-white/5">
                Generate Analytics Report
              </button>
              <button className="p-3 rounded-sm bg-white/5 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all text-left border border-white/5">
                Audit Trail Logs
              </button>
              <button className="p-3 rounded-sm bg-white/5 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all text-left border border-white/5">
                Platform Fee Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
