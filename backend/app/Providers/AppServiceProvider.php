<?php

namespace App\Providers;

use App\Services\Cashfree\CashfreeClient;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\HttpFoundation\Response;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CashfreeClient::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Production auth / public API rate limits.
     *
     * Keys combine IP + identifier (when present) so shared NAT and targeted
     * credential stuffing are both constrained.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)
                ->by($request->user()?->id ?: $request->ip())
                ->response(fn (Request $request, array $headers) => $this->tooManyAttempts($headers));
        });

        // Login / OTP auth use dedicated leaky-bucket middleware (`leaky:login`,
        // `leaky:otp`, `leaky:otp_verify`) — see config/leaky_bucket.php.

        // Forgot / reset password after Firebase phone proof.
        RateLimiter::for('auth-password-reset', function (Request $request) {
            return [
                Limit::perMinute(5)
                    ->by('pw-reset|ip|'.$request->ip())
                    ->response(fn (Request $request, array $headers) => $this->tooManyAttempts($headers, 'password_reset')),
                Limit::perHour(15)
                    ->by('pw-reset|hour|'.$request->ip())
                    ->response(fn (Request $request, array $headers) => $this->tooManyAttempts($headers, 'password_reset_hour')),
            ];
        });

        // Authenticated password change / set.
        RateLimiter::for('auth-password-change', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return [
                Limit::perMinute(6)
                    ->by('pw-change|'.$key)
                    ->response(fn (Request $request, array $headers) => $this->tooManyAttempts($headers, 'password_change')),
                Limit::perHour(20)
                    ->by('pw-change|hour|'.$key)
                    ->response(fn (Request $request, array $headers) => $this->tooManyAttempts($headers, 'password_change_hour')),
            ];
        });

        // Referral / promo validation (public).
        RateLimiter::for('auth-refer-validate', function (Request $request) {
            return [
                Limit::perMinute(20)
                    ->by('refer-validate|ip|'.$request->ip())
                    ->response(fn (Request $request, array $headers) => $this->tooManyAttempts($headers)),
                Limit::perHour(100)
                    ->by('refer-validate|hour|'.$request->ip())
                    ->response(fn (Request $request, array $headers) => $this->tooManyAttempts($headers)),
            ];
        });
    }

    private function tooManyAttempts(array $headers, string $context = 'default'): Response
    {
        $message = match ($context) {
            'password_reset' => 'Too many password reset attempts. Please wait a minute and try again.',
            'password_reset_hour' => 'Password reset limit reached. Please try again later.',
            'password_change', 'password_change_hour' => 'Too many password change attempts. Please wait and try again.',
            default => 'Too many requests. Please wait a moment and try again.',
        };

        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
        ], 429, $headers);
    }
}
