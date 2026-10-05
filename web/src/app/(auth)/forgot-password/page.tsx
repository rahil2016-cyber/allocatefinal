"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Phone, Lock, KeyRound, Briefcase, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Please enter your mobile phone number");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post("/auth/send-otp", { mobile: phone });
      setStep("verify");
    } catch (err: any) {
      setStep("verify"); // Advance to OTP step
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post(ENDPOINTS.FORGOT_PASSWORD, {
        mobile: phone,
        otp,
        password: newPassword,
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please verify the OTP code.");
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
          <h1 className="text-2xl font-extrabold text-slate-900">Reset Account Password</h1>
          <p className="text-xs text-slate-500">Verify your mobile phone via SMS OTP to set a new password</p>
        </div>

        <Card className="p-6 space-y-4 shadow-lg border-slate-200">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Password Reset Successful</h3>
              <p className="text-xs text-slate-500">Redirecting to sign-in page...</p>
            </div>
          ) : step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Registered Mobile Phone Number"
                type="tel"
                placeholder="+91 9876543210"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="h-4 w-4" />}
                helperText="Enter 10-digit mobile number associated with your account"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold shadow-md"
                isLoading={isLoading}
                rightIcon={<KeyRound className="h-4 w-4" />}
              >
                Send SMS Verification OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="Enter 6-Digit SMS OTP"
                type="text"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                leftIcon={<KeyRound className="h-4 w-4" />}
                helperText={`Sent to ${phone}`}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 6 characters"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold shadow-md"
                isLoading={isLoading}
              >
                Confirm & Reset Password
              </Button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 w-full pt-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Mobile Number Entry
              </button>
            </form>
          )}

          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-[#174A7E] hover:underline">
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
