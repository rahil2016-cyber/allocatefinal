# JobAllocate Navigation Map & Route Hierarchy

> **Document Version:** 1.0.0

---

## 1. Complete Route Hierarchy

```text
/ (Splash & Session Check)
│
├── /role_selection (Role Choice)
│   ├── /seeker_login (Candidate Mobile + OTP/Password Login)
│   └── /employer_login (Employer Mobile + OTP/Password Login)
│
├── /register (Mobile Phone + Firebase OTP Registration)
├── /forgot_password (SMS OTP Password Reset)
│
├── /seeker_home (Candidate Shell - Bottom Nav)
│   ├── Tab 0: Home Feed (Categories, Featured Jobs, Banners)
│   ├── Tab 1: Jobs Directory & Filters (/jobs)
│   ├── Tab 2: Resume Studio (/seeker/resume)
│   └── Tab 3: Candidate Profile (/seeker/profile)
│   ├── Drawer: /seeker/applications (My Applications)
│   ├── Drawer: /seeker/saved (Saved Jobs)
│   ├── Drawer: /notifications (In-App Inbox)
│   ├── Drawer: /ai-chat (AI Coach)
│   ├── Drawer: /refer-and-earn (Referral Program)
│   └── Drawer: /legal (Terms & Privacy)
│
└── /employer_home (Employer Shell - Bottom Nav)
    ├── Tab 0: Dashboard & Active Listings (/employer/dashboard)
    ├── Tab 1: Post Job (/employer/post-job)
    ├── Tab 2: Manage Applicants (/employer/applicants)
    └── Tab 3: Company Profile (/employer/profile)
```

---

## 2. Deep Linking & Protected Routes
- **Deep Link Handler:** `JobDeepLinkListener` handles shared position URLs (`/jobs/{id}`).
- **Route Guards**: Navigation checks `AppSession.token` and `user.role`. Attempting to access `/employer/*` as a candidate triggers immediate redirect to `/seeker_home`.
