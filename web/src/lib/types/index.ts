export type UserRole = "job_seeker" | "company" | "super_admin" | "seeker" | "employer" | string;

export interface User {
  id: number | string;
  name?: string;
  email: string;
  phone?: string;
  mobile?: string;
  company_name?: string;
  role: string | number;
  user_type?: string;
  is_verified?: boolean;
  profile_photo_path?: string;
  created_at?: string;
  updated_at?: string;
  seeker_profile?: SeekerProfile;
  employer_profile?: EmployerProfile;
}

export interface SeekerProfile {
  id: number | string;
  user_id: number | string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  dob?: string;
  city?: string;
  country?: string;
  location?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  expected_salary?: string | number;
  expected_salary_min?: string | number;
  expected_salary_max?: string | number;
  current_salary?: string | number;
  industry_type?: string;
  resume_url?: string;
  portfolio_url?: string;
}

export interface EmployerProfile {
  id: number | string;
  user_id: number | string;
  company_name: string;
  company_description?: string;
  company_website?: string;
  company_logo_url?: string;
  industry?: string;
  location?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_kyc_verified?: boolean;
}

export interface JobCategory {
  id: number | string;
  name: string;
  slug?: string;
  icon?: string;
  jobs_count?: number;
}

export interface Company {
  id?: number | string;
  name: string;
  company_logo_url?: string;
  logo_url?: string;
  logo?: string;
  location?: string;
  website?: string;
  description?: string;
}

export interface Job {
  id: number | string;
  user_id?: number | string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  category_id?: number | string;
  category?: JobCategory;
  job_type?: string;
  employment_type?: string;
  experience_level?: string;
  industry_type?: string;
  salary_min?: string | number;
  salary_max?: string | number;
  salary_period?: string;
  location?: string;
  city?: string;
  state?: string;
  is_featured?: boolean | number;
  is_urgent?: boolean | number;
  status?: string;
  published_at?: string;
  created_at: string;
  company_name?: string;
  company_logo?: string;
  company_logo_url?: string;
  company?: Company;
  employer?: EmployerProfile;
  applications_count?: number;
  views_count?: number;
  is_applied?: boolean;
  is_saved?: boolean;
  skills?: string[];
  preferred_locations?: string[];
  benefits?: string;
  salary_insights?: string;
  about_company?: string;
  role_category?: string;
  functional_area?: string;
  education?: string;
  assets_required?: string;
  languages?: string;
  incentive_detail?: string;
  job_timings?: string;
  working_days?: string;
  age_min?: number;
  age_max?: number;
  gender_preference?: string;
  contact_preference?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  department?: string;
  role?: string;
  security_deposit?: boolean | number;
  security_deposit_amount?: string;
  interview_timings?: string;
}

export interface JobApplication {
  id: number | string;
  job_post_id?: number | string;
  job_id?: number | string;
  user_id?: number | string;
  cover_letter?: string;
  resume_url?: string;
  employer_note?: string;
  status: "applied" | "pending" | "shortlisted" | "interview" | "rejected" | "hired" | string;
  applied_at?: string;
  created_at?: string;
  job?: Job;
  job_post?: Job;
  seeker?: User;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  status?: boolean | string;
  message?: string;
  data?: T;
  error?: string;
}
