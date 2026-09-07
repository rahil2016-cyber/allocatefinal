<?php

namespace App\Services\AiChat;

use App\Enums\JobPostStatus;
use App\Enums\UserRole;
use App\Models\Application;
use App\Models\JobPost;
use App\Models\JobSeekerProfile;
use App\Models\SavedJob;
use App\Models\User;
use App\Support\Identifier;
use Illuminate\Support\Collection;

/**
 * Controlled, authorization-enforced context for the AI assistant.
 * Never exposes passwords, tokens, OTPs, or payment details.
 */
class AiChatContextService
{
    public function buildContextBlock(User $user, ?int $jobId = null, ?string $userMessage = null): string
    {
        $parts = [
            'Platform: JobAllocate (jobs, applications, resumes, employer subscriptions, career prep).',
            'User role: '.$user->role,
            'User name: '.$user->name,
        ];

        if ($user->hasRole(UserRole::JobSeeker)) {
            $parts[] = $this->seekerContext($user);
            $parts[] = $this->seekerLiveDataContext($user, $userMessage);
        } elseif ($user->hasRole(UserRole::Company)) {
            $parts[] = $this->employerContext($user);
            $parts[] = $this->employerLiveDataContext($user, $userMessage);
        }

        if ($jobId !== null) {
            $parts[] = $this->jobContext($user, $jobId);
        }

        $block = implode("\n\n", array_filter($parts));
        $max = (int) config('ai_chat.max_context_chars', 8000);

        if (strlen($block) > $max) {
            return substr($block, 0, $max).'…';
        }

        return $block;
    }

    private function seekerLiveDataContext(User $user, ?string $userMessage): string
    {
        if ($userMessage === null || trim($userMessage) === '') {
            return '';
        }

        $intents = $this->detectSeekerIntents($userMessage);
        $sections = [];

        if (in_array('jobs_near_me', $intents, true)) {
            $sections[] = $this->jobsNearUserSection($user);
        }

        if (in_array('recommended_jobs', $intents, true)) {
            $sections[] = $this->recommendedJobsSection($user);
        }

        if (in_array('my_applications', $intents, true)) {
            $sections[] = $this->applicationsSection($user);
        }

        if (in_array('saved_jobs', $intents, true)) {
            $sections[] = $this->savedJobsSection($user);
        }

        if ($sections === []) {
            return '';
        }

        return implode("\n\n", $sections);
    }

    private function employerLiveDataContext(User $user, ?string $userMessage): string
    {
        if ($userMessage === null || trim($userMessage) === '') {
            return '';
        }

        $intents = $this->detectEmployerIntents($userMessage);
        $sections = [];

        if (in_array('employer_jobs', $intents, true)) {
            $sections[] = $this->employerJobsSection($user);
        }

        if (in_array('employer_applicants', $intents, true)) {
            $sections[] = $this->employerApplicantsSection($user);
        }

        if ($sections === []) {
            return '';
        }

        return implode("\n\n", $sections);
    }

    /**
     * @return list<string>
     */
    private function detectSeekerIntents(string $message): array
    {
        $m = strtolower($message);
        $intents = [];

        if (preg_match('/\b(near me|nearby|around me|close to me|in my (city|area|location|district|state)|local jobs?|jobs? near)\b/', $m)) {
            $intents[] = 'jobs_near_me';
        }

        if (preg_match('/\b(my applications?|application status|applied jobs?|show my applications?|track my applications?)\b/', $m)) {
            $intents[] = 'my_applications';
        }

        if (preg_match('/\b(saved jobs?|bookmarked jobs?|my saved)\b/', $m)) {
            $intents[] = 'saved_jobs';
        }

        if (preg_match('/\b(matching my profile|recommended jobs?|find jobs?|jobs? for me|suitable jobs?|jobs? matching)\b/', $m)) {
            $intents[] = 'recommended_jobs';
        }

        if (preg_match('/\b(jobs?|vacancies|vacancy|openings?|hiring)\b/', $m) && $intents === []) {
            $intents[] = 'recommended_jobs';
        }

        return array_values(array_unique($intents));
    }

