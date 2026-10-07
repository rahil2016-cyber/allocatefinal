// API Endpoints matching Laravel API routes (v1)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://joballocate.tech/api/v1";

export const ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/firebase-authenticate",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/reset-password",
  USER_INFO: "/me",
  USER_PROFILE: "/me",

  // Public Jobs & Data
  JOBS: "/jobs",
  JOB_DETAILS: (id: string | number) => `/jobs/${id}`,
  SIMILAR_JOBS: (id: string | number) => `/jobs/${id}/similar`,
  CATEGORIES: "/seeker-home-popular-categories",
  INDUSTRY_TYPES: "/industry-types",
  TOP_COMPANIES: "/companies/top",
  BANNERS: "/banners",

  // Seeker Profile & Actions
  SEEKER_PROFILE: "/job-seeker/profile",
  UPLOAD_RESUME_PDF: "/job-seeker/profile/resume",
  APPLY_JOB: (jobId: string | number) => `/job-seeker/jobs/${jobId}/apply`,
  MY_APPLICATIONS: "/job-seeker/applications",
  SAVED_JOBS: "/job-seeker/saved-jobs",
  SAVE_JOB: (jobId: string | number) => `/job-seeker/jobs/${jobId}/save`,
  REPORT_JOB: (jobId: string | number) => `/job-seeker/jobs/${jobId}/report`,
  SEEKER_PACKAGES_CATALOG: "/job-seeker/packages/catalog",
  SEEKER_PACKAGES_PURCHASES: "/job-seeker/packages/purchases",
  SEEKER_RESUME_SAVE: "/job-seeker/resume/save",
  SEEKER_RESUME_PREVIEW_HTML: "/job-seeker/resume/preview-html",
  AI_CHAT: "/ai/chat",

  // Employer / Company Actions
  COMPANY_PROFILE: "/company/profile",
  COMPANY_JOB_POSTS: "/company/job-posts",
  POST_JOB: "/company/job-posts",
  UPDATE_JOB: (id: string | number) => `/company/job-posts/${id}`,
  JOB_APPLICANTS: (jobId: string | number) => `/company/job-posts/${jobId}/applications`,
  UPDATE_APPLICATION_STATUS: (jobId: string | number, appId: string | number) =>
    `/company/job-posts/${jobId}/applications/${appId}`,
  COMPANY_SUBSCRIPTION_OFFER: "/company/subscription/offer",
  COMPANY_SUBSCRIPTION_PURCHASE: "/company/subscription/purchase",
  COMPANY_SUBSCRIPTION_CONFIRM: "/company/subscription/confirm-status",
  COMPANY_SUBSCRIPTION_HISTORY: "/company/subscription/history",
};
