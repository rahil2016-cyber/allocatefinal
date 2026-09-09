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

    /**
     * Jobs to show as interactive cards in the Flutter chat UI (same payload as job board).
     *
     * @return Collection<int, JobPost>
     */
    public function resolveJobsForMessage(User $user, ?string $userMessage, ?int $jobId = null): Collection
    {
        JobPost::runAutoCloseJobs();

        if ($user->hasRole(UserRole::JobSeeker)) {
            return $this->resolveSeekerJobsForMessage($user, $userMessage, $jobId);
        }

        return collect();
    }

    /**
     * @return Collection<int, JobPost>
     */
    private function resolveSeekerJobsForMessage(User $user, ?string $userMessage, ?int $jobId): Collection
    {
        if ($userMessage === null || trim($userMessage) === '') {
            return collect();
        }

        $intents = $this->detectSeekerIntents($userMessage);
        $profile = $user->jobSeekerProfile;

        if (in_array('jobs_near_me', $intents, true)) {
            $criteria = $this->resolveLocationCriteria(
                $profile,
                $this->parseLocationFromMessage($userMessage)
            );
            if ($criteria !== null) {
                $nearJobs = $this->fetchJobsNearLocation($criteria, [], 15)['jobs'];
                if ($nearJobs->isNotEmpty()) {
                    return $nearJobs;
                }
            }

            // Fallback: If no jobs found in requested location, return recommended/popular jobs
            $fallback = $this->fetchRecommendedJobs($profile, [], 10);
            if ($fallback->isNotEmpty()) {
                return $fallback;
            }

            return $this->listedJobQuery()->latest('published_at')->limit(10)->get();
        }

        if (in_array('recommended_jobs', $intents, true)) {
            return $this->fetchRecommendedJobs($profile, [], 12);
        }

        if (in_array('saved_jobs', $intents, true)) {
            $saved = SavedJob::query()
                ->where('user_id', $user->id)
                ->latest('id')
                ->limit(15)
                ->pluck('job_post_id')
                ->all();

            if ($saved === []) {
                return collect();
            }

            return $this->listedJobQuery()
                ->whereIn('id', $saved)
                ->latest('published_at')
                ->get();
        }

        return collect();
    }

    private function listedJobQuery()
    {
        return JobPost::query()
            ->with('company:id,name,slug,logo_url')
            ->withCount('applications')
            ->listed();
    }

    private function seekerLiveDataContext(User $user, ?string $userMessage): string
    {
        if ($userMessage === null || trim($userMessage) === '') {
            return '';
        }

        $intents = $this->detectSeekerIntents($userMessage);
        $sections = [];

        // Nearby jobs take priority — do not mix with profile recommendations.
        if (in_array('jobs_near_me', $intents, true)) {
            return $this->jobsNearUserSection($user, $userMessage);
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

        if (preg_match('/\b(show|list|see|get|give|fetch|search)\s+(me\s+)?(some\s+|more\s+)?jobs?\b/', $m)) {
            $intents[] = 'recommended_jobs';
        }

        if (preg_match('/\b(jobs?|vacancies|vacancy|openings?|hiring)\b/', $m) && $intents === []) {
            $intents[] = 'recommended_jobs';
        }

        if (preg_match('/\b(jobs?|work|openings?)\s+(?:in|at|near)\s+[a-z]/', $m)) {
            $intents[] = 'jobs_near_me';
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
                $profile->district,
                $profile->city,
                $profile->state,
            ]);
            if ($location !== []) {
                $lines[] = 'District: '.($profile->district ?? 'Not set');
                if (filled($profile->city)) {
                    $lines[] = 'City: '.$profile->city;
                }
                if (filled($profile->state)) {
                    $lines[] = 'State: '.$profile->state;
                }
                $lines[] = 'Nearby job search uses **district** (not whole state).';
            } else {
                $lines[] = 'District: Not set in profile (required for nearby job results).';
            }
        }

        return implode("\n", $lines);
    }

    private function jobsNearUserSection(User $user, ?string $userMessage = null): string
    {
        JobPost::runAutoCloseJobs();

        $profile = $user->jobSeekerProfile;
        // Include jobs already applied to — mark them, do not hide them.
        $appliedIds = Application::query()
            ->where('user_id', $user->id)
            ->pluck('job_post_id')
            ->all();

        $explicitPlace = $this->parseLocationFromMessage($userMessage);
        $criteria = $this->resolveLocationCriteria($profile, $explicitPlace);

        if ($criteria === null) {
            return implode("\n", [
                '--- LIVE JOBS NEAR USER ---',
                'User district is not set in profile and no place was mentioned in their message.',
                'Do NOT invent or guess jobs. Tell the user to:',
                '1. Set their **district** in Me → Profile (jobs near you use district, not whole state), OR',
                '2. Ask e.g. "jobs in Davangere" with a specific district or city name.',
            ]);
        }

        $result = $this->fetchJobsNearLocation($criteria, [], 15);

        if ($result['jobs']->isEmpty()) {
            $fallbackJobs = $this->fetchRecommendedJobs($profile, $appliedIds, 10);
            if ($fallbackJobs->isEmpty()) {
                $fallbackJobs = $this->listedJobQuery()->latest('published_at')->limit(10)->get();
            }

            if ($fallbackJobs->isNotEmpty()) {
                return $this->formatJobListings(
                    $fallbackJobs,
                    '--- LIVE JOBS (LOCATION FALLBACK) ---',
                    "No published jobs were found directly in: {$result['matched_label']}. "
                    ."Showing alternative open jobs on JobAllocate instead. "
                    ."Explain in 1-2 sentences: 'I couldn\'t find active job openings in {$result['matched_label']} right now, but here are some available jobs on JobAllocate you might be interested in:'",
                    $appliedIds
                );
            }

            return implode("\n", [
                '--- LIVE JOBS NEAR USER ---',
                "No published jobs found in district/area: {$result['matched_label']}.",
                'Tell the user no openings match right now and suggest checking back later.',
            ]);
        }

        return $this->formatJobListings(
            $result['jobs'],
            '--- LIVE JOBS NEAR USER (from JobAllocate database) ---',
            "Matched by {$result['match_level']} for: {$result['matched_label']}. "
            .'List ONLY these jobs (title, company, location, Job #ID). Mark jobs user already applied to. Do not add jobs not in this list.',
            $appliedIds
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
     * @return array{city: string, district: string, state: string, preferred: list<string>}|null
     */
    private function resolveLocationCriteria(?JobSeekerProfile $profile, ?string $explicitPlace): ?array
    {
        if ($explicitPlace !== null && $explicitPlace !== '') {
            return [
                'city' => $explicitPlace,
                'district' => '',
                'state' => '',
                'preferred' => [],
                'explicit' => true,
            ];
        }

        if ($profile === null) {
            return null;
        }

        $city = $this->normalizePlace($profile->city);
        $district = $this->normalizePlace($profile->district);
        $state = $this->normalizePlace($profile->state);

        $preferred = [];
        if (is_array($profile->preferred_locations)) {
            foreach ($profile->preferred_locations as $loc) {
                if (is_string($loc)) {
                    $n = $this->normalizePlace($loc);
                    if ($n !== '') {
                        $preferred[] = $n;
                    }
                }
            }
        }

        if ($city === '' && $district === '' && $state === '' && $preferred === []) {
            return null;
        }

        // "Near me" uses district only — not whole state. Require district or city.
        if ($city === '' && $district === '') {
            return null;
        }

        return [
            'city' => $city,
            'district' => $district,
            'state' => $state,
            'preferred' => array_values(array_unique($preferred)),
            'explicit' => false,
        ];
    }

    private function parseLocationFromMessage(?string $message): ?string
    {
        if ($message === null || trim($message) === '') {
            return null;
        }

        $patterns = [
            '/\b(?:jobs?|work|openings?|vacancies)\s+(?:in|at|near)\s+([a-zA-Z][a-zA-Z\s\-\.]{1,45})/iu',
            '/\b(?:in|at|near)\s+([a-zA-Z][a-zA-Z\s\-\.]{1,45})(?:\s*\?|$)/iu',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $message, $matches)) {
                $place = $this->normalizePlace($matches[1]);
                if ($place !== '' && strlen($place) >= 3) {
                    return $place;
                }
            }
        }

        return null;
    }

    private function normalizePlace(?string $value): string
    {
        if ($value === null) {
            return '';
        }

        $v = trim(preg_replace('/\s+/', ' ', $value) ?? $value);

        return $v;
    }

    /**
     * Common spelling variants for Indian district/city names.
     *
     * @return list<string>
     */
    private function locationSearchVariants(string $place): array
    {
        $place = $this->normalizePlace($place);
        if ($place === '') {
            return [];
        }

        $variants = [$place];
        $key = mb_strtolower($place);

        $aliases = [
            'davanagere' => ['davangere'],
            'davangere' => ['davanagere'],
            'bengaluru' => ['bangalore', 'bengaluru urban'],
            'bangalore' => ['bengaluru', 'bengaluru urban'],
            'mysuru' => ['mysore'],
            'mysore' => ['mysuru'],
            'belagavi' => ['belgaum'],
            'belgaum' => ['belagavi'],
            'kalaburagi' => ['gulbarga'],
            'gulbarga' => ['kalaburagi'],
            'shivamogga' => ['shimoga'],
            'shimoga' => ['shivamogga'],
            'tumakuru' => ['tumkur'],
            'tumkur' => ['tumakuru'],
            'vijayapura' => ['bijapur'],
            'bijapur' => ['vijayapura'],
            'ballari' => ['bellary'],
            'bellary' => ['ballari'],
            'chikkamagaluru' => ['chikmagalur'],
            'chikmagalur' => ['chikkamagaluru'],
        ];

        if (isset($aliases[$key])) {
            foreach ($aliases[$key] as $alt) {
                $variants[] = $alt;
            }
        }

        return array_values(array_unique($variants));
    }

    /**
     * Tiered search: district first, then city — never whole state.
     *
     * @param  array{city: string, district: string, state: string, preferred: list<string>, explicit?: bool}  $criteria
     * @param  list<int>  $excludeJobIds
     * @return array{jobs: Collection<int, JobPost>, matched_label: string, match_level: string}
     */
    private function fetchJobsNearLocation(array $criteria, array $excludeJobIds, int $limit): array
    {
        $tiers = [];

        if (! empty($criteria['explicit'])) {
            $tiers[] = ['term' => $criteria['city'], 'level' => 'named place'];
        } else {
            // District is the primary anchor for "jobs near me".
            if ($criteria['district'] !== '') {
                $tiers[] = ['term' => $criteria['district'], 'level' => 'district'];
            }
            if ($criteria['city'] !== '' && $criteria['city'] !== $criteria['district']) {
                $tiers[] = ['term' => $criteria['city'], 'level' => 'city'];
            }
            foreach ($criteria['preferred'] as $pref) {
                if ($pref !== '' && $pref !== $criteria['district'] && $pref !== $criteria['city']) {
                    $tiers[] = ['term' => $pref, 'level' => 'preferred location'];
                }
            }
        }

        foreach ($tiers as $tier) {
            $jobs = $this->fetchJobsMatchingPlace($tier['term'], $excludeJobIds, $limit);
            if ($jobs->isNotEmpty()) {
                return [
                    'jobs' => $jobs,
                    'matched_label' => $tier['term'],
                    'match_level' => $tier['level'],
                ];
            }
        }

        $label = $criteria['district'] !== ''
            ? $criteria['district']
            : $criteria['city'];

        return [
            'jobs' => collect(),
            'matched_label' => $label !== '' ? $label : 'your district',
            'match_level' => 'district',
        ];
    }

    /**
     * @param  list<int>  $excludeJobIds
     */
    private function fetchJobsMatchingPlace(string $place, array $excludeJobIds, int $limit): Collection
    {
        $variants = $this->locationSearchVariants($place);
        if ($variants === []) {
            return collect();
        }

        $seen = [];
        $jobs = collect();

        foreach ($variants as $variant) {
            if (strlen($variant) < 3) {
                continue;
            }

            $batch = $this->listedJobQuery()
                ->when($excludeJobIds !== [], fn ($q) => $q->whereNotIn('id', $excludeJobIds))
                ->where(function ($q) use ($variant): void {
                    $q->whereRaw('LOWER(location) LIKE ?', ['%'.mb_strtolower($variant).'%'])
                        ->orWhereRaw('LOWER(CAST(preferred_locations AS CHAR)) LIKE ?', ['%'.mb_strtolower($variant).'%']);
                })
                ->latest('published_at')
                ->limit($limit)
                ->get()
                ->filter(fn (JobPost $job) => $this->jobMatchesPlace($job, $place));

            foreach ($batch as $job) {
                if (isset($seen[$job->id])) {
                    continue;
                }
                $seen[$job->id] = true;
                $jobs->push($job);
                if ($jobs->count() >= $limit) {
                    return $jobs->values();
                }
            }
        }

        // Fuzzy fallback: tolerate small spelling mistakes (e.g. Davanager → Davangere).
        if ($jobs->count() < $limit) {
            $prefix = substr($this->locationKey($place), 0, 4);
            if (strlen($prefix) >= 4) {
                $fuzzyBatch = $this->listedJobQuery()
                    ->when($excludeJobIds !== [], fn ($q) => $q->whereNotIn('id', $excludeJobIds))
                    ->where(function ($q) use ($prefix): void {
                        $like = '%'.$prefix.'%';
                        $q->whereRaw('LOWER(location) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(CAST(preferred_locations AS CHAR)) LIKE ?', [$like]);
                    })
                    ->latest('published_at')
                    ->limit(40)
                    ->get()
                    ->filter(fn (JobPost $job) => $this->jobMatchesPlace($job, $place));

                foreach ($fuzzyBatch as $job) {
                    if (isset($seen[$job->id])) {
                        continue;
                    }
                    $seen[$job->id] = true;
                    $jobs->push($job);
                    if ($jobs->count() >= $limit) {
                        break;
                    }
                }
            }
        }

        return $jobs->values();
    }

    private function jobMatchesPlace(JobPost $job, string $place): bool
    {
        if ($job->location !== null && $this->fuzzyPlaceMatches($place, $job->location)) {
            return true;
        }

        $preferred = $job->preferred_locations;
        if (is_array($preferred)) {
            foreach ($preferred as $loc) {
                if (is_string($loc) && $this->fuzzyPlaceMatches($place, $loc)) {
                    return true;
                }
            }
        }

        return false;
    }

    /** Lowercase alphanumeric key for fuzzy compare. */
    private function locationKey(string $value): string
    {
        $v = mb_strtolower($this->normalizePlace($value));

        return preg_replace('/[^a-z0-9]/', '', $v) ?? $v;
    }

    /**
     * True when [place] matches [haystack] exactly, via known alias, or close spelling.
     */
    private function fuzzyPlaceMatches(string $needle, string $haystack): bool
    {
        $needleKey = $this->locationKey($needle);
        if ($needleKey === '') {
            return false;
        }

        foreach ($this->locationSearchVariants($needle) as $variant) {
            $variantKey = $this->locationKey($variant);
            if ($variantKey === '') {
                continue;
            }
            if ($this->textContainsLocationKey($haystack, $variantKey)) {
                return true;
            }
        }

        if ($this->textContainsLocationKey($haystack, $needleKey)) {
            return true;
        }

        $parts = preg_split('/[,\|\/]/', mb_strtolower($haystack)) ?: [];
        foreach ($parts as $part) {
            $part = trim($part);
            if ($part === '') {
                continue;
            }
            if ($this->keysAreSimilar($needleKey, $this->locationKey($part))) {
                return true;
            }
        }

        return $this->keysAreSimilar($needleKey, $this->locationKey($haystack));
    }

    private function textContainsLocationKey(string $text, string $key): bool
    {
        if ($key === '') {
            return false;
        }

        $hay = $this->locationKey($text);

        return $hay !== '' && str_contains($hay, $key);
    }

    private function keysAreSimilar(string $a, string $b): bool
    {
        if ($a === '' || $b === '') {
            return false;
        }

        if ($a === $b) {
            return true;
        }

        if (str_contains($a, $b) || str_contains($b, $a)) {
            return true;
        }

        $len = max(strlen($a), strlen($b));
        if ($len < 4) {
            return false;
        }

        // ~1 character wrong per 5 letters (Davanager ≈ Davangere).
        $maxDistance = (int) max(1, floor($len / 5));
        if (levenshtein($a, $b) <= $maxDistance) {
            return true;
        }

        similar_text($a, $b, $percent);

        return $percent >= 80.0;
    }

    /**
     * @param  list<int>  $appliedIds
     */
    private function fetchRecommendedJobs(?JobSeekerProfile $profile, array $appliedIds, int $limit): Collection
    {
        $base = fn () => $this->listedJobQuery();

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
     * @param  list<int>  $appliedJobIds
     */
    private function formatJobListings(Collection $jobs, string $heading, string $instruction, array $appliedJobIds = []): string
    {
        $lines = [$heading, $instruction, ''];

        if ($jobs->isEmpty()) {
            $lines[] = 'No matching jobs found right now.';
            $lines[] = 'Tell the user to check the Home tab or update their profile for better matches.';

            return implode("\n", $lines);
        }

        $appliedSet = array_flip($appliedJobIds);

        foreach ($jobs->values() as $i => $job) {
            $company = $job->company?->name ?? 'Company';
            $loc = $job->location ?? 'Location not specified';
            $type = filled($job->employment_type) ? $job->employment_type : null;
            $exp = filled($job->experience_level) ? $job->experience_level : null;

            $detail = array_filter([$type, $exp]);
            $suffix = $detail !== [] ? ' — '.implode(', ', $detail) : '';
            $appliedNote = isset($appliedSet[$job->id]) ? ' — **Already applied**' : '';

            $lines[] = sprintf(
                '%d. [Job #%d] %s at %s — %s%s%s',
                $i + 1,
                $job->id,
                $job->title,
                $company,
                $loc,
                $suffix,
                $appliedNote
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
