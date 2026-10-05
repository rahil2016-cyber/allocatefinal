"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatDate } from "@/lib/utils";
import {
  Briefcase,
  Users,
  CreditCard,
  Building2,
  PlusCircle,
  Share2,
  ChevronRight,
  ShieldCheck,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  X,
  FileText,
  Edit,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

interface PromoBanner {
  id: number | string;
  title: string;
  image_url: string;
  redirect_url?: string;
  target_url?: string;
  link_url?: string;
}

export default function EmployerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Dialog states
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Banner carousel state
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // 1. Fetch Company Profile
  const { data: company, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["companyProfile"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.COMPANY_PROFILE);
        return res.data?.data || null;
      } catch (e) {
        return null;
      }
    },
    enabled: !!user,
  });

  // 2. Fetch Company Job Posts
  const { data: jobPosts = [], isLoading: isJobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ["companyJobPosts"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.COMPANY_JOB_POSTS);
        // Laravel controller returns items in data
        const items = res.data?.data || [];
        return Array.isArray(items) ? items : [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!user,
  });

  // 3. Fetch Employer Promo Banners
  const { data: banners = [] } = useQuery<PromoBanner[]>({
    queryKey: ["employerBanners"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/banners?for=employer");
        const list = res.data?.data;
        if (Array.isArray(list) && list.length > 0) return list;
        // Fallback to general banners if employer-specific is empty
        const fallback = await apiClient.get("/banners");
        return Array.isArray(fallback.data?.data) ? fallback.data.data : [];
      } catch {
        return [];
      }
    },
  });

  // Auto rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Toast notification timer
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Computed values
  const greetingName = user?.name || user?.email?.split("@")[0] || "Employer";
  const companyName = company?.name || user?.company_name || "Your Company";
  const companyLogoUrl =
    company?.logo_url || company?.company_logo_url || company?.company_logo;
  const isVerified = company?.verification_status === "verified";
  const jobCredits =
    typeof company?.job_credits === "number" ? company.job_credits : 0;

  // Stats
  const publishedCount = jobPosts.filter(
    (j: any) => j.status === "published" || j.status === "active"
  ).length;
  const pendingCount = jobPosts.filter(
    (j: any) => j.status === "pending_review" || j.status === "pending"
  ).length;
  const totalApplicants = jobPosts.reduce(
    (acc: number, j: any) => acc + (Number(j.applications_count) || 0),
    0
  );

  // Handle Post Job click with validations matching Flutter app
  const handlePostJob = () => {
    if (company && !isVerified) {
      setShowVerifyModal(true);
      return;
    }
    if (jobCredits <= 0) {
      setShowCreditModal(true);
      return;
    }
    router.push("/employer/post-job");
  };

  // Share job handler
  const handleShareJob = async (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/jobs/${job.id}`;
    const shareData = {
      title: `${job.title} at ${companyName}`,
      text: `We are hiring for ${job.title}! Apply now on JobAllocate.`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard if cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setToastMessage("Job link copied to clipboard!");
    } catch {
      setToastMessage("Job link copied!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Toast Message ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Container ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ── 1. HEADER CARD (Exact Flutter Employer Card) ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.03)] space-y-5">
          {/* Top Row: Company Logo + Notification Bell / Post Job */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {companyLogoUrl ? (
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-[#174A7E]/10 bg-white p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                  <img
                    src={companyLogoUrl}
                    alt={companyName}
                    className="h-full w-full object-contain rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-slate-200/80 bg-white p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                  <img
                    src="/logo_square.png"
                    alt="JobAllocate"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#174A7E] shrink-0" />
                  <span className="text-sm font-extrabold text-[#174A7E] tracking-tight">
                    {companyName}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Verified Company
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="h-3 w-3 text-amber-600" />
                      Verification Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative h-10 w-10 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-[#174A7E] transition-colors"
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#E53E3E]" />
              </Link>
            </div>
          </div>

          {/* Greeting Row */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hi, {greetingName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium pt-1">
              Welcome to your Employer Management Dashboard. Review postings, track candidates, and allocate talent.
            </p>
          </div>

          {/* Job Credits Pill & Action Shortcuts */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  jobCredits <= 0
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Job Credits: {jobCredits}</span>
              </span>

              {jobCredits <= 0 && (
                <Link
                  href="/employer/subscriptions"
                  className="text-xs font-bold text-[#174A7E] hover:underline flex items-center gap-1"
                >
                  Buy Packages <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/employer/applicants"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5 text-[#174A7E]" />
                <span>Applicants ({totalApplicants})</span>
              </Link>

              <button
                type="button"
                onClick={handlePostJob}
                className="px-4 py-1.5 rounded-xl text-xs font-extrabold text-white bg-[#174A7E] hover:bg-[#123860] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ Post New Job</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. PROMO BANNERS CAROUSEL (Matching Flutter BannerCarousel) ── */}
        {banners.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white group">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeBannerIdx * 100}%)` }}
            >
              {banners.map((b, idx) => {
                const targetUrl = b.redirect_url || b.target_url || b.link_url;
                const Content = (
                  <div className="w-full shrink-0 relative aspect-[21/9] sm:aspect-[24/7] max-h-[220px] bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={b.image_url}
                      alt={b.title || `Banner ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                );

                return targetUrl ? (
                  <a
                    key={b.id || idx}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full shrink-0 block"
                  >
                    {Content}
                  </a>
                ) : (
                  <div key={b.id || idx} className="w-full shrink-0">
                    {Content}
                  </div>
                );
              })}
            </div>

            {/* Left & Right Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveBannerIdx((prev) =>
                      prev === 0 ? banners.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveBannerIdx((prev) => (prev + 1) % banners.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next banner"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveBannerIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeBannerIdx === i
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/50"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 3. STATS GRID (Matching Flutter GridView.count in employer_dashboard_page.dart) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Published */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-[#174A7E]/10 text-[#174A7E] flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <div className="pt-4">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isJobsLoading ? "…" : publishedCount}
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider pt-0.5">
                Published
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="pt-4">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isJobsLoading ? "…" : pendingCount}
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider pt-0.5">
                Pending
              </p>
            </div>
          </div>

          {/* Total Applicants */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="pt-4">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isJobsLoading ? "…" : totalApplicants}
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider pt-0.5">
                Total Applicants
              </p>
            </div>
          </div>

          {/* Job Credits */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="pt-4">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isProfileLoading ? "…" : jobCredits}
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider pt-0.5">
                Job Credits
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. RECENT POSTINGS SECTION (Exact Flutter _jobCard List) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Recent Postings
            </h2>

            <button
              type="button"
              onClick={handlePostJob}
              className="text-xs font-bold text-[#174A7E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Create Job Post <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Job Cards */}
          {isJobsLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-xs">
              Loading recent postings…
            </div>
          ) : jobPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-[#174A7E]/5 text-[#174A7E] flex items-center justify-center">
                <Briefcase className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No jobs posted yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Start connecting with active candidates by creating your first job opening.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePostJob}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#174A7E] hover:bg-[#123860] shadow-sm transition-all"
                >
                  Post First Job
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {jobPosts.map((j: any) => {
                const status = (j.status || "draft").toLowerCase();
                const isPublished = status === "published" || status === "active";
                const isExpired = status === "expired" || status === "closed";
                const isPending = status === "pending_review" || status === "pending";

                const applicantCount = Number(j.applications_count) || 0;

                return (
                  <div
                    key={j.id}
                    onClick={() => router.push(`/employer/post-job?jobId=${j.id}`)}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Left: Icon & Title info */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-[#174A7E]/5 text-[#174A7E] flex items-center justify-center shrink-0 group-hover:bg-[#174A7E]/10 transition-colors">
                        <Briefcase className="h-5 w-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#174A7E] transition-colors">
                            {j.title || "Untitled Job"}
                          </h3>

                          {/* Status Badge */}
                          {isPublished ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Published
                            </span>
                          ) : isExpired ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                              Expired
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Review
                            </span>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          {j.job_type && (
                            <span>{j.job_type}</span>
                          )}
                          {j.created_at && (
                            <>
                              <span>•</span>
                              <span>Posted {formatDate(j.created_at)}</span>
                            </>
                          )}
                          {j.location && (
                            <>
                              <span>•</span>
                              <span>{j.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div
                      className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* View Applicants Button */}
                      <Link
                        href={`/employer/applicants?jobId=${j.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
                      >
                        <Users className="h-3.5 w-3.5 text-[#174A7E]" />
                        <span>Applicants</span>
                        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#174A7E] text-white text-[10px] font-extrabold">
                          {applicantCount}
                        </span>
                      </Link>

                      {/* Share Button (if published) */}
                      {isPublished && (
                        <button
                          type="button"
                          onClick={(e) => handleShareJob(j, e)}
                          title="Share Job"
                          className="h-9 w-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-[#174A7E] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Edit Job Link */}
                      <Link
                        href={`/employer/post-job?jobId=${j.id}`}
                        title="Edit Job"
                        className="h-9 w-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL: Insufficient Credits (Exact Flutter Dialog) ── */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Insufficient Job Credits
              </h3>
              <p className="text-xs text-slate-500 pt-1.5 leading-relaxed">
                You have 0 job credits. Please purchase a package to post more jobs and instantly connect with verified candidates.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href="/employer/subscriptions"
                onClick={() => setShowCreditModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#174A7E] hover:bg-[#123860] shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>View Packages</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Unverified Company (Exact Flutter Dialog) ── */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Company Verification Pending
              </h3>
              <p className="text-xs text-slate-500 pt-1.5 leading-relaxed">
                Your company is not verified yet. You can post jobs once your company profile and documentation are reviewed and approved by the JobAllocate admin.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <Link
                href="/employer/profile"
                onClick={() => setShowVerifyModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#174A7E] hover:bg-[#123860] shadow-sm transition-all"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
