# JobAllocate Forms & Validation Rules Specification

> **Document Version:** 1.0.0

---

## 1. Form Validation Catalog

| Form Name | Field Name | Validation Rule | Error Message |
|---|---|---|---|
| Login / Register | `mobile` | Must be a valid 10-digit Indian Mobile Number | `"Please enter a valid 10-digit mobile number"` |
| Login / Register | `password` | Min 6 characters | `"Password must be at least 6 characters"` |
| OTP Verification | `otp` | Exactly 6 numeric digits | `"Please enter the 6-digit SMS OTP code"` |
| Candidate Profile | `expected_salary` | Numeric string in ₹ (INR) | `"Please specify salary expectation in Indian Rupees"` |
| Employer Job Post | `title` | Required, non-empty string | `"Job title is required"` |
| Employer Job Post | `salary_min` / `salary_max` | Numeric, Min <= Max in ₹ (INR) | `"Min salary cannot exceed max salary"` |
| Candidate Apply | `resume` | PDF, DOC, DOCX up to 5MB | `"File size must be less than 5MB"` |
