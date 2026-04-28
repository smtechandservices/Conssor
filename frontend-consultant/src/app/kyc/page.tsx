"use client";

import { BaseLayout } from "@/components/BaseLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, AlertCircle, Upload, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function KYCPage() {
  const documents = [
    { name: "Aadhaar Card (National ID)", status: "Verified", icon: CheckCircle2, color: "text-green-400" },
    { name: "PAN Card (Tax ID)", status: "Verified", icon: CheckCircle2, color: "text-green-400" },
    { name: "Bank Account Details", status: "Under Review", icon: ShieldCheck, color: "text-amber-400" },
    { name: "Professional Agreement", status: "Pending Signature", icon: AlertCircle, color: "text-primary" },
    { name: "Background Check", status: "Not Initiated", icon: Circle, color: "text-muted-foreground" },
  ];

  return (
    <BaseLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-heading font-medium tracking-tight mb-2">Compliance & KYC</h1>
        <p className="text-muted-foreground text-sm font-sans">Verify your identity and bank details to enable payouts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#112A42]/30 border-white/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                Verification Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-sm border border-white/5 group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <doc.icon className={`w-5 h-5 ${doc.color}`} />
                      <div>
                        <p className="text-xs font-medium">{doc.name}</p>
                        <p className={cn("text-[9px] uppercase tracking-widest font-bold mt-1", doc.color)}>{doc.status}</p>
                      </div>
                    </div>
                    {doc.status !== "Verified" && doc.status !== "Under Review" && (
                      <Button variant="outline" size="sm" className="gap-2 text-[9px]">
                        <Upload className="w-3 h-3" />
                        Upload
                      </Button>
                    )}
                    {doc.status === "Verified" && (
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                        Verified Mar 12
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-primary">Trust Score</CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-widest">Profile verification progress</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    className="text-white/5"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary transition-all duration-1000"
                    strokeWidth="8"
                    strokeDasharray={364}
                    strokeDashoffset={364 * (1 - 0.75)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-heading font-medium">75%</span>
                  <span className="text-[8px] uppercase tracking-tighter text-muted-foreground">Complete</span>
                </div>
              </div>
              <p className="mt-6 text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest">
                Verify your remaining documents to reach "Elite" status and get priority matching.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#112A42]/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-primary">Why KYC?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest space-y-2">
                Verification is required by financial regulations to process payouts and maintain the integrity of the CONSSOR expert network.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}
