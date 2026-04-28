"use client";

import { useEffect, useState } from "react";
import { BaseLayout } from "@/components/BaseLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("conssor_user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    fetch(`http://localhost:8000/api/consultant/${user.consultant_id}/dashboard/`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <BaseLayout><div className="flex items-center justify-center h-64 text-primary uppercase tracking-[0.3em] text-xs">Loading Dashboard...</div></BaseLayout>;

  const stats = [
    { name: "Active Clients", value: data?.stats?.active_clients || "0", icon: Users, color: "text-blue-400" },
    { name: "Total Earnings", value: `$${(data?.stats?.total_earnings_usd || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-400" },
    { name: "Upcoming Sessions", value: data?.stats?.upcoming_sessions || "0", icon: Calendar, color: "text-primary" },
    { name: "Pending KYC", value: data?.stats?.pending_kyc || "0", icon: AlertCircle, color: "text-amber-400" },
  ];

  return (
    <BaseLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-heading font-medium tracking-tight mb-2">Welcome back, Expert</h1>
        <p className="text-muted-foreground text-sm font-sans">Here's an overview of your consulting practice.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-white/5 bg-[#112A42]/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-medium">{stat.value}</div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">+12% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#112A42]/30 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-primary">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { event: "New lead submitted", client: "Acme Corp", time: "2 hours ago" },
                { event: "Milestone completed", client: "Global Tech", time: "5 hours ago" },
                { event: "Payment received", client: "Future Systems", time: "Yesterday" },
                { event: "New session booked", client: "Innovate Inc", time: "2 days ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-medium">{item.event}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{item.client}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112A42]/30 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-primary">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { client: "Acme Corp", date: "Today", time: "4:00 PM" },
                { client: "Global Tech", date: "Tomorrow", time: "10:30 AM" },
                { client: "Future Systems", date: "Apr 26", time: "2:00 PM" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-sm border border-white/5">
                  <p className="text-xs font-bold mb-1">{item.client}</p>
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                    <span>{item.date}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
