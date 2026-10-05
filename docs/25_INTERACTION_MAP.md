# JobAllocate Complete Button & Interaction Map

> **Document Version:** 1.0.0
> **Target System:** Production Flutter (`jobfrontend-main/`) & Web Client (`web/`)

---

## 1. Complete Component Interaction Table

| Screen Name | UI Component / Action Element | User Action Trigger | REST API Call | API Request Payload | Resulting UI State & Navigation |
|---|---|---|---|---|---|
| `RoleSelectionScreen` | "Job Seeker" Card | Tap / Click | N/A | None | Sets role state; Navigates to `/login?role=job_seeker` |
| `RoleSelectionScreen` | "Employer" Card | Tap / Click | N/A | None | Sets role state; Navigates to `/login?role=company` |
| `JobSeekerOtpLoginScreen` | "Sign In" Button | Form Submit | `POST /api/v1/auth/login` | `{ identifier, password, role: "job_seeker" }` | Stores Sanctum token; Navigates to `/seeker_home` |
| `EmployerOtpLoginScreen` | "Sign In" Button | Form Submit | `POST /api/v1/auth/login` | `{ identifier, password, role: "company" }` | Stores Sanctum token; Navigates to `/employer_home` |
| `RegisterScreen` | "Send SMS OTP" Button | Click | Firebase SMS OTP | `{ mobile: "+91..." }` | Triggers SMS OTP delivery; Displays 6-digit OTP prompt |
| `RegisterScreen` | "Verify OTP & Signup" | Click | `POST /api/v1/auth/firebase-authenticate` | `{ id_token, role, name, email }` | Creates user; Prompts password set; Navigates to onboarding |
| `ForgotPasswordScreen` | "Confirm & Reset" | Click | `POST /api/v1/auth/reset-password` | `{ mobile, otp, password }` | Resets password; Navigates to Login Screen |
| `JobSeekerOnboardingScreen` | "Save & Complete" | Form Submit | `PUT /job-seeker/profile` & `POST /job-seeker/profile/resume` | Profile JSON & Resume PDF Multipart | Completes candidate setup; Navigates to `/seeker_home` |
| `JobDetailScreen` | "Submit Application" | Form Submit | `POST /job-seeker/jobs/{id}/apply` | Cover letter & Resume file | Submits job application; Displays success modal |
| `JobDetailScreen` | Bookmark Icon | Tap / Click | `POST /job-seeker/jobs/{id}/save` | None | Toggles bookmark icon fill state |
| `MyApplicationsScreen` | "Withdraw" Button | Click | `DELETE /job-seeker/applications/{id}` | None | Removes application item from dashboard |
| `PostJobScreen` | "Publish Job" Button | Form Submit | `POST /company/job-posts` | Job JSON payload in **₹ / INR** | Publishes job; Navigates to `/employer_dashboard` |
| `ManageApplicationsScreen` | "Shortlist" Button | Click | `PATCH /company/job-posts/{jId}/applications/{aId}` | `{ status: "shortlisted" }` | Updates application badge to `"Shortlisted"` |
| `ManageApplicationsScreen` | "Reject" Button | Click | `PATCH /company/job-posts/{jId}/applications/{aId}` | `{ status: "rejected" }` | Updates application badge to `"Rejected"` |
| `SeekerResumeStudioScreen` | "AI Enhance" Button | Click | `POST /job-seeker/resume/ai-assist` | `{ section, text }` | Updates professional summary/experience text via AI |
| `SeekerResumeStudioScreen` | "Export PDF" Button | Click | `POST /job-seeker/resume/pdf-create-order` | `{ template_id }` | Initiates PDF export order in **₹ / INR** |
| `NotificationInboxPage` | "Mark All Read" | Click | `POST /notifications/read-all` | None | Clears unread counter badges |
| `ReferAndEarnScreen` | "Copy Code" Button | Click | Clipboard Copy | None | Copies `JOB{id}REF` code to clipboard |
