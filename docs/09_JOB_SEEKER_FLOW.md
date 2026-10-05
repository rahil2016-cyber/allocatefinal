# Job Seeker User Journey & Workflow Specification

> **Document Version:** 1.0.0

---

## 1. Candidate Lifecycle & Journey Map

```text
Launch App ──► Splash (Token Check) ──► Role Selection ("Job Seeker")
                                                │
                                                ▼
                                    Register / Login Screen
                                    (Mobile + Firebase SMS OTP)
                                                │
                                                ▼
                                    JobSeekerOnboardingScreen
                                  (4-Step Profile & Resume PDF)
                                                │
                                                ▼
                                       JobSeekerHomeScreen
                         ┌──────────────────────┼──────────────────────┐
                         ▼                      ▼                      ▼
                     Search Jobs            Build Resume          Apply to Jobs
                     (/jobs feed)       (Resume Studio HTML)     (1-Click Submit)
                         │                                             │
                         └──────────────────────┬──────────────────────┘
                                                ▼
                                      My Applications Tracker
                                      (/seeker/applications)
```

---

## 2. Step-by-Step Candidate Actions
1. **Search & Filter Jobs**: Candidate searches keywords or filters by city, industry category, or job type (`Full-time`, `Remote`).
2. **View Job Details**: Review responsibilities, requirements, and compensation displayed strictly in **Indian Rupees (`₹` / `INR`)**.
3. **Submit Application**: Enter optional cover letter, select/upload resume PDF, and call `POST /api/v1/job-seeker/jobs/{id}/apply`.
4. **Track Status**: Monitor application status changes (`applied` ──► `shortlisted` ──► `interview` ──► `hired`).
