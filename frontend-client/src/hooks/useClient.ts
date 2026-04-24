"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoredClient } from "@/lib/types";

export function useClient() {
  const router = useRouter();
  const [client, setClient] = useState<StoredClient | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("conssor_client");
    if (!stored) { router.replace("/login"); return; }
    const user: StoredClient = JSON.parse(stored);
    if (!user.client_id) { router.replace("/login"); return; }
    setClient(user);
    setReady(true);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("conssor_client");
    window.location.href = "http://localhost:3000";
  };

  return { client, ready, logout };
}
