# JobAllocate Complete Production Audit

> **Audit Date:** September 24, 2026
> **Target Systems:** Production Flutter App (`jobfrontend-main/`), Production Backend (`backend/`)
> **Production Base API URL:** `https://joballocate.tech/api/v1`
> **Primary Purpose:** Blueprint for identical, zero-discrepancy Web Replication.

---

## 1. Product Overview

**JobAllocate** is a two-sided job marketplace platform connecting **Job Seekers** (Candidates) and **Employers** (Companies/Recruiters) across India.

### Key Product Pillars
1. **Job Seekers (`job_seeker`)**: Mobile OTP authentication, multi-step profile onboarding, resume builder (20+ HTML templates, AI text improvement, PDF rendering), job browsing/searching, 1-click apply, saved jobs, application status tracking, career preparation feed, AI career coach.
2. **Employers (`company`)**: Company registration (GST number, contact verification), job posting (draft, review, published, closed), applicant candidate review (shortlist, reject, notes), company subscriptions via Cashfree.
3. **Monetisation / Credits**: Credit-based application packages and resume export purchases handled through Cashfree gateway integration.

---

## 2. Complete Flutter Structure

Repository structure of `jobfrontend-main/`:

```text
jobfrontend-main/
├── pubspec.yaml
├── lib/
│   ├── main.dart                          # App entry point, session restoration, initial routing
│   ├── constants/
│   │   ├── app_colors.dart                # Design tokens (#174A7E Primary, #E53E3E Alert, etc.)
│   │   ├── app_constants.dart             # API URLs, shared storage keys
│   │   └── api_endpoints.dart             # Production REST API endpoints
│   ├── models/
│   │   ├── user.dart                      # User, JobSeekerProfile, EmployerProfile
│   │   ├── job.dart                       # Job, JobApplication, Company models
│   │   ├── resume.dart                    # Resume drafts, template schemas
│   │   ├── banner.dart                    # Promotional banners
│   │   ├── saved_job.dart                 # Bookmarked metadata
│   │   └── subscription.dart             # Employer & Seeker package catalogs
│   ├── services/
│   │   ├── api_service.dart               # Base HTTP client with Bearer auth headers
│   │   ├── auth_service.dart              # Login, Firebase OTP, Sanctum session management
│   │   ├── notification_api_service.dart  # In-app inbox & FCM token registration
│   │   ├── fcm_flutter_service.dart       # Push notification handlers
│   │   └── app_session.dart               # SharedPreference token & role persistence
│   └── screens/
│       ├── splash_screen.dart             # Session restoration & biometric check
│       ├── auth/
│       │   ├── job_seeker_otp_login.dart  # Seeker mobile + OTP/password login
│       │   ├── employer_otp_login.dart    # Employer mobile + OTP/password login
│       │   ├── register_screen.dart       # Seeker/Employer mobile registration with Firebase OTP
│       │   └── forgot_password_screen.dart # Password reset via SMS OTP
│       ├── job_seeker/
│       │   ├── job_seeker_home.dart       # Main tab shell & bottom navigation
│       │   ├── job_seeker_onboarding_screen.dart # Profile onboarding wizard
│       │   ├── job_seeker_profile.dart    # View/edit candidate profile
│       │   ├── job_detail_screen.dart     # Full job details & application trigger
│       │   ├── saved_jobs_screen.dart     # Bookmarked jobs
│       │   ├── my_applications_screen.dart# Applied positions & status tracking
│       │   ├── fresh_jobs_screen.dart     # Recently posted positions
│       │   ├── category_browse_screen.dart# Industry category browser
│       │   ├── seeker_resume_studio_screen.dart # Resume builder & HTML preview
│       │   └── career_prep/               # Articles, interview Q&A, AI coach
│       ├── employer/
│       │   ├── employer_home.dart         # Employer bottom nav shell
│       │   ├── employer_dashboard_page.dart# Active listings & stats metrics
│       │   ├── post_job_screen.dart       # Publish/edit job opening
│       │   ├── manage_applications_screen.dart # Candidate pipelines & status updates
│       │   └── employer_profile_screen.dart# Company profile management
│       ├── notifications/
│       │   └── notification_inbox_page.dart # In-app inbox
│       └── common/
│           ├── ai_chat_screen.dart        # AI Chat assistant
│           ├── refer_and_earn_screen.dart # Referral program
│           └── legal_webview_screen.dart  # Terms & Privacy policies
```

