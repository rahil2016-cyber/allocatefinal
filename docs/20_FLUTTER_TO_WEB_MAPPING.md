# Flutter Mobile to Next.js Web Mapping Reference

> **Document Version:** 1.0.0

---

## 1. Complete Architecture Mapping

| Flutter Component | Next.js Web Equivalent | Implementation Path |
|---|---|---|
| `main.dart` | `app/layout.tsx` & `AppProviders.tsx` | Root layout, React Query Client & Auth Provider |
| `JobSeekerOtpLoginScreen` | `app/(auth)/login/page.tsx` | Mobile Phone + Password / SMS OTP login form |
| `RegisterScreen` | `app/(auth)/register/page.tsx` | Dual role signup with SMS OTP |
| `JobSeekerOnboardingScreen` | `app/seeker/onboarding/page.tsx` | 4-step candidate profile setup wizard |
| `JobSeekerHomeScreen` | `app/page.tsx` | Main platform home & categories feed |
| `JobDetailScreen` | `app/jobs/[id]/page.tsx` | Position details & apply modal trigger |
| `MyApplicationsScreen` | `app/seeker/applications/page.tsx` | Candidate application status dashboard |
| `SavedJobsScreen` | `app/seeker/saved/page.tsx` | Bookmarked positions list |
| `SeekerResumeStudioScreen` | `app/seeker/resume/page.tsx` | Resume Studio with HTML preview & AI enhance |
| `EmployerDashboardPage` | `app/employer/dashboard/page.tsx` | Active listings & candidate metrics overview |
| `PostJobScreen` | `app/employer/post-job/page.tsx` | Publish/edit job form in ₹ (INR) |
| `ManageApplicationsScreen` | `app/employer/applicants/page.tsx` | Applicant pipelines & status toggles |
| `NotificationInboxPage` | `app/notifications/page.tsx` | In-app alerts inbox |
| `AiChatScreen` | `app/ai-chat/page.tsx` | AI career coach assistant |
| `ReferAndEarnScreen` | `app/refer-and-earn/page.tsx` | Referral code sharing & redemption |
| `LegalWebViewScreen` | `app/legal/page.tsx` | Terms, Privacy & Refund policies |
