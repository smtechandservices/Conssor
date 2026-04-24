"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { StoredClient } from "@/lib/types";

const NAV = [
  { href: "/dashboard",    label: "Overview" },
  { href: "/engagements",  label: "Engagements" },
  { href: "/quotes",       label: "Quotes" },
  { href: "/docs",         label: "Documents" },
];

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

interface Props {
  children: React.ReactNode;
  heading: string;
  badge?: string;
}

export default function PortalShell({ children, heading, badge }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [client, setClient] = useState<StoredClient | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("conssor_client");
    if (!stored) { router.replace("/login"); return; }
    const user: StoredClient = JSON.parse(stored);
    if (!user.client_id) { router.replace("/login"); return; }
    setClient(user);
  }, [router]);

  const displayName = client?.organization ?? client?.name ?? "Client";

  const logout = () => {
    localStorage.removeItem("conssor_client");
    window.location.href = "http://localhost:3000";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-secondary/30 border-r border-white/5 hidden md:flex flex-col shrink-0 print:hidden">
        <div className="p-8 border-b border-white/5">
          <div className="text-primary tracking-widest text-sm uppercase font-semibold">CONSSOR</div>
          <div className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">Client Portal</div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 text-sm">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={`block px-4 py-3 rounded-sm transition-all ${
                pathname === n.href
                  ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          {client && (
            <div className="flex items-center gap-3 p-2 bg-background/50 rounded-sm border border-white/5">
              <div className="w-10 h-10 rounded-sm bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/10 shrink-0">
                {initials(displayName)}
              </div>
              <div className="text-[11px] min-w-0">
                <div className="font-semibold uppercase tracking-wider truncate">{displayName}</div>
                <div className="text-muted-foreground truncate">{client.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-all rounded-sm flex items-center gap-3 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            End Session
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto print:overflow-visible">
        <header className="h-20 border-b border-white/5 flex items-center px-8 justify-between shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-10 print:hidden">
          <h1 className="font-heading text-xl tracking-tight">{heading}</h1>
          {badge && (
            <span className="text-[10px] bg-secondary border border-white/10 px-3 py-1 text-muted-foreground rounded-sm tracking-widest uppercase">
              {badge}
            </span>
          )}
        </header>
        <div className="flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}
