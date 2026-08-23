"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

type JobDetail = {
  id: string;
  title?: string;
  description?: string;
  company_name?: string;
  location?: string;
  job_type?: string;
  salary?: string;
};

export default function JobDetailPage({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .getJob(jobId)
      .then((data) => {
        if (!mounted) return;
        setJob(data as JobDetail);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unable to load job details");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [jobId]);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam / Fraud");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  async function saveJob() {
    try {
      await api.saveJob(jobId);
      setActionMessage("Job saved successfully.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Unable to save job");
    }
  }

  async function applyJob() {
    try {
      await api.applyToJob(jobId);
      setActionMessage("Application submitted successfully.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Unable to apply now");
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      await api.reportJob(jobId, { reason: reportReason, description: reportDesc });
      setActionMessage("Job reported successfully. Our team will review it.");
      setReportModalOpen(false);
      setReportDesc("");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Failed to report job");
    } finally {
      setReportSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm font-bold">Loading job details...</p>;
  if (error) return <p className="text-sm font-bold text-[var(--error)]">{error}</p>;
  if (!job) return <p className="text-sm font-bold">Job not found.</p>;

  return (
    <section className="space-y-4">
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">{job.title ?? "Job Details"}</h1>
        <p className="mt-2 text-sm font-semibold text-[var(--text-hint)]">
          {job.company_name ?? "Company"} • {job.location ?? "Location"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-extrabold text-[var(--primary)]">
            {job.job_type ?? "Job"}
          </span>
          {job.salary ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">{job.salary}</span>
          ) : null}
        </div>
        <p className="mt-5 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{job.description ?? "No description available."}</p>
      </article>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={applyJob} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-extrabold text-white">
            Apply now
          </button>
          <button onClick={saveJob} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold">
            Save job
          </button>
          <button onClick={() => setReportModalOpen(true)} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-extrabold text-red-600 hover:bg-red-50">
            Report Job
          </button>
        </div>
        {actionMessage ? <p className="mt-3 text-sm font-bold text-[var(--primary)]">{actionMessage}</p> : null}
      </div>

      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold text-slate-900">Report Job</h3>
            <p className="mt-1 text-xs text-slate-500">Why are you reporting this job posting?</p>
            <form onSubmit={submitReport} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold"
                >
                  <option value="Spam / Fraud">Spam / Fraud</option>
                  <option value="Misleading Information">Misleading Information</option>
                  <option value="Asking for Money">Asking for Money / Scam</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">Description (Optional)</label>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  rows={3}
                  placeholder="Provide additional details..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {reportSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
