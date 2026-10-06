import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, CreditCard, FileText } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions — ALEEN VENTURES PRIVATE LIMITED | JobAllocate",
  description: "Official Terms and Conditions, Service Charges, and User Agreement for JobAllocate, operated by ALEEN VENTURES PRIVATE LIMITED.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#174A7E] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-[#174A7E] border border-sky-100">
              <FileText className="h-3.5 w-3.5" /> Official Agreement
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Terms & Conditions
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Last Updated: October 2026 | Operating Entity: <strong>ALEEN VENTURES PRIVATE LIMITED</strong> | Domain: https://joballocate.com
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-normal">
            
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms & Operating Entity</h2>
              <p>
                By accessing or using <strong>JobAllocate</strong> (accessible at{" "}
                <Link href="https://joballocate.com" className="text-[#174A7E] font-semibold underline">
                  https://joballocate.com
                </Link>{" "}
                and through our mobile application), you agree to be bound by these Terms and Conditions. JobAllocate is owned, maintained, and operated by <strong>ALEEN VENTURES PRIVATE LIMITED</strong> ("Company", "we", "us", or "our"), a private limited company incorporated under the laws of India.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Products, Services & Pricing in INR (₹)</h2>
              <p>
                <strong>ALEEN VENTURES PRIVATE LIMITED</strong> operates JobAllocate as an employment matching and ATS resume building service. All paid packages and digital products are billed in <strong>Indian Rupees (INR ₹)</strong> through our authorized payment gateway partner, <strong>Cashfree Payment Gateway India</strong>.
              </p>

              <div className="rounded-2xl border border-slate-200 overflow-hidden mt-3">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="p-3">Product / Service</th>
                      <th className="p-3">Price (INR)</th>
                      <th className="p-3">Billing Cycle / Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Resume Builder & Studio</td>
                      <td className="p-3 font-bold text-emerald-600">Free</td>
                      <td className="p-3 text-slate-500">Instant Access</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Resume PDF Vector Export</td>
                      <td className="p-3 font-bold text-slate-900">₹20</td>
                      <td className="p-3 text-slate-500">Per Download</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Basic Resume Package</td>
                      <td className="p-3 font-bold text-slate-900">₹99</td>
                      <td className="p-3 text-slate-500">One-time / 30 Days</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Premium Resume Package</td>
                      <td className="p-3 font-bold text-slate-900">₹299</td>
                      <td className="p-3 text-slate-500">One-time / 60 Days</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Professional Resume Package</td>
                      <td className="p-3 font-bold text-slate-900">₹499</td>
                      <td className="p-3 text-slate-500">One-time / 90 Days</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Employer 1st Job Listing</td>
                      <td className="p-3 font-bold text-emerald-600">Free</td>
                      <td className="p-3 text-slate-500">Trial Posting</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Additional Employer Job Posting</td>
                      <td className="p-3 font-bold text-slate-900">₹399</td>
                      <td className="p-3 text-slate-500">Per Job Post</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Company Subscription Plans</td>
                      <td className="p-3 font-bold text-slate-900">From ₹499 to ₹1,499</td>
                      <td className="p-3 text-slate-500">Monthly Recurring</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Employer Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Employers must provide authentic and verified business credentials prior to publishing job postings.</li>
                <li>All job postings must represent genuine employment opportunities and comply strictly with applicable Indian labor laws.</li>
                <li>Requesting upfront application fees or security deposits from job seekers is strictly prohibited and leads to instant termination without refund.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Job Seeker Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Job seekers must provide truthful and accurate information regarding their identity, skills, and work experience.</li>
                <li>Users are responsible for maintaining the confidentiality of their login credentials and OTP verification codes.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Legal Entity & Contact Information</h2>
              <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-1 border border-slate-200">
                <p><strong>Business Legal Name:</strong> ALEEN VENTURES PRIVATE LIMITED</p>
                <p><strong>Trade Name:</strong> JobAllocate</p>
                <p><strong>Registered Office Address:</strong> Ram and Co Circle, Davanagere, Karnataka, India</p>
                <p><strong>Direct Phone:</strong> +91 9036980547 / +91 9036980574</p>
                <p><strong>Email:</strong> info@joballocate.com | support@joballocate.com</p>
                <p><strong>Official Website:</strong> https://joballocate.com</p>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
