import type { Metadata } from "next";
import AdminJobReportsPage from "@/pages/admin/job-reports-page";

export const metadata: Metadata = {
  title: "Job Reports | JobAllocate Admin",
  description: "Review and moderate reported job postings.",
};

export default function AdminJobReportsRoute() {
  return <AdminJobReportsPage />;
}
