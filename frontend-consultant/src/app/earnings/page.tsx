"use client";

import { BaseLayout } from "@/components/BaseLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Download, ArrowUpRight, Clock } from "lucide-react";

export default function EarningsPage() {
  const earnings = [
    { client: "Acme Corp", period: "Mar 2026", gross: "$15,000", fee: "12%", net: "$13,200", status: "Paid" },
    { client: "Innovate Inc", period: "Mar 2026", gross: "$8,000", fee: "12%", net: "$7,040", status: "Processing" },
    { client: "Global Tech", period: "Feb 2026", gross: "$12,000", fee: "12%", net: "$10,560", status: "Paid" },
    { client: "Referral Bonus", period: "Mar 2026", gross: "$2,500", fee: "0%", net: "$2,500", status: "Approved" },
  ];

  return (
    <BaseLayout>
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-medium tracking-tight mb-2">Earnings & Payouts</h1>
          <p className="text-muted-foreground text-sm font-sans">Track your revenue, platform fees, and payout history.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-3 h-3" />
          Export Report
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-primary">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-medium text-primary">$45,200</div>
            <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2 font-bold uppercase tracking-wider">
              <ArrowUpRight className="w-3 h-3" />
              +15.4% vs last month
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-medium">$9,540</div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              Next payout: May 1, 2026
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Platform Fees Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-medium">$5,424</div>
            <div className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">
              Fixed 12% across all tiers
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#112A42]/30 border-white/5 overflow-hidden">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-sm uppercase tracking-widest text-primary">Transaction History</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Client / Type</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Billing Period</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Gross Amount</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Platform Fee</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Net Payout</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {earnings.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium">{row.client}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{row.period}</td>
                  <td className="px-6 py-4 text-xs">{row.gross}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{row.fee}</td>
                  <td className="px-6 py-4 text-xs font-bold text-primary">{row.net}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "text-[9px] uppercase tracking-[0.15em] font-bold px-2 py-1 rounded-sm border",
                      row.status === "Paid" ? "border-green-400/20 text-green-400 bg-green-400/5" :
                      row.status === "Processing" ? "border-amber-400/20 text-amber-400 bg-amber-400/5" :
                      "border-primary/20 text-primary bg-primary/5"
                    )}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </BaseLayout>
  );
}
