# JobAllocate Deep Implementation Specification & Source Code Blueprint

> **Document Version:** 1.0.0
> **Target Production Codebase:** `jobfrontend-main/` & `backend/`
> **Base API Origin:** `https://joballocate.tech/api/v1`

---

## 1. Authentication Deep-Dive (`lib/services/api_service.dart`)

### 1.1 Candidate & Employer Login (`loginWithPassword`)
- **Flutter File:** `lib/services/api_service.dart` (L125–169)
- **Dart Function:** `ApiService.loginWithPassword({required String identifier, required String password, required String role})`
- **HTTP Endpoint:** `POST /api/v1/auth/login`
- **Request Headers:**
  ```http
  Content-Type: application/json
  Accept: application/json
  ```
- **Request Body Payload:**
  ```json
  {
    "identifier": "9876543210",
    "password": "user_password",
    "role": "job_seeker"
  }
  ```
- **Success Handling (HTTP 200/201):**
  - Extract `data.token` and `data.user`
  - Invoke `AppSession.setSession(bearerToken: token, userPayload: userMap)`
  - Invoke `FcmFlutterService.instance.registerTokenAfterLogin()` via `_registerPushAfterLogin()`
  - Return JSON object `{ "success": true, "data": { "token": "...", "user": { ... } } }`
- **Error Handling:**
  - Decodes JSON error response via `decodeApiJsonObject(response)`
  - Throws `Exception(json['message'])` (e.g. `"Invalid credentials"`)

---

## 2. Registration & Firebase OTP Lifecycle (`lib/screens/auth/register_screen.dart`)

### 2.1 Complete Step-by-Step Sequence

```text
Step 1: User fills registration form (Name, Phone, Email, Role, GST Number if Company)
                             │
                             ▼
Step 2: Client triggers Firebase Auth SMS OTP: FirebaseAuth.instance.verifyPhoneNumber()
                             │
                             ▼
Step 3: User receives 6-Digit SMS OTP on Indian mobile phone (+91)
                             │
                             ▼
Step 4: User enters OTP ──► FirebaseAuth PhoneAuthProvider.credential()
                             │
                             ▼
Step 5: Firebase returns idToken ──► ApiService.authenticateWithFirebaseToken()
                             │
                             ▼
              POST /api/v1/auth/firebase-authenticate
              Body: {
                "id_token": "<firebase_id_token>",
                "role": "job_seeker", // or "company"
                "name": "Candidate Name",
                "email": "user@example.com",
                "company_name": "Company Name", // if role == "company"
                "gst_number": "27AABCU9603R1ZN", // if role == "company"
                "state": "Maharashtra",
                "district": "Mumbai",
                "city": "Mumbai",
                "referral_code": "JOB123REF" // optional
              }
                             │
                             ▼
Step 6: Backend verifies Firebase token & returns Sanctum Bearer token:
        AppSession.setSession(bearerToken: token, userPayload: userMap)
                             │
                             ▼
Step 7: Password Setup ──► POST /api/v1/auth/set-password
        Headers: Authorization: Bearer <token>
        Body: { "password": "new_password" }
                             │
                             ▼
Step 8: Role-based Continuation:
        Candidate (job_seeker) ──► JobSeekerOnboardingScreen
        Employer (company)     ──► EmployerHomeScreen
```

---

## 3. Candidate Onboarding Wizard (`lib/screens/job_seeker/job_seeker_onboarding_screen.dart`)

### Field Specification & API Payload

| Step # | Step Title | Field Name | Input Control | Required | Validation Rule | API Field Mapping |
|---|---|---|---|---|---|---|
| **Step 1** | Personal Details | First Name | TextField | Yes | Min 1 char | `first_name` |
| **Step 1** | Personal Details | Last Name | TextField | Yes | Min 1 char | `last_name` |
| **Step 1** | Personal Details | Gender | Dropdown | Yes | `"Male"`, `"Female"`, `"Other"` | `gender` |
| **Step 1** | Personal Details | Date of Birth | DatePicker | Yes | `YYYY-MM-DD` | `date_of_birth` |
| **Step 1** | Personal Details | Location | TextField | Yes | Indian City | `location` |
| **Step 2** | Professional | Headline | TextField | Yes | Job Designation | `headline` |
| **Step 2** | Professional | Experience | NumberField | Yes | Numeric Years | `experience_years` |
| **Step 2** | Professional | Current Salary | NumberField | No | Amount in **₹ / INR** | `current_salary` |
| **Step 2** | Professional | Expected Salary | NumberField | Yes | Amount in **₹ / INR** | `expected_salary` |
| **Step 3** | Skills & Bio | Skills List | ChipInput | Yes | Comma-separated | `skills` (Array) |
| **Step 3** | Skills & Bio | Bio | TextArea | No | Free text overview | `bio` |
| **Step 4** | Resume PDF | Resume File | FilePicker | No | PDF / DOCX up to 5MB | `resume` (Multipart) |

