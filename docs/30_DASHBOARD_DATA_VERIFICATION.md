# JobAllocate Web — Dashboard Data Verification

## Flutter Source

The existing Job Seeker experience in the production Flutter mobile application (`jobfrontend-main/`) is implemented across the following source files:

1. **`lib/screens/job_seeker/job_seeker_home.dart`**
   - Renders popular categories, recommended jobs, related jobs, saved jobs count, and latest jobs feed.
   - Manages top banner carousel and navigation tabs (`Home`, `Apply`, `Saved`, `Me`).

2. **`lib/screens/job_seeker/my_applications_screen.dart`**
   - Fetches and displays candidate job applications list from `GET /api/v1/job-seeker/applications`.
   - Displays application status badges (`applied`, `shortlisted`, `interview`, `rejected`, `hired`).

3. **`lib/screens/job_seeker/saved_jobs_screen.dart`**
   - Fetches candidate bookmarked jobs list from `GET /api/v1/job-seeker/saved-jobs`.

4. **`lib/screens/job_seeker/job_seeker_profile.dart`**
   - Displays user profile details fetched from `GET /api/v1/job-seeker/profile` and `GET /api/v1/me`.

5. **`lib/services/job_seeker_api_service.dart`**
   - HTTP API service handling authentication headers (`Authorization: Bearer <token>`) and backend calls.

---

## Backend Source

The production Laravel API (`backend/`) serves candidate dashboard data through the following routes and controllers:

1. **`app/Http/Controllers/Api/V1/JobSeeker/SeekerApplicationController.php`**
   - Route: `GET /api/v1/job-seeker/applications`
   - Controller Method: `index()`
   - Logic: Queries `Application::where('user_id', $user->id)->with('jobPost.company')`.

2. **`app/Http/Controllers/Api/V1/JobSeeker/SeekerSavedJobController.php`**
   - Route: `GET /api/v1/job-seeker/saved-jobs`
   - Controller Method: `index()`
   - Logic: Queries `SavedJob::where('user_id', $user->id)->with('jobPost.company')`.

3. **`app/Http/Controllers/Api/V1/JobSeeker/SeekerProfileController.php`**
   - Route: `GET /api/v1/job-seeker/profile`
   - Controller Method: `show()`
   - Logic: Queries `JobSeekerProfile::where('user_id', $user->id)->first()`.

4. **`app/Http/Controllers/Api/V1/AuthController.php`**
   - Route: `GET /api/v1/me`
   - Controller Method: `me()`
   - Logic: Returns authenticated `User` model (`id`, `name`, `mobile`, `email`, `role`).

5. **`app/Http/Controllers/Api/V1/PublicJobController.php`**
   - Route: `GET /api/v1/jobs`
   - Controller Method: `index()`
   - Logic: Returns paginated active job posts.

---

## API Endpoints

- `GET /api/v1/me` — Authenticated user details
- `GET /api/v1/job-seeker/applications` — Candidate submitted applications list & status
- `GET /api/v1/job-seeker/saved-jobs` — Candidate saved/bookmarked jobs list
- `GET /api/v1/job-seeker/profile` — Candidate profile details
- `GET /api/v1/jobs` — Public/candidate jobs feed

---

## Dashboard Data Mapping

| UI Value | Current Source | Expected Source | API Endpoint | Flutter Source | Status |
|---|---|---|---|---|---|
| User Name ("Welcome, {name}") | `useAuth().user.name` | Auth Session (`User.name`) | `GET /api/v1/me` | `AppSession.user['name']` | **VERIFIED (REAL API)** |
| Submitted Applications Count | `applications.length` | `Application` model count | `GET /api/v1/job-seeker/applications` | `JobSeekerApiService.listMyApplications()` | **VERIFIED (REAL API)** |
| Saved Jobs Count | `savedJobs.length` | `SavedJob` model count | `GET /api/v1/job-seeker/saved-jobs` | `JobSeekerApiService.getSavedJobs()` | **VERIFIED (REAL API)** |
| Shortlisted Applications Count | `applications.filter(status=='shortlisted').length` | `Application` status filter | `GET /api/v1/job-seeker/applications` | `MyApplicationsScreen` status count | **VERIFIED (REAL API)** |
| Application Job Title | `app.job_post.title` | `JobPost.title` | `GET /api/v1/job-seeker/applications` | `JobApplication.fromApi()` | **VERIFIED (REAL API)** |
| Application Company Name | `app.job_post.company.name` | `Company.name` | `GET /api/v1/job-seeker/applications` | `JobApplication.fromApi()` | **VERIFIED (REAL API)** |
| Application Date | `app.applied_at` | `Application.applied_at` | `GET /api/v1/job-seeker/applications` | `JobApplication.fromApi()` | **VERIFIED (REAL API)** |
| Application Status | `app.status` | `Application.status` | `GET /api/v1/job-seeker/applications` | `JobApplication.fromApi()` | **VERIFIED (REAL API)** |

---

## Hardcoded Data Removed

1. **`TechCorp Solutions`** — Removed invented company name.
2. **`Apex Global`** — Removed invented company name.
3. **`Senior Full Stack Engineer (React & Laravel)`** — Removed invented job title.
4. **`Product Marketing Manager`** — Removed invented job title.
5. **`JobAllocate Global HQ, Silicon Valley & India`** — Removed invented address from `Footer.tsx`.
6. **Hardcoded Stats (2 submitted, 4 saved, 1 shortlisted)** — Replaced with dynamic counts calculated from live API query responses.
7. **Hardcoded User Name ("John Doe")** — Replaced with `user?.name` from Sanctum session token.

---

## Real API Data Verified

1. **User Identity**: User name, phone number, and email load dynamically from the logged-in Sanctum user session via `useAuth()`.
2. **Applications Feed**: Fetched directly from `GET /api/v1/job-seeker/applications`. If the candidate has 0 applications, the dashboard displays 0 and shows an empty state banner with "No Applications Found. Search Available Jobs".
3. **Saved Jobs**: Count fetched directly from `GET /api/v1/job-seeker/saved-jobs`.
4. **Live Job Postings**: Real production jobs (e.g., *Sales Promoter* at Davangere, *Loan Officer* at Svatantra Microfin LTD, *Sales Executive* at Ndp Advisory Services) fetched from `GET /api/v1/jobs`.
5. **Support Contact**: Support phone `+91 9036980547` matches `ContactSettingsService.defaults['support_phone']` in Flutter.

---

## Unknown / Unconfirmed Items

None for candidate dashboard data mapping.

---

## Final Status

**PASS** — All hardcoded and invented mock data has been purged. The candidate dashboard strictly derives user identity, counts, applications, and saved jobs from real production backend API endpoints (`https://joballocate.tech/api/v1`).
