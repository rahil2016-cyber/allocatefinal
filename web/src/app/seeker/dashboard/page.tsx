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
  Layers,
  Palette,
  Megaphone,
  Calculator,
  Users,
  Truck,
  GraduationCap,
  Scale,
  PhoneCall,
  Utensils,
  Navigation,
  Building2,
  Video,
  Car,
  Shield,
} from "lucide-react";

// Complete list of all 26 canonical industry categories available across the app
const APP_ALL_CATEGORIES = [
  { key: "software_engineering_it", label: "Software & IT", icon: Code, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { key: "data_science_analytics", label: "Data & Analytics", icon: BarChart3, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { key: "design_ux_creative", label: "Design & UX", icon: Palette, color: "bg-purple-50 text-purple-600 border-purple-200" },
  { key: "product_management", label: "Product Management", icon: Layers, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  { key: "sales_business_development", label: "Sales & Biz Dev", icon: TrendingUp, color: "bg-amber-50 text-amber-600 border-amber-200" },
  { key: "marketing_digital_growth", label: "Marketing & Growth", icon: Megaphone, color: "bg-rose-50 text-rose-600 border-rose-200" },
  { key: "banking_finance", label: "Banking & Finance", icon: Landmark, color: "bg-sky-50 text-sky-600 border-sky-200" },
  { key: "accountants", label: "Accountants & Audit", icon: Calculator, color: "bg-teal-50 text-teal-600 border-teal-200" },
  { key: "human_resources", label: "Human Resources", icon: Users, color: "bg-orange-50 text-orange-600 border-orange-200" },
  { key: "operations_logistics", label: "Operations & Logistics", icon: Truck, color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
  { key: "healthcare_medical", label: "Healthcare & Medical", icon: Heart, color: "bg-red-50 text-red-600 border-red-200" },
  { key: "education_training", label: "Education & Teaching", icon: GraduationCap, color: "bg-lime-50 text-lime-700 border-lime-200" },
  { key: "legal_compliance", label: "Legal & Compliance", icon: Scale, color: "bg-slate-50 text-slate-700 border-slate-200" },
  { key: "customer_success_support", label: "Customer Support", icon: Headphones, color: "bg-violet-50 text-violet-600 border-violet-200" },
  { key: "manufacturing_engineering", label: "Manufacturing & Core", icon: Factory, color: "bg-stone-50 text-stone-700 border-stone-200" },
  { key: "bpo_telecaller", label: "BPO & Telecaller", icon: PhoneCall, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { key: "retail_e_commerce", label: "Retail & E-Commerce", icon: ShoppingCart, color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200" },
  { key: "hospitality_food", label: "Hospitality & Food", icon: Utensils, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "delivery_driving", label: "Delivery & Driving", icon: Navigation, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "construction_real_estate", label: "Real Estate & Builders", icon: Building2, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { key: "media_entertainment", label: "Media & Film", icon: Video, color: "bg-pink-50 text-pink-600 border-pink-200" },
  { key: "automotive", label: "Automotive & Mechanic", icon: Car, color: "bg-neutral-50 text-neutral-700 border-neutral-200" },
  { key: "beauty_wellness", label: "Beauty & Wellness", icon: Sparkles, color: "bg-rose-50 text-rose-500 border-rose-200" },
  { key: "security_housekeeping", label: "Security & Facility", icon: Shield, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "work_from_home_home", label: "Work From Home", search: "work from home", icon: HomeIcon, color: "bg-teal-50 text-teal-700 border-teal-200" },
  { key: "private_jobs_home", label: "Private Jobs", search: "private", icon: Briefcase, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
];

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
  const categoriesSliderRef = useRef<HTMLDivElement>(null);
  const profileJobsSliderRef = useRef<HTMLDivElement>(null);
  const latestJobsSliderRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: "left" | "right") => {
    if (!categoriesSliderRef.current) return;
    const scrollAmount = direction === "left" ? -280 : 280;
    categoriesSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollProfileJobs = (direction: "left" | "right") => {
    if (!profileJobsSliderRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    profileJobsSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollLatestJobs = (direction: "left" | "right") => {
    if (!latestJobsSliderRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    latestJobsSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Fetch real banners from API
  const { data: banners = [] } = useQuery({
    queryKey: ["seekerBanners"],
    queryFn: async () => {
      const res = await apiClient.get("/banners?for=job_seeker");
      return res.data?.data || [];
    },
  });

  // Active banner slide index and sliding logic
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const totalSlides = banners.length > 1 ? banners.length : (banners.length === 1 ? 2 : 1);

  React.useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  // Fetch real categories & real job counts from backend API
  const { data: apiCategories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["popularCategories"],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.CATEGORIES);
      return res.data?.data || [];
    },
  });

  // Fetch full industry types list
  const { data: industryTypes = [] } = useQuery({
    queryKey: ["allIndustryTypesDashboard"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.INDUSTRY_TYPES);
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
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

  // Fetch seeker profile for personalized job recommendations
  const { data: seekerProfile } = useQuery({
    queryKey: ["seekerProfileDashboard"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.SEEKER_PROFILE);
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });

  // Fetch jobs tailored to candidate's profile
  const { data: profileJobs = [], isLoading: isProfileJobsLoading } = useQuery<Job[]>({
    queryKey: ["seekerProfileMatchedJobs", seekerProfile?.industry_type, seekerProfile?.city],
    queryFn: async () => {
      try {
        const params: Record<string, any> = { per_page: 6 };
        if (seekerProfile?.industry_type) {
          params.industry = seekerProfile.industry_type;
        }
        if (seekerProfile?.city) {
          params.city = seekerProfile.city;
        }
        const res = await apiClient.get(ENDPOINTS.JOBS, { params });
        const data = res.data?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        return [];
      } catch {
        return [];
      }
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

  // Merge categories from backend API with complete app category list
  const displayCategories = React.useMemo(() => {
    const apiMap = new Map<string, any>();
    if (Array.isArray(apiCategories)) {
      apiCategories.forEach((cat: any) => {
        if (cat.industry_type) apiMap.set(cat.industry_type, cat);
        if (cat.key) apiMap.set(cat.key, cat);
        if (cat.label) apiMap.set(cat.label.toLowerCase(), cat);
      });
    }

    if (Array.isArray(industryTypes)) {
      industryTypes.forEach((it: any) => {
        if (it.key && !apiMap.has(it.key)) {
          apiMap.set(it.key, it);
        }
      });
    }

    return APP_ALL_CATEGORIES.map((appCat) => {
      const fromApi =
        apiMap.get(appCat.key) ||
        apiMap.get(appCat.label.toLowerCase()) ||
        (appCat.search ? apiMap.get(appCat.search) : null);

      let jobCount = fromApi?.job_posts_count;
      if (jobCount === undefined || jobCount === null) {
        // Count from currently loaded jobsList
        const matched = jobsList.filter(
          (j: any) =>
            j.industry_type === appCat.key ||
            j.category?.name?.toLowerCase().includes(appCat.label.toLowerCase()) ||
            (appCat.search && j.title?.toLowerCase().includes(appCat.search))
        ).length;
        jobCount = matched;
      }

      return {
        ...appCat,
        jobCount: jobCount > 0 ? `${jobCount} jobs` : "Explore",
        rawCount: jobCount || 0,
      };
    });
  }, [apiCategories, industryTypes, jobsList]);

  // Active promo banner image if returned by API
  const promoBanner = banners.length > 0 ? banners[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 lg:space-y-10">
      {/* 1. HERO BANNER SLIDING CAROUSEL (Full Width, Zero Extra Space, Working Controls) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm bg-slate-900 w-full h-[160px] sm:h-[240px] md:h-[300px] lg:h-[340px]">
        <div
          className="flex w-full h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeBannerIndex * 100}%)` }}
        >
          {banners.length > 0 ? (
            <>
              {/* Primary API Banner(s) */}
              {banners.map((b: any, idx: number) => (
                <div key={b.id || idx} className="w-full h-full shrink-0 relative flex items-center justify-center bg-slate-900">
                  <img
                    src={b.image_url}
                    alt={b.title || "JobAllocate Banner"}
                    className="w-full h-full object-cover sm:object-fill rounded-2xl block"
                  />
                </div>
              ))}

              {/* If only 1 banner returned by API, add a second interactive promotional slide so user can slide left & right */}
              {banners.length === 1 && (
                <div className="w-full h-full shrink-0 relative bg-gradient-to-r from-slate-100 via-sky-50 to-blue-100/60 p-4 sm:p-7 md:p-8 flex items-center">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
                    <div className="lg:col-span-8 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-[#E53E3E]">Job</span>
                        <span className="text-sm sm:text-base font-extrabold text-[#174A7E]">Allocate</span>
                        <span className="text-[11px] text-slate-500 font-medium">— Right job, right candidate</span>
                      </div>
                      <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        <span className="text-[#E53E3E]">LOCAL JOBS</span> NEAR YOU
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-red-500" /> Your City</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-blue-500" /> Your District</span>
                      </div>
                      <div>
                        <Link href="/jobs">
                          <Button variant="primary" size="sm" className="rounded-full bg-[#E53E3E] hover:bg-[#C53030] px-5 font-bold shadow-md text-xs">
                            Explore Jobs →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full shrink-0 relative bg-gradient-to-r from-slate-100 via-sky-50 to-blue-100/60 p-5 sm:p-7 md:p-8 flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
                <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-extrabold text-[#E53E3E]">Job</span>
                    <span className="text-base sm:text-lg font-extrabold text-[#174A7E]">Allocate</span>
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
                    </div>
                  </div>

                  <div>
                    <Link href="/jobs">
                      <Button variant="primary" size="md" className="rounded-full bg-[#E53E3E] hover:bg-[#C53030] px-6 font-bold shadow-md text-xs sm:text-sm">
                        Explore Jobs →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Carousel controls on Left and Right (Working on Click and Touch) */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveBannerIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
              title="Previous Banner"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveBannerIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
              title="Next Banner"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Slide Dots Indicator */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/30 backdrop-blur-xs px-2 py-1 rounded-full">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveBannerIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeBannerIndex === i ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. POPULAR CATEGORIES (All App Categories & Mobile Sliding Track) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Popular Categories</h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                {displayCategories.length} Available
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Explore all industries & job roles available across the app</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollCategories("left")}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                title="Previous categories"
                aria-label="Previous categories"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories("right")}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                title="Next categories"
                aria-label="Next categories"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Link href="/jobs" className="text-xs font-bold text-slate-700 hover:text-[#174A7E] flex items-center gap-1 shrink-0 ml-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {isCategoriesLoading && displayCategories.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#174A7E]" />
            <span className="text-xs font-semibold">Loading app categories...</span>
          </div>
        ) : (
          <div
            ref={categoriesSliderRef}
            className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth scrollbar-none -mx-3 px-3 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
            style={{ scrollbarWidth: "none" }}
          >
            {displayCategories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.key || idx}
                  href={cat.search ? `/jobs?search=${encodeURIComponent(cat.search)}` : `/jobs?industry=${encodeURIComponent(cat.key)}`}
                  className="w-[120px] sm:w-[140px] shrink-0 snap-start rounded-2xl bg-white p-3 sm:p-3.5 text-center border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#174A7E]/50 active:scale-95 transition-all group flex flex-col items-center justify-between"
                >
                  <div className={`mx-auto flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border ${cat.color} mb-2 transition-transform group-hover:scale-110 shadow-2xs`}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#174A7E] w-full text-center">
                    {cat.label}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                    {cat.jobCount}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. JOBS BASED ON YOUR PROFILE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Jobs Based on Your Profile
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#174A7E] text-[11px] font-bold">
                <Sparkles className="h-3 w-3" /> Recommended For You
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {seekerProfile?.industry_type
                ? `Personalized openings tailored to ${seekerProfile.industry_type}${seekerProfile.city ? ` in ${seekerProfile.city}` : ""}`
                : "Handpicked opportunities matched to your skills and career interests"}
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex md:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => scrollProfileJobs("left")}
                className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Previous matched jobs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollProfileJobs("right")}
                className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Next matched jobs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-bold text-[#174A7E] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All Matched Jobs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {isProfileJobsLoading && isJobsLoading ? (
          <div className="flex md:grid overflow-x-auto md:overflow-visible gap-4 pb-3 md:pb-0 scrollbar-none md:grid-cols-2 lg:grid-cols-3 -mx-3 px-3 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[84vw] sm:w-[320px] max-w-[340px] shrink-0 md:w-auto md:max-w-none md:shrink h-44 rounded-2xl bg-white border border-slate-200 animate-pulse p-5"
              />
            ))}
          </div>
        ) : (profileJobs.length > 0 ? profileJobs : jobsList.slice(0, 6)).length > 0 ? (
          <div
            ref={profileJobsSliderRef}
            className="flex md:grid overflow-x-auto md:overflow-visible gap-4 pb-4 md:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-none -mx-3 px-3 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid-cols-2 lg:grid-cols-3"
            style={{ scrollbarWidth: "none" }}
          >
            {(profileJobs.length > 0 ? profileJobs : jobsList.slice(0, 6)).map((job) => {
              const companyName = job.company?.name || job.company_name || "Verified Employer";
              const isSaved = savedJobIds.has(job.id);

              return (
                <div
                  key={`profile-job-${job.id}`}
                  className="w-[84vw] sm:w-[320px] max-w-[340px] shrink-0 snap-start h-full md:w-auto md:max-w-none md:shrink flex flex-col"
                >
                  <Card
                    className="p-4 flex flex-col justify-between space-y-3.5 border-slate-200/90 hover:border-[#174A7E]/40 hover:shadow-md transition-all group bg-white h-full"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Sparkles className="h-2.5 w-2.5" /> Profile Match
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#174A7E] transition-colors line-clamp-1 pt-1">
                            {job.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                          title="Save Job"
                        >
                          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-slate-600">{companyName}</p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        {job.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" /> {job.city}
                          </span>
                        )}
                        {(job.salary_min || job.salary_max) && (
                          <span className="font-bold text-slate-700">
                            ₹{job.salary_min ? Number(job.salary_min).toLocaleString() : ""}
                            {job.salary_max ? ` - ₹${Number(job.salary_max).toLocaleString()}` : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                      <Badge variant="primary" size="sm" className="bg-sky-50 text-[#174A7E] font-bold border-sky-100 text-[11px]">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {job.job_type || job.employment_type || "Full time"}
                      </Badge>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsApplyModalOpen(true);
                        }}
                        className="rounded-full bg-[#174A7E] hover:bg-[#0f3459] text-xs font-bold px-3.5 py-1.5 shadow-2xs"
                      >
                        Quick Apply
                      </Button>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="py-10 text-center space-y-2 border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-700">No profile-matched jobs yet</p>
            <p className="text-xs text-slate-500">
              Update your industry and preferences in your profile to see tailored job recommendations.
            </p>
            <div className="pt-2">
              <Link href="/seeker/profile">
                <Button variant="outline" size="sm" className="text-xs font-bold border-slate-300">
                  Update Profile Preferences
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </section>

      {/* 4. QUICK STATS ROW (Compact 3-Card Row on Mobile) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Recommended */}
        <Link href="/jobs">
          <Card className="p-2 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer bg-white text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3.5">
              <div className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-sky-50 text-sky-600 shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5.5 sm:w-5.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Recommended</p>
                <p className="text-base sm:text-2xl font-black text-slate-900 leading-tight">
                  {jobsList.length > 0 ? jobsList.length : 0}
                </p>
                <p className="hidden sm:block text-[10px] font-medium text-slate-400">jobs available</p>
              </div>
            </div>
            <div className="hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600 shrink-0">
              <ArrowRight className="h-4 w-4" />
            </div>
          </Card>
        </Link>

        {/* Related / Applications */}
        <Link href="/seeker/applications">
          <Card className="p-2 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer bg-white text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3.5">
              <div className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5.5 sm:w-5.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Applied</p>
                <p className="text-base sm:text-2xl font-black text-slate-900 leading-tight">
                  {applications.length}
                </p>
                <p className="hidden sm:block text-[10px] font-medium text-slate-400">submitted</p>
              </div>
            </div>
            <div className="hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shrink-0">
              <ArrowRight className="h-4 w-4" />
            </div>
          </Card>
        </Link>

        {/* Saved */}
        <Link href="/seeker/saved">
          <Card className="p-2 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer bg-white text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3.5">
              <div className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-50 text-rose-500 shrink-0">
                <Bookmark className="h-4 w-4 sm:h-5.5 sm:w-5.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Saved</p>
                <p className="text-base sm:text-2xl font-black text-slate-900 leading-tight">
                  {isSavedLoading ? "0" : savedJobs.length}
                </p>
                <p className="hidden sm:block text-[10px] font-medium text-slate-400">jobs saved</p>
              </div>
            </div>
            <div className="hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 shrink-0">
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
          <div className="flex items-center gap-2">
            <div className="flex md:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => scrollLatestJobs("left")}
                className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Previous latest jobs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollLatestJobs("right")}
                className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Next latest jobs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Link href="/seeker/applications" className="text-xs font-bold text-slate-700 hover:text-[#174A7E] flex items-center gap-1">
              My Applications <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {isJobsLoading ? (
          <div className="flex md:grid overflow-x-auto md:overflow-visible gap-4 pb-3 md:pb-0 scrollbar-none md:grid-cols-2 lg:grid-cols-3 -mx-3 px-3 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[84vw] sm:w-[320px] max-w-[340px] shrink-0 md:w-auto md:max-w-none md:shrink h-44 rounded-2xl bg-white border border-slate-200 animate-pulse p-5"
              />
            ))}
          </div>
        ) : jobsList.length > 0 ? (
          <div
            ref={latestJobsSliderRef}
            className="flex md:grid overflow-x-auto md:overflow-visible gap-4 pb-4 md:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-none -mx-3 px-3 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid-cols-2 lg:grid-cols-3"
            style={{ scrollbarWidth: "none" }}
          >
            {jobsList.map((job) => {
              const companyName = job.company?.name || job.company_name || "Company";
              const isSaved = savedJobIds.has(job.id);

              return (
                <div
                  key={job.id}
                  className="w-[84vw] sm:w-[320px] max-w-[340px] shrink-0 snap-start h-full md:w-auto md:max-w-none md:shrink flex flex-col"
                >
                  <Card
                    className="p-4 flex flex-col justify-between space-y-3 border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all bg-white h-full"
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
                </div>
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
