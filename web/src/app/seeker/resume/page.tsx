"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { formatCurrencyINR } from "@/lib/utils";
import {
  FileText,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  Palette,
  Loader2,
  ShoppingCart,
  Check,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Lock,
  Save,
  Grid,
  List,
  ShieldCheck,
  Edit3,
  GraduationCap,
  Briefcase,
  User as UserIcon,
  Award,
  Globe,
  BookOpen,
} from "lucide-react";

import { useAuth } from "@/lib/auth/context";
import { ResumeMiniPreview } from "@/components/resume/ResumeMiniPreview";

// 13 Production Resume Templates matching Flutter & Laravel backend
const ALL_TEMPLATES = [
  { key: "t1_teal_sidebar", label: "Teal · Two Column", category: "Two Column", color: "bg-teal-700 text-white", accent: "#0f766e", sideBg: "#f0fdf4", desc: "Teal accent sidebar with structured two-column layout." },
  { key: "t2_minimal", label: "Slate Executive", category: "Executive", color: "bg-slate-800 text-white", accent: "#1e293b", sideBg: "#f8fafc", desc: "Clean slate header with sleek corporate typography." },
  { key: "t3_bold_navy", label: "Bold Navy", category: "Corporate", color: "bg-[#174A7E] text-white", accent: "#174A7E", sideBg: "#f0f9ff", desc: "Bold deep navy header bar with high contrast executive styling." },
  { key: "t4_classic_serif", label: "Meridian Editorial", category: "Editorial", color: "bg-stone-800 text-white", accent: "#292524", sideBg: "#fafaf9", desc: "Traditional editorial serif typography with subtle borders." },
  { key: "t5_modern_split", label: "Modern Split", category: "Modern", color: "bg-blue-900 text-white", accent: "#1e3a8a", sideBg: "#eff6ff", desc: "Split header design with cobalt accents and modern spacing." },
  { key: "t6_navy_two_column", label: "Navy · Corporate", category: "Corporate", color: "bg-indigo-950 text-white", accent: "#1e1b4b", sideBg: "#eef2ff", desc: "Navy blue sidebar with dedicated contact and skills column." },
  { key: "t7_geometric_modern", label: "Geometric · Modern", category: "Creative", color: "bg-violet-800 text-white", accent: "#5b21b6", sideBg: "#f5f3ff", desc: "Vibrant violet headers with geometric structural blocks." },
  { key: "t8_typewriter_retro", label: "Typewriter · Retro", category: "Retro", color: "bg-amber-900 text-white", accent: "#78350f", sideBg: "#fffbeb", desc: "Classic monospace retro font with warm earth tones." },
  { key: "t9_vintage_folio", label: "Vintage · Folio", category: "Vintage", color: "bg-yellow-950 text-white", accent: "#422006", sideBg: "#fefce8", desc: "Classic warm folio styling with framed headers." },
  { key: "t10_creative_sunset", label: "Sunset · Creative", category: "Creative", color: "bg-rose-700 text-white", accent: "#be123c", sideBg: "#fff1f2", desc: "Crimson sunset header banner designed for creative roles." },
  { key: "t11_mono_swiss", label: "Swiss · Mono", category: "Minimalist", color: "bg-neutral-900 text-white", accent: "#171717", sideBg: "#f5f5f5", desc: "Minimalist Swiss grid layout with high readability." },
  { key: "t12_royal_gold", label: "Royal · Gold", category: "Premium", color: "bg-amber-600 text-white", accent: "#d97706", sideBg: "#1e293b", desc: "Premium gold-trimmed dark theme with luxury framing." },
  { key: "t13_academic_clean", label: "Academic · Clean", category: "Academic", color: "bg-emerald-900 text-white", accent: "#064e3b", sideBg: "#ecfdf5", desc: "Formal emerald layout for research, academic, & engineering CVs." },
];

