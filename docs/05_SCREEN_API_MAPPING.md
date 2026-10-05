# JobAllocate Screen to API Mapping Bible

> **Document Version:** 1.0.0

---

## 1. Authentication & Session Screens

| Screen Name | Trigger Action | Executed API Call | Request Payload | Resulting UI State Change |
|---|---|---|---|---|
| `JobSeekerOtpLoginScreen` | Submit Form | `POST /auth/login` | `{ identifier, password, role: "job_seeker" }` | Store Sanctum token & navigate to `JobSeekerHomeScreen` |
| `EmployerOtpLoginScreen` | Submit Form | `POST /auth/login` | `{ identifier, password, role: "company" }` | Store Sanctum token & navigate to `EmployerHomeScreen` |
| `RegisterScreen` | Submit OTP | `POST /auth/firebase-authenticate` | `{ id_token, role, name, email }` | Creates user record & opens onboarding wizard |
| `ForgotPasswordScreen` | Submit Reset | `POST /auth/reset-password` | `{ mobile, otp, password }` | Resets account password & redirects to login |

---

## 2. Job Seeker Screens

| Screen Name | Trigger Action | Executed API Call | Request Payload | Resulting UI State Change |
|---|---|---|---|---|
| `JobSeekerHomeScreen` | Screen Load | `GET /jobs` & `GET /seeker-home-popular-categories` | Query: `per_page=15` | Populates hero banner, category pills, & jobs grid |
| `JobSeekerOnboardingScreen` | Step 4 Submit | `PUT /job-seeker/profile` & `POST /job-seeker/profile/resume` | Profile JSON & PDF Multipart | Completes candidate profile & opens home |
| `JobDetailScreen` | Screen Load | `GET /jobs/{id}` | None | Displays full requirements, salary in ₹, & company details |
| `JobDetailScreen` | Click Apply | `POST /job-seeker/jobs/{id}/apply` | Cover letter text & optional resume file | Submits candidate application & shows confirmation modal |
| `MyApplicationsScreen` | Screen Load | `GET /job-seeker/applications` | None | Displays applications list with real-time status badges |
| `MyApplicationsScreen` | Click Withdraw | `DELETE /job-seeker/applications/{id}` | None | Removes application from candidate dashboard |
| `SavedJobsScreen` | Screen Load | `GET /job-seeker/saved-jobs` | None | Displays bookmarked positions list |
| `SavedJobsScreen` | Toggle Bookmark | `POST /job-seeker/jobs/{id}/save` | None | Toggles bookmark state & refetches list |

---

## 3. Employer Screens

| Screen Name | Trigger Action | Executed API Call | Request Payload | Resulting UI State Change |
|---|---|---|---|---|
| `EmployerDashboardPage` | Screen Load | `GET /company/job-posts` | Query: `page=1` | Displays active job listings & application count metrics |
| `PostJobScreen` | Submit Form | `POST /company/job-posts` | Job posting payload in ₹ (INR) | Publishes job opening & redirects to dashboard |
| `ManageApplicationsScreen` | Screen Load | `GET /company/job-posts/{id}/applications` | None | Displays candidate applications table |
| `ManageApplicationsScreen` | Click Action | `PATCH /company/job-posts/{jId}/applications/{aId}` | `{ status: "shortlisted" \| "rejected" }` | Updates candidate application status badge |
| `EmployerProfileScreen` | Submit Form | `PUT /company/profile` | Company profile JSON | Updates company details & GST verification status |
