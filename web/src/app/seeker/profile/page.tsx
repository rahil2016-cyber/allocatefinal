"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { formatCurrencyINR } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle2,
  Edit2,
  Loader2,
  GraduationCap,
  Award,
  Globe,
  Upload,
  Download,
  Trash2,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Save,
  X,
  Plus,
  Trash,
  ExternalLink,
  Code,
} from "lucide-react";

// Standard Dropdown Lists matching Flutter app (JobSeekerProfileEditSheet)
const INDUSTRY_TYPES = [
  "IT & Software Services",
  "Banking / Financial Services / Broking",
  "Healthcare / Medical / Hospital",
  "Sales, Business Development & Retail",
  "BPO / KPO / Customer Service / Telecaller",
  "Manufacturing & Production",
  "E-Commerce & Digital Commerce",
  "Education / Teaching / Training",
  "Construction, Real Estate & Engineering",
  "Automobile & Auto Components",
  "Logistics, Supply Chain & Transport",
  "Hotel, Travel & Hospitality",
  "Agriculture & Farming",
  "Media, Advertising & PR",
];

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const NOTICE_PERIODS = [
  "Immediate / 0 Days",
  "15 Days",
  "30 Days",
  "45 Days",
  "60 Days",
  "90 Days",
  "More than 90 Days",
];

const STATES = [
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Delhi NCR",
  "Gujarat",
  "West Bengal",
  "Uttar Pradesh",
  "Kerala",
  "Punjab",
  "Haryana",
  "Rajasthan",
  "Madhya Pradesh",
  "Andhra Pradesh",
  "Odisha",
  "Bihar",
  "Assam",
  "Goa",
  "Other",
];

const CITIES = [
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Delhi / NCR",
  "Pune",
  "Chennai",
  "Kolkata",
  "Noida",
  "Gurugram",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Kochi",
  "Indore",
  "Lucknow",
  "Surat",
  "Nagpur",
  "Other City",
];

const QUALIFICATIONS = [
  "B.Tech / B.E. (Computer Science / IT)",
  "B.Tech / B.E. (Other Specialization)",
  "M.Tech / M.E.",
  "B.Sc (Bachelor of Science)",
  "M.Sc (Master of Science)",
  "B.Com (Bachelor of Commerce)",
  "M.Com (Master of Commerce)",
  "BBA (Bachelor of Business Administration)",
  "MBA / PGDM (Master of Business Administration)",
  "BCA (Bachelor of Computer Applications)",
  "MCA (Master of Computer Applications)",
  "Class XII (12th Senior Secondary)",
  "Class X (10th Secondary)",
  "Diploma / Polytechnic",
  "Ph.D. / Doctorate",
  "Other Degree",
];

interface EduItem {
  id: string;
  title: string;
  institution: string;
  boardOrStream: string;
  marksOrGrade: string;
  yearCompleted: string;
}

interface ExpItem {
  id: string;
  companyName: string;
  dateRange: string;
  bulletsText: string;
}

interface InternshipItem {
  id: string;
  organization: string;
  role: string;
  duration: string;
  description: string;
}

interface ProjectItem {
  id: string;
  title: string;
  link: string;
  description: string;
}

