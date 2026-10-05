"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, FileText, RefreshCw } from "lucide-react";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "refund">("terms");

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <Badge variant="primary" size="sm">
          Legal & Compliance
        </Badge>
        <h1 className="text-2xl font-extrabold text-slate-900">JobAllocate Legal Documentation</h1>
        <p className="text-xs text-slate-500">
          Official Terms of Service, Privacy Policy, and Refund Policies.
        </p>
      </div>

      <div className="flex border-b border-slate-200 text-xs font-bold">
        {[
          { key: "terms", label: "Terms of Service" },
          { key: "privacy", label: "Privacy Policy" },
          { key: "refund", label: "Refund & Cancellation Policy" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-[#174A7E] text-[#174A7E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="p-6 sm:p-8 space-y-4 border-slate-200 text-xs text-slate-700 leading-relaxed">
        {activeTab === "terms" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Terms of Service</h3>
            <p>
              By accessing or using the JobAllocate mobile app or website, you agree to be bound by these Terms of Service. JobAllocate is a marketplace platform facilitating connections between Job Seekers and Employers across India.
            </p>
            <h4 className="font-bold text-slate-900">1. User Accounts & Mobile Verification</h4>
            <p>
              Users must provide accurate, current, and complete mobile phone numbers verified via SMS OTP. Users are responsible for maintaining account confidentiality.
            </p>
            <h4 className="font-bold text-slate-900">2. Job Postings & Candidate Conduct</h4>
            <p>
              Employers are strictly prohibited from posting fraudulent, illegal, or discriminatory job openings. Job Seekers must ensure resume information is accurate.
            </p>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Privacy Policy</h3>
            <p>
              Your privacy is paramount to JobAllocate. We collect verified phone numbers, names, email addresses, and professional resume documents solely for facilitating employment matching.
            </p>
            <h4 className="font-bold text-slate-900">Data Security & Encryption</h4>
            <p>
              All traffic between client devices and our servers is encrypted using standard HTTPS/TLS. We do not sell or rent candidate personal data to unauthorized third-party brokers.
            </p>
          </div>
        )}

        {activeTab === "refund" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Refund & Cancellation Policy</h3>
            <p>
              Credit packages, resume export orders, and employer subscription packages purchased via Cashfree gateway are processed immediately.
            </p>
            <h4 className="font-bold text-slate-900">Refund Requests</h4>
            <p>
              If a payment transaction fails or double charges occur due to gateway timeouts, refunds will be credited back to the original source payment method within 5-7 business days.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
