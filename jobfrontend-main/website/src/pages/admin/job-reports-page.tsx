"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/common/protected";
import { EmptyState, ErrorState } from "@/components/common/states";
import { SiteShell } from "@/components/layout/site-shell";
import { api } from "@/services/api";

type JobReportItem = {
  id: number;
  reason: string;
  description?: string | null;
  status: "pending" | "reviewed" | "dismissed";
  admin_note?: string | null;
  created_at?: string;
  updated_at?: string;
  job_post_id?: number;
  user_id?: number;
  job_post?: {
    id: number;
    title: string;
    status?: string;
    location?: string;
    employment_type?: string;
    published_at?: string;
    company?: {
      id: number;
      name: string;
      verification_status?: string;
    };
  };
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
};

function formatWhen(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: string) {
  if (status === "pending") return "bg-amber-100 text-amber-800";
  if (status === "reviewed") return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-700";
}

export default function AdminJobReportsPage() {
  const [reports, setReports] = useState<JobReportItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [active, setActive] = useState<JobReportItem | null>(null);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    loadReports();
  }, [filterStatus]);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminJobReports(
        filterStatus !== "all" ? { status: filterStatus } : undefined
      );
      const items = (res.data || []) as JobReportItem[];
      setReports(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  function openDetail(report: JobReportItem) {
    setActive(report);
    setNoteInput(report.admin_note || "");
  }

  async function handleStatusChange(
    reportId: number,
    newStatus: "pending" | "reviewed" | "dismissed"
  ) {
    setUpdatingId(reportId);
    try {
      await api.adminUpdateJobReport(reportId, {
        status: newStatus,
        admin_note: noteInput,
      });
      setActive(null);
      await loadReports();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update report");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Protected role="super_admin">
      <SiteShell
        navItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Job Reports", href: "/admin/job-reports" },
        ]}
      >
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-black">Job Reports</h1>
              <p className="mt-1 text-sm font-semibold text-[var(--text-hint)]">
                Reported jobs with company, reporter, reason, details, and time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Filter status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[var(--primary)]"
              >
                <option value="all">All reports</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          {error ? <ErrorState title={error} /> : null}

          {loading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Loading reports…</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Reported</th>
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Reported by</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!reports.length ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10">
                        <EmptyState title="No job reports found." />
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="border-b border-slate-100 align-top last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-500">
                          {formatWhen(report.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900">
                            {report.job_post?.title ?? `Job #${report.job_post?.id || report.job_post_id || "N/A"}`}
                          </div>
                          <div className="text-xs font-semibold text-slate-500">
                            ID {report.job_post?.id || report.job_post_id || "—"}
                            {report.job_post?.status ? ` · ${report.job_post.status}` : ""}
                          </div>
                          {report.job_post?.location ? (
                            <div className="text-xs font-semibold text-slate-400">
                              {report.job_post.location}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">
                            {report.job_post?.company?.name ?? "N/A"}
                          </div>
                          {report.job_post?.company?.verification_status ? (
                            <div className="text-xs font-semibold text-slate-500">
                              {report.job_post.company.verification_status}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{report.user?.name ?? "Job seeker"}</div>
                          <div className="text-xs font-semibold text-slate-500">
                            {report.user?.email ?? "N/A"}
                          </div>
                          {report.user?.phone ? (
                            <div className="text-xs font-semibold text-slate-400">{report.user.phone}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-extrabold text-red-700">
                            {report.reason}
                          </span>
                        </td>
                        <td className="max-w-[220px] px-4 py-3 text-xs font-semibold text-slate-600">
                          {report.description
                            ? report.description.length > 90
                              ? `${report.description.slice(0, 90)}…`
                              : report.description
                            : "No extra details"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize ${statusClass(report.status)}`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openDetail(report)}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {active ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="presentation"
            onClick={() => setActive(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Report #{active.id}</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Reported {formatWhen(active.created_at)} · Updated {formatWhen(active.updated_at)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize ${statusClass(active.status)}`}
                >
                  {active.status}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Job</p>
                  <p className="mt-1 font-extrabold text-slate-900">
                    {active.job_post?.title ?? `Job #${active.job_post_id || "N/A"}`}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    ID {active.job_post?.id || active.job_post_id || "—"}
                    {active.job_post?.status ? ` · ${active.job_post.status}` : ""}
                  </p>
                  {active.job_post?.location ? (
                    <p className="text-xs font-semibold text-slate-500">{active.job_post.location}</p>
                  ) : null}
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Company</p>
                  <p className="mt-1 font-extrabold text-slate-900">
                    {active.job_post?.company?.name ?? "N/A"}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {active.job_post?.company?.verification_status || "Verification unknown"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                    Reported by
                  </p>
                  <p className="mt-1 font-extrabold text-slate-900">{active.user?.name ?? "Job seeker"}</p>
                  <p className="text-xs font-semibold text-slate-500">
                    {active.user?.email ?? "N/A"}
                    {active.user?.phone ? ` · ${active.user.phone}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-red-500">Reason</p>
                <p className="mt-1 font-extrabold text-red-700">{active.reason}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm font-semibold text-slate-700">
                  {active.description?.trim()
                    ? active.description
                    : "No additional details provided by the reporter."}
                </p>
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                  Admin note
                </span>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  rows={4}
                  placeholder="Add moderation notes…"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold outline-none focus:border-[var(--primary)]"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updatingId === active.id}
                  onClick={() => handleStatusChange(active.id, "reviewed")}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Mark reviewed
                </button>
                <button
                  type="button"
                  disabled={updatingId === active.id}
                  onClick={() => handleStatusChange(active.id, "dismissed")}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Dismiss
                </button>
                {active.status !== "pending" ? (
                  <button
                    type="button"
                    disabled={updatingId === active.id}
                    onClick={() => handleStatusChange(active.id, "pending")}
                    className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                  >
                    Reset pending
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="rounded-xl px-3 py-2 text-xs font-extrabold text-slate-500 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </SiteShell>
    </Protected>
  );
}
