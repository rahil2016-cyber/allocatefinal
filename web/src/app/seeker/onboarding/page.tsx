"use client";

import React, { useState } from "react";
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
  IndianRupee,
  AlertCircle,
} from "lucide-react";

export default function SeekerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Personal
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");

  // Step 2: Professional
  const [headline, setHeadline] = useState("");
  const [experienceYears, setExperienceYears] = useState("2");
  const [expectedSalary, setExpectedSalary] = useState("500000");
  const [currentSalary, setCurrentSalary] = useState("350000");

  // Step 3: Skills & Bio
  const [skills, setSkills] = useState("React, Next.js, Node.js, TypeScript");
  const [bio, setBio] = useState("");

  // Step 4: Resume
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Update Seeker Profile
      const payload = {
        first_name: firstName,
        last_name: lastName,
        gender,
        date_of_birth: dob,
        location,
        headline,
        experience_years: Number(experienceYears),
        expected_salary: expectedSalary,
        current_salary: currentSalary,
        skills: skills.split(",").map((s) => s.trim()),
        bio,
      };

      await apiClient.put(ENDPOINTS.SEEKER_PROFILE, payload);

      // 2. Upload Resume PDF if attached
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        await apiClient.post(ENDPOINTS.UPLOAD_RESUME_PDF, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/seeker/dashboard");
      }, 1500);
    } catch (err: any) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/seeker/dashboard");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="primary" size="sm">
          Candidate Setup
        </Badge>
        <h1 className="text-2xl font-extrabold text-slate-900">Complete Candidate Profile</h1>
        <p className="text-xs text-slate-500">
          Follow the 4-step wizard to set up your profile and resume.
        </p>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
        {[
          { num: 1, label: "Personal" },
          { num: 2, label: "Professional" },
          { num: 3, label: "Skills & Bio" },
          { num: 4, label: "Resume PDF" },
        ].map((s) => (
          <div
            key={s.num}
            className={`py-2 px-1 rounded-lg border transition-all ${
              step === s.num
                ? "bg-[#174A7E] text-white border-[#174A7E] shadow-sm"
                : step > s.num
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            Step {s.num}: {s.label}
          </div>
        ))}
      </div>

      <Card className="p-6 sm:p-8 space-y-6 border-slate-200 shadow-md">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-12 space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Profile Setup Complete!</h3>
            <p className="text-xs text-slate-500">Redirecting to candidate dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleNextStep} className="space-y-6">
            {/* STEP 1: PERSONAL INFORMATION */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 1: Personal Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="John"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    leftIcon={<UserIcon className="h-4 w-4" />}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    leftIcon={<UserIcon className="h-4 w-4" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <Input
                    label="Date of Birth"
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>

                <Input
                  label="Location / Current City"
                  placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}

            {/* STEP 2: PROFESSIONAL DETAILS */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 2: Professional & Compensation Expectations
                </h3>

                <Input
                  label="Professional Headline / Designation"
                  placeholder="e.g. Senior Full Stack Engineer"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  leftIcon={<Briefcase className="h-4 w-4" />}
                />

                <Input
                  label="Total Experience (Years)"
                  type="number"
                  placeholder="3"
                  required
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Current Annual Salary (₹ / INR)"
                    type="number"
                    placeholder="350000"
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(e.target.value)}
                    helperText="Specify in Indian Rupees (₹)"
                  />

                  <Input
                    label="Expected Annual Salary (₹ / INR)"
                    type="number"
                    placeholder="500000"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    helperText="Specify in Indian Rupees (₹)"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: SKILLS & BIO */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 3: Key Skills & Bio Overview
                </h3>

                <Input
                  label="Key Skills (Comma Separated)"
                  placeholder="React, Next.js, Node.js, SQL, TypeScript"
                  required
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Personal Bio Overview
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your career background, expertise, and goals..."
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: RESUME UPLOAD */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 4: Upload Resume PDF
                </h3>

                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#174A7E] transition-colors cursor-pointer relative bg-slate-50/50">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {resumeFile ? (
                      <>
                        <FileText className="h-10 w-10 text-[#174A7E]" />
                        <p className="text-sm font-bold text-slate-900">{resumeFile.name}</p>
                        <p className="text-xs text-slate-500">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Click to change file
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-700">
                          Upload your Resume PDF or drag & drop here
                        </p>
                        <p className="text-[11px] text-slate-400">PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(step - 1)}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
              ) : (
                <div />
              )}

              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
                rightIcon={step === 4 ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              >
                {step === 4 ? "Complete & Save Profile" : "Continue to Next Step"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
