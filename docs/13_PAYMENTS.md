# Cashfree Payment Gateway & Monetization Specification

> **Document Version:** 1.0.0
> **Payment Currency:** **Indian Rupee (`₹` / `INR`)**
> **Gateway Partner:** Cashfree Payment Gateway India

---

## 1. Monetization Models
1. **Candidate Credit Packages**: Application credits & resume PDF exports purchased in INR (₹).
2. **Employer Subscriptions**: Monthly/annual company job posting packages.

---

## 2. Cashfree Transaction Lifecycle
```text
Client Initiates Order ──► POST /job-seeker/payments/create-order
                                          │
                                          ▼
                         Cashfree SDK / Web Checkout (in ₹)
                                          │
                                          ▼
                         POST /job-seeker/payments/confirm-status
                                          │
                                          ▼
                             Credits / Package Allocated
```
