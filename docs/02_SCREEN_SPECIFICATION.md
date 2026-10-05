# JobAllocate Screen Specification & UI Inventory

> **Document Version:** 1.0.0
> **Target Production System:** JobAllocate (`jobfrontend-main/`)

---

## 1. Complete Screen Catalog

### 1.1 Splash Screen
- **Flutter File:** `lib/screens/splash_screen.dart`
- **Route:** `/` (Initial boot route)
- **Role:** Public / All
- **Purpose:** Restores persisted `app_session_token` and `app_session_user_json` from SharedPreferences. Checks biometric state if enabled.
- **UI Elements:** Centered JobAllocate logo (`#174A7E`), circular loading indicator, version text.
- **Navigation:**
  - If valid token & `role == "job_seeker"` → `JobSeekerHomeScreen`
  - If valid token & `role == "company"` → `EmployerHomeScreen`
  - If session invalid or missing → `RoleSelectionScreen`

### 1.2 Role Selection Screen
- **Flutter File:** `lib/main.dart`
- **Route:** `/role_selection`
- **Role:** Public / Unauthenticated
- **Purpose:** Initial portal choice between Candidate and Employer login/registration.
- **UI Elements:** Dual card selection ("I'm a Job Seeker" vs "I'm an Employer"), JobAllocate brand header.
- **Navigation:**
  - Candidate tap → `JobSeekerOtpLoginScreen`
  - Employer tap → `EmployerOtpLoginScreen`

### 1.3 Candidate Login Screen (`JobSeekerOtpLoginScreen`)
- **Flutter File:** `lib/screens/auth/job_seeker_otp_login.dart`
- **Route:** `/seeker_login`
- **Role:** Public / Unauthenticated
- **Purpose:** Mobile number login for job seekers. Supports Mobile + Password or Mobile + SMS OTP.
- **UI Elements:** Mobile input (`+91`), Password input, "Login via SMS OTP" button, "Forgot Password?" link, "Create Account" link.
- **API Call:** `POST /api/v1/auth/login` (Body: `{ identifier, password, role: "job_seeker" }`)
- **Navigation:** Success → `JobSeekerHomeScreen`

### 1.4 Employer Login Screen (`EmployerOtpLoginScreen`)
- **Flutter File:** `lib/screens/auth/employer_otp_login.dart`
- **Route:** `/employer_login`
- **Role:** Public / Unauthenticated
- **Purpose:** Mobile number login for employers/companies.
- **UI Elements:** Mobile input (`+91`), Password input, "Login via SMS OTP" button, GST login help.
- **API Call:** `POST /api/v1/auth/login` (Body: `{ identifier, password, role: "company" }`)
- **Navigation:** Success → `EmployerHomeScreen`

### 1.5 Registration Screen (`RegisterScreen`)
- **Flutter File:** `lib/screens/auth/register_screen.dart`
- **Route:** `/register`
- **Role:** Public / Unauthenticated
- **Purpose:** Mobile phone registration with Firebase SMS OTP verification.
- **UI Elements:** Name input, Email input, Mobile number input, Role selector tabs, Firebase OTP verification dialog.
- **API Call:** `POST /api/v1/auth/firebase-authenticate`
- **Navigation:** Seeker → `JobSeekerOnboardingScreen`; Employer → `EmployerHomeScreen`

### 1.6 Forgot Password Screen (`ForgotPasswordScreen`)
- **Flutter File:** `lib/screens/auth/forgot_password_screen.dart`
- **Route:** `/forgot_password`
- **Role:** Public / Unauthenticated
- **Purpose:** Password reset via mobile SMS OTP validation.
- **API Call:** `POST /api/v1/auth/reset-password`
- **Navigation:** Success → `JobSeekerOtpLoginScreen` / `EmployerOtpLoginScreen`

