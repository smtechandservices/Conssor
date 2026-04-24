"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function ClientDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all session and onboarding cache
    localStorage.removeItem("conssor_token");
    localStorage.removeItem("conssor_chat_messages");
    localStorage.removeItem("conssor_onboarding_data");
    
    // Redirect to landing page
    window.location.href = "http://localhost:3000";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-secondary/30 border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-8 border-b border-white/5">
          <div className="text-primary tracking-widest text-sm uppercase font-semibold">CONSSOR</div>
          <div className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">Client Portal</div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 font-sans text-sm tracking-wide">
          <Link href="/dashboard" className="block px-4 py-3 rounded-sm bg-primary/10 text-primary border border-primary/20 transition-all font-medium">
            Overview Dashboard
          </Link>
          <Link href="/projects" className="block px-4 py-3 rounded-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            Engagements & Projects
          </Link>
          <Link href="/quotes" className="block px-4 py-3 rounded-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            Quotes & Payments
          </Link>
          <Link href="/documents" className="block px-4 py-3 rounded-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            Documents & NDAs
          </Link>
          <hr className="border-white/5 my-4" />
          <Link href="/messages" className="block px-4 py-3 rounded-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex justify-between items-center">
            Messages
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          </Link>
          <Link href="/settings" className="block px-4 py-3 rounded-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 p-2 bg-background/50 rounded-sm border border-white/5">
            <div className="w-10 h-10 rounded-sm bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/10">EK</div>
            <div className="text-[11px]">
              <div className="font-semibold text-foreground uppercase tracking-wider">Enterprise Key</div>
              <div className="text-muted-foreground">Premium Client</div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-all rounded-sm flex items-center gap-3 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            End Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto hide-scrollbar">
        <header className="h-20 border-b border-white/5 flex items-center px-8 justify-between shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex gap-4 items-center">
             <h1 className="font-heading text-xl tracking-tight">Overview Dashboard</h1>
             <span className="text-[10px] bg-secondary border border-white/10 px-2 py-0.5 text-muted-foreground rounded-sm tracking-widest uppercase">Live Scope</span>
          </div>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-sm uppercase tracking-widest text-[10px] h-10 px-6 font-semibold transition-all">
            New Engagement Request
          </Button>
        </header>

        <div className="p-8 pb-32 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-4xl font-heading mb-3 tracking-tight">Welcome Back, <span className="text-primary italic">Enterprise Key.</span></h2>
            <p className="text-muted-foreground font-sans max-w-2xl leading-relaxed">
              Your organization currently has 1 pending AI engagement quote generated via the CONSSOR intelligence engine. 
              Review the scope bounds and suggested milestones below.
            </p>
          </div>

          {/* KPI Cards using Card component */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-secondary/40 border-white/5 rounded-sm shadow-sm overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">Active Engagements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-heading text-primary group-hover:scale-105 transition-transform duration-500">0</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/40 border-primary/20 rounded-sm shadow-xl overflow-hidden relative group">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-primary font-sans flex justify-between">
                  Pending Quotes
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-heading text-foreground group-hover:scale-105 transition-transform duration-500">1</div>
              </CardContent>
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><path d="M4 14.71 14 2 10.5 8h9.5L10 21l3.5-6H4Z"/></svg>
              </div>
            </Card>
            <Card className="bg-secondary/40 border-white/5 rounded-sm shadow-sm overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">Projected Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-heading text-foreground group-hover:scale-105 transition-transform duration-500">$0.00</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items List */}
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
               <h3 className="font-heading text-2xl tracking-tight">Priority Actions</h3>
               <Link href="/history" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">View All History</Link>
            </div>
            
            <div className="p-8 bg-secondary/20 border border-primary/30 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:bg-secondary/30 relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
              <div className="flex-1">
                <div className="flex gap-4 items-center mb-3">
                  <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-sm uppercase tracking-widest font-bold">Awaiting Selection</span>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-widest">Received Oct 24, 2026</span>
                </div>
                <h4 className="text-xl font-heading text-foreground mb-2">Digital Transformation Assessment - Financial Services</h4>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed max-w-xl">
                  Strategic review of core banking digital architecture. 
                  Recommended duration: <span className="text-foreground font-medium">16 weeks</span>. 
                  AI Quote Range: <span className="text-primary font-medium">$45k - $52k</span>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button variant="outline" className="border-white/10 text-muted-foreground hover:text-foreground rounded-sm uppercase tracking-widest text-[10px] px-8 h-12 transition-all">Details</Button>
                <Button className="bg-primary hover:bg-primary-hover text-background font-bold rounded-sm uppercase tracking-widest text-[10px] px-8 h-12 transition-all shadow-lg hover:translate-y-[-2px]">Review & Hire</Button>
              </div>
            </div>
            
            <div className="p-8 bg-background border border-white/5 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Oct 23, 2026</div>
                <h4 className="text-lg font-heading text-foreground mb-1">Organization Onboarded</h4>
                <p className="text-sm text-muted-foreground font-sans">Enterprise Key verified as premium organization under Digital Economy vertical.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
