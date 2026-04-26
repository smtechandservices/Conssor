"use client";

import { Sidebar } from "@/components/Sidebar";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0B1C2C]">
      <Sidebar />
      <main className="flex-1 ml-64 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