---

## 3. Complete Screen Inventory

| Screen Name | Flutter File Path | Purpose | Access Control | Primary Action / Navigation |
|---|---|---|---|---|
| `SplashScreen` | `lib/screens/splash_screen.dart` | Restores `app_session_token`, validates session, routes based on role | Public | Navigates to `JobSeekerHomeScreen`, `EmployerHomeScreen`, or `RoleSelectionScreen` |
| `RoleSelectionScreen` | `lib/main.dart` | Allows initial choice between Seeker and Employer portal | Public | Directs to `JobSeekerOtpLoginScreen` or `EmployerOtpLoginScreen` |
| `JobSeekerOtpLoginScreen` | `lib/screens/auth/job_seeker_otp_login.dart` | Mobile + Password or Mobile + OTP login for Candidates | Public | Navigates to `JobSeekerHomeScreen` on success |
| `EmployerOtpLoginScreen` | `lib/screens/auth/employer_otp_login.dart` | Mobile + Password or Mobile + OTP login for Employers | Public | Navigates to `EmployerHomeScreen` on success |
| `RegisterScreen` | `lib/screens/auth/register_screen.dart` | Mobile phone registration + Firebase SMS OTP verification | Public | Directs Seekers to `JobSeekerOnboardingScreen` and Employers to `EmployerHomeScreen` |
| `ForgotPasswordScreen` | `lib/screens/auth/forgot_password_screen.dart` | Password reset using SMS OTP verification | Public | Resets password & auto-logs in user |
| `JobSeekerHomeScreen` | `lib/screens/job_seeker/job_seeker_home.dart` | Candidate home tab shell (Home, Jobs, Resume, Profile) | `job_seeker` | Bottom nav tab switching & drawer navigation |
| `JobSeekerOnboardingScreen` | `lib/screens/job_seeker/job_seeker_onboarding_screen.dart` | Multi-step candidate profile wizard | `job_seeker` | Saves profile & opens `JobSeekerHomeScreen` |
| `JobDetailScreen` | `lib/screens/job_seeker/job_detail_screen.dart` | Single job overview, requirements, salary in INR (₹) | All / `job_seeker` | Triggers job application flow |
| `MyApplicationsScreen` | `lib/screens/job_seeker/my_applications_screen.dart` | List of submitted job applications with real-time status | `job_seeker` | Opens single application detail / withdraw option |
| `SavedJobsScreen` | `lib/screens/job_seeker/saved_jobs_screen.dart` | Bookmarked job postings list | `job_seeker` | Save/unsave toggle & job details navigation |
| `EmployerHomeScreen` | `lib/screens/employer/employer_home.dart` | Employer navigation shell (Dashboard, Post Job, Profile) | `company` | Bottom navigation tab switching |
| `EmployerDashboardPage` | `lib/screens/employer/employer_dashboard_page.dart` | Metrics (Active Jobs, Applicants) & job posts list | `company` | Quick link to `PostJobScreen` & candidate management |
| `PostJobScreen` | `lib/screens/employer/post_job_screen.dart` | Form to publish or edit a job listing | `company` | Submits `POST /api/v1/company/job-posts` |
| `ManageApplicationsScreen` | `lib/screens/employer/manage_applications_screen.dart` | Candidate pipeline management | `company` | Update status (`shortlisted`, `rejected`, `hired`) |

---

## 4. Complete Navigation Map

