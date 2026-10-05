# Employer & Company Workflow Specification

> **Document Version:** 1.0.0

---

## 1. Employer Lifecycle Map

```text
Role Selection ("Employer") ──► Employer Login / Signup ──► Company Profile & GST Details
                                                                   │
                                                                   ▼
                                                          Employer Dashboard
                                                     (Active Listings & Metrics)
                                                                   │
                                           ┌───────────────────────┴───────────────────────┐
                                           ▼                                               ▼
                                     Post New Job                                 Manage Applicants
                                (Title, Salary in ₹,                             (Review Cover Letters,
                                 Location, Category)                              Shortlist, Reject, Hire)
```

---

## 2. Employer Actions
1. **Post Job Opening**: Fills title, industry, employment type, min/max salary in **₹ / INR**, location, description (`POST /api/v1/company/job-posts`).
2. **Review Candidates**: View applicants per job (`GET /company/job-posts/{id}/applications`), view cover letters, download candidate resume PDFs.
3. **Update Candidate Pipeline**: Mark candidate as `shortlisted`, `rejected`, or `hired` with employer notes (`PATCH /company/job-posts/{jId}/applications/{aId}`).
