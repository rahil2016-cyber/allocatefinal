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
  MapPin,
  TrendingUp,
  Clock,
  LayoutDashboard,
  Users,
  CreditCard,
} from "lucide-react";

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
  const isHomeEntry = pathname === "/";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

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

  // Close when clicking outside
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

      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

          {/* Brand Logo */}
          <Link href={isEmployer ? "/employer/dashboard" : isJobSeeker ? "/seeker/dashboard" : "/"} className="flex items-center gap-2.5 group shrink-0">
            <div className="h-9 w-9 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src="/logo_square.png" alt="JobAllocate" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-0.5">
                <span className="text-xl font-extrabold tracking-tight text-[#E53E3E]">Job</span>
                <span className="text-xl font-extrabold tracking-tight text-[#174A7E]">Allocate</span>
              </div>
              <span className="text-[9px] font-semibold text-slate-500 tracking-tight leading-none">
                Right job, right candidate
              </span>
            </div>
          </Link>

          {/* ── SEARCH BAR (centre, desktop - job seekers and visitors) ── */}
          {!isEmployer && (
            <div className="hidden md:flex flex-1 max-w-md relative" ref={searchOverlayRef}>
              {/* Pill trigger / input */}
              <button
                type="button"
                onClick={openSearch}
                className="w-full flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:border-[#174A7E]/40 hover:shadow-sm text-slate-400 text-sm font-medium transition-all group shadow-xs cursor-pointer"
              >
                <Search className="h-4 w-4 text-[#174A7E] shrink-0" />
                <span className="flex-1 text-left text-sm text-slate-400 font-normal">
                  Search jobs, skills, companies…
                </span>
                <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </button>

              {/* Expanded Search Dropdown */}
              {searchOpen && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
                  style={{ minWidth: "420px" }}
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
                      className="flex-1 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
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
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors"
                          >
                            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>
                              {s.split(new RegExp(`(${searchQuery})`, "gi")).map((part, i) =>
                                part.toLowerCase() === searchQuery.toLowerCase() ? (
                                  <mark key={i} className="bg-yellow-100 text-yellow-900 font-bold rounded-sm">
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
                                className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded-full hover:bg-sky-100 transition-colors"
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
                              className="w-full flex items-center gap-3 py-2 text-sm text-slate-700 hover:text-[#174A7E] text-left transition-colors"
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
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#174A7E] hover:bg-[#0f3459] disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Search Jobs
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Pills */}
          {isEmployer ? (
            <nav className="hidden md:flex items-center gap-1.5 shrink-0">
              <Link
                href="/employer/dashboard"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive("/employer/dashboard")
                    ? "bg-[#174A7E] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/employer/applicants"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  pathname.startsWith("/employer/applicants")
                    ? "bg-[#174A7E] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Applicants</span>
              </Link>

              <Link
                href="/employer/subscriptions"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  pathname.startsWith("/employer/subscriptions")
                    ? "bg-[#174A7E] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Subscriptions</span>
              </Link>

              <Link
                href="/employer/profile"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  pathname.startsWith("/employer/profile")
                    ? "bg-[#174A7E] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Company Profile</span>
              </Link>
            </nav>
          ) : isJobSeeker ? (
            <nav className="hidden md:flex items-center gap-1 shrink-0">
              <Link
                href="/seeker/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive("/seeker/dashboard")
                    ? "bg-[#174A7E] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>

              <Link
                href="/seeker/applications"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive("/seeker/applications")
                    ? "bg-[#174A7E] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Apply</span>
              </Link>

              <Link
                href="/seeker/saved"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive("/seeker/saved")
                    ? "bg-[#174A7E] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>Saved</span>
              </Link>

              <Link
                href="/seeker/resume"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive("/seeker/resume")
                    ? "bg-[#174A7E] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Resume</span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
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
                      <Building2 className="h-4 w-4 text-slate-500" /> AI Career Coach
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          ) : null}

          {/* Right Section: Search icon (md) + User Avatar + Logout */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded-full py-1 px-2.5 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#174A7E] text-white text-xs font-bold uppercase">
                      {user?.name ? user.name.charAt(0) : "U"}
                    </div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 max-w-[90px] truncate">
                      {user?.name || "My Account"}
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || user?.phone || user?.mobile}</p>
                      </div>

                      <div className="py-1">
                        {role === "employer" ? (
                          <>
                            <Link
                              href="/employer/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <Building2 className="h-4 w-4 text-slate-500" /> Employer Dashboard
                            </Link>
                            <Link
                              href="/employer/post-job"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <PlusCircle className="h-4 w-4 text-slate-500" /> Post New Job
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/seeker/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <Home className="h-4 w-4 text-slate-500" /> Candidate Home
                            </Link>
                            <Link
                              href="/seeker/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <UserIcon className="h-4 w-4 text-slate-500" /> My Profile
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => logout()}
                  className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-gradient-to-b from-red-600 via-red-700 to-red-900 hover:from-red-500 hover:to-red-800 text-white shadow-lg border border-red-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-white stroke-[2.5]" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login?role=job_seeker">
                  <button className="bg-[#174A7E] hover:bg-[#0f3459] text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Job Seeker</span>
                  </button>
                </Link>
                <Link href="/login?role=company">
                  <button className="border-2 border-[#174A7E] text-[#174A7E] hover:bg-[#174A7E]/5 px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 bg-white cursor-pointer">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Employer</span>
                  </button>
                </Link>
                <Link href="/login">
                  <span className="text-xs font-bold text-slate-600 hover:text-[#174A7E] px-2 py-1 transition-colors">
                    Sign In
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: search icon + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {!isEmployer && (
              <button
                onClick={openSearch}
                className="rounded-full h-9 w-9 flex items-center justify-center border border-slate-200 text-[#174A7E] hover:bg-slate-50 transition-colors"
                aria-label="Open Search"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {isEmployer ? (
              <>
                <Link
                  href="/employer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-400" /> Dashboard
                </Link>
                <Link
                  href="/employer/applicants"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Users className="h-4 w-4 text-slate-400" /> Applicants
                </Link>
                <Link
                  href="/employer/subscriptions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <CreditCard className="h-4 w-4 text-slate-400" /> Subscriptions
                </Link>
                <Link
                  href="/employer/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Building2 className="h-4 w-4 text-slate-400" /> Company Profile
                </Link>
              </>
            ) : isJobSeeker ? (
              <>
                {/* Mobile search bar */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-2 mb-3">
                  <Search className="h-4 w-4 text-[#174A7E] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search jobs, skills, companies..."
                    className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value;
                        setMobileMenuOpen(false);
                        handleSearch(val);
                      }
                    }}
                  />
                </div>

                <Link
                  href="/seeker/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Home className="h-4 w-4 text-slate-400" /> Home
                </Link>
                <Link
                  href="/seeker/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Briefcase className="h-4 w-4 text-slate-400" /> Apply (My Applications)
                </Link>
                <Link
                  href="/seeker/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Bookmark className="h-4 w-4 text-slate-400" /> Saved Jobs
                </Link>
                <Link
                  href="/seeker/resume"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <FileText className="h-4 w-4 text-slate-400" /> Resume Studio
                </Link>
                <Link
                  href="/seeker/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" /> Me (Profile)
                </Link>
              </>
            ) : (
              <div className="space-y-2 py-1">
                <Link
                  href="/login?role=job_seeker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white bg-[#174A7E]"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="h-4.5 w-4.5" /> I'm a Job Seeker
                  </span>
                  <span className="text-xs">→</span>
                </Link>
                <Link
                  href="/login?role=company"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-[#174A7E] border-2 border-[#174A7E] bg-white"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4.5 w-4.5" /> I'm an Employer
                  </span>
                  <span className="text-xs">→</span>
                </Link>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg py-2 text-xs font-bold text-slate-700 bg-slate-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg py-2 text-xs font-bold text-white bg-[#174A7E]"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 w-full"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-b from-red-600 to-red-800 text-white flex items-center justify-center shadow-xs">
                    <LogOut className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mobile Search Overlay */}
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
                placeholder="Search by jobs, skills, companies, salary..."
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
                    onClick={() => { setMobileMenuOpen(false); handleSearch(t); }}
                    className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded-full"
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
                    className="w-full flex items-center gap-2 py-2.5 px-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg text-left"
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
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#174A7E] hover:bg-[#0f3459] disabled:opacity-40 px-4 py-2.5 rounded-full transition-colors"
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
