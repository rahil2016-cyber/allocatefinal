<?php

namespace App\Http\Controllers\Api\V1\JobSeeker;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Models\JobSeekerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResumeSelectionController extends Controller
{
    use ApiResponses;

    public function getSelection(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = JobSeekerProfile::query()->firstOrCreate(
            ['user_id' => $user->id],
            []
        );

        $allowedCount = $profile->allowedTemplateCount();
        $selected = $profile->selected_template_ids ?? [];

        return $this->ok([
            'active_package_key' => $profile->resume_package_key ?? $profile->package_key ?? 'basic_resume',
            'allowed_count' => $allowedCount,
            'selected_template_ids' => $selected,
            'is_selection_complete' => is_array($selected) && count($selected) === $allowedCount,
        ], 'OK');
    }

    public function saveSelection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_ids' => ['required', 'array'],
            'template_ids.*' => ['required', 'string', 'max:64'],
        ]);

        $user = $request->user();
        $profile = JobSeekerProfile::query()->firstOrCreate(
            ['user_id' => $user->id],
            []
        );

        $allowedCount = $profile->allowedTemplateCount();
        $templateIds = array_values(array_unique($validated['template_ids']));

        if (count($templateIds) > $allowedCount) {
            return $this->fail("Your plan allows selecting up to {$allowedCount} resume templates.", null, 422);
        }

        $profile->selected_template_ids = $templateIds;
        $profile->save();

        return $this->ok([
            'active_package_key' => $profile->resume_package_key ?? $profile->package_key ?? 'basic_resume',
            'allowed_count' => $allowedCount,
            'selected_template_ids' => $templateIds,
            'is_selection_complete' => count($templateIds) === $allowedCount,
        ], 'Resume template selection saved.');
    }
}
