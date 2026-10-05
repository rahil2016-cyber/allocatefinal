# JobAllocate UI States & Feedback Specification

> **Document Version:** 1.0.0

---

## 1. UI State Rules
- **Loading State**: Display clean `Loader2` animated spinner with explicit progress text (`"Loading live database jobs..."`).
- **Empty State**: Show contextual empty cards with descriptive headline, message, and primary CTA button.
- **Error Feedback**: Red alert banner (`bg-red-50 text-red-700`) displaying backend exception messages.
- **Success Feedback**: Green alert banner (`bg-emerald-50 text-emerald-800`) with checkmark icons.
