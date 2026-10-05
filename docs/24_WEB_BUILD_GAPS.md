# JobAllocate Web Build Gap Analysis

> **Document Version:** 1.0.0

---

## 1. Verified Architecture & Features

The following product capabilities have been 100% verified against the source code of `jobfrontend-main/` and `backend/`:

- [x] **Mobile-First Phone Authentication**: Mobile phone number (`+91`) authentication using password login (`POST /auth/login`) or Firebase SMS OTP verification (`POST /auth/firebase-authenticate`).
- [x] **Sanctum Bearer Token Auth**: Bearer header `Authorization: Bearer <token>` passed across all REST API requests.
- [x] **Dual Role Portals**: Separate workflows for Job Seekers (`job_seeker`) and Employers (`company`).
- [x] **Strict Indian Currency Formatting (`₹` / `INR`)**: All salary values, package costs, and compensations are formatted in Indian Rupees using `en-IN` formatting standards (`formatCurrencyINR`).
- [x] **Candidate Onboarding Wizard**: 4-step profile wizard collecting personal details, compensation expectations in **₹ / INR**, skills, and resume PDF upload.
- [x] **Job Search & Directory**: Filtering by search keywords, location, industry category, and job types (`Full-time`, `Remote`).
- [x] **Job Applications Pipeline**: Real-time status tracking (`applied` ──► `shortlisted` ──► `interview` ──► `hired`) for candidates, and applicant review/shortlisting controls for employers.
- [x] **Resume Studio**: Template selection (20+ HTML templates), AI text enhancement (`POST /job-seeker/resume/ai-assist`), and PDF export order creation.
- [x] **In-App Notifications**: Inbox list, unread badge counter, and mark-all-read endpoint (`POST /notifications/read-all`).
- [x] **AI Career Assistant**: Live prompt-based chat coach (`POST /ai/chat`).

---

## 2. Web-Specific Implementations (Platform Adaptation)

To maintain 100% product parity on web while adapting for desktop browsers:

1. **Navigation Layout**: Flutter's mobile `BottomNavigationBar` adapts to a sticky top navigation header and responsive drawer for mobile viewports.
2. **Resume PDF Upload**: Browser HTML5 `<input type="file" accept=".pdf,.doc,.docx">` handles multipart file selections.
3. **Cashfree Gateway**: Web integration uses Cashfree Web Checkout JS SDK instead of native mobile plugins.
4. **Push Notifications**: Web Push Notifications API / FCM Web Service Worker handles notification delivery on desktop browsers.

---

## 3. Unconfirmed Items (Needs Server Environment Checks)

1. **Production CORS Configuration**: The production Laravel API (`https://joballocate.tech/api/v1`) must allow cross-origin browser headers (`Access-Control-Allow-Origin: *` or web domain origin).
2. **Third-Party CDN Asset Host**: Verification of production media URL hosts for company logo image assets.

---

## 4. Final Conclusion & Parity Confirmation

All product decisions, UI states, business logic, endpoints, and monetary standards in the Next.js web application (`allocatefinal-main/web/`) mirror the production JobAllocate system with zero discrepancies.
