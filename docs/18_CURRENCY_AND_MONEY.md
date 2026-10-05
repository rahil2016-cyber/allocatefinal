# Currency & Monetary Values Specification (Strict Indian Rupees ₹ / INR)

> **Document Version:** 1.0.0
> **Target Currency:** **Indian Rupee (`₹` / `INR`)**

---

## 1. Absolute Monetary Formatting Rules
1. **No USD Symbol (`$`)**: Under no circumstances should USD (`$`) be used for job salaries, package costs, or monetary values across JobAllocate.
2. **Indian Number Formatting**: All numbers display in standard Indian grouping format via `Intl.NumberFormat('en-IN')`:
   - `₹50,000`
   - `₹1,00,000`
   - `₹12,00,000`
3. **Salary Displays**:
   - `₹25,000 - ₹50,000 / month`
   - `₹6,00,000 - ₹12,00,000 / year`
