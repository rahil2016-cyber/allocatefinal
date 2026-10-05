"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import apiClient from "@/lib/api/client";
import {
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  Briefcase,
  Building2,
  UserCheck,
  AlertCircle,
  KeyRound,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole: "job_seeker" | "company" =
    searchParams.get("role") === "employer" || searchParams.get("role") === "company"
      ? "company"
      : "job_seeker";

  const { login } = useAuth();
  const [role, setRole] = useState<"job_seeker" | "company">(initialRole);
  const [companyKind, setCompanyKind] = useState<"company" | "consultancy">("company");

  // Step state: 0 = Profile details, 1 = OTP Verification, 2 = Set Password
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // Common Details
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // Mobile phone
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Location Details (Full India API)
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [city, setCity] = useState("");

  // Employer Specific
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  // OTP Verification
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Password Setup
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch States on mount
  useEffect(() => {
    async function loadStates() {
      try {
        const res = await apiClient.get("/locations/states");
        const list = res.data?.data?.states || [];
        setStates(list);
        if (list.length > 0 && !selectedState) {
          setSelectedState(list[0]);
        }
      } catch {
        // Fallback default
        setStates(["Karnataka", "Maharashtra", "Delhi (NCT)", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Gujarat"]);
        setSelectedState("Karnataka");
      }
    }
    loadStates();
  }, []);

  // 2. Fetch Districts whenever State changes
  useEffect(() => {
    if (!selectedState) return;
    async function loadDistricts() {
      try {
        const res = await apiClient.get(`/locations/districts?state=${encodeURIComponent(selectedState)}`);
        const list = res.data?.data?.districts || [];
        setDistricts(list);
        if (list.length > 0) {
          setSelectedDistrict(list[0]);
        } else {
          setSelectedDistrict("");
        }
      } catch {
        setDistricts([]);
      }
    }
    loadDistricts();
  }, [selectedState]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const [isFirebaseSession, setIsFirebaseSession] = useState(false);

  // Step 0 -> Step 1: Send Real SMS OTP via Firebase (or backend fallback)
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!identifier.trim()) {
      setError("Please enter your mobile phone number");
      return;
    }
    if (!selectedState) {
      setError("Please select your State");
      return;
    }
    if (role === "company" && !companyName.trim()) {
      setError("Please enter your company name");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Realtime Firebase Carrier SMS OTP (Identical to Flutter Mobile App)
    try {
      const { sendFirebasePhoneOtp } = await import("@/lib/firebase/phoneAuth");
      await sendFirebasePhoneOtp(identifier.trim(), "recaptcha-container");
      setIsFirebaseSession(true);
      setCountdown(60);
      setOtp("");
      setStep(1);
    } catch (fbErr: any) {
      console.error("Firebase Realtime Phone OTP Error:", fbErr);
      const code = fbErr?.code || "";
      const msg = fbErr?.message || "";

      if (code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      } else if (code === "auth/too-many-requests" || code === "auth/quota-exceeded") {
        setError("SMS quota reached for this number today. Please wait a few minutes or try again later.");
      } else if (code === "auth/billing-not-enabled") {
        setError("Firebase Phone Auth requires a Billing Account (Blaze Plan) in Firebase Console for SMS delivery.");
      } else if (code === "auth/captcha-check-failed") {
        setError("reCAPTCHA verification failed. Please refresh the page and try again.");
      } else if (code === "auth/unauthorized-domain") {
        setError("Domain authorization is updating in Firebase. Please wait 1-2 minutes and try again.");
      } else {
        setError(msg || `Failed to send real SMS OTP (${code || "Error"}). Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Verify OTP and Create Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP code");
      return;
    }

    setIsLoading(true);
    setError(null);

    const cleanDigits = identifier.replace(/\D/g, "").slice(-10);
    const resolvedEmail = email.trim() || `user_${cleanDigits}@joballocate.com`;

    // If verified via Firebase
    if (isFirebaseSession) {
      try {
        const { verifyFirebasePhoneOtp } = await import("@/lib/firebase/phoneAuth");
        const idToken = await verifyFirebasePhoneOtp(otp.trim());

        const fbPayload: any = {
          id_token: idToken,
          role,
          name: name.trim(),
          email: resolvedEmail,
          state: selectedState,
          district: selectedDistrict,
          city: city.trim() || undefined,
          referral_code: referralCode.trim() || undefined,
        };

        if (role === "company") {
          fbPayload.company_name = companyName.trim();
          fbPayload.company_kind = companyKind;
          fbPayload.industry = industry.trim() || undefined;
          fbPayload.website = website.trim() || undefined;
          fbPayload.gst_number = gstNumber.trim() || undefined;
        }

        const fbRes = await apiClient.post("/auth/firebase-authenticate", fbPayload);
        const fbData = fbRes.data?.data || fbRes.data;

        if (fbData?.token && fbData?.user) {
          login(fbData.token, fbData.user);
          setStep(2);
          return;
        }
      } catch (fbVerifyErr: any) {
        setError(fbVerifyErr.response?.data?.message || fbVerifyErr.message || "Invalid Firebase SMS code. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    // Backend OTP verification
    try {
      const payload: any = {
        identifier: identifier.trim(),
        code: otp.trim(),
        intent: "register",
        role,
        name: name.trim(),
        state: selectedState,
        district: selectedDistrict,
        city: city.trim() || undefined,
        email: resolvedEmail,
        referral_code: referralCode.trim() || undefined,
      };

      if (role === "company") {
        payload.company_name = companyName.trim();
        payload.company_kind = companyKind;
        payload.industry = industry.trim() || undefined;
        payload.website = website.trim() || undefined;
        payload.gst_number = gstNumber.trim() || undefined;
      }

      const res = await apiClient.post("/auth/verify-otp", payload);
      const data = res.data?.data || res.data;

      if (data?.token && data?.user) {
        login(data.token, data.user);
        setStep(2);
      } else {
        setError(res.data?.message || "Verification failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Set Password
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post("/auth/set-password", {
        password,
        password_confirmation: confirmPassword,
      });

      // Redirect to onboarding or dashboard
      if (role === "job_seeker") {
        router.push("/seeker/onboarding");
      } else {
        router.push("/employer/dashboard");
      }
    } catch {
      // If set password fails or already set, proceed to next step
      if (role === "job_seeker") {
        router.push("/seeker/onboarding");
      } else {
        router.push("/employer/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipPassword = () => {
    if (role === "job_seeker") {
      router.push("/seeker/onboarding");
    } else {
      router.push("/employer/dashboard");
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174A7E] text-white">
            <Briefcase className="h-5.5 w-5.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Job<span className="text-[#174A7E]">Allocate</span>
          </span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {step === 0 && "Create Your Account"}
          {step === 1 && "Verify Mobile OTP"}
          {step === 2 && "Secure Your Account"}
        </h1>
        <p className="text-xs text-slate-500">
          {step === 0 && "Join thousands of candidates and verified employers across India"}
          {step === 1 && `Enter the 6-digit code sent to ${identifier}`}
          {step === 2 && "Set a password for easy access to your profile"}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
        <span className={`px-2.5 py-1 rounded-full ${step === 0 ? "bg-[#174A7E] text-white" : "bg-emerald-100 text-emerald-800"}`}>
          1. Details
        </span>
        <span className="text-slate-300">→</span>
        <span className={`px-2.5 py-1 rounded-full ${step === 1 ? "bg-[#174A7E] text-white" : step > 1 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"}`}>
          2. OTP
        </span>
        <span className="text-slate-300">→</span>
        <span className={`px-2.5 py-1 rounded-full ${step === 2 ? "bg-[#174A7E] text-white" : "bg-slate-100 text-slate-400"}`}>
          3. Password
        </span>
      </div>

      <Card className="p-6 sm:p-8 space-y-5 shadow-xl border-slate-200/90 rounded-3xl relative">
        {/* Invisible Firebase reCAPTCHA container */}
        <div id="recaptcha-container" />

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-red-50 p-3.5 text-xs text-red-700 font-medium flex items-center gap-2.5 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 0: DETAILS FORM */}
        {step === 0 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Role Toggle Selector */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setRole("job_seeker")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === "job_seeker"
                    ? "bg-[#174A7E] text-white shadow-md scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserIcon className="h-4 w-4" /> Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole("company")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === "company"
                    ? "bg-[#174A7E] text-white shadow-md scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Building2 className="h-4 w-4" /> Employer
              </button>
            </div>

            {/* If Employer: Company vs Consultancy */}
            {role === "company" && (
              <div className="flex items-center justify-center gap-3 text-xs font-bold bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl text-amber-900">
                <span>Hiring as:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="company_kind"
                    checked={companyKind === "company"}
                    onChange={() => setCompanyKind("company")}
                    className="text-[#174A7E]"
                  />
                  <span>Direct Company</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="company_kind"
                    checked={companyKind === "consultancy"}
                    onChange={() => setCompanyKind("consultancy")}
                    className="text-[#174A7E]"
                  />
                  <span>Staffing Consultancy</span>
                </label>
              </div>
            )}

            <form onSubmit={handleInitiateRegister} className="space-y-4">
              <Input
                label={role === "company" ? "HR / Contact Person Name" : "Full Name"}
                placeholder="e.g. Rahul Sharma"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserIcon className="h-4 w-4" />}
              />

              {role === "company" && (
                <Input
                  label="Company Name"
                  placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  leftIcon={<Building2 className="h-4 w-4" />}
                />
              )}

              <Input
                label="Mobile Phone Number"
                type="tel"
                placeholder="+91 9876543210"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<Phone className="h-4 w-4" />}
                helperText="We will send a 6-digit verification code"
              />

              <Input
                label="Email Address (Optional)"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
              />

              {/* State & District Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  >
                    <option value="" disabled>Select State</option>
                    {states.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  >
                    <option value="" disabled>Select District</option>
                    {districts.map((dst) => (
                      <option key={dst} value={dst}>{dst}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Referral Code */}
              <Input
                label="Referral Code (Optional)"
                placeholder="e.g. REF1234"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                helperText="Have an invite code from a friend?"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 font-bold shadow-md rounded-2xl flex items-center justify-center gap-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Send Verification OTP
              </Button>
            </form>
          </div>
        )}

        {/* STEP 1: OTP VERIFICATION */}
        {step === 1 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center py-2 space-y-1">
              <div className="h-12 w-12 rounded-2xl bg-sky-50 text-[#174A7E] flex items-center justify-center mx-auto mb-2">
                <KeyRound className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">Verification Code</p>
              <p className="text-[11px] text-slate-500">
                Enter the 6 digits sent to <span className="font-bold text-slate-800">{identifier}</span>
              </p>
            </div>

            <Input
              label="6-Digit OTP Code"
              type="text"
              placeholder="123456"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-lg font-black tracking-widest"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 font-bold shadow-md rounded-2xl"
              isLoading={isLoading}
            >
              Verify & Complete Registration
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              {countdown > 0 ? (
                <span className="text-slate-400 font-medium">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleInitiateRegister}
                  className="font-bold text-[#174A7E] hover:underline"
                >
                  Resend SMS OTP
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-slate-500 hover:text-slate-700 underline"
              >
                Edit Details
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: SET PASSWORD (OPTIONAL) */}
        {step === 2 && (
          <form onSubmit={handleSetPassword} className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center py-2 space-y-1">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">Account Verified Successfully!</p>
              <p className="text-[11px] text-slate-500">
                Set a secure password to log in anytime with your mobile number.
              </p>
            </div>

            <Input
              label="Create Password"
              type="password"
              placeholder="At least 6 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 font-bold shadow-md rounded-2xl"
              isLoading={isLoading}
            >
              Save Password & Proceed
            </Button>

            <button
              type="button"
              onClick={handleSkipPassword}
              className="text-xs text-slate-500 hover:text-slate-800 underline w-full text-center block pt-1 font-medium"
            >
              Skip password setup for now
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#174A7E] hover:underline">
            Sign In with Mobile / OTP
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs font-semibold text-slate-500">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
