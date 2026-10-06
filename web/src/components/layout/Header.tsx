"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import {
  Home,
  Briefcase,
  Bookmark,
  User as UserIcon,
  MoreHorizontal,
  LogOut,
  ChevronDown,
  Menu,
  X,
  FileText,
  PlusCircle,
  Building2,
  Search,
  TrendingUp,
  Clock,
  LayoutDashboard,
  Users,
  CreditCard,
  Headphones,
  Phone,
  MessageCircle,
  Mail,
  Power,
  Smartphone,
  ExternalLink,
  LifeBuoy,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

// Official Support Details from Mobile App (contact_settings_service.dart)
const SUPPORT_INFO = {
  phone: "+91 9036980547",
  phoneRaw: "9036980547",
  whatsappUrl: "https://wa.me/919036980547",
  email: "info@joballocate.tech",
  emailSupport: "support@joballocate.com",
  youtubeUrl: "https://www.youtube.com/@joballocate",
  instagramUrl: "https://www.instagram.com/joballocate",
  linkedinUrl: "https://www.linkedin.com/company/joballocate",
  facebookUrl: "https://www.facebook.com/joballocate",
  websiteUrl: "https://joballocate.tech",
  timing: "Mon - Sat: 9:30 AM - 6:30 PM IST",
};

// Popular search suggestions matching Flutter app
const POPULAR_SEARCHES = [
  "Software Engineer",
  "Data Analyst",
  "Product Manager",
  "UI/UX Designer",
  "Marketing Manager",
  "Sales Executive",
  "Java Developer",
  "React Developer",
  "Python Developer",
  "Business Analyst",
];

