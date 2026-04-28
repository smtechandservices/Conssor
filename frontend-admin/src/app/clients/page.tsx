"use client";

import { useEffect, useState } from "react";
import { 
  UserSquare2, 
  Search, 
  Building2, 
  Mail, 
  Globe,
  ArrowUpRight,
  Filter,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  organization: string;
  contact: string;
  email: string;
  country: string;
  status: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/clients/")
      .then(res => res.json())
      .then(data => {
        setClients(data.clients);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Client Organizations</h1>
          <p className="text-muted mt-1">Manage corporate accounts and project history.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-sm text-muted hover:text-white transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-card/30 border border-white/5 rounded-sm rounded-sm overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Organization</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Primary Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Region</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Assignment Status</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-white leading-none">{client.organization}</p>
                      <p className="text-xs text-muted mt-1.5 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        conssor.com/c/{client.organization.toLowerCase().replace(/\s+/g, '-') || 'id'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">{client.contact}</p>
                    <p className="text-xs text-muted flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white">{client.country}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
                    client.status === "active" ? "bg-success/10 text-success border border-success/20" :
                    client.status === "assigned" ? "bg-blue-400/10 text-blue-400 border border-blue-400/20" :
                    "bg-muted/10 text-muted border border-muted/20"
                  )}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-white/5 text-muted hover:text-white rounded-lg transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/5 text-muted hover:text-white rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 && !loading && (
          <div className="py-20 text-center">
            <Building2 className="w-12 h-12 text-white/5 mx-auto mb-4" />
            <p className="text-muted text-lg">No client organizations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