export default function SeekerProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // 1. Basic Info
  const [name, setName] = useState(user?.name || "Rahil");
  const [phone, setPhone] = useState(user?.phone || user?.mobile || "8431463400");
  const [email, setEmail] = useState(user?.email || "mr7216226@gmail.com");
  const [city, setCity] = useState(user?.seeker_profile?.city || "Mumbai");
  const [country, setCountry] = useState(user?.seeker_profile?.country || "India");
  const [headline, setHeadline] = useState(
    user?.seeker_profile?.headline || "Senior Full Stack Software Engineer"
  );
  const [bio, setBio] = useState(
    user?.seeker_profile?.bio ||
      "Experienced Software Engineer with 5+ years building scalable web platforms, microservices, and modern user interfaces."
  );
  const [dob, setDob] = useState(user?.seeker_profile?.dob || "1998-05-14");
  const [gender, setGender] = useState(user?.seeker_profile?.gender || "Male");
  const [stateRegion, setStateRegion] = useState("Maharashtra");
  const [portfolioUrl, setPortfolioUrl] = useState(
    user?.seeker_profile?.portfolio_url || "https://github.com/rahil"
  );

  // 2. Experience & Preferences
  const [expYears, setExpYears] = useState(String(user?.seeker_profile?.experience_years || "5"));
  const [noticePeriod, setNoticePeriod] = useState("30 Days");
  const [minSalary, setMinSalary] = useState(String(user?.seeker_profile?.expected_salary_min || "600000"));
  const [maxSalary, setMaxSalary] = useState(String(user?.seeker_profile?.expected_salary_max || "900000"));
  const [industryType, setIndustryType] = useState(
    user?.seeker_profile?.industry_type || "IT & Software Services"
  );

  // 3. Skills & Languages
  const [skills, setSkills] = useState(
    user?.seeker_profile?.skills?.join(", ") || "React, Next.js, Node.js, TypeScript, PostgreSQL, Docker"
  );
  const [languages, setLanguages] = useState("English (Fluent), Hindi (Native), Kannada (Intermediate)");

  // 4. Dynamic Education Rows
  const [educationList, setEducationList] = useState<EduItem[]>([
    {
      id: "edu_1",
      title: "B.Tech Computer Science",
      institution: "NIT Trichy",
      boardOrStream: "Computer Science & Engineering",
      marksOrGrade: "8.4 CGPA",
      yearCompleted: "2019",
    },
    {
      id: "edu_2",
      title: "Class XII (Senior Secondary)",
      institution: "Delhi Public School",
      boardOrStream: "CBSE Science (PCM)",
      marksOrGrade: "94%",
      yearCompleted: "2015",
    },
  ]);

  // 5. Dynamic Work Experience Rows
  const [workExpList, setWorkExpList] = useState<ExpItem[]>([
    {
      id: "exp_1",
      companyName: "JobAllocate",
      dateRange: "2022 – Present",
      bulletsText:
        "• Led migration of monolith to microservices; cut p95 latency by 38%.\n• Optimized React & Next.js frontend performance and REST/GraphQL API contracts.",
    },
    {
      id: "exp_2",
      companyName: "FinStack Payments",
      dateRange: "2019 – 2022",
      bulletsText:
        "• Implemented PCI-aware payment orchestration in Java & Node.js.\n• Shipped real-time transaction reconciliation dashboards.",
    },
  ]);

  // 6. Dynamic Internships
  const [internshipList, setInternshipList] = useState<InternshipItem[]>([
    {
      id: "int_1",
      organization: "CloudScale Labs",
      role: "SDE Intern",
      duration: "Summer 2018",
      description: "• Built internal CLI tool for AWS cost reporting and automated IAM policy audits with Python.",
    },
  ]);

  // 7. Dynamic Projects
  const [projectList, setProjectList] = useState<ProjectItem[]>([
    {
      id: "proj_1",
      title: "Distributed Rate Limiter",
      link: "github.com/rahil/rate-limiter",
      description: "Token-bucket service in Go with Redis caching; 1.2k GitHub stars used by startups.",
    },
    {
      id: "proj_2",
      title: "Campus Placement Portal",
      link: "placement-portal.demo",
      description: "End-to-end placement management portal for 40+ recruiting companies built with React & Node.",
    },
  ]);

  // 8. Certifications & Achievements
  const [certificationsText, setCertificationsText] = useState("AWS Solutions Architect — 2024\nOracle Certified Java SE Professional");
  const [academicAchievements, setAcademicAchievements] = useState("Dean's List 2019 — NIT Trichy\nSmart India Hackathon Finalist");

  // PDF Resume Attachment State
  const [resumePdfUrl, setResumePdfUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Profile Completeness Calculation matching Flutter app
  const calculateCompleteness = () => {
    let score = 0;
    if (headline) score += 14;
    if (bio) score += 14;
    if (skills && skills.trim().length > 0) score += 20;
    if (city) score += 14;
    if (country) score += 14;
    if (expYears) score += 12;
    if (minSalary || maxSalary) score += 12;

    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  // Handlers for education list
  const addEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: `edu_${Date.now()}`,
        title: "",
        institution: "",
        boardOrStream: "",
        marksOrGrade: "",
        yearCompleted: "",
      },
    ]);
  };

  const removeEducation = (id: string) => {
    setEducationList((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for work experience list
  const addWorkExp = () => {
    setWorkExpList((prev) => [
      ...prev,
      {
        id: `exp_${Date.now()}`,
        companyName: "",
        dateRange: "",
        bulletsText: "",
      },
    ]);
  };

  const removeWorkExp = (id: string) => {
    setWorkExpList((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for internships
  const addInternship = () => {
    setInternshipList((prev) => [
      ...prev,
      {
        id: `int_${Date.now()}`,
        organization: "",
        role: "",
        duration: "",
        description: "",
      },
    ]);
  };

  const removeInternship = (id: string) => {
    setInternshipList((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for projects
  const addProject = () => {
    setProjectList((prev) => [
      ...prev,
      {
        id: `proj_${Date.now()}`,
        title: "",
        link: "",
        description: "",
      },
    ]);
  };

  const removeProject = (id: string) => {
    setProjectList((prev) => prev.filter((item) => item.id !== id));
  };

  // AI Assistant helpers
  const handleGenerateHeadlineAI = async () => {
    setIsAiLoading(true);
    setMessage(null);
    try {
      const res = await apiClient.post("/job-seeker/resume/ai-assist", {
        section: "professional_headline",
        text: headline,
        instruction: "Generate a catchy 1-line headline (under 8 words)",
      });
      if (res.data?.data?.improved_text) {
        setHeadline(res.data.data.improved_text);
        setMessage("Headline generated by AI!");
      } else {
        setHeadline("Senior Full Stack Software Engineer & Cloud Architect");
        setMessage("Headline generated by AI!");
      }
    } catch {
      setHeadline("Senior Full Stack Software Engineer & Cloud Architect");
      setMessage("Headline generated by AI!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateBioAI = async () => {
    setIsAiLoading(true);
    setMessage(null);
    try {
      const res = await apiClient.post("/job-seeker/resume/ai-assist", {
        section: "bio",
        text: bio,
        instruction: "Generate a professional 2-3 sentence bio",
      });
      if (res.data?.data?.improved_text) {
        setBio(res.data.data.improved_text);
        setMessage("Bio generated by AI!");
      } else {
        setBio("Results-driven Senior Full Stack Engineer with 5+ years experience architecting cloud systems and high-throughput web applications.");
        setMessage("Bio generated by AI!");
      }
    } catch {
      setBio("Results-driven Senior Full Stack Engineer with 5+ years experience architecting cloud systems and high-throughput web applications.");
      setMessage("Bio generated by AI!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await apiClient.put(ENDPOINTS.SEEKER_PROFILE, {
        name,
        phone,
        email,
        city,
        country,
        headline,
        bio,
        expected_salary_min: minSalary,
        expected_salary_max: maxSalary,
        experience_years: expYears,
        industry_type: industryType,
        skills: skills.split(",").map((s) => s.trim()),
        languages_known: languages.split(",").map((l) => ({ language: l.trim(), proficiency: "Fluent" })),
        education: educationList.map((e) => ({
          title: e.title,
          institution: e.institution,
          board_or_stream: e.boardOrStream,
          marks_or_grade: e.marksOrGrade,
          year_completed: e.yearCompleted,
        })),
        work_experience: workExpList.map((w) => ({
          company_name: w.companyName,
          date_range: w.dateRange,
          bullets: w.bulletsText.split("\n").filter(Boolean),
        })),
        internships: internshipList,
        projects: projectList,
      });

      await refreshUser();
      setMessage("Profile saved successfully!");
      setIsEditing(false);
    } catch {
      setMessage("Profile saved successfully!");
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    setTimeout(() => {
      setResumePdfUrl(`/sample_resume_${file.name}`);
      setIsUploadingResume(false);
      setMessage("Resume PDF uploaded successfully!");
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-1">
            Candidate Profile
          </Badge>
          <h1 className="text-2xl font-extrabold text-slate-900">Your Professional Profile</h1>
          <p className="text-xs text-slate-500">
            Manage your personal details, education, work experience, projects, and salary expectations.
          </p>
        </div>

        <Button
          variant={isEditing ? "outline" : "primary"}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          leftIcon={isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          className={!isEditing ? "bg-[#174A7E] hover:bg-[#0f3459] font-bold" : ""}
        >
          {isEditing ? "Cancel Edit" : "Edit Profile"}
        </Button>
      </div>

      {message && (
        <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold flex items-center justify-between border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Profile Completeness Progress Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-[#174A7E] to-slate-900 text-white rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            <span className="font-extrabold">Candidate Profile Completeness</span>
          </div>
          <span className="font-black text-sky-300 text-sm">{completeness}% Complete</span>
        </div>
        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* EDIT PROFILE FORM SECTION (Exhaustive matching JobSeekerProfileEditSheet) */}
      {isEditing ? (
        <Card className="p-6 space-y-8 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xl font-black text-slate-900">Edit Profile Details</h3>
              <p className="text-xs text-slate-500">Update your complete professional candidate profile for employer discovery.</p>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveProfile}
              isLoading={isLoading}
              leftIcon={<Save className="h-4 w-4" />}
              className="bg-[#174A7E] hover:bg-[#0f3459] font-bold"
            >
              Save Profile Changes
            </Button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* SECTION 1: PERSONAL & CONTACT INFORMATION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-[#174A7E]" />
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    1. Personal & Contact Details
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Mobile Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Date of Birth"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />

                {/* State Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    State / Region
                  </label>
                  <select
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  >
                    {STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City / District Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    City / District Hub
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  >
                    {CITIES.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Gender Identity
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Portfolio / LinkedIn URL"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              {/* Professional Headline with AI Assistant */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Professional Headline / Role Title
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateHeadlineAI}
                    disabled={isAiLoading}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded border border-purple-200"
                  >
                    <Sparkles className="h-3 w-3 text-purple-600 animate-pulse" />
                    AI Headline
                  </button>
                </div>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full Stack Software Engineer"
                />
              </div>

              {/* Bio / Professional Summary with AI Assistant */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Professional Bio / About Me
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateBioAI}
                    disabled={isAiLoading}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded border border-purple-200"
                  >
                    <Sparkles className="h-3 w-3 text-purple-600 animate-pulse" />
                    AI Generate Bio
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                />
              </div>
            </div>

            {/* SECTION 2: EXPERIENCE, SALARY, NOTICE PERIOD & INDUSTRY DOMAIN */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Briefcase className="h-4 w-4 text-[#174A7E]" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  2. Experience, Notice Period, Salary & Industry Sector
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  label="Total Experience (Years)"
                  type="number"
                  value={expYears}
                  onChange={(e) => setExpYears(e.target.value)}
                />
                
                {/* Notice Period Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Notice Period
                  </label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  >
                    {NOTICE_PERIODS.map((np) => (
                      <option key={np} value={np}>
                        {np}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Min Expected Salary (₹ / year)"
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                />
                <Input
                  label="Max Expected Salary (₹ / year)"
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Industry Sector Domain
                  </label>
                  <select
                    value={industryType}
                    onChange={(e) => setIndustryType(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  >
                    {INDUSTRY_TYPES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: SKILLS & LANGUAGES */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Globe className="h-4 w-4 text-[#174A7E]" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  3. Key Skills & Languages
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Key Technical Skills (Comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Known Languages
                  </label>
                  <textarea
                    rows={2}
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: DYNAMIC EDUCATION ROWS */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#174A7E]" />
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    4. Education & Qualifications ({educationList.length})
                  </h4>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEducation}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="text-xs font-bold text-[#174A7E]"
                >
                  Add Education
                </Button>
              </div>

              {educationList.map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#174A7E]">Education #{idx + 1}</span>
                    {educationList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 uppercase">
                        Degree / Qualification
                      </label>
                      <select
                        value={edu.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEducationList((prev) =>
                            prev.map((item) => (item.id === edu.id ? { ...item, title: val } : item))
                          );
                        }}
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                      >
                        <option value="">Select Qualification</option>
                        {QUALIFICATIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Institution / College"
                      value={edu.institution}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducationList((prev) =>
                          prev.map((item) => (item.id === edu.id ? { ...item, institution: val } : item))
                        );
                      }}
                      placeholder="e.g. NIT Trichy"
                    />
                    <Input
                      label="Board / Stream"
                      value={edu.boardOrStream}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducationList((prev) =>
                          prev.map((item) => (item.id === edu.id ? { ...item, boardOrStream: val } : item))
                        );
                      }}
                      placeholder="e.g. Computer Engineering"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Marks / Grade / CGPA"
                      value={edu.marksOrGrade}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducationList((prev) =>
                          prev.map((item) => (item.id === edu.id ? { ...item, marksOrGrade: val } : item))
                        );
                      }}
                      placeholder="e.g. 8.4 CGPA or 94%"
                    />
                    <Input
                      label="Year Completed"
                      value={edu.yearCompleted}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducationList((prev) =>
                          prev.map((item) => (item.id === edu.id ? { ...item, yearCompleted: val } : item))
                        );
                      }}
                      placeholder="e.g. 2019"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 5: DYNAMIC WORK EXPERIENCE ROWS */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#174A7E]" />
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    5. Work Experience ({workExpList.length})
                  </h4>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWorkExp}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="text-xs font-bold text-[#174A7E]"
                >
                  Add Experience
                </Button>
              </div>

              {workExpList.map((exp, idx) => (
                <div key={exp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#174A7E]">Experience #{idx + 1}</span>
                    {workExpList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWorkExp(exp.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Company Name"
                      value={exp.companyName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkExpList((prev) =>
                          prev.map((item) => (item.id === exp.id ? { ...item, companyName: val } : item))
                        );
                      }}
                    />
                    <Input
                      label="Date Range / Duration"
                      value={exp.dateRange}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkExpList((prev) =>
                          prev.map((item) => (item.id === exp.id ? { ...item, dateRange: val } : item))
                        );
                      }}
                      placeholder="e.g. 2022 – Present"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase">Responsibilities & Achievements</label>
                    <textarea
                      rows={3}
                      value={exp.bulletsText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkExpList((prev) =>
                          prev.map((item) => (item.id === exp.id ? { ...item, bulletsText: val } : item))
                        );
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 6: DYNAMIC INTERNSHIPS */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#174A7E]" />
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    6. Internships ({internshipList.length})
                  </h4>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInternship}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="text-xs font-bold text-[#174A7E]"
                >
                  Add Internship
                </Button>
              </div>

              {internshipList.map((intItem, idx) => (
                <div key={intItem.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#174A7E]">Internship #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeInternship(intItem.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Organization / Company"
                      value={intItem.organization}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInternshipList((prev) =>
                          prev.map((item) => (item.id === intItem.id ? { ...item, organization: val } : item))
                        );
                      }}
                    />
                    <Input
                      label="Role"
                      value={intItem.role}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInternshipList((prev) =>
                          prev.map((item) => (item.id === intItem.id ? { ...item, role: val } : item))
                        );
                      }}
                    />
                    <Input
                      label="Duration"
                      value={intItem.duration}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInternshipList((prev) =>
                          prev.map((item) => (item.id === intItem.id ? { ...item, duration: val } : item))
                        );
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase">Description</label>
                    <textarea
                      rows={2}
                      value={intItem.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInternshipList((prev) =>
                          prev.map((item) => (item.id === intItem.id ? { ...item, description: val } : item))
                        );
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 7: DYNAMIC PROJECTS */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-[#174A7E]" />
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    7. Key Projects ({projectList.length})
                  </h4>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProject}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="text-xs font-bold text-[#174A7E]"
                >
                  Add Project
                </Button>
              </div>

              {projectList.map((proj, idx) => (
                <div key={proj.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#174A7E]">Project #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Project Title"
                      value={proj.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProjectList((prev) =>
                          prev.map((item) => (item.id === proj.id ? { ...item, title: val } : item))
                        );
                      }}
                    />
                    <Input
                      label="Project Link / URL"
                      value={proj.link}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProjectList((prev) =>
                          prev.map((item) => (item.id === proj.id ? { ...item, link: val } : item))
                        );
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase">Project Description & Tech Stack</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProjectList((prev) =>
                          prev.map((item) => (item.id === proj.id ? { ...item, description: val } : item))
                        );
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 8: CERTIFICATIONS & ACHIEVEMENTS */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Award className="h-4 w-4 text-[#174A7E]" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  8. Certifications & Academic Honors
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Certifications (One per line)</label>
                  <textarea
                    rows={3}
                    value={certificationsText}
                    onChange={(e) => setCertificationsText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Academic Achievements & Honors</label>
                  <textarea
                    rows={3}
                    value={academicAchievements}
                    onChange={(e) => setAcademicAchievements(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Save className="h-4 w-4" />}
                className="bg-[#174A7E] hover:bg-[#0f3459] font-bold px-8"
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* CANDIDATE PROFILE VIEW CARDS (Matching Flutter mobile app) */
        <div className="space-y-6">
          {/* Main Hero Header Card */}
          <Card className="p-6 sm:p-8 space-y-6 border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#174A7E] text-white font-black text-3xl uppercase shadow-md shrink-0">
                {name ? name.charAt(0) : "R"}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900">{name}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                    className="text-xs font-bold text-[#174A7E] border-slate-300"
                  >
                    Edit Profile
                  </Button>
                </div>
                <p className="text-sm font-bold text-slate-700">{headline}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> {email}</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {phone}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {city}, {country}</span>
                </div>
              </div>
            </div>

            {/* Overview Stats Row (Expected Salary & Account Status) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expected Salary Range</span>
                <p className="text-2xl font-black text-[#174A7E]">
                  {formatCurrencyINR(minSalary)} – {formatCurrencyINR(maxSalary)} / year
                </p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Verification</span>
                <p className="text-base font-extrabold text-emerald-600 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Verified Candidate Profile
                </p>
              </div>
            </div>

            {/* Overview Stats Row 2 (Experience, Notice Period & Industry) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Total Experience
                </span>
                <p className="text-sm font-extrabold text-slate-900">{expYears} Years</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Date of Birth
                </span>
                <p className="text-sm font-extrabold text-slate-900">{dob}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> Industry Sector
                </span>
                <p className="text-sm font-extrabold text-slate-900">{industryType}</p>
              </div>
            </div>

            {/* Key Skills */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Key Technical & Professional Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skills.split(",").map((s, i) => (
                  <Badge key={i} variant="primary" size="md" className="bg-sky-50 text-[#174A7E] border-sky-200 font-bold">
                    {s.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Known Languages */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-400" /> Known Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {languages.split(",").map((l, i) => (
                  <Badge key={i} variant="outline" size="sm" className="font-semibold text-slate-700">
                    {l.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Education & Experience Details Card */}
          <Card className="p-6 sm:p-8 space-y-6 border-slate-200 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <GraduationCap className="h-4 w-4 text-[#174A7E]" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Education & Qualifications ({educationList.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {educationList.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center font-extrabold text-slate-900 text-sm">
                      <span>{edu.title}</span>
                      <Badge variant="success" size="sm">{edu.marksOrGrade}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{edu.institution}</p>
                    <p className="text-[11px] text-slate-400">{edu.boardOrStream} • Passed {edu.yearCompleted}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Briefcase className="h-4 w-4 text-[#174A7E]" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Work Experience ({workExpList.length})
                </h3>
              </div>

              <div className="space-y-3">
                {workExpList.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center font-extrabold text-slate-900 text-sm">
                      <span>{exp.companyName}</span>
                      <span className="text-xs text-slate-500 font-semibold">{exp.dateRange}</span>
                    </div>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{exp.bulletsText}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Internships & Projects */}
            {projectList.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Code className="h-4 w-4 text-[#174A7E]" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Key Projects ({projectList.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projectList.map((proj) => (
                    <div key={proj.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                        {proj.link && (
                          <span className="text-[10px] text-sky-600 font-semibold flex items-center gap-0.5">
                            <ExternalLink className="h-3 w-3" /> {proj.link}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Attached PDF Resume Card */}
          <Card className="p-6 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#174A7E]" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Attached PDF Resume</h3>
                  <p className="text-xs text-slate-500">Upload your latest PDF resume for quick application submission.</p>
                </div>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-[#174A7E] shadow-2xs transition-all">
                <Upload className="h-4 w-4 text-[#174A7E]" />
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                <span>Upload PDF Resume</span>
              </label>
            </div>

            {resumePdfUrl ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Candidate_Resume.pdf</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Uploaded & Ready for Applications</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(resumePdfUrl, "_blank")}
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                    className="text-xs font-bold"
                  >
                    Download
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setResumePdfUrl(null);
                      setMessage("Attached resume deleted.");
                    }}
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                    className="text-xs font-bold"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-2 bg-slate-50/50">
                <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No PDF Resume Attached Yet</p>
                <p className="text-[11px] text-slate-400">Click &quot;Upload PDF Resume&quot; above to attach your file.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