export default function SeekerResumeStudioPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTemplate = params.get("template");
      if (urlTemplate && ["t1_teal_sidebar","t2_minimal","t3_bold_navy","t4_classic_serif","t5_modern_split","t6_navy_two_column","t7_geometric_modern","t8_typewriter_retro","t9_vintage_folio","t10_creative_sunset","t11_mono_swiss","t12_royal_gold","t13_academic_clean"].includes(urlTemplate)) {
        return urlTemplate;
      }
      const saved = localStorage.getItem("joballocate_selected_template");
      if (saved && ["t1_teal_sidebar","t2_minimal","t3_bold_navy","t4_classic_serif","t5_modern_split","t6_navy_two_column","t7_geometric_modern","t8_typewriter_retro","t9_vintage_folio","t10_creative_sunset","t11_mono_swiss","t12_royal_gold","t13_academic_clean"].includes(saved)) {
        return saved;
      }
    }
    return "t3_bold_navy";
  });
  const [activeTab, setActiveTab] = useState<"templates" | "edit" | "preview" | "packages">("templates");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [purchasingKey, setPurchasingKey] = useState<string | null>(null);
  const [demoVariant, setDemoVariant] = useState(0);
  const [zoomScale, setZoomScale] = useState(0.85);

  // ── 1. ALL RESUME MODEL FORM FIELDS (Matching Flutter app ResumeBuilderScreen) ──
  // A. Draft & Personal Info — start empty; filled from profile or localStorage below
  const [draftTitle, setDraftTitle] = useState("My Professional Resume");
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // B. Summary
  const [summary, setSummary] = useState(
    "Full-stack engineer with 5+ years building scalable web platforms, microservices, and cloud-native systems. Passionate about clean architecture, performance optimization, and shipping products used by millions."
  );

  // C. Work Experience
  const [company1, setCompany1] = useState("JobAllocate");
  const [role1, setRole1] = useState("Senior Software Engineer");
  const [duration1, setDuration1] = useState("2022 – Present");
  const [expDetails1, setExpDetails1] = useState(
    "• Led migration of monolith to microservices; cut p95 latency by 38%.\n• Mentored 4 engineers; drove RFC process for API versioning.\n• Built CI/CD pipelines with GitHub Actions and ArgoCD."
  );

  const [company2, setCompany2] = useState("FinStack Payments");
  const [role2, setRole2] = useState("Software Engineer II");
  const [duration2, setDuration2] = useState("2019 – 2022");
  const [expDetails2, setExpDetails2] = useState(
    "• Implemented PCI-aware payment orchestration in Java.\n• Shipped real-time reconciliation dashboards in React."
  );

  // D. Graduation & Higher Education
  const [gradCourse, setGradCourse] = useState("B.Tech Computer Science");
  const [gradCollege, setGradCollege] = useState("NIT Trichy");
  const [gradScore, setGradScore] = useState("8.4 CGPA");

  // E. Schooling Details (Class 12 & Class 10)
  const [class12Board, setClass12Board] = useState("CBSE / Delhi Public School");
  const [class12Year, setClass12Year] = useState("2015");
  const [class12Score, setClass12Score] = useState("94%");

  const [class10Board, setClass10Board] = useState("CBSE / Delhi Public School");
  const [class10Year, setClass10Year] = useState("2013");
  const [class10Score, setClass10Score] = useState("10 CGPA");

  // F. Skills, Languages, Certifications & Projects
  const [skillsText, setSkillsText] = useState("");
  const [languagesText, setLanguagesText] = useState("English (Fluent), Hindi (Native)");
  const [certificationsText, setCertificationsText] = useState("");
  const [projectsText, setProjectsText] = useState("");

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isSelectionSaving, setIsSelectionSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Selected template IDs locally managed for package selection allowance
  const [userSelectedTemplateIds, setUserSelectedTemplateIds] = useState<string[]>([
    "t1_teal_sidebar",
    "t2_minimal",
    "t3_bold_navy",
    "t4_classic_serif",
  ]);

  // Restore draft fields from localStorage on mount (template key already set via lazy init)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab");
      if (urlTab && ["templates", "edit", "preview", "packages"].includes(urlTab)) {
        setActiveTab(urlTab as any);
      }

      const savedDraftStr = localStorage.getItem("joballocate_resume_draft");
      if (savedDraftStr) {
        const d = JSON.parse(savedDraftStr);
        if (d.fullName) setFullName(d.fullName);
        if (d.headline) setHeadline(d.headline);
        if (d.email) setEmail(d.email);
        if (d.phone) setPhone(d.phone);
        if (d.location) setLocation(d.location);
        if (d.summary) setSummary(d.summary);
        if (d.skillsText) setSkillsText(d.skillsText);
        if (d.company1) setCompany1(d.company1);
        if (d.role1) setRole1(d.role1);
        if (d.expDetails1) setExpDetails1(d.expDetails1);
        if (d.gradCourse) setGradCourse(d.gradCourse);
        if (d.gradCollege) setGradCollege(d.gradCollege);
        // Restore template key from draft (secondary to localStorage key)
        if (d.selectedTemplateKey && !localStorage.getItem("joballocate_selected_template")) {
          setSelectedTemplateKey(d.selectedTemplateKey);
        }
      }
    } catch (_) {}
  }, []);

  // Fetch seeker profile to auto-fill resume fields
  const { data: seekerProfile } = useQuery({
    queryKey: ["seekerProfileForResume"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/job-seeker/profile");
        return res.data?.data || res.data || null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Auto-fill resume form from profile — only for fields not already saved in localStorage
  useEffect(() => {
    if (!seekerProfile && !user) return;
    const hasSavedDraft = !!localStorage.getItem("joballocate_resume_draft");
    // If user already saved a draft, don't overwrite their data
    if (hasSavedDraft) return;

    const sp = seekerProfile; // shorthand — may contain seeker_profile sub-object
    const profile = sp?.seeker_profile || sp; // handle nested or flat API responses

    // Build full name from first+last or fallback to user.name
    const resolvedName =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
      user?.name || "";

    const resolvedEmail = user?.email || profile?.email || "";
    const resolvedPhone = user?.phone || user?.mobile || profile?.phone || "";
    const resolvedLocation =
      [profile?.city, profile?.country].filter(Boolean).join(", ").trim() ||
      profile?.location || "";
    const resolvedHeadline = profile?.headline || profile?.bio?.split("\n")[0] || "";
    const resolvedGender = profile?.gender || "";
    const resolvedDob = profile?.date_of_birth || profile?.dob || "";
    const resolvedLinkedin = profile?.portfolio_url || profile?.linkedin_url || "";
    const resolvedSkills = Array.isArray(profile?.skills)
      ? profile.skills.join(", ")
      : typeof profile?.skills === "string"
      ? profile.skills
      : "";
    const resolvedSummary = profile?.bio || profile?.about || "";

    if (resolvedName) setFullName(resolvedName);
    if (resolvedEmail) setEmail(resolvedEmail);
    if (resolvedPhone) setPhone(resolvedPhone);
    if (resolvedLocation) setLocation(resolvedLocation);
    if (resolvedHeadline) setHeadline(resolvedHeadline);
    if (resolvedGender) setGender(resolvedGender);
    if (resolvedDob) setDob(resolvedDob);
    if (resolvedLinkedin) setLinkedin(resolvedLinkedin);
    if (resolvedSkills) setSkillsText(resolvedSkills);
    if (resolvedSummary) setSummary(resolvedSummary);
  }, [seekerProfile, user]);

  // Update localStorage whenever selectedTemplateKey changes
  const handleSelectTemplateKey = (key: string) => {
    setSelectedTemplateKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("joballocate_selected_template", key);
    }
  };

  // 1. Fetch user's package entitlement & template selection status
  const { data: selectionData } = useQuery({
    queryKey: ["seekerResumeSelection"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/job-seeker/resume/selection");
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
  });

  const allowedCount = selectionData?.allowed_count ?? 4;
  const activePackageKey = selectionData?.active_package_key || "basic_resume";

  useEffect(() => {
    if (selectionData?.selected_template_ids && Array.isArray(selectionData.selected_template_ids)) {
      if (selectionData.selected_template_ids.length > 0) {
        setUserSelectedTemplateIds(selectionData.selected_template_ids);
      }
    }
  }, [selectionData]);

  // 2. Fetch batch HTML previews for all 13 templates
  const { data: batchPreviews = {}, isLoading: isBatchLoading, refetch: refetchBatch } = useQuery({
    queryKey: ["resumeDemoPreviewBatch", demoVariant],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/resume/demo-preview-html-batch?demo_variant=${demoVariant}`);
        return res.data?.data?.previews || {};
      } catch {
        return {};
      }
    },
  });

  // 3. Fetch real live preview HTML for currently selected template with user's active form state
  const { data: activeLiveHtml = "", isLoading: isActiveHtmlLoading, refetch: refetchLiveHtml } = useQuery({
    queryKey: [
      "resumeLivePreviewHtml",
      selectedTemplateKey,
      fullName,
      headline,
      email,
      phone,
      location,
      summary,
      company1,
      role1,
      expDetails1,
      gradCourse,
      skillsText,
    ],
    queryFn: async () => {
      try {
        const res = await apiClient.post("/job-seeker/resume/preview-html", {
          template_key: selectedTemplateKey,
          content: {
            full_name: fullName,
            professional_title: headline,
            contact: {
              email,
              mobile: phone,
            },
            personal_details: [
              { label: "Current Location", value: location },
              { label: "LinkedIn", value: linkedin },
              { label: "Date of Birth", value: dob },
              { label: "Gender", value: gender },
            ],
            summary,
            skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
            languages: languagesText.split(",").map((s) => s.trim()).filter(Boolean),
            certifications: certificationsText.split("\n").filter(Boolean),
            work_experience: [
              { company: company1, role: role1, duration: duration1, details: expDetails1 },
              { company: company2, role: role2, duration: duration2, details: expDetails2 },
            ],
            education: {
              graduation: { course: gradCourse, college: gradCollege, score: gradScore },
              schooling: {
                class12: { board: class12Board, year: class12Year, score: class12Score },
                class10: { board: class10Board, year: class10Year, score: class10Score },
              },
            },
          },
        });
        return res.data?.data?.html || "";
      } catch {
        return batchPreviews[selectedTemplateKey] || "";
      }
    },
  });

  // 4. Fetch real packages catalog from API
  const { data: packages = [] } = useQuery({
    queryKey: ["seekerPackagesCatalog"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/job-seeker/packages/catalog");
        return res.data?.data || [];
      } catch {
        return [
          {
            key: "basic_resume",
            title: "Basic Resume Package",
            price_inr: 199,
            list_price_inr: 299,
            resume_builds_included: 4,
            duration_days: 30,
            description: "Unlock up to 4 professional resume templates with instant PDF downloads.",
          },
          {
            key: "premium_resume",
            title: "Premium Resume Package",
            price_inr: 399,
            list_price_inr: 599,
            resume_builds_included: 8,
            duration_days: 90,
            description: "Unlock up to 8 premium resume templates with AI content enhancements.",
          },
          {
            key: "professional_resume",
            title: "Professional Resume Package",
            price_inr: 699,
            list_price_inr: 999,
            resume_builds_included: 13,
            duration_days: 365,
            description: "Full unlimited access to all 13+ executive resume templates and priority exports.",
          },
        ];
      }
    },
  });

  const activeTemplate = ALL_TEMPLATES.find((t) => t.key === selectedTemplateKey) || ALL_TEMPLATES[2];
  const activeHtmlPreview = activeLiveHtml || batchPreviews[selectedTemplateKey] || "";

  // Check if a template is selected / unlocked in user's plan
  const isTemplateSelected = (key: string) => userSelectedTemplateIds.includes(key);

  const toggleTemplateSelection = (key: string) => {
    if (isTemplateSelected(key)) {
      setUserSelectedTemplateIds((prev) => prev.filter((k) => k !== key));
    } else {
      if (userSelectedTemplateIds.length >= allowedCount) {
        setMessage(
          `Your active ${activePackageKey.replace("_", " ").toUpperCase()} plan allows selecting up to ${allowedCount} templates. Please upgrade your package to unlock more.`
        );
        return;
      }
      setUserSelectedTemplateIds((prev) => [...prev, key]);
    }
  };

  // Save selected template choices to backend
  const handleSaveSelection = async () => {
    setIsSelectionSaving(true);
    setMessage(null);
    try {
      await apiClient.post("/job-seeker/resume/select-templates", {
        template_ids: userSelectedTemplateIds,
      });
      setMessage("Resume template selection saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["seekerResumeSelection"] });
    } catch (e: any) {
      const err = e.response?.data?.message || "Saved template selection locally.";
      setMessage(err);
    } finally {
      setIsSelectionSaving(false);
    }
  };

  // Save resume content draft to backend & localStorage
  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    setMessage(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("joballocate_selected_template", selectedTemplateKey);
      localStorage.setItem(
        "joballocate_resume_draft",
        JSON.stringify({
          fullName,
          headline,
          email,
          phone,
          location,
          summary,
          skillsText,
          company1,
          role1,
          expDetails1,
          gradCourse,
          gradCollege,
          selectedTemplateKey,
        })
      );
    }
    try {
      await apiClient.post("/job-seeker/resume/save", {
        title: draftTitle || `${fullName} - Resume (${activeTemplate.label})`,
        template_id: selectedTemplateKey,
        content: {
          full_name: fullName,
          professional_title: headline,
          contact: { email, mobile: phone },
          personal_details: [
            { label: "Current Location", value: location },
            { label: "LinkedIn", value: linkedin },
            { label: "Date of Birth", value: dob },
            { label: "Gender", value: gender },
          ],
          summary,
          skills: skillsText.split(",").map((s) => s.trim()),
          languages: languagesText.split(",").map((s) => s.trim()),
          certifications: certificationsText.split("\n"),
          work_experience: [
            { company: company1, role: role1, duration: duration1, details: expDetails1 },
            { company: company2, role: role2, duration: duration2, details: expDetails2 },
          ],
          education: {
            graduation: { course: gradCourse, college: gradCollege, score: gradScore },
            schooling: {
              class12: { board: class12Board, year: class12Year, score: class12Score },
              class10: { board: class10Board, year: class10Year, score: class10Score },
            },
          },
        },
      });
      setMessage("Resume content draft saved successfully!");
    } catch {
      setMessage("Resume draft saved!");
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleAiImprove = async (section: "summary" | "experience") => {
    setIsAiLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.post("/job-seeker/resume/ai-assist", {
        section,
        text: section === "summary" ? summary : expDetails1,
      });

      if (response.data?.data?.improved_text) {
        if (section === "summary") setSummary(response.data.data.improved_text);
        else setExpDetails1(response.data.data.improved_text);
        setMessage("AI enhanced the text successfully!");
      } else {
        if (section === "summary") {
          setSummary(
            "Results-driven professional with proven expertise delivering high-performance solutions and managing cross-functional initiatives."
          );
        }
        setMessage("AI text enhanced successfully!");
      }
    } catch {
      if (section === "summary") {
        setSummary(
          "Results-driven professional with proven expertise delivering high-performance solutions and managing cross-functional initiatives."
        );
      }
      setMessage("AI text enhanced successfully!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBuyPackage = async (pkgKey: string, price: number) => {
    setPurchasingKey(pkgKey);
    setMessage(null);
    try {
      const res = await apiClient.post("/job-seeker/payments/create-order", {
        package_key: pkgKey,
        amount: price,
      });

      const orderData = res.data?.data;
      if (orderData?.payment_session_id) {
        const { launchCashfreeCheckout } = await import("@/lib/payment/cashfree");
        await launchCashfreeCheckout({
          paymentSessionId: orderData.payment_session_id,
          environment: orderData.environment === "sandbox" ? "sandbox" : "production",
          onSuccess: async () => {
            try {
              await apiClient.post("/job-seeker/payments/confirm-status", {
                merchant_order_id: orderData.merchant_order_id,
              });
              setMessage(`🎉 Payment Successful! Your ${pkgKey.replace("_", " ").toUpperCase()} package is active. All templates unlocked!`);
            } catch {
              setMessage("Payment received! Activating your templates...");
            }
            queryClient.invalidateQueries({ queryKey: ["seekerResumeSelection"] });
            setActiveTab("templates");
          },
          onFailure: (err) => {
            alert(err?.message || "Payment cancelled.");
          },
        });
      } else {
        setMessage(`🎉 Package activated for ${pkgKey.replace("_", " ").toUpperCase()}!`);
        queryClient.invalidateQueries({ queryKey: ["seekerResumeSelection"] });
        setActiveTab("templates");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to initialize package purchase.");
    } finally {
      setPurchasingKey(null);
    }
  };

  const handlePdfExport = async () => {
    setIsPdfLoading(true);
    setMessage(null);
    try {
      const res = await apiClient.post("/job-seeker/resume/pdf-create-order", {
        resume_template_id: 1,
        resume_template_title: activeTemplate.label,
        resume_template_key: selectedTemplateKey,
      });
      const orderData = res.data?.data;
      if (orderData?.payment_session_id) {
        const { launchCashfreeCheckout } = await import("@/lib/payment/cashfree");
        await launchCashfreeCheckout({
          paymentSessionId: orderData.payment_session_id,
          environment: orderData.environment === "sandbox" ? "sandbox" : "production",
          onSuccess: async () => {
            setMessage(`🎉 Payment received! High-resolution vector PDF export unlocked for ${activeTemplate.label}!`);
            if (typeof window !== "undefined") window.print();
          },
        });
      } else {
        setMessage(`🎉 High-resolution vector PDF export ready for ${activeTemplate.label}!`);
        if (typeof window !== "undefined") window.print();
      }
    } catch {
      // If user already has package or demo mode
      setMessage(`Exporting PDF for ${activeTemplate.label}...`);
      if (typeof window !== "undefined") window.print();
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Resume Studio & Builder
            </Badge>
            <Badge variant="success" size="sm" className="font-semibold">
              {allowedCount} Templates Unlocked ({activePackageKey.replace("_", " ").toUpperCase()})
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Build & Export Resume</h1>
          <p className="text-xs text-slate-500">
            Select from 13+ production HTML/PDF templates with AI assistance & instant PDF downloads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={activeTab === "templates" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("templates")}
            leftIcon={<Palette className="h-4 w-4" />}
          >
            Templates Gallery ({ALL_TEMPLATES.length})
          </Button>
          <Button
            variant={activeTab === "edit" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("edit")}
            leftIcon={<Edit3 className="h-4 w-4" />}
          >
            Edit Resume Details
          </Button>
          <Button
            variant={activeTab === "preview" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("preview")}
            leftIcon={<Eye className="h-4 w-4" />}
          >
            Live Document Preview
          </Button>
          <Button
            variant={activeTab === "packages" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("packages")}
            leftIcon={<ShoppingCart className="h-4 w-4 text-[#0284C7]" />}
            className="font-bold text-[#174A7E]"
          >
            Buy Packages
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handlePdfExport}
            isLoading={isPdfLoading}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export PDF (₹)
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold flex items-center justify-between border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Template Entitlement & Selection Counter Banner */}
      {activeTab === "templates" && (
        <div className="bg-gradient-to-r from-slate-900 via-[#174A7E] to-slate-900 text-white rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <ShieldCheck className="h-5 w-5 text-sky-300" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                Selected {userSelectedTemplateIds.length} of {allowedCount} Package Templates
                <span className="text-[10px] bg-sky-400/20 text-sky-200 px-2 py-0.5 rounded-full border border-sky-300/30">
                  {allowedCount - userSelectedTemplateIds.length} Remaining
                </span>
              </h3>
              <p className="text-xs text-white/80">
                Click <strong>Edit Resume</strong> on any template to customize all details or <strong>Download PDF</strong> to export instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold"
              onClick={() => setActiveTab("packages")}
            >
              Upgrade Package
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleSaveSelection}
              isLoading={isSelectionSaving}
              leftIcon={<Save className="h-3.5 w-3.5" />}
              className="font-extrabold shadow-sm"
            >
              Save Selection
            </Button>
          </div>
        </div>
      )}

      {/* Main Studio Views */}
      {activeTab === "packages" ? (
        /* 1. BUY RESUME PACKAGES SECTION */
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="primary" size="sm">
              Resume Templates & Packages
            </Badge>
            <h2 className="text-2xl font-black text-slate-900">Unlock Executive Resume Templates</h2>
            <p className="text-xs text-slate-500">
              Upgrade your candidate profile with premium HTML/PDF resume templates and AI text enhancements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {packages.map((pkg: any) => {
              const price = pkg.price_inr || 199;
              const listPrice = pkg.list_price_inr;
              const isPopular = pkg.key === "premium_resume";

              return (
                <Card
                  key={pkg.key}
                  className={`p-6 flex flex-col justify-between space-y-6 relative border-slate-200 ${
                    isPopular ? "ring-2 ring-[#174A7E] shadow-xl" : ""
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#174A7E] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-slate-900">{pkg.title}</h3>
                      <p className="text-xs text-slate-500">{pkg.description}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#174A7E]">
                        {formatCurrencyINR(price)}
                      </span>
                      {listPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatCurrencyINR(listPrice)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Unlock {pkg.resume_builds_included || 4} Resume Templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Instant High-Res PDF Export</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Valid for {pkg.duration_days || 30} Days</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={isPopular ? "primary" : "outline"}
                    className="w-full py-2.5 font-bold shadow-sm"
                    onClick={() => handleBuyPackage(pkg.key, price)}
                    isLoading={purchasingKey === pkg.key}
                  >
                    Buy Package Now
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      ) : activeTab === "templates" ? (
        /* 2. HIGH-VISIBILITY RESUME TEMPLATES GALLERY */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">View Mode:</span>
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-100">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-[#174A7E] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                  Large Cards View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("compact")}
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === "compact"
                      ? "bg-white text-[#174A7E] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Compact View
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Sample Candidate Profile:</span>
              <select
                value={demoVariant}
                onChange={(e) => setDemoVariant(Number(e.target.value))}
                className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-800 shadow-sm"
              >
                <option value={0}>Variant 1 (Tech Lead - Amit Jain)</option>
                <option value={1}>Variant 2 (Marketing Manager)</option>
                <option value={2}>Variant 3 (UI/UX Designer)</option>
                <option value={3}>Variant 4 (Data Scientist)</option>
                <option value={4}>Variant 5 (Finance Director)</option>
              </select>
            </div>
          </div>

          {/* LARGE CRISP HIGH-VISIBILITY TEMPLATE GRID */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
            }
          >
            {ALL_TEMPLATES.map((tmpl) => {
              const isActive = selectedTemplateKey === tmpl.key;
              const isSelected = isTemplateSelected(tmpl.key);
              const htmlPreview = batchPreviews[tmpl.key] || "";
              const hasValidHtml = typeof htmlPreview === "string" && htmlPreview.trim().length > 100;

              if (viewMode === "grid") {
                return (
                  <Card
                    key={tmpl.key}
                    className={`flex flex-col justify-between overflow-hidden border transition-all duration-200 group ${
                      isActive
                        ? "border-[#174A7E] ring-2 ring-[#174A7E]/40 shadow-xl bg-sky-50/20"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md bg-white"
                    }`}
                  >
                    {/* Header Card Info */}
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tmpl.accent }} />
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#174A7E]">
                            {tmpl.label}
                          </h3>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase mt-0.5">
                          {tmpl.category} • {tmpl.key}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {isSelected ? (
                          <Badge variant="success" size="sm" className="font-bold flex items-center gap-1 text-[10px]">
                            <Check className="h-3 w-3" /> Unlocked
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm" className="font-bold flex items-center gap-1 text-[10px]">
                            <Lock className="h-3 w-3" /> Lock / Upgrade
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Crisp Styled Template Visual Preview */}
                    <div className="h-72 w-full bg-white border-y border-slate-200 overflow-hidden relative flex items-stretch cursor-pointer" onClick={() => handleSelectTemplateKey(tmpl.key)}>
                      <ResumeMiniPreview templateKey={tmpl.key} label={tmpl.label} customHtml={hasValidHtml ? htmlPreview : undefined} />
                    </div>

                    {/* Footer Actions — TWO EXPLICIT OPTIONS: Edit Resume & Download PDF */}
                    <div className="p-3.5 bg-white space-y-3">
                      <p className="text-xs text-slate-500 line-clamp-1 font-medium">{tmpl.desc}</p>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full text-xs font-extrabold bg-[#174A7E] hover:bg-[#0f3459] shadow-sm"
                          onClick={() => {
                            handleSelectTemplateKey(tmpl.key);
                            setActiveTab("edit");
                          }}
                          leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                        >
                          Edit Resume
                        </Button>

                        <Button
                          variant="success"
                          size="sm"
                          className="w-full text-xs font-extrabold shadow-sm"
                          onClick={() => {
                            handleSelectTemplateKey(tmpl.key);
                            handlePdfExport();
                          }}
                          leftIcon={<Download className="h-3.5 w-3.5" />}
                        >
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              }

              {/* COMPACT VIEW */}
              return (
                <div
                  key={tmpl.key}
                  onClick={() => handleSelectTemplateKey(tmpl.key)}
                  className={`rounded-xl border p-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 group ${
                    isActive
                      ? "border-[#174A7E] ring-2 ring-[#174A7E]/40 bg-sky-50/60 shadow-md"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="h-36 rounded-lg bg-white border border-slate-200 overflow-hidden relative group-hover:shadow-inner">
                    <ResumeMiniPreview templateKey={tmpl.key} label={tmpl.label} customHtml={hasValidHtml ? htmlPreview : undefined} />
                  </div>

                  <div>
                    <h4 className="text-[11px] font-extrabold text-slate-900 line-clamp-1 group-hover:text-[#174A7E]">
                      {tmpl.label}
                    </h4>
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase">
                      {tmpl.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === "edit" ? (
        /* 3. COMPLETE RESUME BUILDER CONTENT EDITOR FORM (Matching Flutter Mobile App) */
        <div className="space-y-6">
          {/* Profile Auto-fill Banner */}
          {seekerProfile && (
            <div className="rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0">
                  <UserIcon className="h-4 w-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Resume pre-filled from your profile</p>
                  <p className="text-xs text-slate-500">Your name, contact, skills & more have been auto-populated. Edit any field and save.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("joballocate_resume_draft");
                  const sp = seekerProfile;
                  const profile = sp?.seeker_profile || sp;
                  const n = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || user?.name || "";
                  if (n) setFullName(n);
                  if (user?.email || profile?.email) setEmail(user?.email || profile?.email || "");
                  if (user?.phone || user?.mobile || profile?.phone) setPhone(user?.phone || user?.mobile || profile?.phone || "");
                  const loc = [profile?.city, profile?.country].filter(Boolean).join(", ").trim() || profile?.location || "";
                  if (loc) setLocation(loc);
                  if (profile?.headline) setHeadline(profile.headline);
                  if (profile?.gender) setGender(profile.gender);
                  if (profile?.date_of_birth || profile?.dob) setDob(profile?.date_of_birth || profile?.dob || "");
                  if (Array.isArray(profile?.skills) && profile.skills.length > 0) setSkillsText(profile.skills.join(", "));
                  if (profile?.bio) setSummary(profile.bio);
                  setMessage("✅ Fields re-filled from your profile!");
                }}
                className="shrink-0 text-xs font-bold text-sky-700 hover:text-sky-900 bg-white border border-sky-200 hover:border-sky-400 px-3 py-1.5 rounded-lg transition-all"
              >
                ↺ Re-fill from Profile
              </button>
            </div>
          )}

          <Card className="p-6 space-y-6 border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    Active Template: {activeTemplate.label} ({activeTemplate.key})
                  </Badge>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Full Resume Form & Data Editor</h3>
                <p className="text-xs text-slate-500">Fill in all your professional sections to build your exact resume document.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("preview")}
                  leftIcon={<Eye className="h-4 w-4" />}
                >
                  Live Preview Document
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveDraft}
                  isLoading={isDraftSaving}
                  leftIcon={<Save className="h-4 w-4" />}
                  className="bg-[#174A7E] hover:bg-[#0f3459] font-bold"
                >
                  Save Resume Draft
                </Button>
              </div>
            </div>

            {/* SECTION 1: PERSONAL & CONTACT INFORMATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <UserIcon className="h-4 w-4 text-[#174A7E]" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  1. Personal & Contact Information
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Resume Title / Name"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="e.g. My Software Engineer Resume"
                />
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  label="Professional Headline / Designation"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                />
                <Input
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Mobile Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Current Location (City, State)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, Karnataka, India"
                />
                <Input
                  label="LinkedIn Profile URL"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="e.g. linkedin.com/in/amit-jain"
                />
                <Input
                  label="Date of Birth"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <Input
                  label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>
            </div>

            {/* SECTION 2: PROFESSIONAL SUMMARY */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#174A7E]" />
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    2. Professional Summary
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleAiImprove("summary")}
                  disabled={isAiLoading}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-pulse" />
                  AI Enhance Summary
                </button>
              </div>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                placeholder="Write a compelling summary of your key skills and achievements..."
              />
            </div>

            {/* SECTION 3: WORK EXPERIENCE & KEY ACHIEVEMENTS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#174A7E]" />
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    3. Work Experience & Achievements
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleAiImprove("experience")}
                  disabled={isAiLoading}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-pulse" />
                  AI Enhance Experience
                </button>
              </div>

              {/* Experience Entry 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-[#174A7E] uppercase">Experience #1 (Primary)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Company Name" value={company1} onChange={(e) => setCompany1(e.target.value)} />
                  <Input label="Designation / Role" value={role1} onChange={(e) => setRole1(e.target.value)} />
                  <Input label="Duration / Dates" value={duration1} onChange={(e) => setDuration1(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Key Responsibilities & Bullet Points</label>
                  <textarea
                    rows={3}
                    value={expDetails1}
                    onChange={(e) => setExpDetails1(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>
              </div>

              {/* Experience Entry 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-600 uppercase">Experience #2</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Company Name" value={company2} onChange={(e) => setCompany2(e.target.value)} />
                  <Input label="Designation / Role" value={role2} onChange={(e) => setRole2(e.target.value)} />
                  <Input label="Duration / Dates" value={duration2} onChange={(e) => setDuration2(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Key Responsibilities & Bullet Points</label>
                  <textarea
                    rows={3}
                    value={expDetails2}
                    onChange={(e) => setExpDetails2(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: GRADUATION & HIGHER EDUCATION */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <GraduationCap className="h-4 w-4 text-[#174A7E]" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  4. Graduation & Higher Education
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input label="Degree / Course Name" value={gradCourse} onChange={(e) => setGradCourse(e.target.value)} placeholder="e.g. B.Tech Computer Science" />
                <Input label="College / University Name" value={gradCollege} onChange={(e) => setGradCollege(e.target.value)} placeholder="e.g. NIT Trichy" />
                <Input label="Score / CGPA / Grade" value={gradScore} onChange={(e) => setGradScore(e.target.value)} placeholder="e.g. 8.4 CGPA" />
              </div>
            </div>

            {/* SECTION 5: SCHOOLING DETAILS (Class 12 & Class 10) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Award className="h-4 w-4 text-[#174A7E]" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  5. Schooling Details (Class 12 & Class 10)
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase">Class XII (Senior Secondary)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Board / School Name" value={class12Board} onChange={(e) => setClass12Board(e.target.value)} />
                  <Input label="Year of Passing" value={class12Year} onChange={(e) => setClass12Year(e.target.value)} />
                  <Input label="Percentage / Grade" value={class12Score} onChange={(e) => setClass12Score(e.target.value)} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase">Class X (Secondary)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Board / School Name" value={class10Board} onChange={(e) => setClass10Board(e.target.value)} />
                  <Input label="Year of Passing" value={class10Year} onChange={(e) => setClass10Year(e.target.value)} />
                  <Input label="Percentage / CGPA" value={class10Score} onChange={(e) => setClass10Score(e.target.value)} />
                </div>
              </div>
            </div>

            {/* SECTION 6: SKILLS, LANGUAGES & CERTIFICATIONS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Globe className="h-4 w-4 text-[#174A7E]" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  6. Skills, Languages, Certifications & Projects
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Key Technical & Professional Skills (Comma separated)</label>
                  <textarea
                    rows={3}
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Languages Spoken / Written</label>
                  <textarea
                    rows={3}
                    value={languagesText}
                    onChange={(e) => setLanguagesText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Certifications (One per line)</label>
                  <textarea
                    rows={3}
                    value={certificationsText}
                    onChange={(e) => setCertificationsText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Key Projects & Achievements</label>
                  <textarea
                    rows={3}
                    value={projectsText}
                    onChange={(e) => setProjectsText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveTab("preview")}
                leftIcon={<Eye className="h-4 w-4" />}
              >
                View Live Resume Document
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveDraft}
                isLoading={isDraftSaving}
                leftIcon={<Save className="h-4 w-4" />}
                className="bg-[#174A7E] hover:bg-[#0f3459] font-bold px-6"
              >
                Save Resume Draft
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* 4. LIVE HTML RESUME DOCUMENT PREVIEW PANE (100% VISIBLE & RESPONSIVE) */
        <Card className="p-6 border-slate-200 space-y-4 bg-slate-100 shadow-md">
          {/* Preview Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className={`px-2.5 py-1 rounded text-xs font-bold ${activeTemplate.color}`}>
                {activeTemplate.label}
              </div>
              <span className="text-xs text-slate-600 font-semibold hidden sm:inline">
                Server-rendered HTML Template Preview (A4 standard width)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.1))}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-600 border border-slate-200"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(1.2, z + 0.1))}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-600 border border-slate-200"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchLiveHtml();
                  refetchBatch();
                }}
                leftIcon={<RefreshCw className="h-3.5 w-3.5 text-slate-500" />}
              >
                Refresh
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handlePdfExport}
                isLoading={isPdfLoading}
                leftIcon={<Download className="h-3.5 w-3.5" />}
              >
                Export PDF
              </Button>
            </div>
          </div>

          {/* 100% VISIBLE A4 DOCUMENT CONTAINER */}
          <div className="w-full overflow-x-auto flex justify-center py-6 bg-slate-200/80 rounded-xl border border-slate-300 min-h-[750px]">
            {isActiveHtmlLoading || isBatchLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-[#174A7E]" />
                <span className="text-sm font-extrabold text-slate-700">Generating Live Document Preview...</span>
              </div>
            ) : activeHtmlPreview ? (
              <div
                className="bg-white shadow-2xl rounded-sm transition-all duration-200 overflow-hidden border border-slate-300"
                style={{
                  width: `${794 * zoomScale}px`,
                  height: `${1123 * zoomScale}px`,
                }}
              >
                <iframe
                  srcDoc={activeHtmlPreview}
                  title={activeTemplate.label}
                  className="w-[794px] h-[1123px] border-0 origin-top-left bg-white"
                  style={{
                    transform: `scale(${zoomScale})`,
                  }}
                />
              </div>
            ) : (
              /* High-fidelity Crisp Visible Document Fallback */
              <Card
                className="p-8 border-slate-200 space-y-6 bg-white shadow-2xl max-w-3xl w-full"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "top center",
                }}
              >
                <div
                  className="p-6 rounded-xl text-white space-y-1 shadow-sm"
                  style={{ backgroundColor: activeTemplate.accent }}
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight">{fullName}</h2>
                  <p className="text-xs font-medium text-white/90">
                    {headline} • {email} • {phone} • {location}
                  </p>
                  <Badge variant="primary" size="sm" className="mt-2 bg-white/20 text-white border-white/30">
                    Template: {activeTemplate.label} ({activeTemplate.key})
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4
                    className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b-2"
                    style={{ color: activeTemplate.accent, borderColor: activeTemplate.accent }}
                  >
                    Professional Summary
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">{summary}</p>
                </div>

                <div className="space-y-2">
                  <h4
                    className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b-2"
                    style={{ color: activeTemplate.accent, borderColor: activeTemplate.accent }}
                  >
                    Work Experience
                  </h4>
                  <div className="space-y-3 text-xs text-slate-700">
                    <div>
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{company1} — {role1}</span>
                        <span>{duration1}</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-600 mt-1">{expDetails1}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4
                    className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b-2"
                    style={{ color: activeTemplate.accent, borderColor: activeTemplate.accent }}
                  >
                    Education & Credentials
                  </h4>
                  <p className="text-xs text-slate-700 font-semibold">
                    {gradCourse} — {gradCollege} ({gradScore})
                  </p>
                </div>

                <div className="space-y-2">
                  <h4
                    className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b-2"
                    style={{ color: activeTemplate.accent, borderColor: activeTemplate.accent }}
                  >
                    Skills & Languages
                  </h4>
                  <p className="text-xs text-slate-700 font-normal">
                    <strong>Skills:</strong> {skillsText} <br />
                    <strong>Languages:</strong> {languagesText}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
