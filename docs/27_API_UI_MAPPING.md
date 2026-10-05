# JobAllocate API to UI Field Data Mapping Reference

> **Document Version:** 1.0.0

---

## 1. Field Mapping Trace Examples

### Job Salary Range Display Trace
```text
Backend Database Column: `salary_min` (DECIMAL 12,2: 600000.00) & `salary_max` (DECIMAL 12,2: 900000.00)
                                 │
                                 ▼
REST API JSON: { "salary_min": 600000, "salary_max": 900000, "salary_period": "year" }
                                 │
                                 ▼
Flutter Model: Job.salaryMin (double/int) & Job.salaryMax (double/int)
                                 │
                                 ▼
Format Helper: formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)
               Locale: en-IN (Indian Rupees ₹)
                                 │
                                 ▼
UI Rendered Output: "₹6,00,000 - ₹9,00,000 / year"
```

### Application Status Badge Trace
```text
Backend Database Column: `status` (ENUM: 'shortlisted')
                                 │
                                 ▼
REST API JSON: { "id": 14, "status": "shortlisted", "employer_note": "Great background" }
                                 │
                                 ▼
Flutter / React Model: JobApplication.status ("shortlisted")
                                 │
                                 ▼
UI Rendered Output: <Badge variant="success">Shortlisted</Badge>
```

### Company GST Verification Badge Trace
```text
Backend Database Column: `is_kyc_verified` (BOOLEAN: true)
                                 │
                                 ▼
REST API JSON: { "company_name": "Acme Corp", "is_kyc_verified": true }
                                 │
                                 ▼
UI Rendered Output: <Badge variant="success"><ShieldCheck /> GST Verified</Badge>
```
