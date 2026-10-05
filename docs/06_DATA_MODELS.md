# JobAllocate Data Models & Field-Level Mappings

> **Document Version:** 1.0.0

---

## 1. User Model (`models/user.dart`)

| Field Name | Dart Type | Nullable? | JSON Key | Description |
|---|---|---|---|---|
| `id` | `String` / `int` | No | `id` | Primary Key Identifier |
| `name` | `String` | Yes | `name` | Full Name |
| `email` | `String` | No | `email` | Email Address |
| `phone` | `String` | Yes | `phone` | 10-digit Indian Mobile (`+91`) |
| `role` | `String` | No | `role` | Role: `"job_seeker"`, `"company"`, or `"super_admin"` |
| `isVerified` | `bool` | No | `is_verified` | Verified account flag |
| `createdAt` | `DateTime` | Yes | `created_at` | Registration timestamp |

---

## 2. Job Model (`models/job.dart`)

| Field Name | Dart Type | Nullable? | JSON Key | Description |
|---|---|---|---|---|
| `id` | `String` / `int` | No | `id` | Job Position Key |
| `title` | `String` | No | `title` | Position Title |
| `description` | `String` | No | `description` | HTML/Text Job Description |
| `requirements` | `String` | Yes | `requirements` | Role Qualifications |
| `responsibilities` | `String` | Yes | `responsibilities` | Responsibilities List |
| `companyName` | `String` | Yes | `company.name` / `company_name` | Employer Organization |
| `employmentType` | `String` | Yes | `employment_type` | `"Full-time"`, `"Part-time"`, `"Remote"`, `"Contract"` |
| `experienceLevel` | `String` | Yes | `experience_level` | Required years |
| `industryType` | `String` | Yes | `industry_type` | Job Category |
| `salaryMin` | `double` / `int` | Yes | `salary_min` | Minimum Salary (in ₹ / INR) |
| `salaryMax` | `double` / `int` | Yes | `salary_max` | Maximum Salary (in ₹ / INR) |
| `salaryPeriod` | `String` | Yes | `salary_period` | `"month"` or `"year"` |
| `location` | `String` | Yes | `location` | City / State |
| `isUrgent` | `bool` | Yes | `is_urgent` | Urgent hiring tag |
| `status` | `String` | Yes | `status` | `"draft"`, `"pending_review"`, `"published"`, `"closed"` |
| `publishedAt` | `DateTime` | Yes | `published_at` | Publication timestamp |

---

## 3. JobApplication Model (`models/job.dart`)

| Field Name | Dart Type | Nullable? | JSON Key | Description |
|---|---|---|---|---|
| `id` | `String` / `int` | No | `id` | Application ID |
| `jobPostId` | `String` / `int` | No | `job_post_id` | Foreign key to Job |
| `userId` | `String` / `int` | No | `user_id` | Foreign key to User |
| `status` | `String` | No | `status` | Status: `"applied"`, `"shortlisted"`, `"interview"`, `"rejected"`, `"hired"` |
| `coverLetter` | `String` | Yes | `cover_letter` | Cover letter notes |
| `employerNote` | `String` | Yes | `employer_note` | Recruiter feedback note |
| `appliedAt` | `DateTime` | No | `applied_at` / `created_at` | Application timestamp |
