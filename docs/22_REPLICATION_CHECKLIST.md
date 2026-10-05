# JobAllocate Complete Replication Checklist

> **Document Version:** 1.0.0

---

## 1. Replication Checklist

### Authentication
- [x] Role Selection Screen (`JobSeeker` vs `Employer`)
- [x] Candidate Login (Mobile + Password / Mobile + SMS OTP)
- [x] Employer Login (Mobile + Password / Mobile + SMS OTP)
- [x] Mobile Registration + Firebase SMS OTP Payload (`POST /auth/firebase-authenticate`)
- [x] Forgot Password Reset via SMS OTP (`POST /auth/reset-password`)
- [x] Sanctum Bearer Token Session Persistence & Auto-Restoration

### Job Seeker Experience
- [x] Candidate Onboarding Wizard (4 Steps: Personal, Professional, Skills, Resume PDF)
- [x] Main Home Feed & Popular Categories Browser
- [x] Jobs Search & Multi-Facet Filtering (Keywords, Location, Category, Job Type)
- [x] Job Details Page with Salary displayed strictly in **Indian Rupees (`₹` / `INR`)**
- [x] 1-Click Job Application Modal with Cover Letter & Resume PDF Upload
- [x] My Applications Real-Time Status Tracker (`applied`, `shortlisted`, `rejected`, `hired`)
- [x] Saved / Bookmarked Jobs Page
- [x] Seeker Resume Studio with 20+ Templates, HTML Preview & AI Bullet Assist
- [x] Candidate Profile Edit & Salary Expectation Settings in **₹ / INR**

### Employer Experience
- [x] Employer Dashboard & Active Listings Overview
- [x] Job Posting Form with Salary Min/Max in **₹ / INR** (`POST /company/job-posts`)
- [x] Candidate Applicants Pipeline Review & Status Updates (`shortlisted`, `rejected`, `hired`)
- [x] Employer Company Profile & GST Verification Details

### Platform & Technical Parity
- [x] Direct API Connection to Production Backend (`https://joballocate.tech/api/v1`)
- [x] Zero USD (`$`) Displays — Strict Indian Rupee (`₹` / `INR`) formatting
- [x] Responsive Next.js Web Design matching JobAllocate Brand Tokens (`#174A7E`, Plus Jakarta Sans)
- [x] 100% Clean Production Build Pass (`0 TypeScript errors`)
