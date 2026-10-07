"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { INDUSTRY_TYPES, ROLES_AND_SKILLS_BY_INDUSTRY } from "@/lib/constants/industryData";
import {
  Briefcase,
  Building2,
  MapPin,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Headphones,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Phone,
  MessageSquare,
  Mail,
  ShieldAlert,
  Sparkles,
  Lock,
} from "lucide-react";

const COMMON_BENEFITS = [
  "Health Insurance",
  "Work From Home",
  "Flexible Hours",
  "Free Snacks / Meals",
  "Paid Time Off (PTO)",
  "Performance Bonus",
  "Travel Allowance",
  "Retirement Plan (PF)",
  "Sick Leave",
  "Free Training",
];

const TIME_OPTIONS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM",
];

const DAY_RANGE_OPTIONS = [
  "Monday to Saturday",
  "Monday to Friday",
  "Monday to Thursday",
  "Flexible / All Days",
];

const QUALIFICATION_OPTIONS = [
  "<10th pass",
  "10th pass or above",
  "12th pass or above",
  "Graduate / Post Graduate",
];

const ENGLISH_OPTIONS = [
  "Does not speak english",
  "Speaks thoda english",
  "Speaks good english",
  "Speaks fluent english",
];

export default function PostJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editJobId = searchParams.get("edit");
  const { user } = useAuth();

  // Step state: 0 = Job Details, 1 = Job Descriptions, 2 = Company Details
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Job Details
  const [industryType, setIndustryType] = useState<string>("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState("");
  const [lastAutoSetRole, setLastAutoSetRole] = useState("");
  const [location, setLocation] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [preferredLocationInput, setPreferredLocationInput] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [employmentType, setEmploymentType] = useState("full_time");
  const [education, setEducation] = useState("12th pass or above");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  // Step 2: Job Descriptions
  const [modeOfWork, setModeOfWork] = useState<"office" | "home">("office");
  const [securityDeposit, setSecurityDeposit] = useState(false);
  const [securityDepositAmount, setSecurityDepositAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isCustomWorkTiming, setIsCustomWorkTiming] = useState(false);
  const [workDayRange, setWorkDayRange] = useState("Monday to Saturday");
  const [workStartTime, setWorkStartTime] = useState("09:30 AM");
  const [workEndTime, setWorkEndTime] = useState("06:30 PM");
  const [customJobTimings, setCustomJobTimings] = useState("");

  const [isCustomInterviewTiming, setIsCustomInterviewTiming] = useState(false);
  const [interviewDayRange, setInterviewDayRange] = useState("Monday to Saturday");
  const [interviewStartTime, setInterviewStartTime] = useState("11:00 AM");
  const [interviewEndTime, setInterviewEndTime] = useState("04:00 PM");
  const [customInterviewTimings, setCustomInterviewTimings] = useState("");

  const [hasIncentive, setHasIncentive] = useState(false);
  const [incentiveDetail, setIncentiveDetail] = useState("");
  const [benefitsInput, setBenefitsInput] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  const [experiencePreference, setExperiencePreference] = useState<"any" | "fresher" | "experienced">("any");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [languages, setLanguages] = useState("Speaks thoda english");

  const [skillInput, setSkillInput] = useState("");
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [requirements, setRequirements] = useState("");

  // Step 3: Company Details
  const [postingAs, setPostingAs] = useState<"company" | "consultancy">("company");
  const [consultancyName, setConsultancyName] = useState("");
  const [hiringForCompany, setHiringForCompany] = useState("");
  const [hideHiringCompany, setHideHiringCompany] = useState(false);
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPreference, setContactPreference] = useState<"phone_call" | "whatsapp" | "email">("phone_call");
  const [companyAddress, setCompanyAddress] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [maxApplications, setMaxApplications] = useState("");

  // Company Profile & Status
  const [isVerified, setIsVerified] = useState(false);
  const [jobCredits, setJobCredits] = useState<number>(0);
  const [showPayModal, setShowPayModal] = useState(false);
  const [packageOffer, setPackageOffer] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activatingPackage, setActivatingPackage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-fill company profile on mount
  useEffect(() => {
    async function loadCompanyData() {
      try {
        const res = await apiClient.get(ENDPOINTS.COMPANY_PROFILE);
        const data = res.data?.data || res.data;
        if (data) {
          setIsVerified(data.verification_status === "verified");
          setJobCredits(typeof data.job_credits === "number" ? data.job_credits : 0);
          if (!consultancyName) setConsultancyName(data.company_name || data.name || "");
          if (!contactPerson) setContactPerson(data.contact_person || data.owner_name || "");
          if (!contactEmail) setContactEmail(data.email || "");
          if (!contactPhone) setContactPhone(data.phone || "");
          if (!companyAddress) setCompanyAddress(data.address || data.location || "");
          if (!location) setLocation(data.city || data.location || "");
        }
      } catch (_) {}
    }
    loadCompanyData();
  }, []);

  // If editing an existing job, load its data
  useEffect(() => {
    if (!editJobId) return;
    async function loadExistingJob() {
      try {
        const res = await apiClient.get(ENDPOINTS.JOB_DETAILS(editJobId!));
        const j = res.data?.data || res.data;
        if (j) {
          setTitle(j.title || "");
          setLocation(j.location || "");
          if (Array.isArray(j.preferred_locations)) setPreferredLocations(j.preferred_locations);
          if (j.industry_type) {
            const isStandard = INDUSTRY_TYPES.some((it) => it.key === j.industry_type);
            if (isStandard) {
              setIndustryType(j.industry_type);
            } else {
              setIndustryType("none_of_above");
              setCustomIndustry(j.industry_type);
            }
          }
          if (j.employment_type) setEmploymentType(j.employment_type);
          if (j.education) setEducation(j.education);
          if (j.salary_min) setSalaryMin(String(j.salary_min));
          if (j.salary_max) setSalaryMax(String(j.salary_max));
          if (j.mode_of_work) setModeOfWork(j.mode_of_work === "home" ? "home" : "office");
          if (j.security_deposit) {
            setSecurityDeposit(true);
            setSecurityDepositAmount(j.security_deposit_amount || "");
          }
          if (j.description) setDescription(j.description);
          if (j.job_timings) {
            setIsCustomWorkTiming(true);
            setCustomJobTimings(j.job_timings);
          }
          if (j.interview_timings) {
            setIsCustomInterviewTiming(true);
            setCustomInterviewTimings(j.interview_timings);
          }
          if (j.incentive_detail) {
            setHasIncentive(true);
            setIncentiveDetail(j.incentive_detail);
          }
          if (j.benefits) {
            setBenefitsInput(j.benefits);
            const parsed = j.benefits.split(",").map((b: string) => b.trim());
            setSelectedBenefits(parsed.filter(Boolean));
          }
          if (j.experience_level) {
            if (j.experience_level === "fresher") {
              setExperiencePreference("fresher");
            } else {
              setExperiencePreference("experienced");
              setExperienceLevel(j.experience_level);
            }
          }
          if (j.languages) setLanguages(j.languages);
          if (Array.isArray(j.skills)) setAddedSkills(j.skills);
          if (j.requirements) setRequirements(j.requirements);
          if (j.is_consultancy) {
            setPostingAs("consultancy");
            setHiringForCompany(j.hiring_for_company || "");
            setHideHiringCompany(!!j.hide_hiring_company);
          }
          if (j.consultancy_name) setConsultancyName(j.consultancy_name);
          if (j.contact_person) setContactPerson(j.contact_person);
          if (j.contact_email) setContactEmail(j.contact_email);
          if (j.contact_phone) setContactPhone(j.contact_phone);
          if (j.contact_preference) setContactPreference(j.contact_preference);
          if (j.company_address) setCompanyAddress(j.company_address);
          if (j.application_deadline_at) setApplicationDeadline(j.application_deadline_at.slice(0, 10));
          if (j.max_applications) setMaxApplications(String(j.max_applications));
        }
      } catch (_) {}
    }
    loadExistingJob();
  }, [editJobId]);

  // Handle location auto-detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.state_district || data.address?.state;
          const state = data.address?.state;
          if (city) {
            setLocation(state ? `${city}, ${state}` : city);
          } else {
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          }
        } catch {
          setLocation("Current Location Detected");
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        alert("Could not detect location. Please type manually.");
      }
    );
  };

  // Tag management
  const handleAddPreferredLocation = () => {
    const val = preferredLocationInput.trim();
    if (val && !preferredLocations.includes(val)) {
      setPreferredLocations([...preferredLocations, val]);
      setPreferredLocationInput("");
    }
  };

  const handleRemovePreferredLocation = (loc: string) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== loc));
  };

  const handleAddSkill = () => {
    const val = skillInput.trim();
    if (val && !addedSkills.includes(val)) {
      setAddedSkills([...addedSkills, val]);
      setSkillInput("");
    }
  };

  const handleToggleBenefit = (benefit: string) => {
    let next: string[];
    if (selectedBenefits.includes(benefit)) {
      next = selectedBenefits.filter((b) => b !== benefit);
    } else {
      next = [...selectedBenefits, benefit];
    }
    setSelectedBenefits(next);
    setBenefitsInput(next.join(", "));
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 0) {
      if (!industryType) {
        setError("Please select an Industry / Job Field.");
        return false;
      }
      if (industryType === "none_of_above" && !customIndustry.trim()) {
        setError("Please write the custom industry name.");
        return false;
      }
      if (!title.trim()) {
        setError("Please enter a job title.");
        return false;
      }
      if (!location.trim()) {
        setError("Please enter the job location.");
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!description.trim()) {
        setError("Please describe the job role in points.");
        return false;
      }
      if (securityDeposit && !securityDepositAmount.trim()) {
        setError("Please specify the security deposit details / amount.");
        return false;
      }
      const timing = isCustomWorkTiming
        ? customJobTimings.trim()
        : `${workStartTime} - ${workEndTime} | ${workDayRange}`;
      if (!timing) {
        setError("Please provide the work timings.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3 submission & credit verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consultancyName.trim()) {
      setError("Please provide the company name.");
      return;
    }
    if (postingAs === "consultancy" && !hiringForCompany.trim()) {
      setError("Please provide the company you are hiring for.");
      return;
    }
    if (!contactPerson.trim()) {
      setError("Please enter the contact person / recruiter name.");
      return;
    }
    if (!contactEmail.trim()) {
      setError("Please enter the contact email address.");
      return;
    }
    if (!companyAddress.trim()) {
      setError("Please enter the company address.");
      return;
    }

    // Verify company status and credits (for new job posts)
    if (!editJobId) {
      if (!isVerified) {
        setError("Your company profile must be approved by admin before posting jobs.");
        return;
      }
      if (jobCredits <= 0) {
        // Fetch offer and show payment activation modal
        try {
          const offerRes = await apiClient.get(ENDPOINTS.COMPANY_SUBSCRIPTION_OFFER);
          setPackageOffer(offerRes.data?.data || null);
        } catch (_) {}
        setShowPayModal(true);
        return;
      }
    }

    await doSubmitJob();
  };

  const doSubmitJob = async () => {
    setSubmitting(true);
    setError(null);

    const timingStr = isCustomWorkTiming
      ? customJobTimings.trim()
      : `${workStartTime} - ${workEndTime} | ${workDayRange}`;

    const interviewTimingStr = isCustomInterviewTiming
      ? customInterviewTimings.trim()
      : `${interviewStartTime} - ${interviewEndTime} | ${interviewDayRange}`;

    const effectiveIndustry = industryType === "none_of_above" ? customIndustry.trim() : industryType;

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || null,
      preferred_locations: preferredLocations.length > 0 ? preferredLocations : null,
      employment_type: employmentType,
      experience_level: experiencePreference === "fresher" ? "fresher" : experienceLevel,
      industry_type: effectiveIndustry,
      education: education || null,
      mode_of_work: modeOfWork,
      currency: "INR",
      requirements: requirements.trim() || null,
      salary_min: salaryMin ? parseInt(salaryMin.replace(/\D/g, ""), 10) : null,
      salary_max: salaryMax ? parseInt(salaryMax.replace(/\D/g, ""), 10) : null,
      benefits: benefitsInput.trim() || null,
      skills: addedSkills.length > 0 ? addedSkills : null,
      is_consultancy: postingAs === "consultancy",
      consultancy_name: consultancyName.trim(),
      hiring_for_company: postingAs === "consultancy" ? hiringForCompany.trim() : null,
      hide_hiring_company: postingAs === "consultancy" ? hideHiringCompany : false,
      languages: languages || null,
      incentive_detail: hasIncentive ? incentiveDetail.trim() : null,
      job_timings: timingStr || null,
      interview_timings: interviewTimingStr || null,
      contact_preference: contactPreference,
      contact_person: contactPerson.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
      company_address: companyAddress.trim() || null,
      role: role.trim() || title.trim(),
      security_deposit: securityDeposit,
      security_deposit_amount: securityDeposit ? securityDepositAmount.trim() : null,
      application_deadline_at: applicationDeadline || null,
      max_applications: maxApplications ? parseInt(maxApplications, 10) : null,
    };

    try {
      if (editJobId) {
        await apiClient.put(ENDPOINTS.UPDATE_JOB(editJobId), payload);
      } else {
        await apiClient.post(ENDPOINTS.POST_JOB, payload);
      }
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/employer/dashboard");
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to submit job posting.";
      setError(msg);
      // If server returned insufficient credits (402), open payment modal
      if (err.response?.status === 402) {
        setShowPayModal(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Instant Cashfree package activation
  const handleActivatePackage = async () => {
    setActivatingPackage(true);
    try {
      const res = await apiClient.post(ENDPOINTS.COMPANY_SUBSCRIPTION_PURCHASE, {});
      const data = res.data?.data || res.data;

      if (data?.is_free) {
        setShowPayModal(false);
        setJobCredits((prev) => prev + 1);
        await doSubmitJob();
        return;
      }

      if (data?.payment_session_id) {
        const { launchCashfreeCheckout } = await import("@/lib/payment/cashfree");
        await launchCashfreeCheckout({
          paymentSessionId: data.payment_session_id,
          environment: data.environment === "sandbox" ? "sandbox" : "production",
          onSuccess: async () => {
            try {
              await apiClient.post(ENDPOINTS.COMPANY_SUBSCRIPTION_CONFIRM, {
                merchant_order_id: data.merchant_order_id,
              });
              setShowPayModal(false);
              setJobCredits((prev) => prev + 1);
              await doSubmitJob();
            } catch {
              setShowPayModal(false);
              router.push("/employer/dashboard");
            }
          },
          onFailure: (err) => {
            alert(err?.message || "Payment cancelled or failed.");
          },
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not start payment. Please try again.");
    } finally {
      setActivatingPackage(false);
    }
  };

  // Dynamic suggested skills based on selected role
  const rolesForIndustry = (industryType && ROLES_AND_SKILLS_BY_INDUSTRY[industryType]) || {};
  const suggestedSkills = role && rolesForIndustry[role]
    ? rolesForIndustry[role]
    : ["Communication", "Problem Solving", "Teamwork", "Time Management", "Leadership"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <span className="text-[11px] font-bold text-[#174A7E] tracking-wider uppercase">
                {currentStep + 1}/3
              </span>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {editJobId ? "EDIT JOB" : "POST JOB"}
              </h1>
            </div>
          </div>

          <a
            href="tel:9036980547"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Headphones className="h-3.5 w-3.5 text-[#174A7E]" />
            <span className="hidden sm:inline">Call</span> Customer support
          </a>
        </div>

        {/* 3-Step Progress Bar matching Flutter App */}
        <div className="bg-[#F1F5F9] border-t border-slate-200">
          <div className="max-w-4xl mx-auto grid grid-cols-3 text-center">
            {[
              { id: 0, label: "Job Details" },
              { id: 1, label: "Job Descriptions" },
              { id: 2, label: "Company Details" },
            ].map((tab) => {
              const isActive = currentStep === tab.id;
              const isPast = currentStep > tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (isPast) setCurrentStep(tab.id);
                  }}
                  disabled={!isPast && !isActive}
                  className={`py-3 px-2 text-xs sm:text-sm font-bold border-b-3 transition-colors ${
                    isActive
                      ? "border-[#174A7E] text-[#174A7E] bg-white"
                      : isPast
                      ? "border-emerald-500 text-emerald-700 hover:bg-slate-200/50 cursor-pointer"
                      : "border-transparent text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span className="truncate block">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm text-red-700 font-semibold flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isSuccess ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm space-y-4 my-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {editJobId ? "Job Updated Successfully!" : "Job Published Successfully!"}
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your opening is now live across JobAllocate. Job seekers matching your qualifications will be able to discover and apply.
            </p>
            <p className="text-xs text-slate-400">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm">
            {/* ── STEP 1: JOB DETAILS ────────────────────────────────────────── */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#174A7E] tracking-tight">
                    Job Basic Information
                  </h3>
                  <p className="text-xs text-slate-500">Provide the fundamental role and sector information.</p>
                </div>

                {/* Industry Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Industry / Job Field <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={industryType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIndustryType(val);
                      setRole("");
                      if (title === lastAutoSetRole) setTitle("");
                      setLastAutoSetRole("");
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20 focus:border-[#174A7E]"
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRY_TYPES.map((ind) => (
                      <option key={ind.key} value={ind.key}>
                        {ind.label}
                      </option>
                    ))}
                    <option value="none_of_above">None of the above / Other</option>
                  </select>
                </div>

                {/* Custom Industry Input */}
                {industryType === "none_of_above" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="block text-xs font-bold text-slate-800">
                      Write Custom Industry Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Space Exploration, Robotics"
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20 focus:border-[#174A7E]"
                    />
                  </div>
                )}

                {/* Dynamic Role Chips */}
                {industryType && industryType !== "none_of_above" && Object.keys(rolesForIndustry).length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Select a Job Role / Designation <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.keys(rolesForIndustry).map((r) => {
                        const isSelected = role === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setRole("");
                                if (title === lastAutoSetRole) setTitle("");
                                setLastAutoSetRole("");
                              } else {
                                setRole(r);
                                if (!title || title === lastAutoSetRole) {
                                  setTitle(r);
                                  setLastAutoSetRole(r);
                                }
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-[#174A7E] border-[#174A7E] text-white shadow-xs"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Job Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Senior Flutter Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-3.5 pr-10 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20 focus:border-[#174A7E]"
                    />
                    {title.trim() && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 absolute right-3.5 top-3.5 pointer-events-none" />
                    )}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Job Structure & Location */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#174A7E] tracking-tight">
                    Job Structure & Location
                  </h3>
                  <p className="text-xs text-slate-500">Specify where candidate will work.</p>
                </div>

                {/* Primary Job Location */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Job Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="h-4 w-4 text-[#174A7E] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Bangalore, Karnataka"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-28 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20 focus:border-[#174A7E]"
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="absolute right-2 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#174A7E] text-xs font-bold transition-colors cursor-pointer"
                    >
                      {detectingLocation ? "Detecting..." : "Auto-Detect"}
                    </button>
                  </div>
                </div>

                {/* Preferred candidate locations */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Candidates preferred from these locations (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Pune, Maharashtra"
                      value={preferredLocationInput}
                      onChange={(e) => setPreferredLocationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddPreferredLocation();
                        }
                      }}
                      className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddPreferredLocation}
                      className="px-4 py-2.5 rounded-xl bg-[#174A7E] text-white font-bold text-xs hover:bg-[#123860] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>
                  {preferredLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {preferredLocations.map((loc) => (
                        <span
                          key={loc}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                        >
                          {loc}
                          <button
                            type="button"
                            onClick={() => handleRemovePreferredLocation(loc)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Employment Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Job Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20 focus:border-[#174A7E]"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <hr className="border-slate-100" />

                {/* Candidate Minimum Qualification */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Candidate Minimum Qualification
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {QUALIFICATION_OPTIONS.map((q) => {
                      const isSelected = education === q;
                      const isRelevant = q === "12th pass or above";
                      return (
                        <div key={q} className="relative">
                          {isRelevant && (
                            <span className="absolute -top-2 left-3 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider z-10">
                              Relevant
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setEducation(q)}
                            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                              isSelected
                                ? "bg-[#174A7E] border-[#174A7E] text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                            }`}
                          >
                            {q}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Salary Range */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Salary Range (₹ / Month)
                  </label>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="number"
                        placeholder="Min Salary (e.g. 30000)"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                      />
                    </div>
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="number"
                        placeholder="Max Salary (e.g. 60000)"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: JOB DESCRIPTIONS ───────────────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#174A7E] tracking-tight">
                    Job Settings & Role
                  </h3>
                  <p className="text-xs text-slate-500">Configure remote status, timing, and responsibilities.</p>
                </div>

                {/* Work From Home */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Is it a Work From Home Job?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setModeOfWork("home")}
                      className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
                        modeOfWork === "home"
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeOfWork("office")}
                      className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
                        modeOfWork === "office"
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Security Deposit */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Is there any security deposit charged to the candidate (Eg. Uniform, Kit, Bike)? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSecurityDeposit(true)}
                      className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
                        securityDeposit
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSecurityDeposit(false);
                        setSecurityDepositAmount("");
                      }}
                      className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
                        !securityDeposit
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      No
                    </button>
                  </div>

                  {securityDeposit && (
                    <div className="pt-2 animate-fadeIn space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Security Deposit Details / Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹2000 for Uniform & Bike Kit"
                        value={securityDepositAmount}
                        onChange={(e) => setSecurityDepositAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                      />
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* Job Role Descriptions */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Describe The Job Role For The Staff (Please write in points) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder={"Please write in points / lines (e.g.\n- Coordinate with team\n- Build high-quality APIs\n- Write unit tests)"}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>

                {/* Work Timings */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Work Timings <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomWorkTiming(!isCustomWorkTiming)}
                      className="text-xs font-bold text-[#174A7E] hover:underline cursor-pointer"
                    >
                      {isCustomWorkTiming ? "Use automatic timings" : "Enter manually"}
                    </button>
                  </div>

                  {isCustomWorkTiming ? (
                    <input
                      type="text"
                      placeholder="e.g. 09:30 am - 6:30pm | Monday to Saturday"
                      value={customJobTimings}
                      onChange={(e) => setCustomJobTimings(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={workDayRange}
                        onChange={(e) => setWorkDayRange(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-medium"
                      >
                        {DAY_RANGE_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <select
                        value={workStartTime}
                        onChange={(e) => setWorkStartTime(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-medium"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <select
                        value={workEndTime}
                        onChange={(e) => setWorkEndTime(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-medium"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Interview Timings */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Interview Would Be Done Between
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomInterviewTiming(!isCustomInterviewTiming)}
                      className="text-xs font-bold text-[#174A7E] hover:underline cursor-pointer"
                    >
                      {isCustomInterviewTiming ? "Use automatic timings" : "Enter manually"}
                    </button>
                  </div>

                  {isCustomInterviewTiming ? (
                    <input
                      type="text"
                      placeholder="e.g. 11:00 am - 4:00pm | Monday to Saturday"
                      value={customInterviewTimings}
                      onChange={(e) => setCustomInterviewTimings(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={interviewDayRange}
                        onChange={(e) => setInterviewDayRange(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-medium"
                      >
                        {DAY_RANGE_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <select
                        value={interviewStartTime}
                        onChange={(e) => setInterviewStartTime(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-medium"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <select
                        value={interviewEndTime}
                        onChange={(e) => setInterviewEndTime(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-medium"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* Incentives */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Is there any Incentive?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setHasIncentive(true)}
                      className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
                        hasIncentive
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasIncentive(false);
                        setIncentiveDetail("");
                      }}
                      className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
                        !hasIncentive
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      No
                    </button>
                  </div>
                  {hasIncentive && (
                    <div className="pt-2 animate-fadeIn space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Incentive Details <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rs. 12000 as Performance Linked Incentive"
                        value={incentiveDetail}
                        onChange={(e) => setIncentiveDetail(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                      />
                    </div>
                  )}
                </div>

                {/* Company Benefits */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Company Benefits (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Health Insurance, Flexible Hours, PF"
                    value={benefitsInput}
                    onChange={(e) => setBenefitsInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Common Benefits (Tap to add):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_BENEFITS.map((benefit) => {
                        const isAdded = selectedBenefits.includes(benefit);
                        return (
                          <button
                            key={benefit}
                            type="button"
                            onClick={() => handleToggleBenefit(benefit)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              isAdded
                                ? "bg-blue-50 border-[#174A7E] text-[#174A7E] font-bold"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {isAdded ? "✓ " : "+ "}
                            {benefit}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Candidate Criteria: Experience */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Total Experience of Candidate
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <span className="absolute -top-2 left-3 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                        Relevant
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setExperiencePreference("any");
                          setExperienceLevel("fresher");
                        }}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                          experiencePreference === "any"
                            ? "bg-[#174A7E] border-[#174A7E] text-white"
                            : "bg-white border-slate-300 text-slate-700"
                        }`}
                      >
                        Any
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setExperiencePreference("fresher");
                        setExperienceLevel("fresher");
                      }}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                        experiencePreference === "fresher"
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      Freshers Only
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExperiencePreference("experienced");
                        if (experienceLevel === "fresher") setExperienceLevel("junior");
                      }}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                        experiencePreference === "experienced"
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      Experienced Only
                    </button>
                  </div>

                  {experiencePreference === "experienced" && (
                    <div className="pt-2 animate-fadeIn space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">Minimum Experience</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium"
                      >
                        <option value="junior">Junior (1-2 yrs)</option>
                        <option value="mid">Mid Level (2-5 yrs)</option>
                        <option value="senior">Senior (5-8 yrs)</option>
                        <option value="lead">Lead (8+ yrs)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* English Speaking Level */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Candidate&apos;s English Speaking Skill Should Be
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ENGLISH_OPTIONS.map((eng) => {
                      const isSelected = languages === eng;
                      const isRelevant = eng === "Speaks thoda english";
                      return (
                        <div key={eng} className="relative">
                          {isRelevant && (
                            <span className="absolute -top-2 left-3 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider z-10">
                              Relevant
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setLanguages(eng)}
                            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                              isSelected
                                ? "bg-[#174A7E] border-[#174A7E] text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                            }`}
                          >
                            {eng}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Skills & Suggested Skills */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">Skills</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type to search or add skills"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2.5 rounded-xl bg-[#174A7E] text-white font-bold text-xs hover:bg-[#123860] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>

                  {/* Suggested Skills */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Suggested Skills (Tap to add):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSkills.map((sk) => {
                        const isAdded = addedSkills.includes(sk);
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                setAddedSkills(addedSkills.filter((s) => s !== sk));
                              } else {
                                setAddedSkills([...addedSkills, sk]);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              isAdded
                                ? "bg-blue-50 border-[#174A7E] text-[#174A7E] font-bold"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {isAdded ? "✓ " : "+ "}
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Added Skills List */}
                  {addedSkills.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                        Added Skills:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {addedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#174A7E] text-xs font-bold border border-blue-200"
                          >
                            {sk}
                            <button
                              type="button"
                              onClick={() => setAddedSkills(addedSkills.filter((s) => s !== sk))}
                              className="text-[#174A7E] hover:opacity-75"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Requirements */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Detailed Candidate Requirements (Please write in points) (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={"Please write in points / lines (e.g.\n- 2+ years of experience\n- Strong coding skills\n- Good communication)"}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 3: COMPANY DETAILS ────────────────────────────────────── */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#174A7E] tracking-tight">
                    Posting Recruiter & Company Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify how your company information appears to candidates.
                  </p>
                </div>

                {/* Posting As */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    You&apos;re posting this job as a:
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPostingAs("company")}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                        postingAs === "company"
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      Company/Business
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostingAs("consultancy")}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                        postingAs === "consultancy"
                          ? "bg-[#174A7E] border-[#174A7E] text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      Consultancy
                    </button>
                  </div>
                </div>

                {/* If Consultancy */}
                {postingAs === "consultancy" ? (
                  <>
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="block text-xs font-bold text-slate-800">
                        Your consultancy name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Consultancy name"
                        value={consultancyName}
                        onChange={(e) => setConsultancyName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                      />
                    </div>
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="block text-xs font-bold text-slate-800">
                        Company you&apos;re hiring for <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Add hiring company"
                        value={hiringForCompany}
                        onChange={(e) => setHiringForCompany(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={hideHiringCompany}
                        onChange={(e) => setHideHiringCompany(e.target.checked)}
                        className="rounded border-slate-300 text-[#174A7E] focus:ring-[#174A7E] h-4 w-4"
                      />
                      <span className="text-xs text-slate-600 font-medium">
                        Don&apos;t show hiring company info to candidate
                      </span>
                    </label>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Name Of My Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter company name"
                      value={consultancyName}
                      onChange={(e) => setConsultancyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    />
                  </div>
                )}

                {/* Recruiter / Contact Person */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Contact Person / Recruiter Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ram / HR Manager"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>

                {/* Email Id */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Email Id <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="xyz@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>

                {/* HR Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    HR Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="HR Phone number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    Phone number can be changed later
                  </p>
                </div>

                {/* Contact Preference */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Job Seeker Contact Preference <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: "phone_call", label: "Phone Call", icon: Phone },
                      { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                      { id: "email", label: "Email", icon: Mail },
                    ].map((pref) => {
                      const Icon = pref.icon;
                      const isSelected = contactPreference === pref.id;
                      return (
                        <button
                          key={pref.id}
                          type="button"
                          onClick={() => setContactPreference(pref.id as any)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-[#174A7E] border-[#174A7E] text-white shadow-xs"
                              : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{pref.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Company Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    My Company Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter full office or registered address..."
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>

                {/* Prohibited payment warning banner */}
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 font-bold leading-relaxed">
                    Asking job seekers for any kind of payment (registration fee, uniform charges without disclosure, training fees) is strictly prohibited on JobAllocate and will lead to permanent blacklisting.
                  </p>
                </div>

                {/* Optional Deadline & Max applicants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Application Deadline (optional)
                    </label>
                    <input
                      type="date"
                      value={applicationDeadline}
                      onChange={(e) => setApplicationDeadline(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Max Applicants Limit (optional)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={maxApplications}
                      onChange={(e) => setMaxApplications(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Navigation Bar */}
      {!isSuccess && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-[#174A7E] hover:bg-[#123860] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#174A7E] hover:bg-[#123860] text-white font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Publishing Job...</span>
                ) : (
                  <>
                    <span>{editJobId ? "Save Changes" : "Submit to Create a Job Post"}</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Credit Activation Modal matching Flutter app's dialog */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowPayModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#174A7E]/10 text-[#174A7E] flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                Job Posting Requires Activation
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                You have {jobCredits} remaining job posting credits. Purchase or activate the Corporate Package to publish your job opening instantly.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-baseline justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700">
                  {packageOffer?.package_title || "Corporate Package"}
                </p>
                <p className="text-[11px] text-slate-500">Includes active listing + direct applicants</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#174A7E]">
                  ₹{packageOffer?.monthly_price_inr ?? 499}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleActivatePackage}
                disabled={activatingPackage}
                className="w-full py-3 px-6 rounded-2xl bg-[#174A7E] hover:bg-[#123860] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {activatingPackage ? "Processing Payment..." : "Continue to Pay & Post"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/employer/subscriptions")}
                className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 text-center"
              >
                View all employer plans & features
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
