<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Services\PlatformSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    use ApiResponses;

    public function __construct(
        private readonly PlatformSettingService $settings
    ) {}

    public function showModeration(): JsonResponse
    {
        return $this->ok($this->settings->moderationSettings());
    }

    public function updateModeration(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'auto_verify_new_companies' => ['required', 'boolean'],
            'auto_publish_new_jobs' => ['required', 'boolean'],
        ]);

        $updated = $this->settings->updateModerationSettings(
            $validated,
            $request->user()?->id
        );

        return $this->ok($updated, 'Moderation settings updated.');
    }

    public function showContact(): JsonResponse
    {
        return $this->ok($this->settings->contactSettings());
    }

    public function updateContact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'support_phone' => ['required', 'string', 'max:32'],
            'youtube_url' => ['required', 'string', 'max:500'],
            'facebook_url' => ['required', 'string', 'max:500'],
            'whatsapp_url' => ['nullable', 'string', 'max:500'],
            'instagram_url' => ['nullable', 'string', 'max:500'],
            'linkedin_url' => ['nullable', 'string', 'max:500'],
            'website_url' => ['nullable', 'string', 'max:500'],
            'about_text' => ['nullable', 'string', 'max:2000'],
            'app_download_url' => ['nullable', 'string', 'max:500'],
        ]);

        $updated = $this->settings->updateContactSettings(
            $validated,
            $request->user()?->id
        );

        return $this->ok($updated, 'Contact settings updated.');
    }
}

