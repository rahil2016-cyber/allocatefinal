import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Globe, ShieldCheck, CreditCard, Clock, Building, FileText, CheckCircle2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Office Address (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <div className="flex flex-col">
                <div className="flex items-center tracking-tight leading-none text-2xl font-black">
                  <span className="text-[#E53E3E]">Job</span>
                  <span className="text-white">Allocate</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                  Right job, right candidate
                </span>
              </div>
            </Link>
            
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              India's smart career and hiring platform. Connecting verified talent with top companies with instant WhatsApp alerts, verified candidate matching, and ATS resume tools.
            </p>

            {/* Legal Entity Name Box */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Legal / Business Name
              </span>
              <p className="font-black text-white text-sm tracking-wide">
                ALEEN VENTURES PRIVATE LIMITED
              </p>
              <p className="text-[11px] text-slate-400">
                Operating brand: JobAllocate (https://joballocate.com)
              </p>
            </div>

            <div className="space-y-1.5 text-xs pt-1 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <span>Ram and Co Circle, Davanagere, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>Support Hours: Mon – Sat: 9:30 AM – 6:30 PM IST</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-semibold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Verified Jobs
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-semibold text-sky-400">
                <CreditCard className="h-3.5 w-3.5" /> INR (₹) Billing
              </span>
            </div>
          </div>

          {/* Col 2: Products & Services (Pricing in INR) */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <span>Products & Pricing (INR)</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/seeker/resume" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Resume Builder</span>
                  <span className="text-emerald-400 font-bold">Free</span>
                </Link>
              </li>
              <li>
                <Link href="/seeker/resume" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>PDF Vector Download</span>
                  <span className="text-slate-300 font-semibold">₹20 / download</span>
                </Link>
              </li>
              <li>
                <Link href="/seeker/resume" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Basic Resume Pack</span>
                  <span className="text-slate-300 font-semibold">₹99</span>
                </Link>
              </li>
              <li>
                <Link href="/seeker/resume" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Premium Resume Pack</span>
                  <span className="text-slate-300 font-semibold">₹299</span>
                </Link>
              </li>
              <li>
                <Link href="/seeker/resume" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Professional Pack</span>
                  <span className="text-slate-300 font-semibold">₹499</span>
                </Link>
              </li>
              <li className="pt-1 border-t border-slate-800/80">
                <Link href="/employer/post-job" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>1st Employer Job Post</span>
                  <span className="text-emerald-400 font-bold">Free</span>
                </Link>
              </li>
              <li>
                <Link href="/employer/post-job" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Additional Job Post</span>
                  <span className="text-slate-300 font-semibold">₹399 / job</span>
                </Link>
              </li>
              <li>
                <Link href="/employer/subscriptions" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Company Subscriptions</span>
                  <span className="text-slate-300 font-semibold">From ₹499/mo</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy Pages (Mandatory Compliance) */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4">
              Policy & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors font-medium">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors font-medium">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors font-medium">
                  Refunds & Cancellations
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors font-medium">
                  Products & Services Pricing
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-white transition-colors font-medium">
                  Complete Legal Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4">
              Get in Touch
            </h4>
            
            <div className="space-y-2 text-xs">
              <a href="tel:+919036980547" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>+91 9036980547</span>
              </a>
              <a href="tel:+919036980574" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>+91 9036980574</span>
              </a>
              <a href="mailto:info@joballocate.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>info@joballocate.com</span>
              </a>
              <a href="mailto:support@joballocate.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>support@joballocate.com</span>
              </a>
              <Link href="https://joballocate.com" target="_blank" className="flex items-center gap-2 hover:text-white transition-colors">
                <Globe className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>https://joballocate.com</span>
              </Link>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/919036980547"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-colors"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* Payment Gateway Trust & Legal Name Compliance Bar */}
        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-slate-400 font-semibold">Payment Partner:</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
              Cashfree Payment Gateway (India)
            </span>
            <span>•</span>
            <span>All transactions processed in Indian Rupees (INR ₹)</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">100% Encrypted & PCI-DSS Compliant</span>
          </div>
          <div className="text-right">
            <p className="text-slate-300 font-bold">
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
