# JobAllocate Production API Reference (v1)

> **Base URL:** `https://joballocate.tech/api/v1`
> **Default Headers:** `Accept: application/json`, `Content-Type: application/json`

---

## 1. Authentication Endpoints

### 1.1 Password Login
- **Method:** `POST`
- **Path:** `/auth/login`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "identifier": "9876543210",
    "password": "secret_password",
    "role": "job_seeker"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "123|abcdef123456...",
      "user": {
        "id": 101,
        "name": "Candidate Name",
        "email": "user@example.com",
        "phone": "+919876543210",
        "role": "job_seeker"
      }
    }
  }
  ```

### 1.2 Firebase OTP Authenticate
- **Method:** `POST`
- **Path:** `/auth/firebase-authenticate`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "id_token": "eyJhbGciOiJSUzI1NiIs...",
    "role": "job_seeker",
    "name": "Candidate Name",
    "email": "candidate@example.com"
  }
  ```

### 1.3 Logout
- **Method:** `POST`
- **Path:** `/auth/logout`
- **Auth:** `Bearer <token>`
- **Response:** `{ "success": true, "message": "Logged out successfully" }`

### 1.4 Get Active User Profile
- **Method:** `GET`
- **Path:** `/me`
- **Auth:** `Bearer <token>`

---

## 2. Public Jobs & Catalog Endpoints

### 2.1 Get Published Jobs List
- **Method:** `GET`
- **Path:** `/jobs`
- **Auth:** Public / Optional Bearer
- **Query Parameters:**
  - `search`: Keyword string
  - `location`: City or State
  - `industry_type`: Industry category
  - `page`: Page number (default: `1`)
  - `per_page`: Items per page (default: `15`)
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Senior Full Stack Engineer",
        "description": "Role overview...",
        "employment_type": "Full-time",
        "salary_min": 500000,
        "salary_max": 800000,
        "salary_period": "year",
        "location": "Bengaluru, KA",
        "is_urgent": true,
        "company": {
          "name": "TechCorp Solutions",
          "company_logo_url": "https://joballocate.tech/storage/logos/logo.png"
        },
        "published_at": "2026-09-20T10:00:00Z"
      }
    ]
  }
  ```

### 2.2 Get Single Job Details
- **Method:** `GET`
- **Path:** `/jobs/{id}`
- **Auth:** Public / Optional Bearer

### 2.3 Get Popular Categories
- **Method:** `GET`
- **Path:** `/seeker-home-popular-categories`
- **Auth:** Public

---

## 3. Candidate (Job Seeker) Endpoints

### 3.1 Apply to Job Position
- **Method:** `POST`
- **Path:** `/job-seeker/jobs/{jobId}/apply`
- **Auth:** `Bearer <token>` (`job_seeker`)
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `cover_letter` (text), `resume` (PDF file upload)

### 3.2 List Candidate Applications
- **Method:** `GET`
- **Path:** `/job-seeker/applications`
- **Auth:** `Bearer <token>` (`job_seeker`)

### 3.3 Save / Bookmark Job
- **Method:** `POST`
- **Path:** `/job-seeker/jobs/{jobId}/save`
- **Auth:** `Bearer <token>` (`job_seeker`)

### 3.4 List Saved Jobs
- **Method:** `GET`
- **Path:** `/job-seeker/saved-jobs`
- **Auth:** `Bearer <token>` (`job_seeker`)

---

## 4. Employer (Company) Endpoints

### 4.1 Post New Job Opening
- **Method:** `POST`
- **Path:** `/company/job-posts`
- **Auth:** `Bearer <token>` (`company`)
- **Request Body:**
  ```json
  {
    "title": "Full Stack Engineer",
    "employment_type": "Full-time",
    "industry_type": "Technology & Software",
    "location": "Mumbai, MH",
    "salary_min": 600000,
    "salary_max": 900000,
    "salary_period": "year",
    "description": "Job description details...",
    "requirements": "Role requirements...",
    "is_urgent": true
  }
  ```

### 4.2 List Applicants for Job
- **Method:** `GET`
- **Path:** `/company/job-posts/{jobId}/applications`
- **Auth:** `Bearer <token>` (`company`)

### 4.3 Update Applicant Candidate Status
- **Method:** `PATCH`
- **Path:** `/company/job-posts/{jobId}/applications/{appId}`
- **Auth:** `Bearer <token>` (`company`)
- **Request Body:**
  ```json
  {
    "status": "shortlisted",
    "employer_note": "Great fit for our engineering team."
  }
  ```
