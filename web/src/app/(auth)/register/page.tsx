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
import { Mail, Lock, User as UserIcon, Briefcase, Building2, UserCheck, AlertCircle } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "employer" ? "employer" : "seeker";

  const { login } = useAuth();
  const [role, setRole] = useState<"seeker" | "employer">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role: role === "employer" ? 2 : 1,
        user_type: role,
        company_name: role === "employer" ? companyName : undefined,
      };

      const response = await apiClient.post(ENDPOINTS.REGISTER, payload);

      if (response.data && response.data.token && response.data.user) {
        login(response.data.token, response.data.user);
        router.push(role === "employer" ? "/employer/dashboard" : "/seeker/dashboard");
      } else {
        setError(response.data?.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Registration failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <h1 className="text-2xl font-extrabold text-slate-900">Create Account</h1>
        <p className="text-xs text-slate-500">Join JobAllocate to connect with top employers or hire candidates</p>
      </div>

      {/* Role Toggle Selector */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-200/70 p-1">
        <button
          type="button"
          onClick={() => setRole("seeker")}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            role === "seeker"
              ? "bg-white text-[#174A7E] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserIcon className="h-4 w-4" /> Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setRole("employer")}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            role === "employer"
              ? "bg-white text-[#174A7E] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="h-4 w-4" /> Employer
        </button>
      </div>

      <Card className="p-6 space-y-4 shadow-lg border-slate-200">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={role === "employer" ? "Contact Person Name" : "Full Name"}
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon className="h-4 w-4" />}
          />

          {role === "employer" && (
            <Input
              label="Company / Organization Name"
              placeholder="Acme Corporation"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              leftIcon={<Building2 className="h-4 w-4" />}
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <Input
            label="Mobile Phone (Optional)"
            type="tel"
            placeholder="+1 555-0192"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 font-bold shadow-md"
            isLoading={isLoading}
            rightIcon={<UserCheck className="h-4 w-4" />}
          >
            Register as {role === "employer" ? "Employer" : "Job Seeker"}
          </Button>
        </form>

        <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#174A7E] hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs font-semibold text-slate-500">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