#### Onboarding Submission Endpoints:
1. `PUT /api/v1/job-seeker/profile`: Saves profile data JSON.
2. `POST /api/v1/job-seeker/profile/resume`: Uploads resume PDF file using `http.MultipartRequest`.

---

## 4. Complete Action & Button Behavior Table

| Screen | UI Action Element | Function Triggered | REST API Endpoint | Resulting Navigation / State Change |
|---|---|---|---|---|
| `JobSeekerOtpLoginScreen` | "Sign In" Button | `loginWithPassword()` | `POST /auth/login` | Stores Sanctum token; routes to `JobSeekerHomeScreen` |
| `RegisterScreen` | "Verify OTP" Button | `authenticateWithFirebaseToken()` | `POST /auth/firebase-authenticate` | Authenticates account; opens password setup |
| `ForgotPasswordScreen` | "Reset Password" | `resetPasswordWithFirebase()` | `POST /auth/reset-password` | Resets password & auto-logs in user |
| `JobDetailScreen` | "Apply Now" Button | `applyJob()` | `POST /job-seeker/jobs/{id}/apply` | Submits cover letter & opens confirmation modal |
| `JobDetailScreen` | "Save Job" Icon | `toggleSaveJob()` | `POST /job-seeker/jobs/{id}/save` | Toggles bookmarked state |
| `MyApplicationsScreen` | "Withdraw" Button | `withdrawApplication()` | `DELETE /job-seeker/applications/{id}` | Removes application record |
| `PostJobScreen` | "Publish Job" Button | `createJobPost()` | `POST /company/job-posts` | Publishes listing in **₹ / INR**; opens dashboard |
| `ManageApplicationsScreen` | "Shortlist" Button | `updateApplicationStatus()` | `PATCH /company/job-posts/{jId}/applications/{aId}` | Updates candidate status to `"shortlisted"` |
| `SeekerResumeStudioScreen` | "AI Enhance" Button | `aiAssistSection()` | `POST /job-seeker/resume/ai-assist` | Enhances summary/experience bullet points via AI |
| `SeekerResumeStudioScreen` | "Export PDF" Button | `createPdfOrder()` | `POST /job-seeker/resume/pdf-create-order` | Initiates PDF export order in **₹ / INR** |

---

## 5. Local Storage SharedPreferences Schema (`lib/services/app_session.dart`)

| Key Name | Storage Data Type | Written By | Read By | Cleared When |
|---|---|---|---|---|
| `app_session_token` | `String` | `AppSession.setSession()` | `ApiService` headers | `AppSession.clear()` (Logout / 401) |
| `app_session_user_json` | `String` (JSON) | `AppSession.setSession()` | `AppSession.user` | `AppSession.clear()` (Logout / 401) |
| `app_session_persisted_role` | `String` | `AppSession.setSession()` | `SplashScreen` router | `AppSession.clear()` |
| `app_session_biometric_enabled` | `bool` | `SettingsScreen` | `SplashScreen` | User disables biometric |

---

## 6. Exact Design System Tokens (`lib/constants/app_colors.dart`)

- **Primary Color:** `#174A7E` (JobAllocate Primary Blue)
- **Primary Dark Accent:** `#0F2C4D`
- **Secondary Accent:** `#0284C7` / `#38BDF8` (Sky Blue)
- **Alert / Danger:** `#E53E3E` / `#EF4444`
- **Success:** `#16A34A` / `#22C55E`
- **Background Surface:** `#F8FAFC`
- **Typography:** Google Fonts — **Plus Jakarta Sans**
- **Button Height:** `48px` (standard), `36px` (small)
- **Border Radius:** `12px` (Cards / Modals), `8px` (Inputs / Buttons)
