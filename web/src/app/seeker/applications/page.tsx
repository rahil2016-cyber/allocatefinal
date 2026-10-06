"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { JobApplication } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  FileText,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function MyApplicationsPage() {
  const [withdrawingId, setWithdrawingId] = useState<number | string | null>(null);

  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.MY_APPLICATIONS);
      const data = res.data?.data;
      if (Array.isArray(data)) return data as JobApplication[];
      if (Array.isArray(data?.data)) return data.data as JobApplication[];
      return [];
    },
  });

  const handleWithdraw = async (id: number | string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    setWithdrawingId(id);
    try {
      await apiClient.delete(`/job-seeker/applications/${id}`);
      refetch();
    } catch (err: any) {
      alert(err.message || "Failed to withdraw application.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "shortlisted":
        return <Badge variant="success">Shortlisted</Badge>;
      case "interview":
      case "interviewed":
        return <Badge variant="info">Interview Scheduled</Badge>;
      case "hired":
        return <Badge variant="success" className="bg-emerald-600 text-white">Hired</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="warning">Under Review</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-1">
            Candidate Pipeline
          </Badge>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">My Submitted Applications</h1>
          <p className="text-xs text-slate-500">
            Track real-time employer reviews and responses for your applications.
          </p>
        </div>

        <Link href="/jobs">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Explore More Jobs
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#174A7E]" />
          <span className="text-sm font-semibold">Loading your submitted applications...</span>
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const jobTitle = app.job?.title || app.job_post?.title || "Job Position";
            const companyName =
              app.job?.company?.name ||
              app.job?.company_name ||
              app.job_post?.company?.name ||
              "Verified Employer";

            return (
              <Card key={app.id} className="p-4 sm:p-6 space-y-4 border-slate-200 hover:border-slate-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-slate-100 text-[#174A7E] font-bold shrink-0 border border-slate-200">
                      <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#174A7E]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{jobTitle}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate">
                        <span className="truncate">{companyName}</span> • Applied {formatDate(app.applied_at || app.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {app.employer_note && (
                  <div className="rounded-lg bg-sky-50 p-3 border border-sky-100 text-xs text-sky-900 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" /> Employer Note:
                    </p>
                    <p className="leading-relaxed">{app.employer_note}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400">Application ID: #{app.id}</span>

                  <button
                    onClick={() => handleWithdraw(app.id)}
                    disabled={withdrawingId === app.id}
                    className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Withdraw Application
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-16 space-y-3 border-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore active job listings from verified employers and submit your application with a single click.
          </p>
          <Link href="/jobs">
            <Button variant="primary" size="sm">
              Browse Active Jobs
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