```text
Application Launch
        │
   SplashScreen (Check AppSession token in SharedPreferences)
        │
 ┌──────┴────────────────────────────────────────┐
 │ Token valid?                                  │ Token missing / invalid
 ▼                                               ▼
Check User Role                         RoleSelectionScreen
 ├─ role == "job_seeker" ──► JobSeekerHomeScreen    ├─ "I'm a Job Seeker" ─► JobSeekerOtpLoginScreen
 └─ role == "company"    ──► EmployerHomeScreen     └─ "I'm an Employer"   ─► EmployerOtpLoginScreen
                                                            │
                                                     RegisterScreen (Select Seeker / Employer)
                                                            │
                                                  Firebase Mobile SMS OTP
                                                            │
                                              JobSeekerOnboardingScreen (if Seeker)
                                                            │
                                                  JobSeekerHomeScreen / EmployerHomeScreen
```

---

## 5. Authentication & Account Lifecycle

- **Mobile-First Authentication**: Account identities are keyed on **Indian 10-digit Mobile Numbers** (with optional `+91` prefix).
- **Dual Login Methods**:
  1. **Mobile Number + Password**: Handled via `POST /api/v1/auth/login`.
  2. **Mobile Number + Firebase SMS OTP**: Handled via `POST /api/v1/auth/firebase-authenticate`.
- **Sanctum Bearer Token**: Upon login/registration, backend returns Sanctum token:
  ```json
  {
    "success": true,
    "data": {
      "token": "123|abcdef...",
      "user": {
        "id": 101,
        "name": "Candidate Name",
        "email": "user@example.com",
        "phone": "+919876543210",
        "role": "job_seeker"
      }
    }
  }
  ```
- **Header Structure**: All authenticated REST calls pass `Authorization: Bearer <token>` with `Accept: application/json`.
- **Session Termination**: `POST /api/v1/auth/logout` revokes the current Sanctum token, unregisters FCM device tokens, and clears local session storage.

---

## 6. Account Creation & OTP System

1. **Step 1 — Field Input**: Mobile number, full name, role (`job_seeker` or `company`), email, city, state, district.
2. **Step 2 — Firebase Phone Verification**: App triggers SMS OTP code verification to the provided mobile number.
3. **Step 3 — OTP Payload Delivery**: Client calls `POST /api/v1/auth/firebase-authenticate` passing `id_token` and initial profile fields.
4. **Step 4 — Password Set**: First-time password set via `POST /api/v1/auth/set-password`.
5. **Resend Timer & Rate Limiting**: 60-second cooldown timer for SMS OTP resend requests.

---

## 7. Onboarding Audit

1. **Candidate Onboarding (`JobSeekerOnboardingScreen`)**:
   - **Step 1: Personal Info**: Full name, gender (`Male`, `Female`, `Other`), date of birth, location/city.
   - **Step 2: Professional Details**: Headline/designation, total experience years, expected salary (in ₹ / INR), current salary.
   - **Step 3: Skills & Bio**: Skill tags list, personal bio overview.
   - **Step 4: Resume PDF**: Upload resume PDF document (`POST /api/v1/job-seeker/profile/resume`).
2. **Employer Onboarding**:
   - Company name, contact person name, industry category, GST number, company website, company description, city/state.

---

## 8. User Roles

| Role Key | App Display Name | Capabilities |
|---|---|---|
| `job_seeker` | Job Seeker | Browse jobs, 1-click apply, build resume, track applications, save jobs, access career prep & AI coach |
| `company` | Employer / Company | Post job listings, manage candidate pipelines, update application statuses, purchase company subscriptions |
| `super_admin` | Super Admin | Backend moderation, approval of job postings, user suspension, analytics (Backend API only) |

---

## 9. Complete API Inventory

