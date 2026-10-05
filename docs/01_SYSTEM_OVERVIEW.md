# JobAllocate System Overview & Architecture Bible

> **Document Version:** 1.0.0
> **Target Production System:** JobAllocate (`jobfrontend-main/` & `backend/`)
> **Production API Origin:** `https://joballocate.tech/api/v1`

---

## 1. Executive Summary

**JobAllocate** is an end-to-end two-sided career marketplace platform engineered for the Indian employment landscape. It bridges **Job Seekers** (Candidates searching for positions, creating resumes, and applying) and **Employers** (Companies posting job openings, reviewing candidates, and acquiring subscription packages).

### Core Client-Server Relationship
```text
 ┌─────────────────────────────────┐        ┌─────────────────────────────────┐
 │   Existing Flutter Mobile App   │        │     New Next.js Web App         │
 │     (iOS & Android Clients)     │        │    (Desktop & Mobile Browsers)  │
 └────────────────┬────────────────┘        └────────────────┬────────────────┘
                  │                                          │
                  └────────────────────┬─────────────────────┘
                                       │ HTTPS / JSON / Multipart
                                       ▼
                       ┌──────────────────────────────┐
                       │   Production REST API (v1)   │
                       │  https://joballocate.tech/   │
                       └───────────────┬──────────────┘
                                       │
                                       ▼
                       ┌──────────────────────────────┐
                       │   Laravel 10+ Backend (PHP)   │
                       │    (Sanctum Bearer Auth)     │
                       └───────────────┬──────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                         ▼                           ▼
                 ┌───────────────┐           ┌───────────────┐
                 │ MySQL 8.0 DB  │           │ Firebase Auth │
                 │  (Production) │           │  & Messaging  │
                 └───────────────┘           └───────────────┘
```

---

## 2. Platform User Roles & Permissions

| Role Identifier | System Role Name | Access Scope & Capabilities | Primary Auth Route |
|---|---|---|---|
| `job_seeker` | Job Seeker (Candidate) | Search/browse jobs, 1-click apply, saved jobs, HTML/PDF resume studio, career prep, AI coach, profile management | `POST /api/v1/auth/firebase-authenticate` or `POST /auth/login` |
| `company` | Employer (Company) | Post job openings, manage applicant pipeline (shortlist, reject, hire), view GST status, purchase subscription plans | `POST /api/v1/auth/login` (Role: `company`) |
| `super_admin` | Super Admin | Admin dashboard analytics, job post moderation, company GST verification, user moderation (Backend only) | `POST /api/v1/admin/*` |

---

## 3. Technology Stack & External Services

| Component | Production Technology | Details & Notes |
|---|---|---|
| **Mobile Frontend** | Flutter 3.x (Dart SDK ^3.11.0) | `package:http`, Provider + Riverpod state |
| **Web Frontend** | Next.js 15+ (React, TypeScript, Tailwind CSS) | App Router, TanStack Query v5, Axios |
| **Backend Engine** | Laravel 10+ (PHP 8.2+) | Sanctum Bearer Token Middleware |
| **Database** | MySQL 8.0 | InnoDB tables, foreign key constraints |
| **Primary Authentication** | Mobile Phone SMS OTP + Sanctum | Firebase Auth (Phone OTP) + Sanctum Tokens |
| **Payment Gateway** | Cashfree Gateway Integration | INR (₹) transactions for packages & PDF exports |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Token registration via `POST /device-token` |
| **Resume Builder** | Useresume.ai API + HTML Renderer | 20+ HTML templates with AI text enhancement |
| **AI Assistant** | OpenRouter / Custom AI Engine | `POST /api/v1/ai/chat` & `/job-seeker/resume/ai-assist` |

---

## 4. Primary Business Rules
1. **Mobile-First Identity**: Every user account is bound to a verified 10-digit Indian Mobile Number (`+91`).
2. **Indian Currency Mandate**: All monetary amounts (salaries, credit packages, resume export fees) display in **Indian Rupees (`₹` / `INR`)** with `en-IN` formatting (`₹1,00,000` / `₹50,000`).
3. **Credit & Subscription Monetization**: Job applications and resume exports consume credits purchased via Cashfree gateway.
