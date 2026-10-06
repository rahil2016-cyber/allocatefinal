import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, CreditCard, Sparkles, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Products, Services & Pricing (INR) — JobAllocate",
  description: "Official listing of JobAllocate products, resume packages, employer job postings and subscription plans in Indian Rupees (INR ₹).",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#174A7E] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-[#174A7E] border border-sky-100">
            <CreditCard className="h-3.5 w-3.5" /> Transparent Pricing in INR (₹)
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Products, Services & Pricing
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Clear, honest pricing with zero hidden charges. All digital services processed securely in Indian National Rupees (INR) via Cashfree Payment Gateway.
          </p>
        </div>

        {/* Section 1: For Job Seekers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#174A7E]" />
            <h2 className="text-xl font-black text-slate-900">Job Seeker Digital Services</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Entry Package</span>
                <h3 className="text-lg font-black text-slate-900">Basic Resume Package</h3>
                <div className="text-3xl font-black text-slate-900 pt-1">
                  ₹99 <span className="text-xs text-slate-400 font-normal">/ one-time</span>
                </div>
                <p className="text-xs text-slate-500">Perfect for freshers and early-career candidates.</p>
                <ul className="space-y-2 pt-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> ATS-Engineered Resume Templates</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> 3 High-Resolution PDF Downloads</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> 30 Days Online Editing Access</li>
                </ul>
              </div>
              <Link href="/seeker/resume" className="w-full block">
                <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl">
                  Choose Basic →
                </Button>
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#174A7E] shadow-md space-y-4 flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 bg-[#174A7E] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Most Popular
              </span>
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#174A7E]">Best Value</span>
                <h3 className="text-lg font-black text-slate-900">Premium Resume Package</h3>
                <div className="text-3xl font-black text-[#174A7E] pt-1">
                  ₹299 <span className="text-xs text-slate-400 font-normal">/ one-time</span>
                </div>
                <p className="text-xs text-slate-500">Comprehensive tools to stand out to Indian recruiters.</p>
                <ul className="space-y-2 pt-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> All 13+ ATS Resume Templates</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Unlimited PDF Vector Exports</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> 60 Days Validity & Version History</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> AI Resume Suggestion Engine</li>
                </ul>
              </div>
              <Link href="/seeker/resume" className="w-full block">
                <Button variant="primary" size="sm" className="w-full bg-[#174A7E] text-xs font-bold rounded-xl">
                  Choose Premium →
                </Button>
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Executive</span>
                <h3 className="text-lg font-black text-slate-900">Professional Package</h3>
                <div className="text-3xl font-black text-slate-900 pt-1">
                  ₹499 <span className="text-xs text-slate-400 font-normal">/ one-time</span>
                </div>
                <p className="text-xs text-slate-500">For experienced professionals and managers.</p>
                <ul className="space-y-2 pt-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Complete Template Library</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Unlimited Vector & Word Exports</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> 90 Days Validity</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Priority WhatsApp Support</li>
                </ul>
              </div>
              <Link href="/seeker/resume" className="w-full block">
                <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl">
                  Choose Professional →
                </Button>
              </Link>
            </div>

          </div>
        </div>

        {/* Section 2: For Employers */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#174A7E]" />
            <h2 className="text-xl font-black text-slate-900">Employer Hiring & Subscription Plans</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pay per post */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Direct Posting</span>
              <h3 className="text-xl font-black text-slate-900">Pay-Per-Job Posting</h3>
              <div className="text-3xl font-black text-slate-900 pt-1">
                ₹399 <span className="text-xs text-slate-400 font-normal">/ job listing</span>
              </div>
              <p className="text-xs text-slate-500">First job posting is 100% Free for all verified employers.</p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Active on platform for 30 days</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Direct WhatsApp & Phone candidate applications</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Real-time applicant dashboard access</li>
              </ul>
              <div className="pt-2">
                <Link href="/employer/post-job">
                  <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl">
                    Post a Job →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Monthly subscription */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#174A7E]">Monthly Plan</span>
              <h3 className="text-xl font-black text-slate-900">Company Subscriptions</h3>
              <div className="text-3xl font-black text-slate-900 pt-1">
                ₹499 <span className="text-xs text-slate-400 font-normal">/ month (Starter)</span>
              </div>
              <p className="text-xs text-slate-500">Scale your recruitment with bulk verified candidate profiles.</p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Multiple active job postings included</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Unrestricted candidate resume views & phone access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Zero commission fees on successful hires</li>
              </ul>
              <div className="pt-2">
                <Link href="/employer/subscriptions">
                  <Button variant="primary" size="sm" className="bg-[#174A7E] text-xs font-bold rounded-xl">
                    View Subscriptions →
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Compliance Footer Banner */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Cashfree Gateway Secure Payments</p>
              <p className="text-[11px] text-slate-500">All prices are in Indian Rupees (INR ₹). Taxes and invoice receipts provided on every order.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/refund-policy" className="text-[#174A7E] font-bold hover:underline">
              Refund Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="text-[#174A7E] font-bold hover:underline">
              Terms & Conditions
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
