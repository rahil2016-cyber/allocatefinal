"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "urgent">("latest");

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#174A7E] to-[#0F2C4D] p-6 sm:p-8 text-white space-y-2 shadow-lg">
        <Badge variant="primary" size="sm" className="bg-white/10 text-sky-200 border-white/20">
          Production Job Directory
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Explore Real Active Positions
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
          Search live positions fetched directly from your production backend API. Filter by job type, location, category, or keyword.
        </p>
      </div>

      {/* Main Grid: Sidebar + Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FILTERS SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-5 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#174A7E]" />
                <h3 className="text-sm font-bold text-slate-900">Filter Jobs</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-[#174A7E] flex items-center gap-1 font-medium"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>

            {/* Keyword Search */}
            <Input
              label="Keywords"
              placeholder="e.g. Engineer, Designer, Manager"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            {/* Location Search */}
            <Input
              label="Location"
              placeholder="e.g. San Francisco, Remote"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              leftIcon={<MapPin className="h-4 w-4" />}
            />

            {/* Search Action Button */}
            <Button
              type="button"
              variant="primary"
              className="w-full py-2.5 rounded-xl font-bold bg-[#174A7E] hover:bg-[#0f3459] shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Search Active Jobs</span>
            </Button>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Category / Industry
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
              >
                <option value="all">All Categories</option>
                <option value="Technology & Software">Technology & Software</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Healthcare & Medical">Healthcare & Medical</option>
              </select>
            </div>

            {/* Job Type Checkboxes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Job Type
              </label>
              <div className="space-y-2">
                {["Full-time", "Part-time", "Remote", "Contract"].map((type) => (
                  <label key={type} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedJobTypes.includes(type)}
                      onChange={() => toggleJobType(type)}
                      className="rounded border-slate-300 text-[#174A7E]"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* JOBS FEED */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Bar: Count + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-700">
              Showing <span className="text-[#174A7E] font-extrabold">{jobsList.length}</span> live job openings
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="latest">Latest First</option>
                <option value="urgent">Urgent First</option>
              </select>
            </div>
          </div>

          {/* Job List Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#174A7E]" />
              <span className="text-sm font-semibold">Querying live backend jobs...</span>
            </div>
          ) : jobsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobsList.map((job) => (
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
            <Card className="text-center py-12 space-y-3 border-slate-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching jobs found in backend database</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search keywords or location filters.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <JobApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}
