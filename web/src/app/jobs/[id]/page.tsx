"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { JobApplyModal } from "@/components/jobs/JobApplyModal";
import { Job } from "@/lib/types";
import { formatSalary, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  MapPin,
  Building2,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const jobId = resolvedParams.id;
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch real job details from API
  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ["jobDetails", jobId],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.JOB_DETAILS(jobId));
      return res.data?.data;
    },
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#174A7E] mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Fetching job details from server...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <Card className="p-8 text-center space-y-4 max-w-lg mx-auto border-slate-200">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Job Posting Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested position may have been closed, removed, or is currently unavailable.
          </p>
          <Link href="/jobs" className="inline-block pt-2">
            <Button variant="primary" size="md">
              Browse Available Jobs
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const companyName = job.company?.name || job.company_name || "Company";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#174A7E] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to All Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Job Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <Card className="p-6 sm:p-8 space-y-6 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#174A7E] text-white font-bold text-xl border border-slate-200 shrink-0">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#174A7E] flex items-center gap-1">
                      {companyName}
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 fill-sky-100" />
                    </span>
                    {job.is_urgent && <Badge variant="danger" size="sm">Urgent Hiring</Badge>}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{job.title}</h1>
                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    {job.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.city}</span>}
                    {job.created_at && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Posted {formatDate(job.created_at)}</span>}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`rounded-full p-2.5 transition-colors border ${
                  isSaved ? "bg-amber-50 text-amber-600 border-amber-200" : "text-slate-400 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compensation</span>
                <span className="text-lg font-extrabold text-[#174A7E]">
                  {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsApplyModalOpen(true)}
                className="shadow-md"
              >
                Apply for this Position
              </Button>
            </div>
          </Card>

          {/* Description Card */}
          <Card className="p-6 sm:p-8 space-y-6 border-slate-200">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Job Overview & Role Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description || "No description provided."}
              </p>
            </div>

            {job.responsibilities && (
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Key Responsibilities
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}

            {job.requirements && (
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Candidate Requirements & Qualifications
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-8 lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-5 border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Job Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Employment Type</span>
                <Badge variant="primary">{job.job_type || "Full-time"}</Badge>
              </div>
              {job.city && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="font-bold text-slate-900">{job.city}</span>
                </div>
              )}
              {job.category?.name && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Category</span>
                  <span className="font-bold text-slate-900">{job.category.name}</span>
                </div>
              )}
              {job.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Posted Date</span>
                  <span className="font-bold text-slate-900">{formatDate(job.created_at)}</span>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              className="w-full py-2.5 font-bold shadow-md"
              onClick={() => setIsApplyModalOpen(true)}
            >
              Apply Now
            </Button>
          </Card>
        </div>
      </div>

      <JobApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}
