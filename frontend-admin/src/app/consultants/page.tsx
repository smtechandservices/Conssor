"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Star, 
  ShieldCheck, 
  Mail, 
  Link2,
  MapPin,
  ExternalLink,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Consultant {
  id: string;
  full_name: string;
  email: string;
  expertise: string[];
  status: string;
  kyc: string;
  rating: number;
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/consultants/")
      .then(res => res.json())
      .then(data => {
        setConsultants(data.consultants);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Consultant Directory</h1>
          <p className="text-muted mt-1">Manage and vet the global network of domain experts.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search experts..." 
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-sm text-muted hover:text-white transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultants.map((c) => (
          <div key={c.id} className="bg-card/30 border border-white/5 rounded-sm rounded-sm p-6 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start">
              <div className="relative">
                <div className="w-16 h-16 rounded-sm bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center text-2xl font-bold text-white border border-white/10">
                  {c.full_name.charAt(0)}
                </div>
                {c.kyc === "verified" && (
                  <div className="absolute -top-2 -right-2 bg-success rounded-full p-1 border-2 border-[#050505]">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-white">{c.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{c.full_name}</h3>
              <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {c.email}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {c.expertise.slice(0, 3).map((exp, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/5 border border-primary/10 text-primary font-medium">
                  {exp}
                </span>
              ))}
              {c.expertise.length > 3 && (
                <span className="text-[10px] text-muted self-center">+{c.expertise.length - 3}</span>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                c.status === "available" ? "text-success bg-success/5" : "text-danger bg-danger/5"
              )}>
                {c.status}
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-sm bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all">
                  <Link2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-sm bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
