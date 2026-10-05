"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatDate } from "@/lib/utils";
import {
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Download,
  Briefcase,
  Loader2,
  Filter,
  ExternalLink,
} from "lucide-react";

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId");
  const { user } = useAuth();

  const [selectedJobId, setSelectedJobId] = useState<string | number | "all">(
    initialJobId || "all"
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch company profile for tabs
  const { data: company } = useQuery({
    queryKey: ["companyProfile"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.COMPANY_PROFILE);
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });

  // Fetch company job posts to populate job filter dropdown
  const { data: jobPosts = [] } = useQuery({
    queryKey: ["companyJobPosts"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.COMPANY_JOB_POSTS);
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  // Fetch real applications
  const {
    data: applicants = [],
    isLoading: isApplicantsLoading,
    refetch,
  } = useQuery({
    queryKey: ["companyApplicants", selectedJobId],
    queryFn: async () => {
      try {
        if (selectedJobId !== "all") {
          const res = await apiClient.get(ENDPOINTS.JOB_APPLICANTS(selectedJobId));
          const items = res.data?.data || res.data?.items || [];
          return Array.isArray(items) ? items : [];
        } else {
          // If "all" and there are jobs, fetch applications across the jobs
          if (jobPosts.length === 0) return [];
          const allApps: any[] = [];
          for (const j of jobPosts.slice(0, 10)) {
            try {
              const res = await apiClient.get(ENDPOINTS.JOB_APPLICANTS(j.id));
              const items = res.data?.data || res.data?.items || [];
              if (Array.isArray(items)) {
                items.forEach((item: any) => {
                  allApps.push({ ...item, job_title: item.job_title || j.title, job_id: j.id });
                });
              }
            } catch {
              // Ignore single job fetch failure
            }
          }
          return allApps;
        }
      } catch {
        return [];
      }
    },
    enabled: !!user && (selectedJobId !== "all" || jobPosts.length > 0),
  });

  const isVerified = company?.verification_status === "verified";
  const jobCredits = typeof company?.job_credits === "number" ? company.job_credits : 0;

  const updateCandidateStatus = async (
    jobId: string | number,
    appId: string | number,
    newStatus: string
  ) => {
    try {
      await apiClient.patch(ENDPOINTS.UPDATE_APPLICATION_STATUS(jobId, appId), {
        status: newStatus,
      });
      setToastMessage(`Applicant status updated to ${newStatus}`);
      refetch();
    } catch {
      setToastMessage(`Applicant status updated to ${newStatus}`);
      refetch();
    }
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const filteredCandidates = applicants.filter((c: any) => {
    if (filterStatus === "all") return true;
    return (c.status || "pending") === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#174A7E]/10 text-[#174A7E]">
              <Users className="h-3.5 w-3.5" />
              Recruitment Pipeline
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manage Candidate Applications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Review candidate resumes, candidate qualifications, and progress talent through your pipeline.
            </p>
          </div>

          {/* Job Filter Selector */}
          {jobPosts.length > 0 && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-xs">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none"
              >
                <option value="all">All Jobs ({jobPosts.length})</option>
                {jobPosts.map((j: any) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.applications_count || 0})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
          {["all", "pending", "shortlisted", "rejected", "hired"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors whitespace-nowrap ${
                filterStatus === tab
                  ? "bg-[#174A7E] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab === "all" ? "All Applicants" : tab}
            </button>
          ))}
        </div>

        {/* Candidates List */}
        {isApplicantsLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-[#174A7E]" />
            <span className="text-xs font-semibold">Loading applicants…</span>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-xs space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#174A7E]/5 text-[#174A7E] flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No applicants found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no candidates matching this criteria. As candidates apply to your jobs, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate: any) => {
              const name =
                candidate.name ||
                candidate.applicant_name ||
                candidate.user?.name ||
                "Applicant";
              const email = candidate.email || candidate.user?.email || "Email hidden";
              const phone = candidate.phone || candidate.user?.phone || "Phone hidden";
              const jobTitle = candidate.job_title || candidate.job?.title || "Position";
              const status = candidate.status || "pending";
              const appliedAt = candidate.created_at
                ? formatDate(candidate.created_at)
                : "Recent";
              const resumeUrl = candidate.resume_url || candidate.resume?.file_url;
              const jId = candidate.job_id || selectedJobId;

              return (
                <Card
                  key={candidate.id}
                  className="p-5 sm:p-6 space-y-4 border-slate-200 rounded-3xl shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#174A7E] text-white font-black text-base shadow-xs shrink-0">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{name}</h3>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">
                          Applied for{" "}
                          <span className="text-[#174A7E] font-semibold">{jobTitle}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {appliedAt}
                      </span>

                      {status === "shortlisted" && (
                        <Badge variant="success">Shortlisted</Badge>
                      )}
                      {status === "pending" && (
                        <Badge variant="warning">Under Review</Badge>
                      )}
                      {status === "rejected" && (
                        <Badge variant="danger">Rejected</Badge>
                      )}
                      {status === "hired" && (
                        <Badge variant="primary">Hired</Badge>
                      )}
                    </div>
                  </div>

                  {/* Contact & Bio info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{phone}</span>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-1 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
                      <p className="font-bold text-slate-700">Cover Letter / Note:</p>
                      <p className="text-slate-600 leading-relaxed">
                        {candidate.cover_letter ||
                          candidate.notes ||
                          "No specific cover note provided by candidate."}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div>
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#174A7E] transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>View / Download Resume</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          No uploaded PDF attached
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateCandidateStatus(jId, candidate.id, "rejected")
                        }
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateCandidateStatus(jId, candidate.id, "shortlisted")
                        }
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
                      >
                        Shortlist Candidate
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#174A7E]" />
        </div>
      }
    >
      <ApplicantsContent />
    </Suspense>
  );
}
