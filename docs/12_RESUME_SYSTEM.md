# JobAllocate Resume Studio Architecture

> **Document Version:** 1.0.0
> **Target Production System:** `lib/screens/job_seeker/seeker_resume_studio_screen.dart` & `lib/services/useresume_config.dart`

---

## 1. Resume System Architecture

```text
Candidate Form Input ──► AI Text Enhancement ──► HTML Template Engine ──► PDF Export Order
(Personal, Experience)   (POST /resume/ai-assist)  (20+ HTML Templates)     (Cashfree Gateway / ₹)
```

---

## 2. Template Catalog & Features
- **20+ HTML Templates**: Includes `Modern Executive`, `Tech Clean`, `Creative Minimal`, `Healthcare Pro`.
- **AI Bullet Enhancement**: Candidate can tap "AI Enhance Text" to trigger OpenRouter AI text improvement (`POST /api/v1/job-seeker/resume/ai-assist`).
- **PDF Export Order**: PDF creation triggers order creation (`POST /api/v1/job-seeker/resume/pdf-create-order`).
