# JobAllocate Complete Form & Field Specification

> **Document Version:** 1.0.0

---

## 1. Form Field Specifications

| Form Name | Field Identifier | Widget Type | Required | Validation & Constraints | Error Feedback Message | API Field Mapping |
|---|---|---|---|---|---|---|
| `LoginForm` | `identifier` | `TextField` / `Input` | Yes | 10-digit Indian Mobile (`+91`) | `"Please enter a valid 10-digit mobile number"` | `identifier` |
| `LoginForm` | `password` | `PasswordField` | Yes | Min 6 characters | `"Password must be at least 6 characters"` | `password` |
| `RegisterForm` | `name` | `TextField` | Yes | Non-empty string | `"Full name is required"` | `name` |
| `RegisterForm` | `email` | `TextField` | Yes | Valid email format | `"Please enter a valid email address"` | `email` |
| `RegisterForm` | `phone` | `TextField` | Yes | 10-digit Indian Mobile | `"Valid mobile phone is required"` | `mobile` |
| `RegisterForm` | `gst_number` | `TextField` | Conditional | 15-char GSTIN string (if Employer) | `"Please enter a valid GST registration number"` | `gst_number` |
| `OnboardingForm` | `headline` | `TextField` | Yes | Non-empty string | `"Professional headline is required"` | `headline` |
| `OnboardingForm` | `experience_years` | `NumberField` | Yes | Non-negative integer | `"Experience years must be a valid number"` | `experience_years` |
| `OnboardingForm` | `expected_salary` | `NumberField` | Yes | Numeric string in **₹ / INR** | `"Please enter expected salary in Indian Rupees"` | `expected_salary` |
| `JobPostForm` | `title` | `TextField` | Yes | Non-empty string | `"Job title is required"` | `title` |
| `JobPostForm` | `salary_min` | `NumberField` | Yes | Numeric in **₹ / INR** | `"Min salary is required"` | `salary_min` |
| `JobPostForm` | `salary_max` | `NumberField` | Yes | Numeric, >= `salary_min` in **₹ / INR** | `"Max salary must be greater than min salary"` | `salary_max` |
| `ApplyModal` | `cover_letter` | `TextArea` | No | Max 1000 chars | `"Cover letter exceeds character limit"` | `cover_letter` |
| `ApplyModal` | `resume` | `FilePicker` | No | PDF, DOC, DOCX up to 5MB | `"Resume file size must be less than 5MB"` | `resume` |
