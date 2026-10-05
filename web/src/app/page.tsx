"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Job } from "@/lib/types";
import { JobCard } from "@/components/jobs/JobCard";
import { JobApplyModal } from "@/components/jobs/JobApplyModal";
import { ResumeMiniPreview } from "@/components/resume/ResumeMiniPreview";
import { ResumePreviewModal } from "@/components/resume/ResumePreviewModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Search,
  MapPin,
  Sparkles,
  CheckCircle2,
  FileText,
  Download,
  Edit3,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Building2,
  Users,
  Award,
  Zap,
  Smartphone,
  Star,
  Layers,
  GraduationCap,
  Clock,
  PhoneCall,
} from "lucide-react";

// Official Panoramic Promotional Banners (Exact Artwork)
const HERO_BANNERS = [
  {
    id: "seeker",
    src: "/banner_seeker.png",
    alt: "Empowering Students & Job Seekers to Get Hired",
    href: "/login?role=job_seeker",
  },
  {
    id: "employer",
    src: "/banner_employer.png",
    alt: "Hire Top Verified Candidates Fast with Zero Commissions",
    href: "/login?role=company",
  },
  {
    id: "resume",
    src: "/banner_resume.jpg",
    alt: "Build Recruiter-Approved Resumes That Get You Shortlisted",
    href: "/seeker/resume",
  },
];