    /**
     * @return list<string>
     */
    private function detectEmployerIntents(string $message): array
    {
        $m = strtolower($message);
        $intents = [];

        if (preg_match('/\b(active jobs?|my job posts?|posted jobs?|show my jobs?)\b/', $m)) {
            $intents[] = 'employer_jobs';
        }

        if (preg_match('/\b(applicants?|candidates?|applications? received|who applied)\b/', $m)) {
            $intents[] = 'employer_applicants';
        }

        return array_values(array_unique($intents));
    }

    private function seekerContext(User $user): string
    {
        $profile = $user->jobSeekerProfile;
        $lines = ['--- Job seeker profile (summary) ---'];

        if ($profile) {
            $lines[] = 'Headline: '.($profile->headline ?? 'Not set');
            $lines[] = 'Industry: '.($profile->industry_type ?? 'Not set');
            $lines[] = 'Experience years: '.($profile->experience_years ?? 'Not set');
            $skills = $profile->skills;
            if (is_array($skills) && $skills !== []) {
                $lines[] = 'Skills: '.implode(', ', array_slice($skills, 0, 15));
            }
            $location = array_filter([
                $profile->city,
                $profile->district,
                $profile->state,
            ]);
            if ($location !== []) {
                $lines[] = 'Location: '.implode(', ', $location);
            } else {
                $lines[] = 'Location: Not set in profile (user should update profile for better nearby job results).';
            }
        }

        return implode("\n", $lines);
    }

    private function jobsNearUserSection(User $user): string
    {
        JobPost::runAutoCloseJobs();

        $profile = $user->jobSeekerProfile;
        $searchTerms = $this->locationSearchTerms($profile);
        $appliedIds = Application::query()
            ->where('user_id', $user->id)
            ->pluck('job_post_id')
            ->all();

        if ($searchTerms === []) {
            $fallback = $this->fetchListedJobs($appliedIds, 10);

            return $this->formatJobListings(
                $fallback,
                '--- LIVE JOBS (near you) ---',
                'User asked for jobs near them but has no city/district/state in profile. Showing latest open jobs instead. Tell the user to update their profile location for better nearby results.'
            );
        }

        $jobs = $this->fetchJobsByLocationTerms($searchTerms, $appliedIds, 15);

        if ($jobs->isEmpty()) {
            $jobs = $this->fetchListedJobs($appliedIds, 10);
            $area = implode(', ', $searchTerms);

            return $this->formatJobListings(
                $jobs,
                '--- LIVE JOBS (near you) ---',
                "No jobs matched location \"{$area}\" exactly. Showing other open jobs. Suggest the user try the Home tab search or broaden their location in profile."
            );
        }

        $area = implode(', ', array_slice($searchTerms, 0, 3));

        return $this->formatJobListings(
            $jobs,
            '--- LIVE JOBS NEAR USER (from JobAllocate database) ---',
            "Matched using profile location: {$area}. You MUST list every job below with its number, title, company, location, and Job #ID. Do not only tell the user to open the app."
        );
    }

    private function recommendedJobsSection(User $user): string
    {
        JobPost::runAutoCloseJobs();

        $profile = $user->jobSeekerProfile;
        $appliedIds = Application::query()
            ->where('user_id', $user->id)
            ->pluck('job_post_id')
            ->all();

        $jobs = $this->fetchRecommendedJobs($profile, $appliedIds, 12);

        return $this->formatJobListings(
            $jobs,
            '--- RECOMMENDED JOBS (matched to profile) ---',
            'These jobs match the user profile (industry/skills). List each job with title, company, location, and Job #ID.'
        );
    }

