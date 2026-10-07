"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, FileText, RefreshCw, CreditCard, Phone, MapPin, Mail, Clock, Check, Building } from "lucide-react";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<"terms" | "refund" | "pricing" | "privacy" | "contact">("terms");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="space-y-1">
        <Badge variant="primary" size="sm">
          Legal & Compliance
        </Badge>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          ALEEN VENTURES PRIVATE LIMITED — JobAllocate
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Official Terms & Conditions, Refund Policy, Privacy Standards, INR Pricing, and Company Information for <strong>ALEEN VENTURES PRIVATE LIMITED</strong>.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold overflow-x-auto scrollbar-none">
        {[
          { key: "terms", label: "Terms & Conditions" },
          { key: "refund", label: "Refunds & Cancellations" },
          { key: "pricing", label: "Products & Pricing (INR)" },
          { key: "privacy", label: "Privacy Policy" },
          { key: "contact", label: "Contact Us & Entity" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === t.key
                ? "border-[#174A7E] text-[#174A7E] font-black"
                : "border-transparent text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="p-6 sm:p-10 space-y-6 border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal shadow-sm">
        
        {/* Tab 1: Terms */}
        {activeTab === "terms" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">Terms & Conditions</h2>
            <p className="text-xs text-slate-500">
              Operating Entity: <strong>ALEEN VENTURES PRIVATE LIMITED</strong> | Effective: August 2026
            </p>
            <p>
              By accessing or using <strong>JobAllocate</strong> (accessible at https://joballocate.com and through our mobile apps), you agree to be bound by these Terms and Conditions. JobAllocate is owned, maintained, and operated by <strong>ALEEN VENTURES PRIVATE LIMITED</strong> ("Company", "we", "us", or "our"), an entity incorporated under the laws of India.
            </p>
            
            <h3 className="font-bold text-slate-900 pt-2">1. User Eligibility & Mobile Authentication</h3>
            <p>
              Users must be at least 18 years of age and possess an authentic, verified Indian mobile phone number verified via carrier SMS OTP.
            </p>

            <h3 className="font-bold text-slate-900 pt-2">2. Products, Services & INR Pricing</h3>
            <p>
              All paid digital services on JobAllocate are charged in Indian National Rupees (INR ₹) via Cashfree Payment Gateway India. Current prices are listed transparently on our platform before payment confirmation.
            </p>

            <h3 className="font-bold text-slate-900 pt-2">3. Employer & Candidate Standards</h3>
            <p>
              Employers must represent genuine verified businesses and are strictly forbidden from demanding upfront charges from candidates. Job seekers must maintain truthful profiles and accurate qualifications.
            </p>
          </div>
        )}

        {/* Tab 2: Refund */}
        {activeTab === "refund" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">Refund & Cancellation Policy</h2>
            <p className="text-xs text-slate-500">
              Operating Entity: <strong>ALEEN VENTURES PRIVATE LIMITED</strong> | Effective: August 2026
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-xs font-medium">
              Digital goods and services provided by <strong>ALEEN VENTURES PRIVATE LIMITED</strong> — including resume downloads, candidate packages, job listings, and employer subscription credits — are activated immediately upon payment and are non-refundable once delivered.
            </div>

            <h3 className="font-bold text-slate-900 pt-2">Eligible Refund Circumstances</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Duplicate Billing:</strong> Multiple charges for the exact same order caused by a payment gateway or network delay.</li>
              <li><strong>Technical Delivery Failure:</strong> Money debited but subscription credits/packages not reflected within 24 hours.</li>
              <li><strong>Company Verification Rejection:</strong> Employer payments refunded minus payment gateway transaction fees if company fails regulatory verification.</li>
            </ul>

            <h3 className="font-bold text-slate-900 pt-2">Refund Processing Timeline</h3>
            <p>
              Refund requests must be emailed to <strong>info@joballocate.com</strong> within 7 business days with your Order ID and payment receipt. Approved refunds will be credited back to the original payment source within <strong>5 to 7 working days</strong>.
            </p>
          </div>
        )}

        {/* Tab 3: Pricing */}
        {activeTab === "pricing" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">Products, Services & Pricing in INR (₹)</h2>
            <p className="text-xs text-slate-500">
              Billed by: <strong>ALEEN VENTURES PRIVATE LIMITED</strong> | Zero hidden fees
            </p>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
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
          </div>
        )}

        {/* Tab 4: Privacy */}
        {activeTab === "privacy" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">Privacy Policy</h2>
            <p className="text-xs text-slate-500">
              Entity: <strong>ALEEN VENTURES PRIVATE LIMITED</strong> | Effective: August 2026
            </p>
            <p>
              Your privacy is paramount to JobAllocate. We collect verified phone numbers, names, email addresses, and professional resume documents solely for facilitating employment matching.
            </p>
            <h3 className="font-bold text-slate-900 pt-2">Data Security & Third-Party Gateways</h3>
            <p>
              All traffic is encrypted using standard HTTPS/TLS. Payment credentials and card numbers are processed directly by Cashfree Payment Gateway India and are never stored on JobAllocate servers.
            </p>
          </div>
        )}

        {/* Tab 5: Contact */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">Legal Entity & Contact Details</h2>
            <p className="text-xs text-slate-500">Official business information for ALEEN VENTURES PRIVATE LIMITED.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 md:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#174A7E] block">Business Legal Name</span>
                <p className="pt-1 text-base font-black text-slate-900">ALEEN VENTURES PRIVATE LIMITED</p>
                <p className="text-xs text-slate-600">Brand / Platform: JobAllocate (https://joballocate.com)</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="font-bold text-slate-900 flex items-center gap-1.5"><Phone className="h-4 w-4 text-[#174A7E]" /> Phone Support</p>
                <p className="pt-2 text-sm font-bold text-[#174A7E]">+91 9036980547</p>
                <p className="text-xs text-slate-500">Mon – Sat: 9:30 AM – 6:30 PM IST</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="font-bold text-slate-900 flex items-center gap-1.5"><Mail className="h-4 w-4 text-[#174A7E]" /> Email Helpdesk</p>
                <p className="pt-2 text-sm font-bold text-[#174A7E]">info@joballocate.com</p>
                <p className="text-xs text-slate-500">Official Customer Support</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 md:col-span-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#174A7E]" /> Registered Office Address</p>
                <p className="pt-2 text-xs text-slate-700 font-semibold">Ram and Co Circle, Davanagere, Karnataka, India</p>
                <p className="text-xs text-slate-500 pt-1">Official Website: https://joballocate.com</p>
              </div>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}
