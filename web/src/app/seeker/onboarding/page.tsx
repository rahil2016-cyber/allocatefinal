"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  INDUSTRY_TYPES,
  getRolesForIndustry,
  getSkillsForRoles,
  getIndustryLabel,
} from "@/lib/constants/industryData";
import {
  Sparkles,
  Rocket,
  Briefcase,
  GraduationCap,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  AlertCircle,
  Plus,
  X,
  Building,
  Check,
  Laptop,
  BarChart3,
  Palette,
  FolderGit2,
  TrendingUp,
  Megaphone,
  Landmark,
  Calculator,
  Users,
  Truck,
  Stethoscope,
  Scale,
  Headphones,
  Wrench,
  PhoneCall,
  ShoppingBag,
  Utensils,
  Car,
  Film,
  Settings,
  ShieldCheck,
} from "lucide-react";

const INDUSTRY_ICON_MAP: Record<string, any> = {
  software_engineering_it: Laptop,
  data_science_analytics: BarChart3,
  design_ux_creative: Palette,
  product_management: FolderGit2,
  sales_business_development: TrendingUp,
  marketing_digital_growth: Megaphone,
  banking_finance: Landmark,
  accountants: Calculator,
  human_resources: Users,
  operations_logistics: Truck,
  healthcare_medical: Stethoscope,
  education_training: GraduationCap,
  legal_compliance: Scale,
  customer_success_support: Headphones,
  manufacturing_engineering: Wrench,
  bpo_telecaller: PhoneCall,
  retail_e_commerce: ShoppingBag,
  hospitality_food: Utensils,
  delivery_driving: Car,
  construction_real_estate: Building,
  media_entertainment: Film,
  automotive: Settings,
  beauty_wellness: Sparkles,
  security_housekeeping: ShieldCheck,
};

const STATUS_OPTIONS = [
  "Student",
  "Fresher",
  "Experienced Professional",
  "Freelancer",
  "Career Break",
];

const EMPLOYMENT_PREF_OPTIONS = [
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
  "Remote",
  "Hybrid",
  "Work From Office",
];

const QUALIFICATION_OPTIONS = [
  "Bachelor's Degree",
  "Master's Degree",
  "Diploma / Certificate",
  "Ph.D. / Doctorate",
  "Class 12th",
  "Class 10th",
];

