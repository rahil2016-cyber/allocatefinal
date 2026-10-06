"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/login?role=job_seeker&redirect=${encodeURIComponent(pathname)}`);
      } else if (role === "company") {
        // Employer attempting to access candidate area
        router.replace("/employer/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, role, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-[#174A7E] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Verifying Candidate Profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || role === "company") {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900">Job Seeker Account Required</h2>
          <p className="text-xs text-slate-500 max-w-sm">
            {role === "company"
              ? "You are currently signed in as an Employer. Redirecting to your hiring dashboard..."
              : "Please sign in with your Job Seeker account to access candidate features."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
