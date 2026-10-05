"use client";

import React, { useState } from "react";
import Link from "next/link";
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

  return (
    <Card hoverEffect className="group relative flex flex-col justify-between overflow-hidden">
      {/* Header with Logo and Company info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="h-11 w-11 rounded-xl object-contain border border-slate-100 p-1 bg-slate-50"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#174A7E] font-bold text-lg border border-slate-200">
              <Building2 className="h-6 w-6 text-[#174A7E]" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              {companyName}
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 fill-sky-100 inline" />
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Posted {formatDate(postDate)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`rounded-full p-2 transition-colors ${
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
      <div className="mb-4">
        <Link href={`/jobs/${job.id}`} className="group-hover:text-[#174A7E] transition-colors">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1.5">{job.title}</h3>
        </Link>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {job.description ? job.description.replace(/<[^>]*>?/gm, "") : "No description provided."}
        </p>
      </div>

      {/* Meta tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="primary" size="sm">
          <Briefcase className="h-3 w-3 mr-1" />
          {employmentType}
        </Badge>

        {(job.location || job.city) && (
          <Badge variant="secondary" size="sm">
            <MapPin className="h-3 w-3 mr-1 text-slate-400" />
            {job.location || job.city}
          </Badge>
        )}

        {job.is_urgent ? (
          <Badge variant="danger" size="sm">
            Urgent
          </Badge>
        ) : null}

        {(job.category?.name || job.industry_type) && (
          <Badge variant="outline" size="sm">
            {job.category?.name || job.industry_type}
          </Badge>
        )}
      </div>

      {/* Footer / Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Estimated Salary
          </span>
          <span className="text-xs font-extrabold text-[#174A7E]">
            {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/jobs/${job.id}`}>
            <Button variant="outline" size="sm">
              Details
            </Button>
          </Link>

          {onApply && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApply(job)}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
