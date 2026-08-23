<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Services\PlatformSettingService;
use Illuminate\Http\JsonResponse;

class PublicContactController extends Controller
{
    use ApiResponses;

    public function __construct(
        private readonly PlatformSettingService $settings
    ) {}

    public function show(): JsonResponse
    {
        return $this->ok($this->settings->contactSettings());
    }
}