    private function applicationsSection(User $user): string
    {
        $apps = Application::query()
            ->with(['jobPost' => fn ($q) => $q->with('company:id,name')->select('id', 'title', 'location', 'company_id', 'status')])
            ->where('user_id', $user->id)
            ->latest('applied_at')
            ->limit(15)
            ->get();

        if ($apps->isEmpty()) {
            return "--- USER'S APPLICATIONS ---\nThe user has not applied to any jobs yet.";
        }

        $lines = [
            "--- USER'S APPLICATIONS (from JobAllocate database) ---",
            'List each application below with job title, company, status, and Job #ID.',
            '',
        ];

        foreach ($apps as $i => $app) {
            $job = $app->jobPost;
            $title = $job?->title ?? 'Unknown job';
            $company = $job?->company?->name ?? 'Unknown company';
            $location = $job?->location ?? '';
            $status = $app->status instanceof \BackedEnum ? $app->status->value : (string) $app->status;
            $jobId = $job?->id ?? $app->job_post_id;
            $lines[] = sprintf(
                '%d. %s at %s%s — Status: %s (Job #%d)',
                $i + 1,
                $title,
                $company,
                $location !== '' ? " — {$location}" : '',
                $status,
                $jobId
            );
        }

        $lines[] = 'Total applications: '.$apps->count();

        return implode("\n", $lines);
    }

    private function savedJobsSection(User $user): string
    {
        $saved = SavedJob::query()
            ->with(['jobPost' => fn ($q) => $q->with('company:id,name')])
            ->where('user_id', $user->id)
            ->latest('id')
            ->limit(15)
            ->get()
            ->map(fn (SavedJob $s) => $s->jobPost)
            ->filter();

        return $this->formatJobListings(
            collect($saved->values()),
            '--- SAVED JOBS ---',
            'List each saved job with title, company, location, and Job #ID.'
        );
    }

    private function employerJobsSection(User $user): string
    {
        $company = $user->company;
        if ($company === null) {
            return '--- EMPLOYER JOBS --- Company profile not found.';
        }

        $jobs = JobPost::query()
            ->where('company_id', $company->id)
            ->where('status', JobPostStatus::Published)
            ->whereNotNull('published_at')
            ->latest('published_at')
            ->limit(15)
            ->get(['id', 'title', 'location', 'status', 'employment_type']);

        if ($jobs->isEmpty()) {
            return '--- EMPLOYER ACTIVE JOBS --- No published jobs right now.';
        }

        $lines = [
            '--- EMPLOYER ACTIVE JOBS ---',
            'List each job with title, location, and Job #ID.',
            '',
        ];

        foreach ($jobs as $i => $job) {
            $lines[] = sprintf(
                '%d. [Job #%d] %s — %s — %s',
                $i + 1,
                $job->id,
                $job->title,
                $job->location ?? 'No location',
                $job->employment_type ?? 'Not specified'
            );
        }

        return implode("\n", $lines);
    }

    private function employerApplicantsSection(User $user): string
    {
        $company = $user->company;
        if ($company === null) {
            return '--- APPLICANTS --- Company profile not found.';
        }

        $jobs = JobPost::query()
            ->where('company_id', $company->id)
            ->latest('updated_at')
            ->limit(8)
            ->get(['id', 'title']);

        if ($jobs->isEmpty()) {
            return '--- APPLICANTS --- No job posts yet.';
        }

        $lines = [
            '--- APPLICANT SUMMARY (your company jobs) ---',
            '',
        ];

        foreach ($jobs as $job) {
            $count = Application::query()->where('job_post_id', $job->id)->count();
            $shortlisted = Application::query()
                ->where('job_post_id', $job->id)
                ->where('status', 'shortlisted')
                ->count();
            $lines[] = sprintf(
                '- %s (Job #%d): %d total applicants, %d shortlisted',
                $job->title,
                $job->id,
                $count,
                $shortlisted
            );
        }

        return implode("\n", $lines);
    }

