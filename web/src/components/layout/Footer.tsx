import React from "react";
import Link from "next/link";
import { Briefcase, Heart, Mail, Phone, MapPin, Globe } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <div className="flex flex-col">
                <div className="flex items-center tracking-tight leading-none">
                  <span className="text-2xl font-black text-[#E53E3E]">Job</span>
                  <span className="text-2xl font-black text-white">Allocate</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                  Right job, right candidate
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Empowering careers through smart matching and powerful resume building tools.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <Link href="https://joballocate.tech" target="_blank" className="hover:text-white transition-colors">
                <Globe className="h-4 w-4" />
              </Link>
              <Link href="https://wa.me/919036980547" target="_blank" className="hover:text-white transition-colors">
                <Phone className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              For Job Seekers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Browse All Jobs
                </Link>
              </li>
              <li>
                <Link href="/seeker/dashboard" className="hover:text-white transition-colors">
                  Seeker Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seeker/profile" className="hover:text-white transition-colors">
                  Build Resume Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/employer/post-job" className="hover:text-white transition-colors">
                  Post a Job Listing
                </Link>
              </li>
              <li>
                <Link href="/employer/dashboard" className="hover:text-white transition-colors">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/employer/applicants" className="hover:text-white transition-colors">
                  Manage Applicants
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Get in Touch
            </h4>
            <div className="flex items-center gap-2.5 text-xs">
              <Phone className="h-4 w-4 text-[#38BDF8] shrink-0" />
              <span>+91 9036980547</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Globe className="h-4 w-4 text-[#38BDF8] shrink-0" />
              <span>https://joballocate.tech</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobAllocate. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>JobAllocate Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
