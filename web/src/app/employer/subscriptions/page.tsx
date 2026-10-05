"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Headphones,
  FileCheck,
  Briefcase,
  AlertCircle,
} from "lucide-react";

export default function EmployerSubscriptionsPage() {
  const { user } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch company profile & offer
  const { data: company } = useQuery({
    queryKey: ["companyProfile"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.COMPANY_PROFILE);
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });

  const { data: offer, isLoading: isOfferLoading } = useQuery({
    queryKey: ["companyOffer"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/company/subscription/offer");
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });

  const priceInr = offer?.monthly_price_inr ?? 499;
  const packageTitle = offer?.package_title || "Corporate Package";
  const jobCreditsGranted = offer?.job_credits_granted ?? 5;
  const isVerified = company?.verification_status === "verified";
  const jobCredits = typeof company?.job_credits === "number" ? company.job_credits : 0;

  const features = [
    `${jobCreditsGranted} Job Posts Credits`,
    "30 Days Active Job Visibility",
    "Direct Candidate Resume & Contact Access",
    "Priority Search Placement",
    "Instant WhatsApp & Email Applicant Alerts",
    "Dedicated Account Manager Support",
  ];

  const handlePurchase = async () => {
    setPurchasing(true);
    setSuccessMessage(null);
    try {
      const res = await apiClient.post("/company/subscription/purchase", {});
      const data = res.data?.data || res.data;

      if (data?.is_free) {
        setSuccessMessage("🎉 Free First Month activated successfully! Your job credits have been added.");
        return;
      }

      if (data?.payment_session_id) {
        // Launch Cashfree modal
        const { launchCashfreeCheckout } = await import("@/lib/payment/cashfree");
        await launchCashfreeCheckout({
          paymentSessionId: data.payment_session_id,
          environment: data.environment === "sandbox" ? "sandbox" : "production",
          onSuccess: async () => {
            // Confirm payment with backend
            try {
              await apiClient.post("/company/subscription/confirm-status", {
                merchant_order_id: data.merchant_order_id,
              });
              setSuccessMessage("🎉 Payment successful! Your employer package has been activated.");
            } catch {
              setSuccessMessage("Payment received! Activating your package...");
            }
          },
          onFailure: (err) => {
            alert(err?.message || "Payment was cancelled or could not be completed.");
          },
        });
      } else if (res.data?.success) {
        setSuccessMessage("Package activated successfully! Your job credits have been updated.");
      } else {
        setSuccessMessage("Package order generated. Please proceed to payment.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to initialize payment.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#174A7E]/10 text-[#174A7E]">
            <Sparkles className="h-3.5 w-3.5" />
            Employer Hiring Packages
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Post Jobs & Hire Faster
          </h1>
          <p className="text-sm text-slate-500">
            Purchase an employer package to receive verified job posting credits and directly access talent across India.
          </p>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold max-w-2xl mx-auto">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Pricing Card */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#E53E3E] text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-xs">
            Most Popular
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">{packageTitle}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Everything your recruitment team needs to hire top talent quickly.
            </p>
          </div>

          <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100">
            <span className="text-4xl font-black text-[#174A7E]">₹{priceInr}</span>
            <span className="text-sm font-semibold text-slate-400">/ package</span>
          </div>

          {/* Features list */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Included in this package:
            </p>
            <div className="space-y-2.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full py-3 px-6 rounded-2xl bg-[#174A7E] hover:bg-[#123860] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {purchasing ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>Activate Package Now</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 font-medium pt-2.5">
              Secure online checkout • Instant credit activation
            </p>
          </div>
        </div>

        {/* Benefits Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#174A7E] flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Instant Publishing</h4>
              <p className="text-[11px] text-slate-500 pt-0.5">
                Jobs go live immediately for job seekers to discover and apply.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Direct Candidate Access</h4>
              <p className="text-[11px] text-slate-500 pt-0.5">
                Review verified candidate resumes, skills, and direct contact numbers.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Support Priority</h4>
              <p className="text-[11px] text-slate-500 pt-0.5">
                Get fast resolution and candidate matching help from our support desk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
