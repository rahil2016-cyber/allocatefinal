<?php

namespace App\Models;

use App\Enums\CompanyVerificationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Company extends Model
{
    protected $appends = [
        'company_logo_url',
    ];

    protected $fillable = [
        'user_id',
        'name',
        'company_kind',
        'slug',
        'industry',
        'industry_type',
        'website',
        'consultancy_hiring_for',
        'hide_hiring_company',
        'description',
        'gst_number',
        'location',
        'state',
        'district',
        'city',
        'established_year',
        'company_bio',
        'what_we_do',
        'benefits',
        'salary_insights',
        'team_members',
        'logo_url',
        'verification_status',
        'is_top_company',
        'job_credits',
        'verified_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'job_credits' => 'integer',
            'verification_status' => CompanyVerificationStatus::class,
            'team_members' => 'array',
            'is_top_company' => 'boolean',
            'hide_hiring_company' => 'boolean',
        ];
    }

    /** Alias for mobile/admin UIs that expect `company_logo_url`. */
    public function getCompanyLogoUrlAttribute(): ?string
    {
        return $this->logo_url;
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function jobPosts(): HasMany
    {
        return $this->hasMany(JobPost::class);
    }

    /** All subscription payment records, ordered by cycle. */
    public function subscriptionPayments(): HasMany
    {
        return $this->hasMany(CompanySubscriptionPayment::class)
            ->where(function ($q) {
                $q->where('payment_status', 'successful')
                  ->orWhere('is_free', true);
            })
            ->orderByDesc('cycle_number');
    }

    public function isVerified(): bool
    {
        return $this->verification_status === CompanyVerificationStatus::Verified;
    }

    /**
     * Paid / free successful subscription cycles last this many days.
     */
    public const SUBSCRIPTION_DURATION_DAYS = 30;

    /**
     * Whether the company currently has an active paid subscription.
     */
    public function isPremium(): bool
    {
        $expiresAt = $this->subscriptionExpiresAt();

        return $expiresAt !== null && $expiresAt->isFuture();
    }

    /**
     * Returns the expiration date of the latest successful subscription cycle.
     */
    public function subscriptionExpiresAt(): ?Carbon
    {
        $latest = $this->subscriptionPayments()->first();
        if ($latest === null || $latest->purchased_at === null) {
            return null;
        }

        return Carbon::parse($latest->purchased_at)->addDays(self::SUBSCRIPTION_DURATION_DAYS);
    }

    /**
     * Whole days remaining until expiry (0 = expires today, negative = already expired).
     */
    public function subscriptionDaysRemaining(): ?int
    {
        $expiresAt = $this->subscriptionExpiresAt();
        if ($expiresAt === null) {
            return null;
        }

        return (int) Carbon::today()->diffInDays($expiresAt->copy()->startOfDay(), false);
    }
}
