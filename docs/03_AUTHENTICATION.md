# JobAllocate Authentication & Session Architecture

> **Document Version:** 1.0.0
> **Target Production System:** JobAllocate (`lib/services/auth_service.dart` & `lib/services/api_service.dart`)

---

## 1. Authentication Overview

JobAllocate utilizes a **Mobile-First Identity System**. User accounts are keyed on 10-digit Indian Mobile Numbers (`+91`).

---

## 2. Login Flow Specifications

### Method 1: Mobile Phone + Password Login
```text
Mobile Input (+91 9876543210) + Password
                 │
                 ▼
  POST /api/v1/auth/login
  Body: {
    "identifier": "9876543210",
    "password": "user_password",
    "role": "job_seeker" // or "company"
  }
                 │
                 ▼
     Laravel Sanctum Token
  Header: Authorization: Bearer <token>
                 │
                 ▼
  Save to SharedPreferences:
  app_session_token = "123|abcdef..."
  app_session_user_json = "{...}"
```

### Method 2: Mobile Phone + Firebase SMS OTP Login
```text
Mobile Input (+91 9876543210)
                 │
                 ▼
   Firebase SMS OTP Triggered
                 │
                 ▼
  User Enters 6-Digit SMS OTP
                 │
                 ▼
Firebase Auth Returns id_token
                 │
                 ▼
POST /api/v1/auth/firebase-authenticate
  Body: {
    "id_token": "eyJhbGci...",
    "role": "job_seeker"
  }
                 │
                 ▼
  Sanctum Token & Session Save
```

---

## 3. Registration Lifecycle

```text
User fills registration details (Name, Phone, Email, Role)
                         │
                         ▼
             Firebase SMS OTP Verification
                         │
                         ▼
      POST /api/v1/auth/firebase-authenticate
      Payload: {
        "id_token": "...",
        "role": "job_seeker", // or "company"
        "name": "User Name",
        "email": "user@example.com",
        "referral_code": "..." // optional
      }
                         │
                         ▼
        POST /api/v1/auth/set-password
        Payload: { "password": "new_password" }
                         │
                         ▼
  Seeker ──► JobSeekerOnboardingScreen
  Employer ──► EmployerHomeScreen
```

---

## 4. Session Persistence Keys

Persisted in SharedPreferences via `lib/services/app_session.dart`:

| Storage Key | Value Type | Description |
|---|---|---|
| `app_session_token` | String | Sanctum Bearer Auth Token (`123\|abcdef...`) |
| `app_session_user_json` | JSON String | User account object (`id`, `name`, `email`, `role`) |
| `app_session_persisted_role` | String | Persisted role string (`job_seeker` or `company`) |
| `app_session_biometric_enabled` | Boolean | Biometric gate toggle flag |

---

## 5. Session Expiration & 401 Interception

When an API call returns HTTP `401 Unauthorized`:
1. Client clears `app_session_token` and `app_session_user_json` from SharedPreferences.
2. In-memory `AppSession` state is reset.
3. User is redirected to `RoleSelectionScreen`.
