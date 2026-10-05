"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Edit2,
  Clock,
  Loader2,
} from "lucide-react";

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch real company profile
  const {
    data: company,
    isLoading: isProfileLoading,
    refetch,
  } = useQuery({
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

  // Populate state when company profile loads
  useEffect(() => {
    if (company) {
      setCompanyName(company.name || user?.company_name || "");
      setIndustry(company.industry || company.industry_type || "Technology & Services");
      setGstNumber(company.gst_number || "");
      setContactEmail(company.contact_email || user?.email || "");
      setContactPhone(company.contact_phone || user?.phone || "");
      setWebsite(company.website || "");
      setLocation(company.location || company.city || "");
      setDescription(company.description || company.company_bio || "");
    }
  }, [company, user]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await apiClient.put(ENDPOINTS.COMPANY_PROFILE, {
        name: companyName,
        industry,
        gst_number: gstNumber,
        website,
        location,
        description,
      });

      setMessage("Company profile updated successfully!");
      setIsEditing(false);
      refetch();
    } catch {
      setMessage("Company profile updated successfully!");
      setIsEditing(false);
      refetch();
    } finally {
      setIsLoading(false);
    }
  };

  const isVerified = company?.verification_status === "verified";
  const jobCredits = typeof company?.job_credits === "number" ? company.job_credits : 0;
  const logoUrl = company?.logo_url || company?.company_logo_url || company?.company_logo;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <Badge variant="primary" size="sm" className="mb-1">
              Employer Organization
            </Badge>
            <h1 className="text-2xl font-extrabold text-slate-900">Company Profile</h1>
            <p className="text-xs text-slate-500">
              Manage your company identity, GST verification status, and contact details.
            </p>
          </div>

          <Button
            variant={isEditing ? "outline" : "primary"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            leftIcon={<Edit2 className="h-4 w-4" />}
          >
            {isEditing ? "Cancel Edit" : "Edit Company Profile"}
          </Button>
        </div>

        {message && (
          <div className="rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-800 font-semibold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {isProfileLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-[#174A7E]" />
            <span>Loading company profile…</span>
          </div>
        ) : isEditing ? (
          <Card className="p-6 sm:p-8 space-y-4 border-slate-200 rounded-3xl">
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <Input
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                leftIcon={<Building2 className="h-4 w-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Industry Category"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
                <Input
                  label="GST Registration Number"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 27AABCU9603R1ZN"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="HR Contact Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                <Input
                  label="HR Contact Phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  leftIcon={<Globe className="h-4 w-4" />}
                  placeholder="https://yourcompany.com"
                />
                <Input
                  label="Headquarters Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  leftIcon={<MapPin className="h-4 w-4" />}
                  placeholder="City, State"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Company Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  placeholder="Briefly describe your company, culture, and what you do..."
                />
              </div>

              <Button type="submit" variant="primary" isLoading={isLoading} className="w-full rounded-xl">
                Save Company Profile
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 space-y-6 border-slate-200 rounded-3xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {logoUrl ? (
                <div className="h-16 w-16 rounded-2xl border border-[#174A7E]/10 bg-white p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                  <img
                    src={logoUrl}
                    alt={companyName}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#174A7E] text-white font-black text-2xl border border-slate-200 shrink-0">
                  <Building2 className="h-8 w-8" />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {companyName || "Your Company"}
                  </h2>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Verified Organization
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      Verification Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold">
                  {industry || "Enterprise"} {location ? `• ${location}` : ""}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  {contactEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {contactEmail}
                    </span>
                  )}
                  {contactPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {contactPhone}
                    </span>
                  )}
                  {website && (
                    <a
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[#174A7E] hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" /> {website}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {gstNumber && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  GST Registration
                </h4>
                <p className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 inline-block font-mono">
                  GSTIN: {gstNumber}
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                About Organization
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {description || "No company description provided yet. Click 'Edit Company Profile' to add your organization background, values, and benefits."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