    /**
     * @return list<string>
     */
    private function locationSearchTerms(?JobSeekerProfile $profile): array
    {
        if ($profile === null) {
            return [];
        }

        $terms = [];
        foreach ([$profile->city, $profile->district, $profile->state] as $value) {
            if (is_string($value) && trim($value) !== '') {
                $terms[] = trim($value);
            }
        }

        if (is_array($profile->preferred_locations)) {
            foreach ($profile->preferred_locations as $loc) {
                if (is_string($loc) && trim($loc) !== '') {
                    $terms[] = trim($loc);
                }
            }
        }

        return array_values(array_unique($terms));
    }

    /**
     * @param  list<string>  $terms
     * @param  list<int>  $excludeJobIds
     */
    private function fetchJobsByLocationTerms(array $terms, array $excludeJobIds, int $limit): Collection
    {
        $query = JobPost::query()
            ->with('company:id,name')
            ->listed()
            ->when($excludeJobIds !== [], fn ($q) => $q->whereNotIn('id', $excludeJobIds))
            ->where(function ($q) use ($terms): void {
                foreach ($terms as $term) {
                    $like = '%'.$term.'%';
                    $q->orWhere('location', 'like', $like)
                        ->orWhere('preferred_locations', 'like', $like);
                }
            })
            ->latest('published_at')
            ->limit($limit);

        return $query->get();
    }

    /**
     * @param  list<int>  $excludeJobIds
     */
    private function fetchListedJobs(array $excludeJobIds, int $limit): Collection
    {
        return JobPost::query()
            ->with('company:id,name')
            ->listed()
            ->when($excludeJobIds !== [], fn ($q) => $q->whereNotIn('id', $excludeJobIds))
            ->latest('published_at')
            ->limit($limit)
            ->get();
    }

    /**
     * @param  list<int>  $appliedIds
     */
    private function fetchRecommendedJobs(?JobSeekerProfile $profile, array $appliedIds, int $limit): Collection
    {
        $base = fn () => JobPost::query()
            ->with('company:id,name')
            ->listed()
            ->when($appliedIds !== [], fn ($q) => $q->whereNotIn('id', $appliedIds));

        $seen = [];
        $ordered = collect();

        $add = function (Collection $batch) use (&$seen, &$ordered, $limit): void {
            foreach ($batch as $job) {
                if ($ordered->count() >= $limit) {
                    return;
                }
                if (isset($seen[$job->id])) {
                    continue;
                }
                $seen[$job->id] = true;
                $ordered->push($job);
            }
        };

        if ($profile && filled($profile->industry_type)) {
            $add($base()->where('industry_type', $profile->industry_type)->latest('published_at')->limit($limit)->get());
        }

        if ($ordered->count() < $limit && $profile) {
            $skills = array_values(array_filter(
                array_slice($profile->skills ?? [], 0, 10),
                fn ($s) => is_string($s) && $s !== ''
            ));
            foreach ($skills as $skill) {
                if ($ordered->count() >= $limit) {
                    break;
                }
                $ids = array_keys($seen);
                $add($base()
                    ->when($ids !== [], fn ($q) => $q->whereNotIn('id', $ids))
                    ->whereJsonContains('skills', $skill)
                    ->latest('published_at')
                    ->limit($limit - $ordered->count())
                    ->get());
            }
        }

        if ($ordered->count() < $limit) {
            $ids = array_keys($seen);
            $add($base()
                ->when($ids !== [], fn ($q) => $q->whereNotIn('id', $ids))
                ->latest('published_at')
                ->limit($limit - $ordered->count())
                ->get());
        }

        return $ordered;
    }