| Method | Endpoint | Purpose | Authentication | Headers | Request Payload | Response Data |
|---|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Mobile + password login | Public | `Accept: application/json` | `{ "identifier": "9876543210", "password": "...", "role": "job_seeker" }` | `{ "success": true, "data": { "token", "user" } }` |
| `POST` | `/api/v1/auth/firebase-authenticate` | Mobile SMS OTP login/signup | Public | `Accept: application/json` | `{ "id_token": "...", "role": "job_seeker", "name", "email" }` | `{ "success": true, "data": { "token", "user" } }` |
| `POST` | `/api/v1/auth/logout` | Revoke Sanctum Bearer token | Bearer Token | `Authorization: Bearer <token>` | Empty | `{ "success": true, "message": "Logged out successfully" }` |
| `GET` | `/api/v1/me` | Fetch active user session profile | Bearer Token | `Authorization: Bearer <token>` | None | `{ "success": true, "data": { "user" } }` |
| `GET` | `/api/v1/jobs` | Public jobs catalog search | Public / Optional | `Accept: application/json` | Query params: `search`, `location`, `industry_type`, `page` | `{ "success": true, "data": [ Job ] }` |
| `GET` | `/api/v1/jobs/{id}` | Single job details | Public / Optional | `Accept: application/json` | None | `{ "success": true, "data": Job }` |
| `GET` | `/api/v1/seeker-home-popular-categories` | Home screen category list | Public | `Accept: application/json` | None | `{ "success": true, "data": [ Category ] }` |
| `POST` | `/api/v1/job-seeker/jobs/{jobId}/apply` | Apply to position | Bearer (`job_seeker`) | `Authorization: Bearer <token>` | `FormData` with `cover_letter`, optional `resume` | `{ "success": true, "message": "Applied successfully" }` |
| `GET` | `/api/v1/job-seeker/applications` | Candidate applications list | Bearer (`job_seeker`) | `Authorization: Bearer <token>` | Query params: `page` | `{ "success": true, "data": [ JobApplication ] }` |
| `POST` | `/api/v1/job-seeker/jobs/{jobId}/save` | Bookmark job position | Bearer (`job_seeker`) | `Authorization: Bearer <token>` | None | `{ "success": true }` |
| `GET` | `/api/v1/job-seeker/saved-jobs` | List bookmarked jobs | Bearer (`job_seeker`) | `Authorization: Bearer <token>` | None | `{ "success": true, "data": [ Job ] }` |
| `GET` | `/api/v1/company/job-posts` | List employer's posted jobs | Bearer (`company`) | `Authorization: Bearer <token>` | Query params: `page` | `{ "success": true, "data": [ Job ] }` |
| `POST` | `/api/v1/company/job-posts` | Publish new job post | Bearer (`company`) | `Authorization: Bearer <token>` | `{ "title", "employment_type", "location", "salary_min", "salary_max", "description" }` | `{ "success": true, "data": Job }` |
| `GET` | `/api/v1/company/job-posts/{id}/applications` | List applicants for job | Bearer (`company`) | `Authorization: Bearer <token>` | None | `{ "success": true, "data": [ JobApplication ] }` |
| `PATCH` | `/api/v1/company/job-posts/{jobId}/applications/{appId}` | Update applicant status | Bearer (`company`) | `Authorization: Bearer <token>` | `{ "status": "shortlisted" \| "rejected" \| "hired", "employer_note" }` | `{ "success": true }` |

---

## 10. Data Models

### Job (`models/job.dart`)
```typescript
interface Job {
  id: number | string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  company_name?: string;
  company?: { name: string; company_logo_url?: string };
  employment_type?: string; // "Full-time", "Part-time", "Remote", "Contract"
  experience_level?: string;
  industry_type?: string;
  salary_min?: number | string;
  salary_max?: number | string;
  salary_period?: string; // "month", "year"
  location?: string;
  city?: string;
  is_urgent?: boolean;
  is_featured?: boolean;
  status?: "draft" | "pending_review" | "published" | "closed";
  published_at?: string;
  created_at: string;
}
```

