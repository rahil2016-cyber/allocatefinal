"use client";

import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { JobCard } from "@/components/jobs/JobCard";
import { JobApplyModal } from "@/components/jobs/JobApplyModal";
import { Job } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  Search,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Briefcase,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
} from "lucide-react";

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "urgent">("latest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const jobsSliderRef = useRef<HTMLDivElement>(null);

  const scrollJobs = (direction: "left" | "right") => {
    if (!jobsSliderRef.current) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    jobsSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Query live production jobs from backend API
  const { data: jobsList = [], isLoading } = useQuery({
    queryKey: ["jobs-list", searchTerm, locationTerm, selectedCategory, selectedJobTypes],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (searchTerm) params.search = searchTerm;
      if (locationTerm) params.location = locationTerm;
      if (selectedCategory !== "all") params.industry_type = selectedCategory;

      const res = await apiClient.get(ENDPOINTS.JOBS, { params });
      const data = res.data?.data;
      let items: Job[] = [];
      if (Array.isArray(data)) items = data;
      else if (Array.isArray(data?.data)) items = data.data;

      // Filter locally by job types if selected
      if (selectedJobTypes.length > 0) {
        items = items.filter((job) =>
          selectedJobTypes.includes(job.employment_type || job.job_type || "")
        );
      }

      return items;
    },
  });

  const toggleJobType = (type: string) => {
    if (selectedJobTypes.includes(type)) {
      setSelectedJobTypes(selectedJobTypes.filter((t) => t !== type));
    } else {
      setSelectedJobTypes([...selectedJobTypes, type]);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setLocationTerm("");
    setSelectedJobTypes([]);
    setSelectedCategory("all");
    setSortBy("latest");
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (locationTerm ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    selectedJobTypes.length;

  const FilterControls = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#174A7E]" />
          <h3 className="text-sm font-bold text-slate-900">Filter Jobs</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="primary" size="sm" className="bg-[#174A7E] text-white text-[10px]">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <button
          onClick={handleResetFilters}
          className="text-xs text-slate-500 hover:text-[#174A7E] flex items-center gap-1 font-medium cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Keyword Search */}
      <Input
        label="Keywords"
        placeholder="Role, skill, company..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {/* Location Search */}
      <Input
        label="Location"
        placeholder="e.g. Bangalore, Mumbai, Remote"
        value={locationTerm}
        onChange={(e) => setLocationTerm(e.target.value)}
        leftIcon={<MapPin className="h-4 w-4" />}
      />

      {/* Category Dropdown */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Category / Industry
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
        >
          <option value="all">All Industries & Roles</option>
          <option value="software_engineering_it">Software & IT</option>
          <option value="data_science_analytics">Data & Analytics</option>
          <option value="sales_business_development">Sales & Business Dev</option>
          <option value="marketing_digital_growth">Marketing & Growth</option>
          <option value="banking_finance">Banking & Finance</option>
          <option value="human_resources">Human Resources</option>
          <option value="bpo_telecaller">BPO & Telecaller</option>
          <option value="operations_logistics">Operations & Logistics</option>
          <option value="healthcare_medical">Healthcare & Medical</option>
          <option value="retail_e_commerce">Retail & E-commerce</option>
        </select>
      </div>

      {/* Job Type Checkboxes */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Job Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
          {["Full-time", "Part-time", "Remote", "Contract"].map((type) => (
            <label key={type} className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={selectedJobTypes.includes(type)}
                onChange={() => toggleJobType(type)}
                className="h-4 w-4 rounded border-slate-300 text-[#174A7E] focus:ring-[#174A7E]/20"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#174A7E] to-[#0F2C4D] p-5 sm:p-8 text-white space-y-2 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-200 border border-white/20 text-xs font-bold">
          <Briefcase className="h-3.5 w-3.5" />
          <span>Live Job Directory</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
          Explore Real Active Positions
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
          Search live positions fetched directly from verified employers. On mobile, swipe horizontally through cards or filter by role and location.
        </p>
      </div>

      {/* Mobile Quick Filter & Search Bar */}
      <div className="lg:hidden flex flex-col gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search role or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[42px] pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
            />
          </div>
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Filter className="h-4 w-4 text-[#174A7E]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-[#174A7E] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar on Desktop, Jobs Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* DESKTOP FILTERS SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24">
          <Card className="p-5 border-slate-200 shadow-xs">
            <FilterControls />
          </Card>
        </aside>

        {/* JOBS FEED */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Bar: Count + Sort + Mobile Swipe Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <p className="text-xs font-bold text-slate-700">
                Showing <span className="text-[#174A7E] font-black">{jobsList.length}</span> live vacancies
              </p>
              {/* Mobile Swipe Buttons */}
              <div className="flex md:hidden items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollJobs("left")}
                  className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs active:scale-95"
                  aria-label="Previous job"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollJobs("right")}
                  className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs active:scale-95"
                  aria-label="Next job"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="min-h-[36px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="latest">Latest First</option>
                <option value="urgent">Urgent First</option>
              </select>
            </div>
          </div>

          {/* Job List: Mobile Horizontal Swipe Carousel (~88% width peeking next card) & Desktop Multi-column Grid */}
          {isLoading ? (
            <div className="flex md:grid overflow-x-auto md:overflow-visible gap-4 pb-3 md:pb-0 scrollbar-none md:grid-cols-2 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-[88vw] sm:w-[360px] max-w-[380px] shrink-0 md:w-auto md:shrink h-48 rounded-2xl bg-white border border-slate-200 animate-pulse p-5"
                />
              ))}
            </div>
          ) : jobsList.length > 0 ? (
            <div
              ref={jobsSliderRef}
              className="flex md:grid overflow-x-auto md:overflow-visible gap-4 pb-4 md:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-none -mx-3 px-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 md:grid-cols-2"
              style={{ scrollbarWidth: "none" }}
            >
              {jobsList.map((job) => (
                <div
                  key={job.id}
                  className="w-[88vw] sm:w-[360px] max-w-[380px] shrink-0 snap-start h-full md:w-auto md:shrink flex flex-col"
                >
                  <JobCard
                    job={job}
                    onApply={(j) => {
                      setSelectedJob(j);
                      setIsApplyModalOpen(true);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 space-y-3 border-slate-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching jobs found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search keywords, category or location filters.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS SLIDE-OVER DRAWER */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#174A7E]" />
                <h3 className="text-base font-bold text-slate-900">Filters & Preferences</h3>
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto custom-scrollbar flex-1">
              <FilterControls />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="outline"
                className="w-1/3"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                className="w-2/3"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                Apply Filters ({jobsList.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      <JobApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}