const TRENDING_SEARCHES = [
  "Remote Jobs",
  "Fresher Jobs",
  "Work From Home",
  "IT Jobs",
  "MBA Jobs",
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, role, logout } = useAuth();
  const isEmployer = role === "employer" || role === "company" || pathname.startsWith("/employer");
  const isJobSeeker = (isAuthenticated && !isEmployer) || pathname.startsWith("/seeker");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);

  const supportRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchOverlayRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  // Open search overlay and focus input
  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  // Handle search submit
  const handleSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    closeSearch();
    router.push(`/jobs?search=${encodeURIComponent(q)}`);
  };

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchOpen ? closeSearch() : openSearch();
      }
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen, openSearch, closeSearch]);

  // Close search when clicking outside
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchOverlayRef.current && !searchOverlayRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen, closeSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) {
        setSupportDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSuggestions = searchQuery.trim()
    ? POPULAR_SEARCHES.filter((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      {/* Search Overlay Backdrop */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      )}

      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs transition-all">
        {/* ─── TIER 1: MAIN TOP BAR (Logo, Search Bar, Support, User Name, Round Switch) ─── */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

          {/* 1. Brand Logo (Typography Only - Square icon removed per user instruction) */}
          <Link
            href={isEmployer ? "/employer/dashboard" : isJobSeeker ? "/seeker/dashboard" : "/"}
            className="flex items-center group shrink-0 select-none"
          >
            <div className="flex flex-col">
              <div className="flex items-center tracking-tight leading-none">
                <span className="text-2xl sm:text-[26px] font-black text-[#E53E3E] group-hover:opacity-90 transition-opacity">
                  Job
                </span>
                <span className="text-2xl sm:text-[26px] font-black text-[#174A7E] group-hover:opacity-90 transition-opacity">
                  Allocate
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                Right job, right candidate
              </span>
            </div>
          </Link>

          {/* 2. Search Bar (Centered, Full Featured) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-2 lg:mx-4 relative" ref={searchOverlayRef}>
            {/* Pill Trigger */}
            <button
              type="button"
              onClick={openSearch}
              className="w-full flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-[#174A7E]/40 hover:shadow-sm text-slate-400 text-sm font-medium transition-all group shadow-2xs cursor-pointer"
            >
              <Search className="h-4 w-4 text-[#174A7E] shrink-0" />
              <span className="flex-1 text-left text-sm text-slate-500 font-normal truncate">
                Search jobs, skills, companies…
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Expanded Search Dropdown */}
            {searchOpen && (
              <div
                className="absolute top-0 left-0 right-0 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
                style={{ minWidth: "440px" }}
              >
                {/* Input row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                  <Search className="h-5 w-5 text-[#174A7E] shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch(searchQuery);
                      if (e.key === "Escape") closeSearch();
                    }}
                    placeholder="Search by jobs, skills, companies, salary..."
                    className="flex-1 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={closeSearch}
                    className="text-slate-400 hover:text-slate-600 pl-2 border-l border-slate-100"
                  >
                    <kbd className="text-[10px] font-semibold text-slate-400">Esc</kbd>
                  </button>
                </div>

                {/* Suggestions */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredSuggestions.length > 0 ? (
                    <div className="py-2">
                      <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Suggestions
                      </p>
                      {filteredSuggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSearch(s)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                        >
                          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>
                            {s.split(new RegExp(`(${searchQuery})`, "gi")).map((part, i) =>
                              part.toLowerCase() === searchQuery.toLowerCase() ? (
                                <mark key={i} className="bg-yellow-100 text-yellow-900 font-bold rounded-xs">
                                  {part}
                                </mark>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2">
                      {/* Trending */}
                      <div className="px-4 pt-2 pb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <TrendingUp className="h-3 w-3" /> Trending Searches
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {TRENDING_SEARCHES.map((t) => (
                            <button
                              key={t}
                              onClick={() => handleSearch(t)}
                              className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded-full hover:bg-sky-100 transition-colors cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Popular */}
                      <div className="px-4 pt-3 pb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <Clock className="h-3 w-3" /> Popular Roles
                        </p>
                        {POPULAR_SEARCHES.slice(0, 5).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSearch(s)}
                            className="w-full flex items-center gap-3 py-2 text-sm text-slate-700 hover:text-[#174A7E] text-left transition-colors cursor-pointer"
                          >
                            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Press <kbd className="bg-white border border-slate-200 rounded px-1 font-mono">Enter</kbd> to search
                  </span>
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    disabled={!searchQuery.trim()}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#174A7E] hover:bg-[#0f3459] disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Search Jobs
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. RIGHT SECTION (Support Button + User Name + Round Login/Logout Switch) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* A. Support Menu Dropdown (Details from App) */}
            <div className="relative" ref={supportRef}>
              <button
                type="button"
                onClick={() => setSupportDropdownOpen(!supportDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                  supportDropdownOpen
                    ? "bg-[#174A7E] text-white border-[#174A7E]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-[#174A7E]/50 hover:bg-slate-50"
                }`}
                title="JobAllocate Official Support & Helpdesk"
              >
                <Headphones className={`h-4 w-4 shrink-0 ${supportDropdownOpen ? "text-white" : "text-[#174A7E]"}`} />
                <span className="hidden sm:inline">Support</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${supportDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {supportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-76 sm:w-84 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          JobAllocate Support Desk
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{SUPPORT_INFO.timing}</p>
                    </div>
                    <button
                      onClick={() => setSupportDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600 rounded-md p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 py-3 text-xs">
                    {/* Call Direct */}
                    <a
                      href={`tel:${SUPPORT_INFO.phone}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-[#174A7E]/30 hover:bg-slate-50 transition-all group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#174A7E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800">{SUPPORT_INFO.phone}</p>
                        <p className="text-[10px] text-slate-400">Direct Calling Line</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#174A7E] bg-blue-50 px-2 py-0.5 rounded-full">
                        Call
                      </span>
                    </a>

                    {/* WhatsApp Direct */}
                    <a
                      href={SUPPORT_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 transition-all group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-emerald-950">Chat on WhatsApp</p>
                        <p className="text-[10px] text-emerald-700">Instant Help & Inquiries</p>
                      </div>
                      <span className="text-[10px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full">
                        Chat
                      </span>
                    </a>

                    {/* Official Email */}
                    <a
                      href={`mailto:${SUPPORT_INFO.email}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{SUPPORT_INFO.email}</p>
                        <p className="text-[10px] text-slate-400">Official Help Desk</p>
                      </div>
                    </a>
                  </div>

                  {/* Social Handles */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Social & Communities
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold text-slate-600">
                      <a
                        href={SUPPORT_INFO.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 hover:text-red-600 transition-colors"
                      >
                        <span className="h-2 w-2 rounded-full bg-red-600" />
                        <span>YouTube</span>
                      </a>
                      <a
                        href={SUPPORT_INFO.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 hover:text-pink-600 transition-colors"
                      >
                        <span className="h-2 w-2 rounded-full bg-pink-600" />
                        <span>Instagram</span>
                      </a>
                      <a
                        href={SUPPORT_INFO.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition-colors"
                      >
                        <span className="h-2 w-2 rounded-full bg-blue-700" />
                        <span>LinkedIn</span>
                      </a>
                      <a
                        href={SUPPORT_INFO.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                      >
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        <span>Facebook</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* B. Show User Name */}
            <div className="hidden sm:flex flex-col text-right pl-2 border-l border-slate-200">
              <span className="text-xs font-black text-slate-800 max-w-[120px] truncate leading-tight">
                {isAuthenticated ? (user?.name || "Job Seeker") : "Guest User"}
              </span>
              <span
                className={`text-[10px] font-bold leading-tight ${
                  isAuthenticated ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {isAuthenticated ? (role === "employer" ? "Employer" : "Job Seeker") : "Not Logged In"}
              </span>
            </div>

            {/* C. Round Login / Logout Switch (Turn ON / Turn OFF) */}
            <div
              className="flex items-center gap-1.5"
              title={
                isAuthenticated
                  ? `Logged in as ${user?.name || "User"} • Click to Turn OFF (Logout)`
                  : "Logged Out • Click to Turn ON (Login)"
              }
            >
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    logout();
                  } else {
                    router.push("/login");
                  }
                }}
                className={`relative inline-flex h-8 w-18 sm:w-20 items-center rounded-full p-1 transition-all duration-300 cursor-pointer shadow-inner focus:outline-none focus:ring-2 focus:ring-[#174A7E]/30 ${
                  isAuthenticated
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
                role="switch"
                aria-checked={isAuthenticated}
              >
                {/* Text ON / OFF inside the switch */}
                <span
                  className={`absolute text-[10px] font-black uppercase tracking-wider select-none transition-opacity duration-200 ${
                    isAuthenticated ? "left-2.5 text-white" : "right-2.5 text-slate-700"
                  }`}
                >
                  {isAuthenticated ? "ON" : "OFF"}
                </span>

                {/* Round sliding knob with power icon */}
                <span
                  className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                    isAuthenticated ? "translate-x-10 sm:translate-x-12" : "translate-x-0"
                  }`}
                >
                  <Power
                    className={`h-3.5 w-3.5 ${
                      isAuthenticated
                        ? "text-emerald-600 stroke-[2.5]"
                        : "text-slate-500 stroke-[2.5]"
                    }`}
                  />
                </span>
              </button>
            </div>

            {/* Mobile: Search icon + Hamburger */}
            <div className="flex md:hidden items-center gap-1.5 ml-1">
              <button
                onClick={openSearch}
                className="rounded-full h-8 w-8 flex items-center justify-center border border-slate-200 text-[#174A7E] hover:bg-slate-50 transition-colors"
                aria-label="Open Search"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ─── TIER 2: SUB-NAVIGATION BAR (Directly Below The Search Bar) ─── */}
        {/* User requirement: "this all should come below the search bar" */}
        <div className="border-t border-slate-100 bg-slate-50/70 backdrop-blur-xs">
          <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Desktop Navigation Pills */}
            {isEmployer ? (
              <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
                <Link
                  href="/employer/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive("/employer/dashboard")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/employer/post-job"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive("/employer/post-job")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Post Job</span>
                </Link>

                <Link
                  href="/employer/applicants"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    pathname.startsWith("/employer/applicants")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Applicants</span>
                </Link>

                <Link
                  href="/employer/subscriptions"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    pathname.startsWith("/employer/subscriptions")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Subscriptions</span>
                </Link>

                <Link
                  href="/employer/profile"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    pathname.startsWith("/employer/profile")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Company Profile</span>
                </Link>
              </nav>
            ) : (
              <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
                {/* Home */}
                <Link
                  href={isJobSeeker ? "/seeker/dashboard" : "/"}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive("/") || isActive("/seeker/dashboard")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Home</span>
                </Link>

                {/* Apply */}
                <Link
                  href={isAuthenticated ? "/seeker/applications" : "/jobs"}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive("/seeker/applications")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Apply</span>
                </Link>

                {/* Saved */}
                <Link
                  href={isAuthenticated ? "/seeker/saved" : "/login?role=job_seeker"}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive("/seeker/saved")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Saved</span>
                </Link>

                {/* Resume */}
                <Link
                  href="/seeker/resume"
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive("/seeker/resume")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Resume</span>
                </Link>

                {/* All Jobs Feed */}
                <Link
                  href="/jobs"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive("/jobs")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5 text-[#174A7E]" />
                  <span>Jobs Feed</span>
                </Link>

                {/* AI Career Coach */}
                <Link
                  href="/ai-chat"
                  className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive("/ai-chat")
                      ? "bg-[#174A7E] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>AI Coach</span>
                </Link>

                {/* More dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-slate-700 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span>More</span>
                  </button>

                  {moreDropdownOpen && (
                    <div
                      className="absolute left-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50"
                      onMouseLeave={() => setMoreDropdownOpen(false)}
                    >
                      <Link
                        href="/jobs"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Briefcase className="h-4 w-4 text-slate-500" /> All Jobs Feed
                      </Link>
                      <Link
                        href="/seeker/profile"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <UserIcon className="h-4 w-4 text-slate-500" /> My Profile
                      </Link>
                      <Link
                        href="/ai-chat"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Sparkles className="h-4 w-4 text-amber-500" /> AI Career Coach
                      </Link>
                      <Link
                        href="#download-app"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Smartphone className="h-4 w-4 text-emerald-600" /> Download App
                      </Link>
                      <Link
                        href="/login?role=company"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Building2 className="h-4 w-4 text-[#174A7E]" /> Employer Portal
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            )}

            {/* Right link: Download App Quick Action */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="#download-app"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174A7E] hover:text-[#0f3459] bg-white border border-slate-200/80 px-3 py-1 rounded-full shadow-2xs hover:shadow-xs transition-all"
              >
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                <span>Download App</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── MOBILE DRAWER ─── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-4">
            {/* User status card inside mobile menu */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-[#174A7E] text-white flex items-center justify-center font-bold text-sm">
                  {isAuthenticated && user?.name ? user.name.charAt(0).toUpperCase() : "G"}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">
                    {isAuthenticated ? user?.name : "Guest User"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isAuthenticated ? (role === "employer" ? "Employer" : "Job Seeker") : "Not Logged In"}
                  </p>
                </div>
              </div>

              {/* Round Power Button on mobile drawer */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAuthenticated) {
                    logout();
                  } else {
                    router.push("/login");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer ${
                  isAuthenticated ? "bg-emerald-600" : "bg-slate-400"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>{isAuthenticated ? "ON (Logout)" : "OFF (Login)"}</span>
              </button>
            </div>

            {/* Navigation links */}
            <div className="space-y-1 pt-1">
              {isEmployer ? (
                <>
                  <Link
                    href="/employer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <LayoutDashboard className="h-4 w-4 text-slate-400" /> Dashboard
                  </Link>
                  <Link
                    href="/employer/post-job"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <PlusCircle className="h-4 w-4 text-slate-400" /> Post New Job
                  </Link>
                  <Link
                    href="/employer/applicants"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Users className="h-4 w-4 text-slate-400" /> Applicants
                  </Link>
                  <Link
                    href="/employer/subscriptions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <CreditCard className="h-4 w-4 text-slate-400" /> Subscriptions
                  </Link>
                  <Link
                    href="/employer/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Building2 className="h-4 w-4 text-slate-400" /> Company Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={isJobSeeker ? "/seeker/dashboard" : "/"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Home className="h-4 w-4 text-slate-400" /> Home
                  </Link>
                  <Link
                    href="/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Briefcase className="h-4 w-4 text-slate-400" /> Browse All Jobs
                  </Link>
                  <Link
                    href="/seeker/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Briefcase className="h-4 w-4 text-slate-400" /> My Applications
                  </Link>
                  <Link
                    href="/seeker/saved"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Bookmark className="h-4 w-4 text-slate-400" /> Saved Jobs
                  </Link>
                  <Link
                    href="/seeker/resume"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <FileText className="h-4 w-4 text-slate-400" /> Resume Studio
                  </Link>
                  <Link
                    href="/ai-chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" /> AI Career Coach
                  </Link>
                  <Link
                    href="#download-app"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Smartphone className="h-4 w-4 text-emerald-600" /> Download Mobile App
                  </Link>
                </>
              )}
            </div>

            {/* Direct Support In Mobile Menu */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <a
                href={`tel:${SUPPORT_INFO.phone}`}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 text-[#174A7E]"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call Support</span>
              </a>
              <a
                href={SUPPORT_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-700"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* ─── MOBILE SEARCH OVERLAY ─── */}
        {searchOpen && (
          <div className="md:hidden fixed inset-x-0 top-0 z-50 bg-white shadow-xl border-b border-slate-200 p-4 space-y-4">
            <div className="flex items-center gap-3 border border-[#174A7E]/30 rounded-full px-4 py-2.5 bg-white shadow-sm">
              <Search className="h-5 w-5 text-[#174A7E] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(searchQuery);
                }}
                placeholder="Search jobs, skills, companies..."
                className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                autoFocus
              />
              <button onClick={closeSearch} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile trending pills */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Trending
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSearch(t);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded-full cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {filteredSuggestions.length > 0 && (
              <div className="space-y-1">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="w-full flex items-center gap-2 py-2.5 px-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg text-left cursor-pointer"
                  >
                    <Search className="h-4 w-4 text-slate-400 shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => handleSearch(searchQuery)}
              disabled={!searchQuery.trim()}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#174A7E] hover:bg-[#0f3459] disabled:opacity-40 px-4 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Search Jobs
            </button>
          </div>
        )}
      </header>
    </>
  );
};
