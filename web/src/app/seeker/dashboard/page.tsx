"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Job } from "@/lib/types";
import { JobApplyModal } from "@/components/jobs/JobApplyModal";
import { ResumeMiniPreview } from "@/components/resume/ResumeMiniPreview";
import { ResumePreviewModal } from "@/components/resume/ResumePreviewModal";
import {
  TrendingUp,
  BarChart3,
  Bookmark,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Code,
  Headphones,
  Grid,
  Home as HomeIcon,
  Heart,
  Factory,
  ShoppingCart,
  MapPin,
  Briefcase,
  Sparkles,
  Loader2,
  FileText,
  Edit3,
  Download,
  Eye,
} from "lucide-react";

const ALL_RESUME_TEMPLATES = [
  {
    key: "t3_bold_navy",
    label: "Bold Navy Professional",
    category: "Corporate",
    accent: "#174A7E",
    badge: "99% ATS Score",
    desc: "Bold deep navy header bar with high contrast executive styling.",
  },
  {
    key: "t1_teal_sidebar",
    label: "Teal · Two Column",
    category: "Two Column",
    accent: "#0f766e",
    badge: "Recruiter Choice",
    desc: "Teal accent sidebar with structured two-column layout.",
  },
  {
    key: "t2_minimal",
    label: "Slate Executive",
    category: "Executive",
    accent: "#1e293b",
    badge: "Executive Grade",
    desc: "Clean slate header with sleek corporate typography.",
  },
  {
    key: "t13_academic_clean",
    label: "Academic · Clean",
    category: "Academic",
    accent: "#064e3b",
    badge: "Fresher Approved",
    desc: "Formal emerald layout for research, academic & engineering CVs.",
  },
  {
    key: "t7_geometric_modern",
    label: "Geometric · Modern",
    category: "Creative",
    accent: "#5b21b6",
    badge: "Modern UI",
    desc: "Vibrant violet headers with geometric structural blocks.",
  },
  {
    key: "t6_navy_two_column",
    label: "Navy · Corporate",
    category: "Corporate",
    accent: "#1e1b4b",
    badge: "Top Ranked",
    desc: "Navy blue sidebar with dedicated contact and skills column.",
  },
  {
    key: "t10_creative_sunset",
    label: "Sunset · Creative",
    category: "Creative",
    accent: "#be123c",
    badge: "Portfolio Style",
    desc: "Crimson sunset header banner designed for creative roles.",
  },
  {
    key: "t5_modern_split",
    label: "Modern Split",
    category: "Modern",
    accent: "#1e3a8a",
    badge: "Clean Layout",
    desc: "Split header design with cobalt accents and modern spacing.",
  },
  {
    key: "t12_royal_gold",
    label: "Royal · Gold",
    category: "Premium",
    accent: "#d97706",
    badge: "Luxury Finish",
    desc: "Premium gold-trimmed dark theme with luxury framing.",
  },
  {
    key: "t4_classic_serif",
    label: "Meridian Editorial",
    category: "Editorial",
    accent: "#292524",
    badge: "Editorial Serif",
    desc: "Traditional editorial serif typography with subtle borders.",
  },
  {
    key: "t11_mono_swiss",
    label: "Swiss · Mono",
    category: "Minimalist",
    accent: "#171717",
    badge: "Minimalist",
    desc: "Minimalist Swiss grid layout with high readability.",
  },
  {
    key: "t8_typewriter_retro",
    label: "Typewriter · Retro",
    category: "Retro",
    accent: "#78350f",
    badge: "Retro Style",
    desc: "Classic monospace retro font with warm earth tones.",
  },
  {
    key: "t9_vintage_folio",
    label: "Vintage · Folio",
    category: "Vintage",
    accent: "#422006",
    badge: "Classic Folio",
    desc: "Classic warm folio styling with framed headers.",
  },
];

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<number | string>>(new Set());

  // Resume full-scale preview modal state
  const [previewModalKey, setPreviewModalKey] = useState<string | null>(null);
  const [previewModalTitle, setPreviewModalTitle] = useState("");

  const openFullResumePreview = (key: string, label: string) => {
    setPreviewModalKey(key);
    setPreviewModalTitle(label);
  };

  const resumeSliderRef = useRef<HTMLDivElement>(null);

  const handleResumeScrollLeft = () => {
    if (resumeSliderRef.current) {
      resumeSliderRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const handleResumeScrollRight = () => {
    if (resumeSliderRef.current) {
      resumeSliderRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  // Fetch real banners from API
  const { data: banners = [] } = useQuery({
    queryKey: ["seekerBanners"],
    queryFn: async () => {
      const res = await apiClient.get("/banners?for=job_seeker");
      return res.data?.data || [];
    },
  });

  // Fetch real categories & real job counts from backend API
  const { data: apiCategories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["popularCategories"],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.CATEGORIES);
      return res.data?.data || [];
    },
  });

  // Fetch live backend jobs for Latest Jobs feed
  const { data: jobsList = [], isLoading: isJobsLoading } = useQuery<Job[]>({
    queryKey: ["seekerDashboardJobs"],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.JOBS, { params: { per_page: 9 } });
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });

  // Fetch real applications count & list
  const { data: applications = [] } = useQuery({
    queryKey: ["myApplicationsDashboard"],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.MY_APPLICATIONS);
      return res.data?.data || [];
    },
    enabled: !!user,
  });

  // Fetch real saved jobs count
  const { data: savedJobs = [], isLoading: isSavedLoading } = useQuery({
    queryKey: ["savedJobsDashboard"],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.SAVED_JOBS);
      return res.data?.data || [];
    },
    enabled: !!user,
  });

  // Map icon for category based on icon key or label
  const getCategoryIcon = (iconKey?: string, label?: string) => {
    const l = (label || "").toLowerCase();
    if (l.includes("bank") || l.includes("finance")) return Landmark;
    if (l.includes("sales") || l.includes("business")) return TrendingUp;
    if (l.includes("software") || l.includes("it")) return Code;
    if (l.includes("bpo") || l.includes("telecaller")) return Headphones;
    if (l.includes("private")) return Grid;
    if (l.includes("work from home") || l.includes("remote")) return HomeIcon;
    if (l.includes("health")) return Heart;
    if (l.includes("manufactur")) return Factory;
    return ShoppingCart;
  };

  const getCategoryColor = (idx: number) => {
    const colors = [
      "bg-blue-50 text-blue-600 border-blue-100",
      "bg-emerald-50 text-emerald-600 border-emerald-100",
      "bg-purple-50 text-purple-600 border-purple-100",
      "bg-amber-50 text-amber-600 border-amber-100",
      "bg-rose-50 text-rose-600 border-rose-100",
      "bg-sky-50 text-sky-600 border-sky-100",
      "bg-red-50 text-red-600 border-red-100",
      "bg-violet-50 text-violet-600 border-violet-100",
      "bg-orange-50 text-orange-600 border-orange-100",
    ];
    return colors[idx % colors.length];
  };

  const toggleSaveJob = (jobId: number | string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  // Active promo banner image if returned by API
  const promoBanner = banners.length > 0 ? banners[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* 1. HERO BANNER CAROUSEL */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm bg-white">
        {promoBanner && promoBanner.image_url ? (
          <div className="relative w-full h-[200px] sm:h-[300px] md:h-[360px] lg:h-[400px] overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center">
            <img
              src={promoBanner.image_url}
              alt={promoBanner.title || "JobAllocate Banner"}
              className="w-full h-full object-contain rounded-2xl block"
            />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-slate-100 via-sky-50 to-blue-100/60 p-5 sm:p-7 md:p-8 h-[200px] sm:h-[300px] md:h-[360px] lg:h-[400px] flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <span className="text-base sm:text-lg font-extrabold text-[#E53E3E]">Job</span>
                    <span className="text-base sm:text-lg font-extrabold text-[#174A7E]">Allocate</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">— Right job, right candidate</span>
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    <span className="text-[#E53E3E]">LOCAL JOBS</span> <br />
                    FIND JOBS NEAR YOU
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700 pt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-red-500" /> Your City</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-blue-500" /> Your District</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-500" /> Your Taluk</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-2xs">
                    Search Local Jobs
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-2xs">
                    Jobs in Your Area
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-2xs">
                    Verified Employers
                  </span>
                </div>

                <div>
                  <Link href="/jobs">
                    <Button variant="primary" size="md" className="rounded-full bg-[#E53E3E] hover:bg-[#C53030] px-6 font-bold shadow-md text-xs sm:text-sm">
                      Explore Jobs →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Visual / Tagline Illustration */}
              <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#174A7E] to-slate-900 p-5 text-white text-center space-y-3 shadow-lg w-full">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20">
                    <Briefcase className="h-6 w-6 text-sky-300" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold italic tracking-wide text-sky-200">
                      "Opportunities are closer than you think"
                    </p>
                    <p className="text-xs text-slate-300 mt-1 font-medium">
                      Better Jobs • Brighter Futures
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carousel controls */}
        <button className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md hover:bg-white transition-all hover:scale-105 active:scale-95 z-20">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md hover:bg-white transition-all hover:scale-105 active:scale-95 z-20">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 2. POPULAR CATEGORIES (Real API Job Counts) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Popular Categories</h2>
            <p className="text-xs text-slate-500 font-medium">Explore jobs by top industries & roles</p>
          </div>
          <Link href="/jobs" className="text-xs font-bold text-slate-700 hover:text-[#174A7E] flex items-center gap-1">
            View all categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#174A7E]" />
            <span className="text-xs font-semibold">Loading real API categories...</span>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {apiCategories.map((cat: any, idx: number) => {
                const IconComp = getCategoryIcon(cat.icon, cat.label);
                const colorClass = getCategoryColor(idx);
                const realJobCount = cat.job_posts_count !== undefined ? `${cat.job_posts_count} jobs` : "0 jobs";

                return (
                  <Link
                    key={idx}
                    href={`/jobs?industry=${encodeURIComponent(cat.industry_type || "")}`}
                    className="flex-none w-36 sm:w-40 rounded-2xl bg-white p-3.5 text-center border border-slate-200/80 shadow-2xs hover:shadow-md transition-all group"
                  >
                    <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${colorClass} mb-2 transition-transform group-hover:scale-110`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#174A7E]">{cat.label}</h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{realJobCount}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. RESUME STUDIO & JOB SEEKER CALLOUT CARD */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-50 via-sky-50/50 to-blue-50 p-6 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-1.5 max-w-2xl">
          <span className="text-[10px] font-bold text-[#174A7E] uppercase tracking-wider block">
            RESUME STUDIO & CAREER BUILDER
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Find your next opportunity & Build Your Resume
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Browse jobs, apply in one tap, and manage your career — same account as the JobAllocate app.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          <Link href="/seeker/resume">
            <Button variant="primary" size="md" className="rounded-full bg-[#0284C7] hover:bg-[#0369A1] font-bold shadow-md px-6">
              <FileText className="h-4 w-4 mr-1.5" /> Build Resume →
            </Button>
          </Link>
          <span className="text-[11px] text-slate-500 font-medium pt-0.5">
            Create & export professional PDF resumes in minutes
          </span>
        </div>
      </div>

      {/* 4. QUICK STATS ROW (3 White Cards with Real API Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Recommended */}
        <Link href="/jobs">
          <Card className="p-4 flex items-center justify-between border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <TrendingUp className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Recommended</p>
                <p className="text-2xl font-black text-slate-900">{jobsList.length > 0 ? jobsList.length : 0}</p>
                <p className="text-[10px] font-medium text-slate-400">jobs available</p>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600">
              <ArrowRight className="h-4 w-4" />
            </div>
          </Card>
        </Link>

        {/* Related */}
        <Link href="/jobs">
          <Card className="p-4 flex items-center justify-between border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BarChart3 className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Related</p>
                <p className="text-2xl font-black text-slate-900">{applications.length}</p>
                <p className="text-[10px] font-medium text-slate-400">applications submitted</p>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ArrowRight className="h-4 w-4" />
            </div>
          </Card>
        </Link>

        {/* Saved */}
        <Link href="/seeker/saved">
          <Card className="p-4 flex items-center justify-between border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <Bookmark className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Saved</p>
                <p className="text-2xl font-black text-slate-900">
                  {isSavedLoading ? "0" : savedJobs.length}
                </p>
                <p className="text-[10px] font-medium text-slate-400">jobs saved</p>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <ArrowRight className="h-4 w-4" />
            </div>
          </Card>
        </Link>
      </div>

      {/* 5. LATEST JOBS FEED */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Latest Jobs</h2>
            <p className="text-xs text-slate-500 font-medium">Fresh opportunities from top companies</p>
          </div>
          <Link href="/seeker/applications" className="text-xs font-bold text-slate-700 hover:text-[#174A7E] flex items-center gap-1">
            My Applications <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isJobsLoading ? (
          <div className="py-12 text-center text-slate-400 flex justify-center items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#174A7E]" />
            <span className="text-xs font-semibold">Loading latest jobs...</span>
          </div>
        ) : jobsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobsList.map((job) => {
              const companyName = job.company?.name || job.company_name || "Company";
              const isSaved = savedJobIds.has(job.id);

              return (
                <Card
                  key={job.id}
                  className="p-4 flex flex-col justify-between space-y-3 border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                        {job.title}
                      </h3>
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className="text-slate-400 hover:text-amber-500 transition-colors"
                      >
                        <Bookmark className={`h-4 w-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">{companyName}</p>
                    {job.city && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 line-clamp-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {job.city}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Badge variant="primary" size="sm" className="bg-sky-50 text-[#174A7E] font-bold border-sky-100">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {job.job_type || job.employment_type || "Full time"}
                    </Badge>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setIsApplyModalOpen(true);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-[#174A7E] hover:bg-[#174A7E] hover:text-white transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-12 text-center space-y-3 border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-700">No Jobs Found</p>
            <p className="text-xs text-slate-500">Check back soon for new opportunities.</p>
          </Card>
        )}
      </section>

      {/* 6. RESUME STUDIO & TEMPLATES SLIDING SHOWCASE SECTION (LAST SECTION BEFORE FOOTER) */}
      <section className="space-y-6 pt-4 border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm" className="bg-[#174A7E] text-white font-extrabold">
                Resume Studio
              </Badge>
              <Badge variant="success" size="sm" className="font-bold">
                13+ HTML & PDF Templates
              </Badge>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Build & Export Resume</h2>
            <p className="text-xs text-slate-500 font-medium">
              Slide through all 13 production resume templates with AI assistance & instant PDF exports
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={handleResumeScrollLeft}
                className="p-2 rounded-lg bg-white hover:bg-slate-200 text-slate-700 shadow-2xs transition-all"
                title="Scroll Left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleResumeScrollRight}
                className="p-2 rounded-lg bg-white hover:bg-slate-200 text-slate-700 shadow-2xs transition-all"
                title="Scroll Right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <Link href="/seeker/resume">
              <Button variant="outline" size="sm" className="text-xs font-extrabold text-[#174A7E] border-slate-300">
                Explore All 13 Templates →
              </Button>
            </Link>
          </div>
        </div>

        {/* Interactive Horizontal Sliding Container for ALL 13 Templates */}
        <div
          ref={resumeSliderRef}
          className="flex overflow-x-auto gap-4 pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none focus:outline-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ALL_RESUME_TEMPLATES.map((tmpl) => (
            <Card
              key={tmpl.key}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start p-4 flex flex-col justify-between space-y-3.5 border-slate-200/90 hover:border-[#174A7E] hover:shadow-xl transition-all rounded-2xl bg-white group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tmpl.accent }} />
                    <h4 className="text-sm font-black text-slate-900 truncate">{tmpl.label}</h4>
                  </div>
                  <Badge variant="outline" size="sm" className="text-[9px] uppercase font-bold text-slate-500 shrink-0 px-2 py-0.5">
                    {tmpl.category}
                  </Badge>
                </div>

                {/* Template Large Clear Resume Paper Document (Height 320px) */}
                <div
                  onClick={() => openFullResumePreview(tmpl.key, tmpl.label)}
                  className="h-72 sm:h-80 rounded-xl bg-white border border-slate-200 p-1 shadow-inner overflow-hidden relative cursor-pointer group-hover:border-[#174A7E]/50 transition-all flex flex-col"
                >
                  <ResumeMiniPreview templateKey={tmpl.key} label={tmpl.label} />
                  <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md z-10">
                    {tmpl.badge}
                  </div>

                  {/* Quick View Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[1px]">
                    <span className="bg-white text-slate-900 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-[#174A7E]" />
                      <span>Quick Full View</span>
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 font-medium leading-snug">{tmpl.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openFullResumePreview(tmpl.key, tmpl.label)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  <span>Full View</span>
                </button>
                <Link href={`/seeker/resume?template=${tmpl.key}&tab=edit`} className="w-full">
                  <Button variant="primary" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />} className="w-full text-xs font-extrabold bg-[#174A7E] hover:bg-[#0f3459] py-2 rounded-xl">
                    Edit Resume
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FULL SCALE RESUME PREVIEW MODAL */}
      {previewModalKey && (
        <ResumePreviewModal
          isOpen={!!previewModalKey}
          onClose={() => setPreviewModalKey(null)}
          templateKey={previewModalKey}
          templateTitle={previewModalTitle}
        />
      )}

      {/* APPLY MODAL */}
      <JobApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}
