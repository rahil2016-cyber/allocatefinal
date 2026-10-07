"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { JobApplyModal } from "@/components/jobs/JobApplyModal";
import { AiChatModal } from "@/components/ai/AiChatModal";
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
  Share2,
  Flag,
  Sparkles,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  Zap,
  Users,
  AlertCircle,
  Loader2,
  X,
  Send,
} from "lucide-react";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const jobId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"job" | "company">("job");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam / Fraud");
  const [reportDescription, setReportDescription] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [reportErrorMessage, setReportErrorMessage] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);

  // Fetch job details
  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ["jobDetails", jobId],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.JOB_DETAILS(jobId));
      return res.data?.data;
    },
    enabled: !!jobId,
  });

  const [isSaved, setIsSaved] = useState(false);

  // Sync saved status
  React.useEffect(() => {
    if (job?.is_saved !== undefined) {
      setIsSaved(Boolean(job.is_saved));
    }
  }, [job?.is_saved]);

  // Save / Bookmark mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        router.push("/login?role=job_seeker");
        return;
      }
      const res = await apiClient.post(ENDPOINTS.SAVE_JOB(jobId));
      return res.data;
    },
    onSuccess: () => {
      setIsSaved((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ["jobDetails", jobId] });
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to update saved status.");
    },
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        router.push("/login?role=job_seeker");
        return;
      }
      const res = await apiClient.post(ENDPOINTS.REPORT_JOB(jobId), {
        reason: reportReason,
        description: reportDescription.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setReportStatus("success");
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportStatus("idle");
        setReportDescription("");
      }, 2000);
    },
    onError: (err: any) => {
      setReportStatus("error");
      setReportErrorMessage(err.response?.data?.message || "Failed to submit report. Please try again.");
    },
  });

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title || "Job Posting",
          text: `Check out this job: ${job?.title} at ${job?.company?.name || job?.company_name || "JobAllocate"}`,
          url,
        });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      } catch (_) {}
    }
  };

  const handleContactHR = () => {
    if (!job) return;
    const pref = job.contact_preference || "phone_call";
    const phone = job.contact_phone || "";
    const email = job.contact_email || "";

    if (pref === "whatsapp" && phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, "");
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi, I am interested in your job post: ${job.title}`)}`, "_blank");
    } else if (pref === "email" && email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Job Application for ${job.title}`)}&body=${encodeURIComponent(`Hi, I would like to apply for the ${job.title} position.`)}`;
    } else if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#174A7E] mx-auto" />
        <p className="text-sm font-bold text-slate-600">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Card className="p-8 text-center space-y-4 max-w-lg mx-auto border-slate-200 shadow-sm">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Job Posting Not Available</h2>
          <p className="text-xs text-slate-500">
            This job posting may have expired, reached application capacity, or has been archived.
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
  const companyLogo = job.company_logo_url || job.company?.company_logo_url || job.company_logo;
  const isSecurityDeposit = Boolean(job.security_deposit);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-16">
      {/* Top Navigation & Actions Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#174A7E] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Jobs</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Ask AI Button */}
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 text-[#174A7E] border border-sky-200/80 font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="Ask AI Career Coach about this job"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#174A7E]" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              aria-label={isSaved ? "Saved Job" : "Save Job"}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isSaved
                  ? "bg-amber-50 text-amber-600 border-amber-300"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
              title={isSaved ? "Saved" : "Save Job"}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer relative"
              title="Share Job"
            >
              <Share2 className="h-4 w-4" />
              {copiedToast && (
                <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>

            {/* Report Button */}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="p-2 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
              title="Report Job"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-5 space-y-5">
        {/* Header Hero Card */}
        <Card className="p-5 sm:p-6 md:p-8 bg-white border-slate-200 shadow-sm rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Building2 className="h-7 w-7 text-[#174A7E]" />
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#174A7E] flex items-center gap-1">
                    {companyName}
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 fill-sky-100" />
                  </span>
                  {job.is_urgent && <Badge variant="danger" size="sm">Urgent Hiring</Badge>}
                  {job.is_featured && <Badge variant="primary" size="sm">Featured</Badge>}
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {job.location || job.city || "Remote"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    {job.experience_level ? job.experience_level.replace(/_/g, " ").toUpperCase() : "Any Experience"}
                  </span>
                  {job.created_at && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Posted {formatDate(job.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Apply CTA */}
            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsApplyModalOpen(true)}
                className="font-bold px-7 shadow-md"
              >
                Apply Now
              </Button>
              {job.contact_phone && (
                <button
                  type="button"
                  onClick={handleContactHR}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#174A7E] hover:underline"
                >
                  {job.contact_preference === "whatsapp" ? (
                    <>
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>WhatsApp HR</span>
                    </>
                  ) : (
                    <>
                      <Phone className="h-3.5 w-3.5 text-[#174A7E]" />
                      <span>Call HR</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Salary & Incentives Block */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fixed Salary:</span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                </span>
              </div>
              {job.incentive_detail && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  + Incentive Available
                </span>
              )}
            </div>

            {job.incentive_detail && (
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-1.5">
                <span className="font-bold text-slate-700 shrink-0">Incentive Details:</span>
                <span>{job.incentive_detail}</span>
              </div>
            )}

            {job.salary_insights && (
              <div className="pt-1 text-xs text-slate-500 flex items-start gap-1.5">
                <span className="font-bold text-slate-600 shrink-0">Salary Insights:</span>
                <span>{job.salary_insights}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Security Deposit Warning or Protection Notice */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            isSecurityDeposit
              ? "bg-amber-50/80 border-amber-200 text-amber-900"
              : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
          }`}
        >
          {isSecurityDeposit ? (
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            <p className="font-bold">
              {isSecurityDeposit ? "Security Deposit Notice" : "Zero Fee Guarantee — No Payment Involved"}
            </p>
            <p className="mt-0.5 text-slate-700">
              {isSecurityDeposit
                ? `Candidates are asked for a security deposit (e.g. kit/uniform/equipment). ${job.security_deposit_amount ? `Deposit amount: ${job.security_deposit_amount}.` : ""} Never pay any unverified upfront fee.`
                : "JobAllocate strictly prohibits employers from demanding money or training fees from candidates. Report this job immediately if anyone requests payment."}
            </p>
          </div>
        </div>

        {/* Two-Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2">
          <button
            type="button"
            onClick={() => setActiveTab("job")}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer text-center ${
              activeTab === "job"
                ? "border-[#174A7E] text-[#174A7E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Job Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("company")}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer text-center ${
              activeTab === "company"
                ? "border-[#174A7E] text-[#174A7E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Company Details
          </button>
        </div>

        {/* TAB 1: JOB DETAILS */}
        {activeTab === "job" && (
          <div className="space-y-5">
            {/* Job Highlights */}
            <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-sm rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Zap className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900">Job Highlights</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                {job.job_timings && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold">Job Timings</span>
                    <span className="font-semibold text-slate-800 mt-0.5">{job.job_timings}</span>
                  </div>
                )}
                {job.working_days && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold">Working Days</span>
                    <span className="font-semibold text-slate-800 mt-0.5">{job.working_days}</span>
                  </div>
                )}
                {job.languages && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold">Languages</span>
                    <span className="font-semibold text-slate-800 mt-0.5">{job.languages}</span>
                  </div>
                )}
                {job.assets_required && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold">Assets Required</span>
                    <span className="font-semibold text-slate-800 mt-0.5">{job.assets_required}</span>
                  </div>
                )}
                {job.department && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold">Department</span>
                    <span className="font-semibold text-slate-800 mt-0.5">{job.department}</span>
                  </div>
                )}
                {job.role_category && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold">Role Category</span>
                    <span className="font-semibold text-slate-800 mt-0.5">{job.role_category}</span>
                  </div>
                )}
                {job.functional_area && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold">Functional Area</span>
                    <span className="font-semibold text-slate-800 mt-0.5">{job.functional_area}</span>
                  </div>
                )}
                {job.job_type && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold">Employment Type</span>
                    <span className="font-semibold text-slate-800 mt-0.5 capitalize">{job.job_type.replace(/_/g, " ")}</span>
                  </div>
                )}
              </div>

              {/* Skills Chips */}
              {job.skills && job.skills.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-slate-400 font-bold text-xs block">Key Skills Required</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Candidate Requirements */}
            <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-sm rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <GraduationCap className="h-4 w-4 text-[#174A7E]" />
                <h3 className="text-sm font-extrabold text-slate-900">Candidate Requirements</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-bold block">Qualification</span>
                  <p className="font-bold text-slate-800 mt-1">
                    {job.education || "10th / 12th / Any Graduate"}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-bold block">Age & Gender Preference</span>
                  <p className="font-bold text-slate-800 mt-1">
                    {job.age_min && job.age_max ? `${job.age_min} - ${job.age_max} Years` : "18 - 45 Years"} •{" "}
                    {job.gender_preference
                      ? job.gender_preference === "male_only"
                        ? "Male Candidates Only"
                        : job.gender_preference === "female_only"
                        ? "Female Candidates Only"
                        : "Any Gender"
                      : "Any Gender"}
                  </p>
                </div>
              </div>

              {/* Preferred Locations */}
              {job.preferred_locations && job.preferred_locations.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs space-y-1.5">
                  <span className="text-slate-500 font-bold block">Preferred Candidate Locations</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.preferred_locations.map((loc, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-medium">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements text */}
              {job.requirements && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">Detailed Requirements</span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </p>
                </div>
              )}
            </Card>

            {/* Job Description & Responsibilities */}
            <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-sm rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Briefcase className="h-4 w-4 text-[#174A7E]" />
                <h3 className="text-sm font-extrabold text-slate-900">Job Description</h3>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-4">
                <p>{job.description || "No detailed description provided."}</p>

                {job.responsibilities && (
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold text-slate-800 mb-2">Key Responsibilities:</h4>
                    <p>{job.responsibilities}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Interview & HR Contact */}
            <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-sm rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Calendar className="h-4 w-4 text-[#174A7E]" />
                <h3 className="text-sm font-extrabold text-slate-900">Interview & HR Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {job.interview_timings && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 font-bold block">Interview Timings</span>
                    <p className="font-bold text-slate-800 mt-1">{job.interview_timings}</p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-bold block">Contact Person</span>
                  <p className="font-bold text-slate-800 mt-1">{job.contact_person || "HR Recruitment Team"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {job.contact_phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContactHR}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#174A7E]"
                  >
                    {job.contact_preference === "whatsapp" ? (
                      <>
                        <MessageCircle className="h-4 w-4 text-emerald-600" />
                        <span>Chat on WhatsApp</span>
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 text-[#174A7E]" />
                        <span>Call Recruiter</span>
                      </>
                    )}
                  </Button>
                )}

                {job.contact_email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = `mailto:${job.contact_email}?subject=${encodeURIComponent(`Application for ${job.title}`)}`;
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700"
                  >
                    <Mail className="h-4 w-4 text-slate-600" />
                    <span>Email HR</span>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: COMPANY DETAILS */}
        {activeTab === "company" && (
          <div className="space-y-5">
            <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-sm rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {companyLogo ? (
                    <img src={companyLogo} alt={companyName} className="h-full w-full object-contain p-1" />
                  ) : (
                    <Building2 className="h-6 w-6 text-[#174A7E]" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{companyName}</h3>
                  <p className="text-xs text-slate-500">{job.location || job.city || "India"}</p>
                </div>
              </div>

              {job.industry_type && (
                <div className="pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-bold block">Industry</span>
                  <span className="font-bold text-slate-800 capitalize mt-0.5 block">
                    {job.industry_type.replace(/_/g, " ")}
                  </span>
                </div>
              )}

              {/* About company */}
              {(job.about_company || job.company?.description) && (
                <div className="pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <span className="text-slate-900 font-bold block text-xs mb-1">About the Organization</span>
                  <p className="whitespace-pre-line">{job.about_company || job.company?.description}</p>
                </div>
              )}

              {/* Company Website */}
              {job.company?.website && (
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={job.company.website.startsWith("http") ? job.company.website : `https://${job.company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174A7E] hover:underline"
                  >
                    <span>Visit Company Website</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* Perks & Benefits */}
              {job.benefits && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-extrabold text-slate-900 block">Company Benefits & Perks</span>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {job.benefits}
                  </div>
                </div>
              )}
            </Card>

            {/* Report Job Card */}
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-red-900">Notice something wrong or suspicious?</p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  Report fraud, misleading pay, fake recruiter details, or upfront money demands.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
                className="shrink-0 text-red-600 border-red-300 hover:bg-red-50 text-xs font-bold"
              >
                Report this Job
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 lg:hidden">
        <div className="min-w-0 pr-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fixed Pay</span>
          <p className="text-xs sm:text-sm font-black text-[#174A7E] truncate">
            {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {job.contact_phone && (
            <button
              type="button"
              onClick={handleContactHR}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 active:scale-95"
              title="Contact Recruiter"
            >
              {job.contact_preference === "whatsapp" ? (
                <MessageCircle className="h-4 w-4 text-emerald-600" />
              ) : (
                <Phone className="h-4 w-4 text-[#174A7E]" />
              )}
            </button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsApplyModalOpen(true)}
            className="font-bold px-5 shadow-md active:scale-95"
          >
            Apply Now
          </Button>
        </div>
      </div>

      {/* Job Apply Modal */}
      <JobApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      {/* AI Career Coach Modal for this job */}
      <AiChatModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
      />

      {/* Report Job Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                <h3 className="text-base font-extrabold text-slate-900">Report Job Posting</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reportStatus === "success" ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Report Submitted</h4>
                <p className="text-xs text-slate-500">
                  Thank you for helping keep JobAllocate safe. Our moderation team will review this posting.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-500">
                  Please let us know why this job posting violates JobAllocate policies.
                </p>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-hidden focus:border-[#174A7E]"
                  >
                    <option value="Spam / Fraud">Spam / Fraud</option>
                    <option value="Asking for Money">Asking for Money / Fee Demanded</option>
                    <option value="Misleading Information">Misleading Salary / Job Information</option>
                    <option value="Inappropriate Content">Inappropriate / Offensive Content</option>
                    <option value="Already Filled">Position Already Closed</option>
                    <option value="Other">Other Violation</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Additional Details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide additional details to help our team investigate..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-hidden focus:border-[#174A7E]"
                  />
                </div>

                {reportStatus === "error" && (
                  <p className="text-red-600 font-bold text-[11px]">{reportErrorMessage}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReportModalOpen(false)}
                    disabled={reportMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => reportMutation.mutate()}
                    disabled={reportMutation.isPending}
                    className="font-bold"
                  >
                    {reportMutation.isPending ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
