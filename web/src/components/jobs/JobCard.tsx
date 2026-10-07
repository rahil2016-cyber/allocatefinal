"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Job } from "@/lib/types";
import { formatSalary, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Bookmark,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export interface JobCardProps {
  job: Job;
  onApply?: (job: Job) => void;
  onSaveToggle?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply, onSaveToggle }) => {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(job.is_saved || false);

  const companyName = job.company?.name || job.company_name || job.employer?.company_name || "Verified Hiring Partner";
  const logoUrl = job.company?.company_logo_url || job.company_logo;
  const employmentType = job.employment_type || job.job_type || "Full-time";
  const postDate = job.published_at || job.created_at;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSaveToggle) onSaveToggle(job);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if click wasn't on an interactive child
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/jobs/${job.id}`);
  };

  return (
    <Card
      hoverEffect
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between overflow-hidden h-full p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#174A7E]/50 shadow-xs hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header with Logo and Company info */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="h-11 w-11 rounded-xl object-contain border border-slate-100 p-1 bg-slate-50 shrink-0"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#174A7E] font-bold text-lg border border-slate-200 shrink-0">
              <Building2 className="h-5 w-5 text-[#174A7E]" />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1 truncate">
              <span className="truncate">{companyName}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 fill-sky-100 shrink-0" />
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                <Clock className="h-3 w-3 shrink-0" /> Posted {formatDate(postDate)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          aria-label={isSaved ? "Remove from saved" : "Save job"}
          className={`min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
            isSaved
              ? "bg-amber-50 text-amber-600"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`}
          title={isSaved ? "Saved" : "Save Job"}
        >
          <Bookmark className={`h-4.5 w-4.5 ${isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Title & Description */}
      <div className="mb-3 sm:mb-4">
        <Link href={`/jobs/${job.id}`} className="group-hover:text-[#174A7E] transition-colors block">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-2 mb-1.5 leading-snug break-words">
            {job.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed break-words">
          {job.description ? job.description.replace(/<[^>]*>?/gm, "") : "No description provided."}
        </p>
      </div>

      {/* Meta tags */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3.5 sm:mb-4">
        <Badge variant="primary" size="sm" className="bg-sky-50 text-[#174A7E] font-bold border-sky-100 text-[11px]">
          <Briefcase className="h-3 w-3 mr-1 shrink-0" />
          <span>{employmentType}</span>
        </Badge>

        {(job.location || job.city) && (
          <Badge variant="secondary" size="sm" className="text-[11px]">
            <MapPin className="h-3 w-3 mr-1 text-slate-400 shrink-0" />
            <span className="truncate max-w-[120px]">{job.location || job.city}</span>
          </Badge>
        )}

        {job.is_urgent ? (
          <Badge variant="danger" size="sm" className="text-[11px] font-bold">
            Urgent
          </Badge>
        ) : null}

        {(job.category?.name || job.industry_type) && (
          <Badge variant="outline" size="sm" className="text-[11px] max-w-[140px] truncate">
            {job.category?.name || job.industry_type}
          </Badge>
        )}
      </div>

      {/* Footer / Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto gap-2">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
            Estimated Salary
          </span>
          <span className="text-xs font-black text-[#174A7E] truncate block">
            {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link href={`/jobs/${job.id}`}>
            <button
              type="button"
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
            >
              Details
            </button>
          </Link>

          {onApply && (
            <button
              type="button"
              onClick={() => onApply(job)}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#174A7E] hover:bg-[#0f3459] text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>Apply</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