export default function SeekerOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  // Step 2: Basic Info & Industry
  const [name, setName] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("software_engineering_it");
  const [customIndustry, setCustomIndustry] = useState("");

  // Step 3: Job Roles
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [customRoleInput, setCustomRoleInput] = useState("");

  // Step 4: Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Step 5: Current Status & Experience
  const [currentStatus, setCurrentStatus] = useState<string>("Experienced Professional");
  const [expYears, setExpYears] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentRole, setCurrentRole] = useState("");

  // Step 6: Education
  const [qualification, setQualification] = useState("Bachelor's Degree");
  const [degree, setDegree] = useState("");
  const [college, setCollege] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [gradMarks, setGradMarks] = useState("");

  const [s12Board, setS12Board] = useState("");
  const [s12School, setS12School] = useState("");
  const [s12Year, setS12Year] = useState("");
  const [s12Marks, setS12Marks] = useState("");

  const [s10Board, setS10Board] = useState("");
  const [s10School, setS10School] = useState("");
  const [s10Year, setS10Year] = useState("");
  const [s10Marks, setS10Marks] = useState("");

  // Step 7: Location & Work Preferences
  const [city, setCity] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [prefLocationInput, setPrefLocationInput] = useState("");
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [selectedEmploymentPrefs, setSelectedEmploymentPrefs] = useState<string[]>(["Full Time"]);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  // Step 8: Resume Upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(null);

  // Load existing profile data on mount
  useEffect(() => {
    async function loadInitialProfile() {
      try {
        const res = await apiClient.get(ENDPOINTS.SEEKER_PROFILE);
        const data = res.data?.data || res.data;
        if (data) {
          if (data.name) setName(data.name);
          if (data.city) setCity(data.city);
          if (data.industry_type) {
            setSelectedIndustry(data.industry_type);
          }
          if (Array.isArray(data.job_roles) && data.job_roles.length > 0) {
            setSelectedRoles(data.job_roles);
          }
          if (Array.isArray(data.skills) && data.skills.length > 0) {
            setSelectedSkills(data.skills);
          }
          if (data.current_status) {
            setCurrentStatus(data.current_status);
          }
          if (data.experience_years !== undefined && data.experience_years !== null) {
            setExpYears(String(data.experience_years));
          }
          if (data.current_company) setCurrentCompany(data.current_company);
          if (data.current_role) setCurrentRole(data.current_role);
          if (Array.isArray(data.preferred_locations)) {
            setPreferredLocations(data.preferred_locations);
          }
          if (data.willing_to_relocate !== undefined) {
            setWillingToRelocate(Boolean(data.willing_to_relocate));
          }
          if (Array.isArray(data.employment_preferences) && data.employment_preferences.length > 0) {
            setSelectedEmploymentPrefs(data.employment_preferences);
          }
          if (data.expected_salary_min) setMinSalary(String(data.expected_salary_min));
          if (data.expected_salary_max) setMaxSalary(String(data.expected_salary_max));
          if (data.resume_url) setExistingResumeUrl(data.resume_url);

          // Populate education if available
          if (Array.isArray(data.education) && data.education.length > 0) {
            for (const item of data.education) {
              const t = item.title || "";
              if (t === "Class 10th") {
                setS10Board(item.board_or_stream || "");
                setS10School(item.institution || "");
                setS10Year(item.year_completed || "");
                setS10Marks(item.marks_or_grade || "");
              } else if (t === "Class 12th") {
                setS12Board(item.board_or_stream || "");
                setS12School(item.institution || "");
                setS12Year(item.year_completed || "");
                setS12Marks(item.marks_or_grade || "");
              } else {
                setQualification(t || "Bachelor's Degree");
                setDegree(item.board_or_stream || "");
                setCollege(item.institution || "");
                setGradYear(item.year_completed || "");
                setGradMarks(item.marks_or_grade || "");
              }
            }
          }
        }
      } catch {
        // Fallback to local session
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("joballocate_user");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed?.name) setName(parsed.name);
            } catch {}
          }
        }
      } finally {
        setIsPageLoading(false);
      }
    }

    loadInitialProfile();
  }, []);

  // Compute suggested skills based on selected industry and roles
  const availableRoles = getRolesForIndustry(selectedIndustry);
  const recommendedSkills = getSkillsForRoles(selectedIndustry, selectedRoles.length > 0 ? selectedRoles : availableRoles);

  // Handlers for dynamic lists
  const handleToggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleAddCustomRole = () => {
    const val = customRoleInput.trim();
    if (val && !selectedRoles.includes(val)) {
      setSelectedRoles([...selectedRoles, val]);
      setCustomRoleInput("");
    }
  };

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const val = customSkillInput.trim();
    if (val && !selectedSkills.includes(val)) {
      setSelectedSkills([...selectedSkills, val]);
      setCustomSkillInput("");
    }
  };

  const handleAddPreferredLocation = () => {
    const val = prefLocationInput.trim();
    if (val && !preferredLocations.includes(val)) {
      setPreferredLocations([...preferredLocations, val]);
      setPrefLocationInput("");
    }
  };

  const handleToggleEmploymentPref = (pref: string) => {
    if (selectedEmploymentPrefs.includes(pref)) {
      if (selectedEmploymentPrefs.length > 1) {
        setSelectedEmploymentPrefs(selectedEmploymentPrefs.filter((p) => p !== pref));
      }
    } else {
      setSelectedEmploymentPrefs([...selectedEmploymentPrefs, pref]);
    }
  };

  // Build education payload
  const buildEducationArray = () => {
    const list: any[] = [];
    if (qualification !== "Class 10th" && qualification !== "Class 12th") {
      if (degree.trim() || college.trim() || gradYear.trim()) {
        list.push({
          title: qualification,
          board_or_stream: degree.trim() || undefined,
          institution: college.trim() || undefined,
          year_completed: gradYear.trim() || undefined,
          marks_or_grade: gradMarks.trim() || undefined,
        });
      }
    }
    if (qualification !== "Class 10th") {
      if (s12Board.trim() || s12School.trim() || s12Year.trim()) {
        list.push({
          title: "Class 12th",
          board_or_stream: s12Board.trim() || undefined,
          institution: s12School.trim() || undefined,
          year_completed: s12Year.trim() || undefined,
          marks_or_grade: s12Marks.trim() || undefined,
        });
      }
    }
    if (s10Board.trim() || s10School.trim() || s10Year.trim()) {
      list.push({
        title: "Class 10th",
        board_or_stream: s10Board.trim() || undefined,
        institution: s10School.trim() || undefined,
        year_completed: s10Year.trim() || undefined,
        marks_or_grade: s10Marks.trim() || undefined,
      });
    }
    return list;
  };

  // Build full profile payload
  const buildPayload = (isFinal = false) => {
    const isExp = currentStatus === "Experienced Professional" || currentStatus === "Freelancer";
    const resolvedIndustry = selectedIndustry === "none_of_above" ? customIndustry.trim() : selectedIndustry;
    const resolvedHeadline = isExp && currentRole.trim() && currentCompany.trim()
      ? `${currentRole.trim()} at ${currentCompany.trim()}`
      : selectedRoles[0]
      ? `${selectedRoles[0]} · ${currentStatus}`
      : `Seeking opportunities as ${currentStatus}`;

    return {
      name: name.trim() || undefined,
      industry_type: resolvedIndustry || undefined,
      job_roles: selectedRoles.length > 0 ? selectedRoles : undefined,
      skills: selectedSkills.length > 0 ? selectedSkills : undefined,
      current_status: currentStatus,
      is_experienced: isExp,
      experience_years: isExp ? parseInt(expYears, 10) || 0 : 0,
      current_company: isExp ? currentCompany.trim() || undefined : undefined,
      current_role: isExp ? currentRole.trim() || undefined : undefined,
      headline: resolvedHeadline,
      education: buildEducationArray(),
      city: city.trim() || undefined,
      preferred_locations: preferredLocations.length > 0 ? preferredLocations : undefined,
      willing_to_relocate: willingToRelocate,
      employment_preferences: selectedEmploymentPrefs,
      expected_salary_min: minSalary ? parseInt(minSalary, 10) : undefined,
      expected_salary_max: maxSalary ? parseInt(maxSalary, 10) : undefined,
      onboarding_step: isFinal ? 11 : currentStep + 1,
      onboarded: isFinal ? true : undefined,
    };
  };

  // Step validation
  const validateCurrentStep = (): boolean => {
    setError(null);
    if (currentStep === 2) {
      if (!name.trim()) {
        setError("Please enter your full name");
        return false;
      }
      if (!selectedIndustry) {
        setError("Please select your primary industry");
        return false;
      }
      if (selectedIndustry === "none_of_above" && !customIndustry.trim()) {
        setError("Please specify your custom industry");
        return false;
      }
    } else if (currentStep === 3) {
      if (selectedRoles.length === 0) {
        setError("Please select at least one job role that interests you");
        return false;
      }
    } else if (currentStep === 4) {
      if (selectedSkills.length === 0) {
        setError("Please select or add at least one professional skill");
        return false;
      }
    } else if (currentStep === 5) {
      if (!currentStatus) {
        setError("Please select your current profile status");
        return false;
      }
      const isExp = currentStatus === "Experienced Professional" || currentStatus === "Freelancer";
      if (isExp && !expYears.trim()) {
        setError("Please enter your total years of experience");
        return false;
      }
    } else if (currentStep === 7) {
      if (!city.trim()) {
        setError("Please enter your current city");
        return false;
      }
    }
    return true;
  };

  // Next Step or Save
  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep < totalSteps) {
      // Auto-save progress silently in background
      try {
        const payload = buildPayload(false);
        apiClient.put(ENDPOINTS.SEEKER_PROFILE, payload).catch(() => {});
      } catch {}

      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      await handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setError(null);
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Skip step if optional
  const handleSkipStep = () => {
    setError(null);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleFinalSubmit();
    }
  };

  // Skip entire onboarding
  const handleSkipAll = async () => {
    setIsLoading(true);
    try {
      await apiClient.put(ENDPOINTS.SEEKER_PROFILE, {
        onboarded: true,
        onboarding_step: 11,
      });
      router.push("/seeker/dashboard");
    } catch {
      router.push("/seeker/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Final submit
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = buildPayload(true);
      await apiClient.put(ENDPOINTS.SEEKER_PROFILE, payload);

      // Upload resume if attached
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        try {
          await apiClient.post(ENDPOINTS.UPLOAD_RESUME_PDF, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch {
          // Non-fatal resume upload issue
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/seeker/dashboard");
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to save profile. Please check your details.");
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-[#174A7E] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading your profile preferences...</p>
      </div>
    );
  }

  const isOptionalStep = currentStep === 1 || currentStep === 6 || currentStep === 8;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#174A7E]/10 text-[#174A7E]">
            <Sparkles className="h-3.5 w-3.5" /> Candidate Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentStep === 1 ? "Welcome to JobAllocate! 🚀" : "Build Your Career Profile"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Complete your profile to unlock tailored job recommendations, direct recruiter outreach, and ATS resume access.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSkipAll}
          disabled={isLoading}
          className="self-start sm:self-center text-xs font-bold text-slate-600 hover:text-[#174A7E] border border-slate-200 hover:border-slate-300 bg-white px-4 py-2 rounded-full transition-all shadow-2xs"
        >
          Skip Onboarding →
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#174A7E]">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-emerald-700">
            {Math.round((currentStep / totalSteps) * 100)}% Completed
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#174A7E] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Card Content */}
      <Card className="p-6 sm:p-8 space-y-6 border-slate-200/90 shadow-lg rounded-3xl bg-white">
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs text-red-700 font-medium flex items-center gap-2 border border-red-200 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-md">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Profile Setup Completed! 🚀</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your profile is ready. Redirecting you to your candidate dashboard to view matching jobs...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* STEP 1: Welcome Overview */}
            {currentStep === 1 && (
              <div className="text-center py-6 space-y-6 max-w-xl mx-auto">
                <div className="h-24 w-24 rounded-3xl bg-blue-50 text-[#174A7E] flex items-center justify-center mx-auto shadow-sm">
                  <Rocket className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Let&apos;s Help You Land Your Dream Job</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    In just 2 minutes, personalize your industry, job preferences, and key skills. Recruiters prioritize candidates with completed profiles!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-lg">🎯</span>
                    <h4 className="text-xs font-bold text-slate-800">Targeted Matches</h4>
                    <p className="text-[11px] text-slate-500">Only see jobs that match your selected role & skills.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-lg">⚡</span>
                    <h4 className="text-xs font-bold text-slate-800">1-Click Apply</h4>
                    <p className="text-[11px] text-slate-500">Apply instantly to hiring companies and consultancies.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-lg">📄</span>
                    <h4 className="text-xs font-bold text-slate-800">ATS Resumes</h4>
                    <p className="text-[11px] text-slate-500">Access verified resume layouts approved by recruiters.</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Basic Info & Industry Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>What is your name & industry?</span> 👋
                  </h3>
                  <p className="text-xs text-slate-500">
                    We will customize your job roles and skills recommendations based on your primary industry.
                  </p>
                </div>

                <Input
                  label="Full Name *"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Select Your Primary Industry *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                    {INDUSTRY_TYPES.map((ind) => {
                      const Icon = INDUSTRY_ICON_MAP[ind.key] || Briefcase;
                      const isSelected = selectedIndustry === ind.key;
                      return (
                        <button
                          key={ind.key}
                          type="button"
                          onClick={() => {
                            setSelectedIndustry(ind.key);
                            setSelectedRoles([]);
                            setSelectedSkills([]);
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all gap-2 ${
                            isSelected
                              ? "bg-[#174A7E]/5 border-[#174A7E] shadow-sm ring-2 ring-[#174A7E]/20 text-[#174A7E]"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className={`h-5 w-5 ${isSelected ? "text-[#174A7E]" : "text-slate-400"}`} />
                            {isSelected && <Check className="h-4 w-4 text-[#174A7E]" />}
                          </div>
                          <span className="text-xs font-bold leading-snug line-clamp-2">
                            {ind.label}
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIndustry("none_of_above");
                        setSelectedRoles([]);
                        setSelectedSkills([]);
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all gap-2 ${
                        selectedIndustry === "none_of_above"
                          ? "bg-[#174A7E]/5 border-[#174A7E] shadow-sm ring-2 ring-[#174A7E]/20 text-[#174A7E]"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Plus className="h-5 w-5 text-slate-400" />
                        {selectedIndustry === "none_of_above" && <Check className="h-4 w-4 text-[#174A7E]" />}
                      </div>
                      <span className="text-xs font-bold leading-snug">Other (Custom Industry)</span>
                    </button>
                  </div>
                </div>

                {selectedIndustry === "none_of_above" && (
                  <Input
                    label="Custom Industry Name *"
                    placeholder="e.g. Space Exploration, Robotics"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    required
                  />
                )}
              </div>
            )}

            {/* STEP 3: Job Roles */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>What job roles interest you?</span> 🎯
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select the job roles you are looking for in {getIndustryLabel(selectedIndustry)}. (Multiple selections allowed)
                  </p>
                </div>

                {availableRoles.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Common Roles in {getIndustryLabel(selectedIndustry)}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableRoles.map((role) => {
                        const isSelected = selectedRoles.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleToggleRole(role)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSelected
                                ? "bg-[#174A7E] text-white border-[#174A7E] shadow-2xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {isSelected ? `✓ ${role}` : `+ ${role}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Add Custom Role
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Senior Tech Lead, Growth Associate"
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomRole();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddCustomRole}
                      className="px-4 font-bold"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {selectedRoles.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                    <span className="text-xs font-bold text-[#174A7E]">
                      Selected Roles ({selectedRoles.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRoles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#174A7E] text-white shadow-2xs"
                        >
                          {role}
                          <button
                            type="button"
                            onClick={() => handleToggleRole(role)}
                            className="hover:text-red-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Skills */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Add your professional skills</span> 💻
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recommended based on high-demand recruiter searches in {getIndustryLabel(selectedIndustry)}.
                  </p>
                </div>

                {recommendedSkills.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Recommended Skills
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                      {recommendedSkills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleToggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isSelected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Add Custom Skill
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Next.js, SAP, Kubernetes, Figma"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddCustomSkill}
                      className="px-4 font-bold"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {selectedSkills.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                    <span className="text-xs font-bold text-emerald-800">
                      Selected Skills ({selectedSkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white shadow-2xs"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleToggleSkill(skill)}
                            className="hover:text-red-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Current Status & Experience */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>What is your current profile status?</span> 💼
                  </h3>
                  <p className="text-xs text-slate-500">
                    Helps employers know if you are entry-level or have prior corporate experience.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STATUS_OPTIONS.map((status) => {
                    const isSelected = currentStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setCurrentStatus(status)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#174A7E]/5 border-[#174A7E] ring-2 ring-[#174A7E]/20 text-[#174A7E] font-bold"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 font-medium"
                        }`}
                      >
                        <span className="text-sm">{status}</span>
                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-[#174A7E]" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-300" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {(currentStatus === "Experienced Professional" || currentStatus === "Freelancer") && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Experience Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Total Experience (Years) *"
                        type="number"
                        min="0"
                        placeholder="e.g. 3"
                        value={expYears}
                        onChange={(e) => setExpYears(e.target.value)}
                        required
                      />
                      <Input
                        label="Current / Last Company *"
                        placeholder="e.g. Infosys, TCS, Startup"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        className="sm:col-span-2"
                        required
                      />
                    </div>

                    <Input
                      label="Current / Last Job Title *"
                      placeholder="e.g. Senior Software Engineer"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: Education Details */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Tell us about your education</span> 🎓
                  </h3>
                  <p className="text-xs text-slate-500">
                    Academic qualifications help recruiters match entry-level and specialized roles. (Optional, can be skipped)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Highest Qualification
                  </label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#174A7E]"
                  >
                    {QUALIFICATION_OPTIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                {qualification !== "Class 10th" && qualification !== "Class 12th" && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Highest Qualification Details ({qualification})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Course / Degree Name"
                        placeholder="e.g. B.Tech Computer Science, BBA"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                      />
                      <Input
                        label="College / University Name"
                        placeholder="e.g. Delhi University, IIT Bombay"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                      />
                      <Input
                        label="Graduation Year"
                        placeholder="e.g. 2024"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                      />
                      <Input
                        label="Marks / CGPA"
                        placeholder="e.g. 8.5 CGPA or 85%"
                        value={gradMarks}
                        onChange={(e) => setGradMarks(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {qualification !== "Class 10th" && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Class 12th Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Board / Stream Name"
                        placeholder="e.g. CBSE Science, State Board Commerce"
                        value={s12Board}
                        onChange={(e) => setS12Board(e.target.value)}
                      />
                      <Input
                        label="School Name"
                        placeholder="e.g. St. Xavier's High School"
                        value={s12School}
                        onChange={(e) => setS12School(e.target.value)}
                      />
                      <Input
                        label="Passing Year"
                        placeholder="e.g. 2020"
                        value={s12Year}
                        onChange={(e) => setS12Year(e.target.value)}
                      />
                      <Input
                        label="Marks / Percentage"
                        placeholder="e.g. 90%"
                        value={s12Marks}
                        onChange={(e) => setS12Marks(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Class 10th Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Board Name"
                      placeholder="e.g. CBSE, ICSE, State Board"
                      value={s10Board}
                      onChange={(e) => setS10Board(e.target.value)}
                    />
                    <Input
                      label="School Name"
                      placeholder="e.g. Central School"
                      value={s10School}
                      onChange={(e) => setS10School(e.target.value)}
                    />
                    <Input
                      label="Passing Year"
                      placeholder="e.g. 2018"
                      value={s10Year}
                      onChange={(e) => setS10Year(e.target.value)}
                    />
                    <Input
                      label="Marks / Percentage"
                      placeholder="e.g. 92%"
                      value={s10Marks}
                      onChange={(e) => setS10Marks(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Location & Work Preferences */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Where are you located & work preferences?</span> 📍
                  </h3>
                  <p className="text-xs text-slate-500">
                    Let employers know your location constraints, relocation interest, and salary expectations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Current City *"
                    placeholder="e.g. Bengaluru, Mumbai, Pune"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    required
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Preferred Job Locations
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add city (e.g. Hyderabad)"
                        value={prefLocationInput}
                        onChange={(e) => setPrefLocationInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddPreferredLocation();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddPreferredLocation}
                        className="px-3"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {preferredLocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {preferredLocations.map((loc) => (
                      <span
                        key={loc}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        {loc}
                        <button
                          type="button"
                          onClick={() => setPreferredLocations(preferredLocations.filter((l) => l !== loc))}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="relocateCheck"
                    checked={willingToRelocate}
                    onChange={(e) => setWillingToRelocate(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#174A7E] focus:ring-[#174A7E]"
                  />
                  <label htmlFor="relocateCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    I am willing to relocate for the right job opportunity
                  </label>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Employment Formats (Select Multiple)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYMENT_PREF_OPTIONS.map((opt) => {
                      const isSelected = selectedEmploymentPrefs.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleToggleEmploymentPref(opt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? "bg-[#174A7E] text-white border-[#174A7E]"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {isSelected ? `✓ ${opt}` : `+ ${opt}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Expected Minimum Annual Salary (₹)"
                    type="number"
                    placeholder="e.g. 400000"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                  />
                  <Input
                    label="Expected Maximum Annual Salary (₹)"
                    type="number"
                    placeholder="e.g. 800000"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 8: Resume Upload */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Upload your Resume</span> 📄
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload your latest CV in PDF format so recruiters can download it directly. (Optional, can finish without file)
                  </p>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-4 hover:border-[#174A7E] transition-all bg-slate-50/50">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 text-[#174A7E] flex items-center justify-center mx-auto">
                    <Upload className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {resumeFile ? resumeFile.name : "Choose a PDF resume file from your computer"}
                    </p>
                    <p className="text-[11px] text-slate-400">PDF, DOC, or DOCX (up to 5MB)</p>
                  </div>

                  <input
                    type="file"
                    id="resumeUploadInput"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResumeFile(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="flex justify-center gap-3">
                    <label
                      htmlFor="resumeUploadInput"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                    >
                      <FileText className="h-4 w-4" />
                      {resumeFile ? "Change File" : "Select Document"}
                    </label>

                    {resumeFile && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setResumeFile(null)}
                        className="text-xs font-bold text-red-600"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {existingResumeUrl && !resumeFile && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span className="font-semibold">✓ You already have an active resume uploaded.</span>
                    <a
                      href={existingResumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold"
                    >
                      View Current CV
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isOptionalStep && currentStep !== 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkipStep}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Skip Step
                  </Button>
                )}

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  isLoading={isLoading}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl font-bold shadow-md bg-[#174A7E] hover:bg-[#123962] text-white"
                >
                  {currentStep === 1
                    ? "Let's Start →"
                    : currentStep === totalSteps
                    ? "Finish Profile & Go to Dashboard"
                    : "Next Step →"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