// 13 Official Production Resume Templates matching Flutter App & Laravel Backend
const RESUME_TEMPLATES = [
  { key: "t3_bold_navy", label: "Bold Navy Professional", category: "Corporate", accent: "#174A7E", badge: "99% ATS Score", desc: "Bold deep navy header bar with high-contrast executive hierarchy." },
  { key: "t1_teal_sidebar", label: "Teal · Two Column", category: "Two Column", accent: "#0D7377", badge: "Recruiter Choice", desc: "Structured two-column layout with teal sidebar for skills & contact." },
  { key: "t2_minimal", label: "Slate Executive", category: "Executive", accent: "#1E293B", badge: "Executive Grade", desc: "Clean slate header banner with sleek corporate typography." },
  { key: "t13_academic_clean", label: "Academic · Clean", category: "Academic", accent: "#064E3B", badge: "Fresher Approved", desc: "Formal emerald layout for research, engineering & academic CVs." },
  { key: "t7_geometric_modern", label: "Geometric · Modern", category: "Creative", accent: "#5B21B6", badge: "Modern UI", desc: "Vibrant violet headers with geometric structural blocks." },
  { key: "t6_navy_two_column", label: "Navy · Corporate", category: "Corporate", accent: "#1E1B4B", badge: "Top Ranked", desc: "Deep navy sidebar with dedicated contact and skills column." },
  { key: "t5_modern_split", label: "Modern Split", category: "Modern", accent: "#1E3A8A", badge: "Clean Layout", desc: "Split header with cobalt accents and modern section spacing." },
  { key: "t10_creative_sunset", label: "Sunset · Creative", category: "Creative", accent: "#BE123C", badge: "Portfolio Style", desc: "Crimson sunset header banner designed for creative and tech roles." },
  { key: "t12_royal_gold", label: "Royal · Gold", category: "Premium", accent: "#D97706", badge: "Luxury Finish", desc: "Premium gold-trimmed dark theme with luxury executive framing." },
  { key: "t4_classic_serif", label: "Meridian Editorial", category: "Editorial", accent: "#292524", badge: "Editorial Serif", desc: "Traditional serif typography with subtle borders for corporate roles." },
  { key: "t11_mono_swiss", label: "Swiss · Mono", category: "Minimalist", accent: "#171717", badge: "Minimalist", desc: "Clean Swiss grid layout with high readability and structured data." },
  { key: "t8_typewriter_retro", label: "Typewriter · Retro", category: "Retro", accent: "#78350F", badge: "Retro Monospace", desc: "Classic monospace retro styling with warm earth tones." },
  { key: "t9_vintage_folio", label: "Vintage · Folio", category: "Vintage", accent: "#422006", badge: "Classic Folio", desc: "Classic warm folio styling with framed headers and elegant lines." },
];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Banner slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Resume template preview modal state
  const [previewModalKey, setPreviewModalKey] = useState<string | null>(null);
  const [previewModalTitle, setPreviewModalTitle] = useState<string>("");

  // Job Search State
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Resume carousel scroll ref
  const resumeSliderRef = useRef<HTMLDivElement>(null);

  // 1. Fetch live active jobs from API
  const { data: jobsData, isLoading: isJobsLoading } = useQuery({
    queryKey: ["homeJobs"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.JOBS);
        return res.data?.data?.data || res.data?.data || res.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // 2. Fetch popular categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ["homeCategories"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.CATEGORIES);
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch top companies from API
  const { data: topCompanies = [] } = useQuery({
    queryKey: ["homeTopCompanies"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.TOP_COMPANIES);
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const jobsList: Job[] = Array.isArray(jobsData) ? jobsData : [];
  const filteredJobs = searchKeyword.trim()
    ? jobsList.filter(
        (j) =>
          j.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          j.company?.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          j.location?.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : jobsList;

  // Auto-rotate hero banners every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const scrollSlider = (direction: "left" | "right") => {
    if (!resumeSliderRef.current) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    resumeSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const openFullResumePreview = (key: string, label: string) => {
    setPreviewModalKey(key);
    setPreviewModalTitle(label);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* ─── 1. HERO & PROMOTIONAL BANNERS SECTION ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#174A7E]/5 via-[#174A7E]/10 to-transparent pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Promotional Banner Carousel with Exact Panoramic Banner Artwork */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white group">
            {/* Banner Slides */}
            <div className="relative w-full aspect-[21/9] sm:aspect-[2.8/1] min-h-[220px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[420px]">
              {HERO_BANNERS.map((banner, idx) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    currentSlide === idx ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                  }`}
                >
                  <Link href={banner.href} className="block w-full h-full relative cursor-pointer">
                    <img
                      src={banner.src}
                      alt={banner.alt}
                      className="w-full h-full object-cover object-center select-none"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/[0.02] transition-colors" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Left / Right Arrow Controls */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_BANNERS.length - 1 : prev - 1))}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl border border-slate-200/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
              aria-label="Previous Banner"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev === HERO_BANNERS.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl border border-slate-200/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
              aria-label="Next Banner"
            >
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* Slide Navigation Dots */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-slate-900/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
              {HERO_BANNERS.map((banner, idx) => (
                <button
                  key={banner.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === idx ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── DEDICATED PROMINENT HERO JOB SEARCH BAR WITH WORKING SEARCH BUTTON ── */}
          <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-slate-200 shadow-xl relative z-30">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchKeyword.trim();
                const loc = searchLocation.trim();
                const params = new URLSearchParams();
                if (q) params.set("search", q);
                if (loc) params.set("location", loc);
                router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
              }}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              {/* Job title / keyword */}
              <div className="md:col-span-5 relative flex items-center">
                <Search className="absolute left-3.5 h-5 w-5 text-[#174A7E]" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Job title, skills, or company name..."
                  className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                />
              </div>

              {/* Location */}
              <div className="md:col-span-4 relative flex items-center">
                <MapPin className="absolute left-3.5 h-5 w-5 text-[#E53E3E]" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Location (e.g. Bangalore, Delhi)..."
                  className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                />
              </div>

              {/* Submit Search Button */}
              <div className="md:col-span-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#174A7E] hover:bg-[#0f3459] shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="h-4.5 w-4.5" />
                  <span>Search Jobs</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Platform Metrics Bar with Real Values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-sky-50 text-[#174A7E] flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {jobsList.length > 0 ? `${jobsList.length} Active` : "10,000+"}
                </p>
                <p className="text-xs text-slate-500 font-medium">Live Job Openings</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">50,000+</p>
                <p className="text-xs text-slate-500 font-medium">Verified Candidates</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">13 ATS</p>
                <p className="text-xs text-slate-500 font-medium">Resume Templates</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {topCompanies.length > 0 ? `${topCompanies.length}+ Top` : "500+"}
                </p>
                <p className="text-xs text-slate-500 font-medium">Hiring Companies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. REAL TOP HIRING COMPANIES (ACTUAL API DATA) ─── */}
      {topCompanies.length > 0 && (
        <section className="py-6 border-y border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#174A7E]" />
                Top Hiring Companies on JobAllocate:
              </span>

              <div className="flex flex-wrap items-center justify-center gap-6">
                {topCompanies.slice(0, 5).map((comp: any) => (
                  <div key={comp.id} className="flex items-center gap-2.5 group cursor-default">
                    {comp.company_logo_url || comp.logo_url ? (
                      <img
                        src={comp.company_logo_url || comp.logo_url}
                        alt={comp.name}
                        className="h-7 w-7 rounded-lg object-contain border border-slate-200 p-0.5"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                        {comp.name?.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-700 group-hover:text-[#174A7E] transition-colors">
                      {comp.name}
                    </span>
                    {comp.open_jobs_count > 0 && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {comp.open_jobs_count} job{comp.open_jobs_count > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 3. SHOWCASE RESUME TEMPLATES (CLEAR & FULLY VISIBLE) ─── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Professional Header with Banner Image */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-[#174A7E] text-white p-6 sm:p-8 mb-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
              <FileText className="h-3.5 w-3.5" />
              <span>Resume Studio · 13+ ATS Templates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Recruiter-Approved Resume Templates
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
              Engineered to beat automated parsing systems. Click <strong>Quick View</strong> to inspect any template in crystal-clear full scale, or start editing with your details.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 z-10">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollSlider("left")}
                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                title="Previous Template"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollSlider("right")}
                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                title="Next Template"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <Link href="/seeker/resume">
              <Button variant="primary" size="sm" className="bg-white text-[#174A7E] hover:bg-slate-100 font-extrabold text-xs shadow-md">
                Open Full Studio →
              </Button>
            </Link>
          </div>
        </div>

        {/* ── HIGH VISIBILITY HORIZONTAL CAROUSEL FOR ALL 13 TEMPLATES ── */}
        <div
          ref={resumeSliderRef}
          className="flex overflow-x-auto gap-5 pb-5 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {RESUME_TEMPLATES.map((tmpl) => (
            <Card
              key={tmpl.key}
              className="w-[290px] sm:w-[320px] shrink-0 snap-start p-4 flex flex-col justify-between space-y-3.5 border-slate-200 hover:border-[#174A7E] hover:shadow-xl transition-all rounded-2xl bg-white group"
            >
              {/* Template Header Info */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tmpl.accent }} />
                  <h3 className="text-sm font-extrabold text-slate-900 truncate">{tmpl.label}</h3>
                </div>
                <Badge variant="outline" size="sm" className="text-[9px] uppercase font-bold text-slate-500 shrink-0">
                  {tmpl.category}
                </Badge>
              </div>

              {/* ── CLEAR & FULLY VISIBLE LARGE PREVIEW SHEET (Height 320px) ── */}
              <div
                onClick={() => openFullResumePreview(tmpl.key, tmpl.label)}
                className="h-72 sm:h-80 w-full rounded-xl bg-white border border-slate-200 overflow-hidden relative shadow-inner cursor-pointer group-hover:border-[#174A7E]/50 transition-all flex flex-col"
              >
                {/* Real Server HTML Iframe Component with automatic scaling */}
                <ResumeMiniPreview templateKey={tmpl.key} label={tmpl.label} />

                {/* Floating Badge */}
                <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md z-10">
                  {tmpl.badge}
                </div>

                {/* Hover Quick View Trigger Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[1px]">
                  <span className="bg-white text-slate-900 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <Eye className="h-3.5 w-3.5 text-[#174A7E]" />
                    <span>Quick Full View</span>
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-1 font-medium leading-snug">
                {tmpl.desc}
              </p>

              {/* Action Buttons: Quick View & Use Template */}
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
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-extrabold py-2 bg-[#174A7E] hover:bg-[#0f3459] shadow-xs rounded-xl"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    <span>Use Template</span>
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 4. DUAL PROFESSIONAL SECTIONS: STUDENTS & JOB SEEKERS vs CORPORATE EMPLOYERS ─── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-2 mb-10">
          <Badge variant="primary" size="sm" className="bg-[#174A7E] text-white">
            Tailored Experiences
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Designed for Both Students & Corporate Employers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Choose your path to enter the exact onboarding experience tailored to your specific career or recruitment needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* JOB SEEKER / STUDENT CARD */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg flex flex-col justify-between group hover:shadow-xl transition-all">
            <div className="relative h-60 sm:h-72 overflow-hidden">
              <img
                src="/jobseeker_student.jpg"
                alt="Student & Job Seeker"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="bg-sky-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    For Job Seekers & Students
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">Accelerate Your Dream Career</h3>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">13 Free ATS-Compliant Resumes</h4>
                    <p className="text-xs text-slate-500">Auto-fill your details and export high-resolution PDFs in seconds.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">One-Click Easy Applications</h4>
                    <p className="text-xs text-slate-500">Apply to tech, marketing, finance, and operations roles directly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Direct Recruiter Interview Calls</h4>
                    <p className="text-xs text-slate-500">Get notified immediately when companies review your profile.</p>
                  </div>
                </div>
              </div>

              <Link href="/login?role=job_seeker" className="block pt-2">
                <Button variant="primary" size="lg" className="w-full bg-[#174A7E] hover:bg-[#0f3459] font-black rounded-2xl py-3.5 shadow-md flex items-center justify-center gap-2">
                  <User className="h-4.5 w-4.5" />
                  <span>Start as a Job Seeker →</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* EMPLOYER / OFFICE RECRUITER CARD */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg flex flex-col justify-between group hover:shadow-xl transition-all">
            <div className="relative h-60 sm:h-72 overflow-hidden">
              <img
                src="/employer_office.jpg"
                alt="Corporate Office HR & Employers"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    For Employers & Companies
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">Hire Top Talent Without Middlemen</h3>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Post Vacancies in 2 Minutes</h4>
                    <p className="text-xs text-slate-500">Publish roles with salary, experience, and custom screening questions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Access 50,000+ Pre-Screened Candidates</h4>
                    <p className="text-xs text-slate-500">View complete candidate ATS resumes, verified skills, and direct contact numbers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Zero Placement Commissions</h4>
                    <p className="text-xs text-slate-500">Flat affordable subscriptions with unlimited applicant shortlisting.</p>
                  </div>
                </div>
              </div>

              <Link href="/login?role=company" className="block pt-2">
                <Button variant="outline" size="lg" className="w-full border-2 border-[#174A7E] text-[#174A7E] hover:bg-[#174A7E]/5 font-black rounded-2xl py-3.5 shadow-sm flex items-center justify-center gap-2">
                  <Briefcase className="h-4.5 w-4.5" />
                  <span>Start as an Employer →</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. ACTIVE JOBS SECTION (REAL API DATA) ─── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#174A7E] text-xs font-extrabold uppercase tracking-wider">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Verified Live Openings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Live Active Jobs
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Real vacancies posted by verified employers. Apply directly with your JobAllocate profile or ATS resume.
              </p>
            </div>

            {/* Keyword search filter with active Search Button */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchKeyword.trim()) {
                  router.push(`/jobs?search=${encodeURIComponent(searchKeyword.trim())}`);
                }
              }}
              className="flex items-center gap-2 w-full md:w-96"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Role, skill, company, location..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-full border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#174A7E]/30 shadow-2xs"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="rounded-full px-5 py-2.5 font-bold text-xs bg-[#174A7E] hover:bg-[#0f3459] shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </Button>
            </form>
          </div>

          {/* Job Categories Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((cat: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSearchKeyword(cat.label)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 bg-white hover:border-[#174A7E] hover:text-[#174A7E] text-slate-700 transition-colors shadow-2xs"
                >
                  {cat.label} {cat.job_posts_count > 0 && `(${cat.job_posts_count})`}
                </button>
              ))}
            </div>
          )}

          {/* Job Cards Grid */}
          {isJobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-white border border-slate-200 animate-pulse p-5 space-y-3" />
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={(j) => {
                    setSelectedJob(j);
                    setIsApplyModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
              <Briefcase className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No matching jobs found right now</p>
              <Link href="/jobs">
                <Button variant="outline" size="sm">
                  Browse All Jobs
                </Button>
              </Link>
            </div>
          )}

          {/* View All Jobs Footer CTA */}
          <div className="text-center pt-2">
            <Link href="/jobs">
              <Button
                variant="primary"
                size="lg"
                className="bg-[#174A7E] hover:bg-[#0f3459] font-extrabold text-sm rounded-full px-8 py-3 shadow-md"
              >
                <span>Browse All Active Jobs ({jobsList.length})</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6. FULL-SCALE RESUME PREVIEW MODAL (100% CLEAR A4 INSPECTION) ─── */}
      {previewModalKey && (
        <ResumePreviewModal
          isOpen={!!previewModalKey}
          onClose={() => setPreviewModalKey(null)}
          templateKey={previewModalKey}
          templateTitle={previewModalTitle}
        />
      )}

      {/* ─── 7. JOB APPLY MODAL ─── */}
      <JobApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      {/* ─── 8. FOOTER ─── */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 shadow-2xs">
              <img src="/logo_square.png" alt="JobAllocate Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center text-lg font-black tracking-tight">
                <span className="text-[#E53E3E]">Job</span>
                <span className="text-[#174A7E]">Allocate</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                RIGHT JOB, RIGHT CANDIDATE
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/jobs" className="hover:text-[#174A7E]">All Jobs</Link>
            <Link href="/seeker/resume" className="hover:text-[#174A7E]">Resume Studio</Link>
            <Link href="/login?role=job_seeker" className="hover:text-[#174A7E]">Job Seeker Login</Link>
            <Link href="/login?role=company" className="hover:text-[#174A7E]">Employer Portal</Link>
            <Link href="/legal/terms" className="hover:text-[#174A7E]">Terms & Conditions</Link>
            <Link href="/legal/privacy" className="hover:text-[#174A7E]">Privacy Policy</Link>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} JobAllocate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
