"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserSquare2, 
  FileText, 
  Settings,
  LogOut,
  ShieldCheck,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Briefcase, label: "Projects", href: "/projects" },
  { icon: Users, label: "Consultants", href: "/consultants" },
  { icon: FileText, label: "Leads", href: "/leads" },
  { icon: UserSquare2, label: "Clients", href: "/clients" },
  { icon: ShieldCheck, label: "KYC", href: "/kyc" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 border-r border-white/5 bg-[#0B1C2C]/50 backdrop-blur-xl">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#0B1C2C] fill-[#0B1C2C]" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white font-heading">CONSSOR</span>
          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest ml-1">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-[#0B1C2C] shadow-lg shadow-primary/20" 
                  : "text-muted hover:text-primary hover:bg-primary/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                isActive ? "text-[#0B1C2C]" : "text-muted"
              )} />
              <span className="font-medium text-xs uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0B1C2C] shadow-[0_0_8px_#0B1C2C]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-muted hover:text-primary hover:bg-primary/5 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-xs uppercase tracking-widest">Settings</span>
        </Link>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-danger/80 hover:text-danger hover:bg-danger/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
