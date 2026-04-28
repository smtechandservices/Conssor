"use client";

import { useEffect, useState } from "react";
import { 
  Briefcase, 
  Search, 
  Filter, 
  UserPlus, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Engagement {
  id: string;
  client_name: string;
  consultant_name?: string;
  scope: string[];
  stage: string;
  created_at: string;
  status: string;
  payment_status?: string;
}

interface Consultant {
  id: string;
  full_name: string;
  expertise: string[];
}

export default function ProjectsPage() {
  const [unassigned, setUnassigned] = useState<Engagement[]>([]);
  const [allProjects, setAllProjects] = useState<Engagement[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"unassigned" | "all">("unassigned");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/admin/projects/unassigned/").then(res => res.json()),
      fetch("http://localhost:8000/api/admin/projects/all/").then(res => res.json()),
      fetch("http://localhost:8000/api/admin/consultants/").then(res => res.json())
    ]).then(([unassignedData, allData, consultantsData]) => {
      setUnassigned(unassignedData.engagements);
      setAllProjects(allData.engagements);
      setConsultants(consultantsData.consultants);
      setLoading(false);
    });
  }, []);

  const handleAssign = (engagementId: string, consultantId: string) => {
    fetch("http://localhost:8000/api/admin/projects/assign/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engagement_id: engagementId, consultant_id: consultantId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Consultant assigned successfully!");
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Project Governance</h1>
          <p className="text-muted mt-1">Manage lifecycle and assignments for all engagements.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-sm text-muted hover:text-white transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-sm w-fit">
        <button 
          onClick={() => setActiveTab("unassigned")}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "unassigned" ? "bg-white/10 text-white shadow-sm" : "text-muted hover:text-white"
          )}
        >
          Unassigned ({unassigned.length})
        </button>
        <button 
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "all" ? "bg-white/10 text-white shadow-sm" : "text-muted hover:text-white"
          )}
        >
          All Projects
        </button>
      </div>

      <div className="bg-card/30 border border-white/5 rounded-sm rounded-sm overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Client & Project</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Scope</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Consultant</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(activeTab === "unassigned" ? unassigned : allProjects).map((project) => (
              <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-white leading-none">{project.client_name}</p>
                      <p className="text-xs text-muted mt-1.5">{project.stage}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {project.scope.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted">
                        {s}
                      </span>
                    ))}
                    {project.scope.length > 2 && (
                      <span className="text-[10px] text-muted">+{project.scope.length - 2} more</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {project.consultant_name ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                        {project.consultant_name.charAt(0)}
                      </div>
                      <span className="text-sm text-white font-medium">{project.consultant_name}</span>
                    </div>
                  ) : (
                    <span className="text-sm italic text-amber-400/70 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Unassigned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
                    project.status === "active" ? "bg-success/10 text-success border border-success/20" : "bg-muted/10 text-muted border border-muted/20"
                  )}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {activeTab === "unassigned" ? (
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={() => setAssigningId(assigningId === project.id ? null : project.id)}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                      >
                        <UserPlus className="w-4 h-4" /> Match
                      </button>
                      
                      {assigningId === project.id && (
                        <div className="absolute right-0 mt-2 w-64 bg-card/30 border border-white/5 rounded-sm rounded-sm p-3 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                          <p className="text-xs font-bold text-white mb-2 uppercase tracking-widest px-2">Select Consultant</p>
                          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {consultants.map(c => (
                              <button 
                                key={c.id}
                                onClick={() => handleAssign(project.id, c.id)}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm group/item flex items-center justify-between"
                              >
                                <span className="text-white group-hover/item:text-primary transition-colors">{c.full_name}</span>
                                <ChevronRight className="w-3 h-3 text-muted opacity-0 group-hover/item:opacity-100" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-white/5 text-muted hover:text-white rounded-lg transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white/5 text-muted hover:text-white rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {((activeTab === "unassigned" ? unassigned : allProjects).length === 0) && (
          <div className="py-20 text-center">
            <Briefcase className="w-12 h-12 text-white/5 mx-auto mb-4" />
            <p className="text-muted text-lg">No projects found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
