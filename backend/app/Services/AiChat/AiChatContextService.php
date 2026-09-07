<?php

namespace App\Services\AiChat;

use App\Enums\UserRole;
use App\Models\Application;
use App\Models\JobPost;
use App\Models\User;
use App\Support\Identifier;

/**
 * Controlled, authorization-enforced context for the AI assistant.
 * Never exposes passwords, tokens, OTPs, or payment details.
 */
class AiChatContextService
{
    public function buildContextBlock(User $user, ?int $jobId = null): string
    {
        $parts = [
            'Platform: JobAllocate (jobs, applications, resumes, employer subscriptions, career prep).',
            'User role: '.$user->role,
            'User name: '.$user->name,
        ];

        if ($user->hasRole(UserRole::JobSeeker)) {
            $parts[] = $this->seekerContext($user);
        } elseif ($user->hasRole(UserRole::Company)) {
            $parts[] = $this->employerContext($user);
        }

        if ($jobId !== null) {
            $parts[] = $this->jobContext($user, $jobId);
        }

        $block = implode("\n", array_filter($parts));
        $max = (int) config('ai_chat.max_context_chars', 8000);

        if (strlen($block) > $max) {
            return substr($block, 0, $max).'…';
        }

        return $block;
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
            }
        }

        $applications = Application::query()
            ->with(['jobPost:id,title,location,status'])
            ->where('user_id', $user->id)
            ->latest('applied_at')
            ->limit(8)
            ->get();

        if ($applications->isNotEmpty()) {
            $lines[] = '--- Recent applications (status only) ---';
            foreach ($applications as $app) {
                $title = $app->jobPost?->title ?? 'Unknown job';
                $status = $app->status instanceof \BackedEnum ? $app->status->value : (string) $app->status;
                $lines[] = "- {$title} (application #{$app->id}): {$status}";
            }
        } else {
            $lines[] = 'No job applications yet.';
        }

        return implode("\n", $lines);
    }

    private function employerContext(User $user): string
    {
        $company = $user->company;
        if ($company === null) {
            return '--- Employer --- Company profile not found.';
        }

        $lines = [
            '--- Company ---',
            'Company: '.$company->name,
            'Verification: '.($company->verification_status instanceof \BackedEnum
                ? $company->verification_status->value
                : (string) $company->verification_status),
            'Job credits remaining: '.(string) ($company->job_credits ?? 0),
        ];

        $jobs = JobPost::query()
            ->where('company_id', $company->id)
            ->latest('updated_at')
            ->limit(8)
            ->get(['id', 'title', 'status', 'location']);

        if ($jobs->isNotEmpty()) {
            $lines[] = '--- Active/recent job posts ---';
            foreach ($jobs as $job) {
                $status = $job->status instanceof \BackedEnum ? $job->status->value : (string) $job->status;
                $appCount = Application::query()->where('job_post_id', $job->id)->count();
                $lines[] = "- {$job->title} (job #{$job->id}, {$status}): {$appCount} applicants";
            }
        } else {
            $lines[] = 'No job posts yet.';
        }

        return implode("\n", $lines);
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

    /** Strip email if synthetic (internal placeholder). */
    public function safeEmail(?string $email): ?string
    {
        if ($email === null || Identifier::isSyntheticEmail($email)) {
            return null;
        }

        return $email;
    }
}
