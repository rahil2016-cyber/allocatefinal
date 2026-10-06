"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  User as UserIcon,
  Building2,
  KeyRound,
  AlertCircle,
  FileText,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole: "job_seeker" | "company" =
    roleParam === "company" || roleParam === "employer" ? "company" : "job_seeker";

  const { login } = useAuth();

  const [role, setRole] = useState<"job_seeker" | "company">(initialRole);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(ENDPOINTS.LOGIN, {
        identifier,
        password,
        role,
      });

      const data = response.data;
      const userData = data?.data?.user || data?.user;
      const userToken = data?.data?.token || data?.token;

      if (userToken && userData) {
        login(userToken, userData);
        const resolvedRole = (userData.role || role) === "company" ? "company" : "job_seeker";
        if (resolvedRole === "company") {
          window.location.href = "/employer/dashboard";
        } else {
          if (userData.seeker_profile?.onboarded === false) {
            window.location.href = "/seeker/onboarding";
          } else {
            window.location.href = "/seeker/dashboard";
          }
        }
      } else {
        setError(data?.message || "Invalid credentials. Please check your mobile number and password.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to log in. Please verify your mobile number and password.";
      if (msg.toLowerCase().includes("different role")) {
        setError(`This account is registered as a ${role === "company" ? "Job Seeker" : "Employer"}. Please switch to the ${role === "company" ? "Job Seeker" : "Employer"} tab above to sign in.`);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const [isFirebaseSession, setIsFirebaseSession] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("Please enter your mobile number");
      return;
    }
    setIsLoading(true);
    setError(null);

    // Realtime Firebase Carrier SMS OTP (Identical to Flutter Mobile App)
    try {
      const { sendFirebasePhoneOtp } = await import("@/lib/firebase/phoneAuth");
      await sendFirebasePhoneOtp(identifier.trim(), "recaptcha-container-login");
      setIsFirebaseSession(true);
      setOtpSent(true);
      setOtp("");
      setCountdown(60);
    } catch (fbErr: any) {
      console.error("Firebase Realtime Phone OTP Error:", fbErr);
      const code = fbErr?.code || "";
      const msg = fbErr?.message || "";

      if (code === "auth/invalid-phone-number") {
        setError("Invalid mobile number format. Please enter a 10-digit Indian phone number (e.g. 9876543210).");
      } else if (code === "auth/too-many-requests" || code === "auth/quota-exceeded") {
        setError("SMS quota reached for this number today. Please wait a few minutes or use Password login above.");
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP code");
      return;
    }
    setIsLoading(true);
    setError(null);

    // If verified via Firebase
    if (isFirebaseSession) {
      try {
        const { verifyFirebasePhoneOtp } = await import("@/lib/firebase/phoneAuth");
        const idToken = await verifyFirebasePhoneOtp(otp.trim());

        const fbRes = await apiClient.post("/auth/firebase-authenticate", {
          id_token: idToken,
          role,
        });

        const fbData = fbRes.data?.data || fbRes.data;
        if (fbData?.token && fbData?.user) {
          login(fbData.token, fbData.user);
          const resolvedRole = (fbData.user.role || role) === "company" ? "company" : "job_seeker";
          if (resolvedRole === "company") {
            window.location.href = "/employer/dashboard";
          } else {
            if (fbData.user.seeker_profile?.onboarded === false) {
              window.location.href = "/seeker/onboarding";
            } else {
              window.location.href = "/seeker/dashboard";
            }
          }
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
      const response = await apiClient.post("/auth/verify-otp", {
        identifier: identifier.trim(),
        code: otp.trim(),
        intent: "login",
        role,
      });

      const data = response.data;
      const userData = data?.data?.user || data?.user;
      const userToken = data?.data?.token || data?.token;

      if (userToken && userData) {
        login(userToken, userData);
        const resolvedRole = (userData.role || role) === "company" ? "company" : "job_seeker";
        if (resolvedRole === "company") {
          window.location.href = "/employer/dashboard";
        } else {
          if (userData.seeker_profile?.onboarded === false) {
            window.location.href = "/seeker/onboarding";
          } else {
            window.location.href = "/seeker/dashboard";
          }
        }
      } else {
        setError(data?.message || "Invalid OTP code. Please try again.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to verify OTP. Please try again.";
      if (msg.toLowerCase().includes("different role")) {
        setError(`This account is registered as a ${role === "company" ? "Job Seeker" : "Employer"}. Please switch to the ${role === "company" ? "Job Seeker" : "Employer"} tab above to sign in.`);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-108px)] bg-slate-50/70 flex flex-col justify-center py-6 sm:py-12 lg:py-14 px-3 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1280px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12 xl:gap-16">
          
          {/* ─── LEFT COLUMN: HERO VISUAL SHOWCASE (54% width) ─── */}
          <div className="w-full lg:w-[54%] space-y-5 hidden lg:block">
            {role === "company" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-slate-900 leading-tight">
                    Hire Top Talent <span className="text-[#174A7E]">Faster</span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                    Post jobs in minutes, connect directly with verified candidates, and scale your workforce with zero commission fees.
                  </p>
                </div>

                <div className="relative rounded-[24px] overflow-hidden shadow-xl border border-slate-200/90 bg-slate-100 group aspect-[16/10] max-h-[400px] w-full">
                  <img
                    src="/employer_office.jpg"
                    alt="Employer Hiring Talent"
                    className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-md border border-white/50">
                        <PlusCircle className="h-3.5 w-3.5 text-[#174A7E]" />
                        <span>Post Jobs Instantly</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-md border border-white/50">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Verified Candidates</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-md border border-white/50">
                        <Building2 className="h-3.5 w-3.5 text-blue-600" />
                        <span>0% Commission</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-slate-900 leading-tight">
                    Find Your Next <span className="text-[#174A7E]">Opportunity</span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                    Explore thousands of jobs, track your applications and grow your career with JobAllocate.
                  </p>
                </div>

                <div className="relative rounded-[24px] overflow-hidden shadow-xl border border-slate-200/90 bg-slate-100 group aspect-[16/10] max-h-[400px] w-full">
                  <img
                    src="/jobseeker_student.jpg"
                    alt="Job Seeker Career Opportunity"
                    className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-md border border-white/50">
                        <Briefcase className="h-3.5 w-3.5 text-[#174A7E]" />
                        <span>Get Hired</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-md border border-white/50">
                        <FileText className="h-3.5 w-3.5 text-purple-600" />
                        <span>Build Your Resume</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-md border border-white/50">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Track Applications</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN: LOGIN CARD (46% width) ─── */}
          <div className="w-full lg:w-[46%] max-w-[490px] mx-auto lg:mx-0">
            <div className="bg-white rounded-[24px] p-5 sm:p-8 md:p-9 shadow-xl border border-slate-200/90 relative w-full">
              {/* Invisible Firebase reCAPTCHA container */}
              <div id="recaptcha-container-login" />

              {/* Card Header Branding */}
              <div className="text-center space-y-2 mb-6">
                <Link href="/" className="inline-flex flex-col items-center group">
                  <div className="flex items-center tracking-tight leading-none text-2xl font-black">
                    <span className="text-[#E53E3E]">Job</span>
                    <span className="text-[#174A7E]">Allocate</span>
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mt-1">
                    RIGHT JOB, RIGHT CANDIDATE
                  </span>
                </Link>

                <div className="pt-2">
                  {role === "company" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#174A7E] border border-blue-100">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Employer Portal</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-[#174A7E] border border-sky-100">
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>Job Seeker Portal</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight pt-1">
                  {role === "company" ? "Employer Sign In" : "Job Seeker Sign In"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {role === "company"
                    ? "Post jobs, review verified applicants & hire fast"
                    : "Access your candidate dashboard, ATS resume & active jobs"}
                </p>
              </div>

              {/* Role Switcher (Always available so users can toggle easily) */}
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setRole("job_seeker");
                    setError(null);
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === "job_seeker"
                      ? "bg-white text-[#174A7E] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Job Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole("company");
                    setError(null);
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === "company"
                      ? "bg-white text-[#174A7E] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Employer</span>
                </button>
              </div>

              {/* Login Method Tabs */}
              <div className="flex border-b border-slate-200 mb-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("password");
                    setError(null);
                  }}
                  className={`flex-1 pb-3 text-center border-b-2 transition-all cursor-pointer ${
                    loginMethod === "password"
                      ? "border-[#174A7E] text-[#174A7E] font-black"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Mobile & Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("otp");
                    setError(null);
                  }}
                  className={`flex-1 pb-3 text-center border-b-2 transition-all cursor-pointer ${
                    loginMethod === "otp"
                      ? "border-[#174A7E] text-[#174A7E] font-black"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Mobile & SMS OTP
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200/80 p-3 mb-5 text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── Method 1: Mobile & Password ── */}
              {loginMethod === "password" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <Input
                    label="MOBILE PHONE / IDENTIFIER"
                    type="tel"
                    placeholder="+91 9876543210"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    leftIcon={<Phone className="h-4 w-4 text-[#174A7E]" />}
                    className="h-[52px] rounded-xl bg-slate-50/80 border-slate-200 focus:bg-white text-sm font-medium transition-all"
                    helperText="Enter 10-digit Indian mobile number"
                  />

                  <Input
                    label="PASSWORD"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4 text-[#174A7E]" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    className="h-[52px] rounded-xl bg-slate-50/80 border-slate-200 focus:bg-white text-sm font-medium transition-all"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberSession}
                        onChange={(e) => setRememberSession(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#174A7E] focus:ring-[#174A7E] cursor-pointer"
                      />
                      <span>Remember session</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="font-bold text-[#174A7E] hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-[52px] rounded-xl bg-[#174A7E] hover:bg-[#0f3459] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer mt-2"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Sign In as {role === "company" ? "Employer" : "Job Seeker"} →
                  </Button>
                </form>
              ) : !otpSent ? (
                /* ── Method 2: Mobile & SMS OTP Step 1 ── */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <Input
                    label="MOBILE PHONE / IDENTIFIER"
                    type="tel"
                    placeholder="+91 9876543210"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    leftIcon={<Phone className="h-4 w-4 text-[#174A7E]" />}
                    className="h-[52px] rounded-xl bg-slate-50/80 border-slate-200 focus:bg-white text-sm font-medium transition-all"
                    helperText="We will send a carrier SMS OTP to verify your account"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-[52px] rounded-xl bg-[#174A7E] hover:bg-[#0f3459] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer mt-2"
                    isLoading={isLoading}
                    rightIcon={<KeyRound className="h-4 w-4" />}
                  >
                    Send SMS OTP →
                  </Button>
                </form>
              ) : (
                /* ── Method 2: Mobile & SMS OTP Step 2 ── */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <Input
                    label="ENTER 6-DIGIT SMS OTP"
                    type="text"
                    placeholder="123456"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    leftIcon={<KeyRound className="h-4 w-4 text-[#174A7E]" />}
                    className="h-[52px] rounded-xl bg-slate-50/80 border-slate-200 focus:bg-white text-center text-lg tracking-widest font-black transition-all"
                    helperText={`SMS OTP sent to ${identifier}`}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-[52px] rounded-xl bg-[#174A7E] hover:bg-[#0f3459] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer mt-2"
                    isLoading={isLoading}
                  >
                    Verify OTP & Sign In →
                  </Button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    {countdown > 0 ? (
                      <span className="text-slate-400 font-medium">Resend OTP in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="font-bold text-[#174A7E] hover:underline cursor-pointer"
                      >
                        Resend SMS OTP
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                      className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Change number
                    </button>
                  </div>
                </form>
              )}

              {/* Divider & Switch Role / Create Account Links */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
              </div>

              <div className="space-y-2 text-center text-xs">
                <p className="text-slate-600">
                  {role === "company" ? (
                    <>
                      Looking for jobs?{" "}
                      <Link href="/login?role=job_seeker" className="font-bold text-[#174A7E] hover:underline">
                        Job Seeker Portal Sign In →
                      </Link>
                    </>
                  ) : (
                    <>
                      Are you an employer hiring talent?{" "}
                      <Link href="/login?role=company" className="font-bold text-[#174A7E] hover:underline">
                        Employer Portal Sign In →
                      </Link>
                    </>
                  )}
                </p>

                <p className="text-slate-600">
                  Don't have an account?{" "}
                  <Link
                    href={`/register?role=${role === "company" ? "employer" : "seeker"}`}
                    className="font-bold text-[#174A7E] hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-xs font-semibold text-slate-500">
          Loading sign in portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