### 1.7 Candidate Home Shell (`JobSeekerHomeScreen`)
- **Flutter File:** `lib/screens/job_seeker/job_seeker_home.dart`
- **Route:** `JobSeekerHomeScreen.routeName` (`/seeker_home`)
- **Role:** `job_seeker`
- **Purpose:** Candidate primary shell with Bottom Navigation (Home, Jobs, Resume Studio, Profile) and Navigation Drawer.
- **UI Elements:** Top app bar with notification bell (unread counter), search widget, banner carousel, popular categories, handpicked fresh jobs grid.

### 1.8 Candidate Onboarding Wizard (`JobSeekerOnboardingScreen`)
- **Flutter File:** `lib/screens/job_seeker/job_seeker_onboarding_screen.dart`
- **Route:** `/seeker_onboarding`
- **Role:** `job_seeker`
- **Purpose:** 4-step candidate profile completion:
  - Step 1: Personal Info (Name, Gender, DOB, Location)
  - Step 2: Professional Details (Headline, Experience, Expected Salary in ₹/INR, Current Salary)
  - Step 3: Skills & Bio
  - Step 4: Resume PDF Upload (`POST /api/v1/job-seeker/profile/resume`)

### 1.9 Job Detail Screen (`JobDetailScreen`)
- **Flutter File:** `lib/screens/job_seeker/job_detail_screen.dart`
- **Route:** `/job_detail`
- **Role:** All / `job_seeker`
- **Purpose:** Full position overview, company verification badge, requirements, salary in **₹ / INR**, save toggle, and apply button.
- **API Calls:** `GET /api/v1/jobs/{id}`, `POST /api/v1/job-seeker/jobs/{id}/apply`

### 1.10 My Applications Screen (`MyApplicationsScreen`)
- **Flutter File:** `lib/screens/job_seeker/my_applications_screen.dart`
- **Route:** `/my_applications`
- **Role:** `job_seeker`
- **Purpose:** List of candidate's submitted job applications with real-time status badges (`applied`, `shortlisted`, `interview`, `rejected`, `hired`).
- **API Calls:** `GET /api/v1/job-seeker/applications`, `DELETE /api/v1/job-seeker/applications/{id}`

### 1.11 Saved Jobs Screen (`SavedJobsScreen`)
- **Flutter File:** `lib/screens/job_seeker/saved_jobs_screen.dart`
- **Route:** `/saved_jobs`
- **Role:** `job_seeker`
- **Purpose:** List of bookmarked job postings.
- **API Calls:** `GET /api/v1/job-seeker/saved-jobs`, `POST /api/v1/job-seeker/jobs/{id}/save`

### 1.12 Employer Dashboard (`EmployerDashboardPage`)
- **Flutter File:** `lib/screens/employer/employer_dashboard_page.dart`
- **Route:** `/employer_dashboard`
- **Role:** `company`
- **Purpose:** Active listings table, total candidate application counts, listing views, and quick link to `PostJobScreen`.
- **API Calls:** `GET /api/v1/company/job-posts`

### 1.13 Post Job Screen (`PostJobScreen`)
- **Flutter File:** `lib/screens/employer/post_job_screen.dart`
- **Route:** `/post_job`
- **Role:** `company`
- **Purpose:** Form to publish or edit a job opening.
- **Fields:** Title, Category, Employment Type, Location, Min Salary (₹), Max Salary (₹), Description, Requirements, Urgent toggle.
- **API Call:** `POST /api/v1/company/job-posts`

### 1.14 Manage Applications Screen (`ManageApplicationsScreen`)
- **Flutter File:** `lib/screens/employer/manage_applications_screen.dart`
- **Route:** `/manage_applications`
- **Role:** `company`
- **Purpose:** Review candidate applications for a specific job, view cover letters, download resumes, and update status (`shortlisted`, `rejected`, `hired`).
- **API Calls:** `GET /api/v1/company/job-posts/{id}/applications`, `PATCH /api/v1/company/job-posts/{jId}/applications/{aId}`
