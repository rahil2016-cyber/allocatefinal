"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { JobCard } from "@/components/jobs/JobCard";
import { JobApplyModal } from "@/components/jobs/JobApplyModal";
import { Job } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Bookmark, ArrowRight, Loader2 } from "lucide-react";

export default function SavedJobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { data: savedJobs = [], isLoading, refetch } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.SAVED_JOBS);
      const data = res.data?.data;
      if (Array.isArray(data)) return data as Job[];
      if (Array.isArray(data?.data)) return data.data as Job[];
      return [];
    },
  });

  const handleSaveToggle = async (job: Job) => {
    try {
      await apiClient.post(ENDPOINTS.SAVE_JOB(job.id));
      refetch();
    } catch {
      refetch();
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-1">
            Bookmarked Openings
          </Badge>
          <h1 className="text-2xl font-extrabold text-slate-900">Your Saved Jobs</h1>
          <p className="text-xs text-slate-500">
            Quickly access positions you saved for later review or application.
          </p>
        </div>

        <Link href="/jobs">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Discover More Jobs
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#174A7E]" />
          <span className="text-sm font-semibold">Loading bookmarked jobs...</span>
        </div>
      ) : savedJobs.length > 0 ? (
        <div>
          {/* Mobile swipe view (<sm) */}
          <div className="sm:hidden -mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-3">
            {savedJobs.map((job) => (
              <div key={job.id} className="w-[88vw] max-w-[360px] shrink-0 snap-start">
                <JobCard
                  job={{ ...job, is_saved: true }}
                  onSaveToggle={handleSaveToggle}
                  onApply={(j) => {
                    setSelectedJob(j);
                    setIsApplyModalOpen(true);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Tablet & Desktop Grid (sm+) */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-4">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={{ ...job, is_saved: true }}
                onSaveToggle={handleSaveToggle}
                onApply={(j) => {
                  setSelectedJob(j);
                  setIsApplyModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-16 space-y-3 border-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-amber-500">
            <Bookmark className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No saved jobs yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any job card to save positions for easy access later.
          </p>
          <Link href="/jobs">
            <Button variant="primary" size="sm">
              Explore Active Jobs
            </Button>
          </Link>
        </Card>
      )}

      <JobApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}
