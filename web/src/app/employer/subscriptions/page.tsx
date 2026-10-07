"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  History,
  Calendar,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function EmployerSubscriptionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"package" | "history">("package");
  const [purchasing, setPurchasing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch company profile & offer
  const { data: company, refetch: refetchProfile } = useQuery({
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

  const { data: offer, isLoading: isOfferLoading, refetch: refetchOffer } = useQuery({
    queryKey: ["companyOffer"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.COMPANY_SUBSCRIPTION_OFFER);
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });

  // Fetch subscription history
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["companySubscriptionHistory"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.COMPANY_SUBSCRIPTION_HISTORY);
        return res.data?.data?.items || res.data?.items || [];
      } catch {
        return [];
      }
    },
    enabled: !!user && activeTab === "history",
  });

  const priceInr = offer?.monthly_price_inr ?? 499;
  const packageTitle = offer?.package_title || "Corporate Package";
  const jobCreditsGranted = offer?.job_credits_granted ?? 5;
  const isVerified = company?.verification_status === "verified";
  const jobCredits = typeof company?.job_credits === "number" ? company.job_credits : 0;
  const subscriptionStatus = offer?.subscription_meta?.status || "none";
  const daysRemaining = offer?.subscription_meta?.days_remaining;

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
      const res = await apiClient.post(ENDPOINTS.COMPANY_SUBSCRIPTION_PURCHASE, {});
      const data = res.data?.data || res.data;

      if (data?.is_free) {
        setSuccessMessage("🎉 Free package activated successfully! Your job credits have been updated.");
        refetchProfile();
        refetchOffer();
        return;
      }

      if (data?.payment_session_id) {
        // Launch Cashfree modal
        const { launchCashfreeCheckout } = await import("@/lib/payment/cashfree");
        await launchCashfreeCheckout({
          paymentSessionId: data.payment_session_id,
          environment: data.environment === "sandbox" ? "sandbox" : "production",
          onSuccess: async () => {
            try {
              await apiClient.post(ENDPOINTS.COMPANY_SUBSCRIPTION_CONFIRM, {
                merchant_order_id: data.merchant_order_id,
              });
              setSuccessMessage("🎉 Payment successful! Your employer package is now active.");
              refetchProfile();
              refetchOffer();
              refetchHistory();
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
        refetchProfile();
        refetchOffer();
      } else {
        setSuccessMessage("Order generated. Please proceed to payment.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to initialize payment.");
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#174A7E]/10 text-[#174A7E]">
            <Sparkles className="h-3.5 w-3.5" />
            Employer Hiring Packages
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Post Jobs & Hire Faster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Activate job posting credits and directly access qualified candidate profiles across India.
          </p>

          {/* Current Status Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
              <Briefcase className="h-3.5 w-3.5 text-[#174A7E]" />
              Remaining Job Credits: <strong className="text-[#174A7E] font-black">{jobCredits}</strong>
            </span>
            {subscriptionStatus === "active" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Active Subscription {daysRemaining !== null && `(${daysRemaining} days left)`}
              </span>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("package")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "package"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="h-4 w-4 text-[#174A7E]" />
              Available Package
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="h-4 w-4 text-[#174A7E]" />
              Purchase History
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold max-w-2xl mx-auto animate-fadeIn">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: AVAILABLE PACKAGE */}
        {activeTab === "package" && (
          <div className="space-y-8 animate-fadeIn">
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
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <span>Activate Package Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 font-medium pt-2.5">
                  Secure Cashfree checkout • Instant credit activation
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
                    Fast recruiter assistance from our support desk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBSCRIPTION HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Subscription & Invoices History
                </h3>
                <p className="text-xs text-slate-500">
                  All past activations and packages purchased for this company profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetchHistory()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            {isHistoryLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <div className="animate-spin h-8 w-8 border-3 border-[#174A7E] border-t-transparent rounded-full mx-auto" />
                <p className="text-xs text-slate-500 font-semibold mt-3">Loading history...</p>
              </div>
            ) : !historyData || historyData.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <History className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No purchases found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven&apos;t purchased any subscription packages yet. Once you activate a package, receipt and payment logs will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("package")}
                  className="px-5 py-2 rounded-xl bg-[#174A7E] text-white text-xs font-bold hover:bg-[#123860]"
                >
                  View Packages
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {historyData.map((item: any) => {
                  const isFree = item.is_free === true;
                  const isSuccessful =
                    item.payment_status === "successful" || item.payment_status === "paid";
                  const isPending = item.payment_status === "pending";

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isFree
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-[#174A7E] border border-blue-200"
                            }`}
                          >
                            {isFree ? "FREE" : `INR ${item.amount_inr || 0}`}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            Cycle #{item.cycle_number ?? "1"}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {item.package_title || "Corporate Package"}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(item.purchased_at)}
                          </span>
                          {item.merchant_order_id && (
                            <span className="font-mono text-slate-400 truncate max-w-xs">
                              Order: {item.merchant_order_id}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isSuccessful
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {isSuccessful ? "Successful" : isPending ? "Pending" : item.payment_status || "Completed"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
