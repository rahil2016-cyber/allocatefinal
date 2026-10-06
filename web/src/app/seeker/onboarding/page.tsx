"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  User as UserIcon,
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  MapPin,
  Sparkles,
  Building,
  AlertCircle,
} from "lucide-react";

export default function SeekerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Current Status & Experience
  const [currentStatus, setCurrentStatus] = useState("Experienced Professional");
  const [experienceYears, setExperienceYears] = useState("2");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [headline, setHeadline] = useState("");

  // Step 2: Target Industry & Desired Roles
  const [industries, setIndustries] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [skills, setSkills] = useState("");

  // Step 3: Education Details
  const [qualification, setQualification] = useState("Bachelor's Degree");
  const [degree, setDegree] = useState("");
  const [college, setCollege] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [marks, setMarks] = useState("");

  // Step 4: Location & Work Preferences
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [preferredCity, setPreferredCity] = useState("");
  const [willingToRelocate, setWillingToRelocate] = useState(true);
  const [employmentType, setEmploymentType] = useState<string[]>(["Full Time"]);
  const [expectedSalaryMin, setExpectedSalaryMin] = useState("300000");
  const [expectedSalaryMax, setExpectedSalaryMax] = useState("600000");

  // Step 5: Resume PDF Upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load States & Industries on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [statesRes, indRes] = await Promise.allSettled([
          apiClient.get("/locations/states"),
          apiClient.get("/industry-types"),
        ]);

        if (statesRes.status === "fulfilled") {
          const list = statesRes.value.data?.data?.states || [];
          setStates(list);
          if (list.length > 0) setSelectedState(list[0]);
        }

        if (indRes.status === "fulfilled") {
          const list = indRes.value.data?.data || [];
          const indNames = Array.isArray(list) ? list.map((i: any) => i.name || i.title || i) : [];
          setIndustries(indNames);
          if (indNames.length > 0) setSelectedIndustry(indNames[0]);
        }
      } catch {
        // Fallback
        setStates(["Karnataka", "Maharashtra", "Delhi (NCT)", "Tamil Nadu", "Telangana"]);
        setSelectedState("Karnataka");
      }
    }
    loadMetadata();
  }, []);

  // Load Districts when State changes
  useEffect(() => {
    if (!selectedState) return;
    async function loadDistricts() {
      try {
        const res = await apiClient.get(`/locations/districts?state=${encodeURIComponent(selectedState)}`);
        const list = res.data?.data?.districts || [];
        setDistricts(list);
        if (list.length > 0) setSelectedDistrict(list[0]);
      } catch {
        setDistricts([]);
      }
    }
    loadDistricts();
  }, [selectedState]);

  const toggleEmploymentType = (type: string) => {
    if (employmentType.includes(type)) {
      if (employmentType.length > 1) {
        setEmploymentType(employmentType.filter((t) => t !== type));
      }
    } else {
      setEmploymentType([...employmentType, type]);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        headline: headline.trim() || desiredRole || currentRole || "Job Seeker",
        experience_years: currentStatus === "Student" || currentStatus === "Fresher" ? 0 : Number(experienceYears) || 0,
        expected_salary_min: Number(expectedSalaryMin) || undefined,
        expected_salary_max: Number(expectedSalaryMax) || undefined,
        state: selectedState,
        district: selectedDistrict,
        location: preferredCity ? `${preferredCity}, ${selectedDistrict}, ${selectedState}` : `${selectedDistrict}, ${selectedState}`,
        skills: skillsArray,
        industry_type: selectedIndustry,
        bio: `${currentStatus} targeting ${desiredRole || "open opportunities"} in ${selectedIndustry}. Education: ${qualification} ${degree ? `in ${degree}` : ""} from ${college || "reputed institute"}.`,
        education: [
          {
            qualification,
            degree,
            college_name: college,
            passing_year: gradYear,
            percentage_or_cgpa: marks,
          },
        ],
        employment_preferences: employmentType,
        willing_to_relocate: willingToRelocate,
      };

      // 1. Update Seeker Profile in Laravel Backend
      await apiClient.put(ENDPOINTS.SEEKER_PROFILE, payload);

      // 2. Upload Resume PDF if attached
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        try {
          await apiClient.post(ENDPOINTS.UPLOAD_RESUME_PDF, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch {
          // Resume upload warning
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/seeker/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update profile. Please verify your fields.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#174A7E]/10 text-[#174A7E]">
            <Sparkles className="h-3.5 w-3.5" /> Candidate Onboarding
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Complete Your Job Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Match with verified recruiters and access all 13 ATS resume templates
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/seeker/dashboard")}
          className="self-start sm:self-center text-xs font-bold text-slate-500 hover:text-[#174A7E] border border-slate-200 hover:border-slate-300 bg-white px-3.5 py-1.5 rounded-full transition-all shadow-2xs"
        >
          Skip Onboarding →
        </button>
      </div>

      {/* Step Progress Bar */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold">
        {[
          { num: 1, label: "Status" },
          { num: 2, label: "Role & Skills" },
          { num: 3, label: "Education" },
          { num: 4, label: "Preferences" },
          { num: 5, label: "Resume" },
        ].map((s) => (
          <div
            key={s.num}
            className={`py-2.5 px-1 rounded-xl border transition-all ${
              step === s.num
                ? "bg-[#174A7E] text-white border-[#174A7E] shadow-md scale-[1.02]"
                : step > s.num
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {s.num}. {s.label}
          </div>
        ))}
      </div>

      <Card className="p-6 sm:p-8 space-y-6 border-slate-200/90 shadow-xl rounded-3xl">
        {error && (
          <div className="rounded-xl bg-red-50 p-3.5 text-xs text-red-700 font-medium flex items-center gap-2 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-12 space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Candidate Profile Completed!</h3>
            <p className="text-xs text-slate-500">Redirecting to candidate dashboard and matching jobs...</p>
          </div>
        ) : (
          <form onSubmit={handleNextStep} className="space-y-6">
            {/* STEP 1: CURRENT STATUS & EXPERIENCE */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Step 1: What is your current employment status?
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    "Student",
                    "Fresher",
                    "Experienced Professional",
                    "Freelancer",
                    "Career Break",
                  ].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setCurrentStatus(status)}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                        currentStatus === status
                          ? "bg-sky-50 text-[#174A7E] border-[#174A7E] ring-2 ring-[#174A7E]/20"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {currentStatus !== "Student" && currentStatus !== "Fresher" && (
                  <div className="space-y-4 pt-2">
                    <Input
                      label="Total Years of Work Experience"
                      type="number"
                      placeholder="e.g. 3"
                      min="0"
                      max="40"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Current / Most Recent Company"
                        placeholder="e.g. Infosys, TCS, Startup"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                      />
                      <Input
                        label="Current / Last Job Title"
                        placeholder="e.g. Software Engineer"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Input
                  label="Professional Headline"
                  placeholder="e.g. B.Tech Computer Science Graduate | Full Stack React & Node Developer"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  helperText="This is the first line recruiters see on your profile"
                />
              </div>
            )}

            {/* STEP 2: INDUSTRY & SKILLS */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Step 2: Target Industry & Top Skills
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Primary Industry Focus <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  >
                    {industries.length > 0 ? (
                      industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))
                    ) : (
                      <>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Finance & Banking">Finance & Banking</option>
                        <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                        <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                        <option value="Manufacturing & Engineering">Manufacturing & Engineering</option>
                      </>
                    )}
                  </select>
                </div>

                <Input
                  label="Desired Job Title / Target Role"
                  placeholder="e.g. Frontend Developer, HR Executive, Data Analyst"
                  required
                  value={desiredRole}
                  onChange={(e) => setDesiredRole(e.target.value)}
                  leftIcon={<Briefcase className="h-4 w-4" />}
                />

                <Input
                  label="Top Skills (Comma Separated)"
                  placeholder="e.g. Python, SQL, React, Project Management, Communication"
                  required
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  helperText="Enter 3 to 8 relevant skills"
                />
              </div>
            )}

            {/* STEP 3: EDUCATION */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Step 3: Highest Educational Qualification
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Highest Qualification <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree (B.Tech / B.E / B.Sc / B.Com / B.A)</option>
                    <option value="Master's Degree">Master's Degree (M.Tech / M.Sc / MBA / MCA)</option>
                    <option value="Diploma">Diploma / Polytechnic</option>
                    <option value="12th Pass">12th Standard / Higher Secondary</option>
                    <option value="10th Pass">10th Standard / Matriculation</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Degree / Course Specialization"
                    placeholder="e.g. Computer Science, Mechanical, Finance"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />
                  <Input
                    label="College / Institute / University"
                    placeholder="e.g. Delhi University, VTU, Mumbai University"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    leftIcon={<GraduationCap className="h-4 w-4" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Year of Graduation"
                    type="number"
                    placeholder="e.g. 2024"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  />
                  <Input
                    label="Percentage / CGPA (Optional)"
                    placeholder="e.g. 8.2 CGPA or 78%"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: LOCATION & WORK PREFERENCES */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Step 4: Location & Compensation Preferences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Preferred State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    >
                      {states.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Preferred District <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    >
                      {districts.map((dst) => (
                        <option key={dst} value={dst}>{dst}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Specific Preferred City / Town (Optional)"
                  placeholder="e.g. Whitefield, Koramangala, Pune, Noida"
                  value={preferredCity}
                  onChange={(e) => setPreferredCity(e.target.value)}
                  leftIcon={<MapPin className="h-4 w-4" />}
                />

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={willingToRelocate}
                    onChange={(e) => setWillingToRelocate(e.target.checked)}
                    className="rounded text-[#174A7E] h-4 w-4"
                  />
                  <span>I am willing to relocate for the right job opportunity</span>
                </label>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Employment Type Preferences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Full Time", "Part Time", "Internship", "Remote", "Hybrid", "Work From Office"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleEmploymentType(type)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          employmentType.includes(type)
                            ? "bg-[#174A7E] text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Expected Minimum Salary (₹ / Annual LPA)"
                    type="number"
                    placeholder="300000"
                    value={expectedSalaryMin}
                    onChange={(e) => setExpectedSalaryMin(e.target.value)}
                    helperText="e.g. ₹3,00,000 (3 LPA)"
                  />
                  <Input
                    label="Expected Maximum Salary (₹ / Annual LPA)"
                    type="number"
                    placeholder="600000"
                    value={expectedSalaryMax}
                    onChange={(e) => setExpectedSalaryMax(e.target.value)}
                    helperText="e.g. ₹6,00,000 (6 LPA)"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: RESUME PDF */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Step 5: Upload Your Resume PDF
                </h3>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-[#174A7E] transition-colors cursor-pointer relative bg-slate-50/50">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {resumeFile ? (
                      <>
                        <div className="h-12 w-12 rounded-2xl bg-sky-100 text-[#174A7E] flex items-center justify-center mb-1">
                          <FileText className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">{resumeFile.name}</p>
                        <p className="text-xs text-slate-500">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          Click to upload your Resume PDF or drag and drop
                        </p>
                        <p className="text-[11px] text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-sky-900">
                  <Sparkles className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Don't have an ATS resume yet?</span>
                    <p className="text-[11px] text-sky-800 mt-0.5">
                      No worries! After onboarding, you can use our built-in Resume Studio to create one of our 13 ATS-friendly templates in minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(step - 1)}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                  className="rounded-2xl"
                >
                  Previous
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/seeker/dashboard")}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
                >
                  Skip for now
                </button>
              )}

              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
                rightIcon={step === totalSteps ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                className="rounded-2xl font-bold px-6 py-2.5 shadow-md"
              >
                {step === totalSteps ? "Finish Onboarding & View Jobs" : "Continue"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
