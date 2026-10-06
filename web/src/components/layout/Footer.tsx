import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  ShieldCheck,
  CreditCard,
  Clock,
  Briefcase,
  FileText,
  UserCheck,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Office Address (5 cols on lg) */}
          <div className="sm:col-span-2 lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <div className="flex flex-col">
                <div className="flex items-center tracking-tight leading-none text-2xl font-black">
                  <span className="text-[#E53E3E]">Job</span>
                  <span className="text-[#174A7E]">Allocate</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">
                  Right job, right candidate
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-slate-600 max-w-md">
              India&apos;s smart career and hiring platform. Connecting verified talent with top
              companies with instant WhatsApp alerts, verified candidate matching, and ATS resume
              tools.
            </p>

            {/* Legal Entity Name Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Legal / Business Name
              </span>
              <p className="font-extrabold text-slate-900 text-sm tracking-wide">
                ALEEN VENTURES PRIVATE LIMITED
              </p>
              <p className="text-[11px] text-slate-500">
                Operating brand: JobAllocate (https://joballocate.com)
              </p>
            </div>

            <div className="space-y-2 text-xs pt-1 text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#174A7E] shrink-0 mt-0.5" />
                <span>Ram and Co Circle, Davanagere, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#174A7E] shrink-0" />
                <span>Support Hours: Mon – Sat: 9:30 AM – 6:30 PM IST</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Verified Jobs
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-[11px] font-bold text-[#174A7E]">
                <CreditCard className="h-3.5 w-3.5" /> INR (₹) Billing
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links (Candidates & Employers) (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link href="/jobs" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/seeker/resume" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/employer/post-job" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Post a Job
                </Link>
              </li>
              <li>
                <Link href="/employer/dashboard" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Employer Hub
                </Link>
              </li>
              <li>
                <Link href="/refer-and-earn" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Refer & Earn
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Pricing & Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy Pages (Mandatory Compliance) (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
              Policy & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link href="/contact" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Refunds & Cancellations
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-[#174A7E] transition-colors font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" /> Legal Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Helpdesk (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
              Get in Touch
            </h4>

            <div className="space-y-2.5 text-xs text-slate-600">
              <a
                href="tel:+919036980547"
                className="flex items-center gap-2 hover:text-[#174A7E] transition-colors font-medium"
              >
                <Phone className="h-4 w-4 text-[#174A7E] shrink-0" />
                <span>+91 9036980547</span>
              </a>
              <a
                href="tel:+919036980574"
                className="flex items-center gap-2 hover:text-[#174A7E] transition-colors font-medium"
              >
                <Phone className="h-4 w-4 text-[#174A7E] shrink-0" />
                <span>+91 9036980574</span>
              </a>
              <a
                href="mailto:info@joballocate.com"
                className="flex items-center gap-2 hover:text-[#174A7E] transition-colors font-medium"
              >
                <Mail className="h-4 w-4 text-[#174A7E] shrink-0" />
                <span>info@joballocate.com</span>
              </a>
              <a
                href="mailto:support@joballocate.com"
                className="flex items-center gap-2 hover:text-[#174A7E] transition-colors font-medium"
              >
                <Mail className="h-4 w-4 text-[#174A7E] shrink-0" />
                <span>support@joballocate.com</span>
              </a>
              <Link
                href="https://joballocate.com"
                target="_blank"
                className="flex items-center gap-2 hover:text-[#174A7E] transition-colors font-medium"
              >
                <Globe className="h-4 w-4 text-[#174A7E] shrink-0" />
                <span>https://joballocate.com</span>
              </Link>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/919036980547"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Payment Gateway Trust & Legal Name Compliance Bar */}
        <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2 text-center md:text-left">
            <span className="text-slate-700 font-semibold">Payment Partner:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-medium">
              Cashfree Payment Gateway (India)
            </span>
            <span>•</span>
            <span>All transactions processed in Indian Rupees (INR ₹)</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">100% Encrypted &amp; PCI-DSS Compliant</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-slate-800 font-bold">
              © {new Date().getFullYear()} ALEEN VENTURES PRIVATE LIMITED. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-500">
              JobAllocate is an official platform operated by ALEEN VENTURES PRIVATE LIMITED.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
