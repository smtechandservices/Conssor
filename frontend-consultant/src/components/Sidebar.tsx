"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  MessageSquare,
  User
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Leads", href: "/leads", icon: TrendingUp },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Earnings", href: "/earnings", icon: DollarSign },
  { name: "KYC Status", href: "/kyc", icon: ShieldCheck },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-[#0B1C2C] border-r border-white/5 flex flex-col fixed left-0 top-0">
      <div className="p-8">
        <Link href="/">
          <div className="text-primary tracking-[0.3em] text-xs uppercase font-bold">CONSSOR</div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">Consultant Portal</div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3 text-[11px] uppercase tracking-widest font-medium rounded-sm transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-[11px] uppercase tracking-widest font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/5 rounded-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
