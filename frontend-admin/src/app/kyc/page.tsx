"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  FileCheck, 
  XCircle, 
  Clock, 
  Eye,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCDoc {
  id: string;
  consultant_name: string;
  type: string;
  submitted_at: string;
  status: "pending" | "verified" | "rejected";
}

export default function KYCPage() {
  const [docs, setDocs] = useState<KYCDoc[]>([
    { id: "1", consultant_name: "John Doe", type: "Aadhaar Card", submitted_at: "2024-04-28T10:00:00Z", status: "pending" },
    { id: "2", consultant_name: "Jane Smith", type: "PAN Card", submitted_at: "2024-04-27T14:30:00Z", status: "pending" },
    { id: "3", consultant_name: "Robert Fox", type: "Bank Details", submitted_at: "2024-04-26T09:15:00Z", status: "verified" },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Trust & Safety</h1>
        <p className="text-muted mt-1">Review and verify identity documents for consultants.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {docs.map((doc) => (
          <div key={doc.id} className="bg-card/30 border border-white/5 rounded-sm p-6 rounded-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-sm flex items-center justify-center border",
                doc.status === "pending" ? "bg-amber-400/10 border-amber-400/20 text-amber-400" :
                doc.status === "verified" ? "bg-success/10 border-success/20 text-success" :
                "bg-danger/10 border-danger/20 text-danger"
              )}>
                {doc.status === "pending" ? <Clock className="w-6 h-6" /> :
                 doc.status === "verified" ? <FileCheck className="w-6 h-6" /> :
                 <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-white">{doc.consultant_name}</h3>
                <p className="text-sm text-muted">{doc.type} • Submitted {new Date(doc.submitted_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-sm bg-white/5 text-white hover:bg-white/10 transition-all text-sm font-medium">
                <Eye className="w-4 h-4" /> View Doc
              </button>
              {doc.status === "pending" && (
                <>
                  <button className="p-2 rounded-sm bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-sm bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all">
                    <XCircle className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
