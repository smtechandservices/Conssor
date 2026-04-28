"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function AuthGuardContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const authParam = searchParams.get("auth");
    
    if (authParam) {
      try {
        const decoded = atob(authParam);
        localStorage.setItem("conssor_user", decoded);
        
        // Remove auth param from URL
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("auth");
        const queryString = newParams.toString();
        const newUrl = pathname + (queryString ? `?${queryString}` : "");
        window.history.replaceState({}, document.title, newUrl);
        
        setAuthenticated(true);
      } catch (e) {
        console.error("Failed to decode auth data", e);
      }
    } else {
      const userStr = localStorage.getItem("conssor_user");
      if (!userStr) {
        window.location.href = "http://localhost:3000/consultant/login";
      } else {
        setAuthenticated(true);
      }
    }
  }, [searchParams, pathname]);

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B1C2C]">
        <div className="text-primary uppercase tracking-[0.3em] text-xs animate-pulse">
          Authenticating...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0B1C2C]">
        <div className="text-primary uppercase tracking-[0.3em] text-xs animate-pulse">
          Loading...
        </div>
      </div>
    }>
      <AuthGuardContent>{children}</AuthGuardContent>
    </Suspense>
  );
}
