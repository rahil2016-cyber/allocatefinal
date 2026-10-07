import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Eye } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — ALEEN VENTURES PRIVATE LIMITED | JobAllocate",
  description: "Official Privacy Policy, Data Protection, and Information Security standards for JobAllocate, operated by ALEEN VENTURES PRIVATE LIMITED.",
};

export default function PrivacyPage() {
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Privacy & Data Security
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Last Updated: October 2026 | Operating Entity: <strong>ALEEN VENTURES PRIVATE LIMITED</strong> | Domain: https://joballocate.com
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-normal">
            
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Commitment to User Privacy</h2>
              <p>
                At <strong>JobAllocate</strong> (operated and maintained by <strong>ALEEN VENTURES PRIVATE LIMITED</strong>, accessible at{" "}
                <Link href="https://joballocate.com" className="text-[#174A7E] font-semibold underline">
                  https://joballocate.com
                </Link>{" "}
                and via our mobile apps), we take your privacy and data security seriously. This Privacy Policy details what information we collect, how it is utilized for employment matching, and how we protect your personal credentials.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Account Identification:</strong> Mobile phone number, verified name, and account password or OTP authentication tokens.
                </li>
                <li>
                  <strong>Candidate Career Details:</strong> Professional resume content, work experience, educational background, skills, and city of residence.
                </li>
                <li>
                  <strong>Employer Business Data:</strong> Company name, registered business address, GST number (where applicable), contact person details, and job descriptions.
                </li>
                <li>
                  <strong>Payment Records:</strong> Transaction references, Order IDs, and status metadata processed securely through Cashfree Payment Gateway. We do not store full credit card numbers or UPI PINs.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. How Information is Used</h2>
              <p>Your data is used strictly for:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Connecting verified candidates with legitimate recruiting employers.</li>
                <li>Sending job match notifications and application status alerts via SMS and WhatsApp.</li>
                <li>Processing secure subscriptions and package transactions via Cashfree.</li>
                <li>Preventing spam, fraudulent listings, and unauthorized access.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Third-Party Service Providers</h2>
              <p>
                We partner with trusted, industry-standard third-party providers:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Cashfree Payments India:</strong> For secure digital payment gateway processing.</li>
                <li><strong>Firebase Authentication:</strong> For carrier SMS OTP verification.</li>
              </ul>
              <p>We do not sell, rent, or trade your personal data to external advertisers.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Legal Entity & Grievance Contact</h2>
              <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-1 border border-slate-200">
                <p><strong>Business Legal Name:</strong> ALEEN VENTURES PRIVATE LIMITED</p>
                <p><strong>Brand / Platform:</strong> JobAllocate</p>
                <p><strong>Address:</strong> Ram and Co Circle, Davanagere, Karnataka, India</p>
                <p><strong>Phone:</strong> +91 9036980547</p>
                <p><strong>Email:</strong> info@joballocate.com</p>
                <p><strong>Website:</strong> https://joballocate.com</p>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