    /**
     * @param  Collection<int, JobPost>  $jobs
     */
    private function formatJobListings(Collection $jobs, string $heading, string $instruction): string
    {
        $lines = [$heading, $instruction, ''];

        if ($jobs->isEmpty()) {
            $lines[] = 'No matching jobs found right now.';
            $lines[] = 'Tell the user to check the Home tab or update their profile for better matches.';

            return implode("\n", $lines);
        }

        foreach ($jobs->values() as $i => $job) {
            $company = $job->company?->name ?? 'Company';
            $loc = $job->location ?? 'Location not specified';
            $type = filled($job->employment_type) ? $job->employment_type : null;
            $exp = filled($job->experience_level) ? $job->experience_level : null;

            $detail = array_filter([$type, $exp]);
            $suffix = $detail !== [] ? ' — '.implode(', ', $detail) : '';

            $lines[] = sprintf(
                '%d. [Job #%d] %s at %s — %s%s',
                $i + 1,
                $job->id,
                $job->title,
                $company,
                $loc,
                $suffix
            );

            if ($job->salary_min !== null || $job->salary_max !== null) {
                $lines[] = '   Salary: '.($job->salary_min ?? '?').' - '.($job->salary_max ?? '?').' '.($job->currency ?? 'INR');
            }

            $skills = is_array($job->skills) ? array_slice($job->skills, 0, 5) : [];
            if ($skills !== []) {
                $lines[] = '   Skills: '.implode(', ', $skills);
            }
        }

        $lines[] = '';
        $lines[] = 'Total jobs listed: '.$jobs->count();
        $lines[] = 'To apply: user opens Job #ID in the app Home/Apply tab (you cannot apply for them).';

        return implode("\n", $lines);
    }

    private function employerContext(User $user): string
    {
        $company = $user->company;
        if ($company === null) {
            return '--- Employer --- Company profile not found.';
        }

        return implode("\n", [
            '--- Company ---',
            'Company: '.$company->name,
            'Verification: '.($company->verification_status instanceof \BackedEnum
                ? $company->verification_status->value
                : (string) $company->verification_status),
            'Job credits remaining: '.(string) ($company->job_credits ?? 0),
        ]);
    }

    private function jobContext(User $user, int $jobId): string
    {
        $job = JobPost::query()->with('company:id,name')->find($jobId);
        if ($job === null) {
            return '--- Requested job --- Job #'.$jobId.' was not found.';
        }

        if ($user->hasRole(UserRole::Company)) {
            $companyId = $user->company?->id;
            if ($companyId === null || $job->company_id !== $companyId) {
                return '--- Requested job --- You do not have access to job #'.$jobId.'.';
            }
        }

        $status = $job->status instanceof \BackedEnum ? $job->status->value : (string) $job->status;
        $skills = is_array($job->skills) ? implode(', ', array_slice($job->skills, 0, 12)) : '';

        $lines = [
            '--- Job context (user is viewing or asking about this job) ---',
            'Title: '.$job->title,
            'Company: '.($job->company?->name ?? 'Unknown'),
            'Location: '.($job->location ?? 'Not specified'),
            'Employment type: '.($job->employment_type ?? 'Not specified'),
            'Experience: '.($job->experience_level ?? 'Not specified'),
            'Status: '.$status,
        ];

        if ($skills !== '') {
            $lines[] = 'Skills: '.$skills;
        }

        $desc = trim((string) ($job->description ?? ''));
        if ($desc !== '') {
            $lines[] = 'Description excerpt: '.mb_substr($desc, 0, 600);
        }

        $req = trim((string) ($job->requirements ?? ''));
        if ($req !== '') {
            $lines[] = 'Requirements excerpt: '.mb_substr($req, 0, 400);
        }

        if ($user->hasRole(UserRole::JobSeeker)) {
            $app = Application::query()
                ->where('user_id', $user->id)
                ->where('job_post_id', $job->id)
                ->first();
            if ($app) {
                $appStatus = $app->status instanceof \BackedEnum ? $app->status->value : (string) $app->status;
                $lines[] = "User's application status for this job: {$appStatus}";
            } else {
                $lines[] = 'User has not applied to this job yet.';
            }
        }

        if ($user->hasRole(UserRole::Company)) {
            $appCount = Application::query()->where('job_post_id', $job->id)->count();
            $lines[] = "Total applicants: {$appCount}";
        }

        return implode("\n", $lines);
    }

    public function safeEmail(?string $email): ?string
    {
        if ($email === null || Identifier::isSyntheticEmail($email)) {
            return null;
        }

        return $email;
    }
}
