"use client";

import React, { useState } from "react";
import { Job } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth/context";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";

interface JobApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JobApplyModal: React.FC<JobApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please sign in to your account to apply for jobs.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("job_id", String(job.id));
      formData.append("cover_letter", coverLetter);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      await apiClient.post(ENDPOINTS.APPLY_JOB(job.id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setError(null);
    setCoverLetter("");
    setResumeFile(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={isSuccess ? "Application Submitted!" : `Apply for ${job.title}`}
      subtitle={isSuccess ? "The employer will review your profile." : `${job.company_name || "JobAllocate Hiring Partner"} • ${job.city || "Remote"}`}
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900">Application Received</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your application and details have been successfully delivered to {job.company_name || "the hiring team"}.
            </p>
          </div>
          <Button variant="primary" onClick={handleResetAndClose} className="mt-4">
            Done & Back to Jobs
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* User Info Header */}
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#174A7E] text-white text-xs font-bold uppercase">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user?.name || "Job Seeker"}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Verified Profile
            </span>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Resume / CV (PDF, DOCX)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-[#174A7E] transition-colors cursor-pointer relative bg-slate-50/50">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                {resumeFile ? (
                  <>
                    <FileText className="h-8 w-8 text-[#174A7E]" />
                    <p className="text-xs font-bold text-slate-800">{resumeFile.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-700">
                      Upload your Resume or drag & drop here
                    </p>
                    <p className="text-[11px] text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cover Letter / Personal Note
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and explain why you're a great fit for this position..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20 focus:border-[#174A7E]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={handleResetAndClose} type="button">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
            >
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