### JobApplication (`models/job.dart`)
```typescript
interface JobApplication {
  id: number | string;
  job_post_id: number | string;
  user_id: number | string;
  status: "applied" | "shortlisted" | "interview" | "rejected" | "hired";
  cover_letter?: string;
  employer_note?: string;
  applied_at: string;
  job_post?: Job;
  seeker?: User;
}
```

---

## 11. Money / Currency Specification (Strict Indian Rupees ₹ / INR)

- **Currency Unit**: **Indian Rupee (`₹` / `INR`)**.
- **Rule**: USD (`$`) MUST NOT be used for monetary values anywhere in JobAllocate.
- **Salary Formatting**:
  - Example: `₹25,000 - ₹50,000 / month`
  - Example: `₹6,000,000 - ₹12,00,000 / year` (formatted via `en-IN` locale formatting `Intl.NumberFormat('en-IN')`).
- **Payments**: Packages and credit purchases handled in INR via Cashfree gateway.

---

## 12. Existing Brand Assets & Design Tokens

- **Primary Color**: `#174A7E` (JobAllocate Deep Blue)
- **Primary Hover / Dark**: `#0F2C4D`
- **Secondary Accent**: `#0284C7` / `#38BDF8` (Sky Blue)
- **Alert / Danger**: `#E53E3E` / `#EF4444`
- **Success / Emerald**: `#16A34A` / `#22C55E`
- **Light Background**: `#F8FAFC`
- **Typography**: Google Fonts — **Plus Jakarta Sans** / system sans-serif.

---

## 13. Flutter → Web Feature Mapping Table

| Existing Flutter Feature | Flutter File Path | Existing Product Behavior | API Endpoint | Planned Web Equivalent |
|---|---|---|---|---|
| Role Selection | `main.dart` | Switch between Candidate and Employer portal | N/A | Landing page role switcher & navigation tabs |
| Mobile OTP Auth | `screens/auth/job_seeker_otp_login.dart` | Enter mobile phone + SMS OTP verification | `POST /auth/firebase-authenticate` | Mobile OTP & Password login page (`/login`) |
| Candidate Onboarding | `screens/job_seeker/job_seeker_onboarding_screen.dart` | Multi-step form (personal, skills, salary, resume PDF) | `PUT /job-seeker/profile` | Candidate Onboarding wizard modal/page |
| Job Directory & Search | `screens/job_seeker/job_seeker_home.dart` | Search keywords, location filter, industry category browser | `GET /jobs` | Jobs directory page with filter sidebar (`/jobs`) |
| Job Details & Apply | `screens/job_seeker/job_detail_screen.dart` | View role description, salary in ₹ (INR), submit cover letter | `POST /job-seeker/jobs/{id}/apply` | Job detail page & `JobApplyModal` component (`/jobs/[id]`) |
| My Applications | `screens/job_seeker/my_applications_screen.dart` | Real-time status list (`applied`, `shortlisted`, `rejected`) | `GET /job-seeker/applications` | Candidate dashboard applications tracker (`/seeker/dashboard`) |
| Employer Post Job | `screens/employer/post_job_screen.dart` | Form to specify title, salary in ₹, location, category | `POST /company/job-posts` | Employer Job Posting page (`/employer/post-job`) |
| Candidate Management | `screens/employer/manage_applications_screen.dart` | Update candidate status (`shortlisted`, `rejected`), download resume | `PATCH /company/job-posts/{jId}/applications/{aId}` | Employer applicants management page (`/employer/applicants`) |

---

## 14. Open Questions / Unconfirmed Items

1. **CORS Handling for Web Origin**: Ensure the production backend Laravel server headers allow `Access-Control-Allow-Origin: *` or specific web domain origins for Axios requests.
2. **Third-Party Payment SDK**: Web Cashfree integration requires Cashfree Web JS SDK loading vs native Flutter SDK.

---

### PHASE 1 IS COMPLETE.
This document represents the full read-only audit of the production JobAllocate system. Web development (Phase 2) will proceed upon explicit user confirmation.
