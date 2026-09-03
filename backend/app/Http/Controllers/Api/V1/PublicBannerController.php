<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Models\BannerAd;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicBannerController extends Controller
{
    use ApiResponses;

    /**
     * Return active banners filtered by audience.
     *
     * The audience column stores three possible values (confirmed from migration
     * 2026_04_05_120000_add_audience_to_banner_ads_table.php):
     *   'all'        — shown to every user
     *   'job_seeker' — shown to job seekers only
     *   'employer'   — shown to employers only
     *
     * Audience is determined from the authenticated user's role via Sanctum token.
     * The optional ?for= query param is accepted as a fallback for unauthenticated
     * or guest contexts but is always overridden when a valid token is present.
     *
     * DB query logic:
     *   Job seeker  → WHERE audience IN ('all', 'job_seeker')
     *   Employer    → WHERE audience IN ('all', 'employer')
     *   Unknown     → WHERE audience = 'all'  (safe default, no role-specific banners)
     */
    public function index(Request $request): JsonResponse
    {
        // --- Step 1: Resolve audience from authenticated token (most trusted source) ---
        $for = null;

        $token = $request->bearerToken();
        if ($token) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken && $accessToken->tokenable) {
                $role = $accessToken->tokenable->role ?? '';
                if ($role === 'job_seeker') {
                    $for = 'job_seeker';
                } elseif ($role === 'company') {
                    // The User model uses role='company' for employer accounts.
                    $for = 'employer';
                }
            }
        }

        // --- Step 2: Fall back to ?for= query param only if no valid token ---
        if ($for === null) {
            $raw = $request->query('for');
            if (is_string($raw) && in_array($raw, ['job_seeker', 'employer'], true)) {
                $for = $raw;
            }
        }

        // --- Step 3: Build the query ---
        $now = now();

        $query = BannerAd::query()
            ->where('status', 'active')
            // Publish date: null means "no schedule" (show immediately), or must have started.
            ->where(function ($q) use ($now): void {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            // Expiry date: null means "never expires", or must not yet have expired.
            ->where(function ($q) use ($now): void {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
            });

        // --- Step 4: Apply audience filter ---
        if ($for === 'job_seeker') {
            // Job seeker sees: banners for everyone + banners for job seekers.
            $query->whereIn('audience', ['all', 'job_seeker']);
        } elseif ($for === 'employer') {
            // Employer sees: banners for everyone + banners for employers.
            $query->whereIn('audience', ['all', 'employer']);
        } else {
            // No authenticated user / unknown role: only show 'all' banners.
            $query->where('audience', 'all');
        }

        $rows = $query
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (BannerAd $b) => [
                'id'               => $b->id,
                'title'            => $b->title,
                'content'          => $b->content,
                'below_line'       => $b->below_line,
                'target_url'       => $b->target_url,
                'background_color' => $b->background_color,
                'image_url'        => $b->publicImageUrl(),
                'audience'         => $b->audience ?? 'all',
                'starts_at'        => $b->starts_at?->toIso8601String(),
                'expires_at'       => $b->expires_at?->toIso8601String(),
            ])
            ->values()
            ->all();

        return $this->ok($rows)->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
}
