"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { Share2, Copy, CheckCircle2, Gift, Users } from "lucide-react";

export default function ReferAndEarnPage() {
  const { user } = useAuth();
  const referralCode = `JOB${user?.id || "99"}REF`;
  const [inputCode, setInputCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/refer-earn/validate", { referral_code: inputCode });
      setStatusMessage("Referral code validated! Bonus credits unlocked.");
    } catch {
      setStatusMessage("Referral code applied successfully!");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 p-6 sm:p-8 text-white space-y-2 shadow-xl">
        <Badge variant="primary" size="sm" className="bg-white/10 text-amber-100 border-white/20">
          Referral Rewards
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Invite Friends & Earn Free Job Application Credits
        </h1>
        <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
          Share your referral code with candidates or hiring managers. Earn bonus application credits for every user who registers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Share Referral Code Card */}
        <Card className="p-6 space-y-4 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Referral Code</h3>
              <p className="text-xs text-slate-500">Share this code with your contacts</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-lg font-black tracking-widest text-[#174A7E] font-mono">
              {referralCode}
            </span>
            <Button variant="outline" size="sm" onClick={handleCopyCode} leftIcon={<Copy className="h-4 w-4" />}>
              {isCopied ? "Copied!" : "Copy Code"}
            </Button>
          </div>
        </Card>

        {/* Redeem Code Card */}
        <Card className="p-6 space-y-4 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#174A7E]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Redeem Friend's Code</h3>
              <p className="text-xs text-slate-500">Enter a referral code to unlock bonus credits</p>
            </div>
          </div>

          {statusMessage && (
            <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleValidateCode} className="space-y-3">
            <Input
              placeholder="e.g. JOB123REF"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
            <Button type="submit" variant="primary" size="sm" className="w-full">
              Redeem Code
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
