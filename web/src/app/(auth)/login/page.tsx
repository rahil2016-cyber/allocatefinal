"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Phone, Lock, LogIn, Briefcase, User as UserIcon, Building2, KeyRound, AlertCircle } from "lucide-react";

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
      if (data?.data?.token && data?.data?.user) {
        login(data.data.token, data.data.user);
        router.push(role === "company" ? "/employer/dashboard" : "/seeker/dashboard");
      } else if (data?.token && data?.user) {
        login(data.token, data.user);
        router.push(role === "company" ? "/employer/dashboard" : "/seeker/dashboard");
      } else {
        setError(data?.message || "Invalid credentials. Please check your mobile number and password.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please verify your mobile number and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("Please enter your mobile number");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post("/auth/send-otp", {
        mobile: identifier,
        role,
      });
      setOtpSent(true);
    } catch (err: any) {
      // If send-otp API is handled via Firebase on client, prompt user for OTP entry
      setOtpSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/auth/verify-otp", {
        mobile: identifier,
        otp,
        role,
      });

      const data = response.data;
      if (data?.data?.token && data?.data?.user) {
        login(data.data.token, data.data.user);
        router.push(role === "company" ? "/employer/dashboard" : "/seeker/dashboard");
      } else {
        setError(data?.message || "Invalid OTP code. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174A7E] text-white">
              <Briefcase className="h-5.5 w-5.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Job<span className="text-[#174A7E]">Allocate</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign In to Your Account</h1>
          <p className="text-xs text-slate-500">Official Mobile & OTP Authentication Portal</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setRole("job_seeker")}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              role === "job_seeker"
                ? "bg-white text-[#174A7E] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserIcon className="h-4 w-4" /> Job Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole("company")}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              role === "company"
                ? "bg-white text-[#174A7E] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-4 w-4" /> Employer
          </button>
        </div>

        {/* Login Method Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("password");
              setError(null);
            }}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              loginMethod === "password"
                ? "border-[#174A7E] text-[#174A7E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
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
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              loginMethod === "otp"
                ? "border-[#174A7E] text-[#174A7E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Mobile & SMS OTP
          </button>
        </div>

        <Card className="p-6 space-y-4 shadow-lg border-slate-200">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {loginMethod === "password" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <Input
                label="Mobile Phone / Identifier"
                type="tel"
                placeholder="+91 9876543210"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<Phone className="h-4 w-4" />}
                helperText="Enter 10-digit Indian mobile number"
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-[#174A7E]" />
                  <span>Remember session</span>
                </label>
                <Link href="/forgot-password" className="font-semibold text-[#174A7E] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold shadow-md"
                isLoading={isLoading}
                rightIcon={<LogIn className="h-4 w-4" />}
              >
                Sign In as {role === "company" ? "Employer" : "Job Seeker"}
              </Button>
            </form>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Mobile Phone Number"
                type="tel"
                placeholder="+91 9876543210"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<Phone className="h-4 w-4" />}
                helperText="We will send an SMS OTP to verify your account"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold shadow-md"
                isLoading={isLoading}
                rightIcon={<KeyRound className="h-4 w-4" />}
              >
                Send SMS OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                label="Enter 6-Digit SMS OTP"
                type="text"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                leftIcon={<KeyRound className="h-4 w-4" />}
                helperText={`OTP sent to ${identifier}`}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold shadow-md"
                isLoading={isLoading}
              >
                Verify OTP & Sign In
              </Button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-xs text-[#174A7E] hover:underline w-full text-center font-medium block"
              >
                Change mobile number or resend OTP
              </button>
            </form>
          )}

          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
            Don't have an account?{" "}
            <Link href={`/register?role=${role === "company" ? "employer" : "seeker"}`} className="font-bold text-[#174A7E] hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-xs font-semibold text-slate-500">Loading sign in portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
