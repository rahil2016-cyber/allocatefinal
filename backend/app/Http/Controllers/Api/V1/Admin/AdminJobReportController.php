<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Models\JobReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminJobReportController extends Controller
{
    use ApiResponses;

    /**
     * GET /admin/job-reports
     * List all job reports (newest first). Filter by status if needed.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status'   => ['nullable', 'in:pending,reviewed,dismissed'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page'     => ['nullable', 'integer', 'min:1'],
            'search'   => ['nullable', 'string', 'max:200'],
        ]);

        $q = JobReport::query()
            ->with([
                'jobPost:id,title,company_id,status,location,employment_type,published_at',
                'jobPost.company:id,name,verification_status',
                'user:id,name,email,phone',
            ])
            ->latest('id');

        if (! empty($validated['status'])) {
            $q->where('status', $validated['status']);
        }

        if (! empty($validated['search'])) {
            $term = trim((string) $validated['search']);
            $q->where(function ($inner) use ($term) {
                $inner->where('reason', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhereHas('user', function ($u) use ($term) {
                        $u->where('name', 'like', "%{$term}%")
                            ->orWhere('email', 'like', "%{$term}%")
                            ->orWhere('phone', 'like', "%{$term}%");
                    })
                    ->orWhereHas('jobPost', function ($j) use ($term) {
                        $j->where('title', 'like', "%{$term}%")
                            ->orWhereHas('company', function ($c) use ($term) {
                                $c->where('name', 'like', "%{$term}%");
                            });
                    });
            });
        }

        $perPage = (int) ($validated['per_page'] ?? 20);
        $rows = $q->paginate($perPage);

        $items = collect($rows->items())->map(fn (JobReport $report) => $this->serializeReport($report))->values()->all();

        return $this->ok(
            $items,
            'OK',
            [
                'current_page' => $rows->currentPage(),
                'last_page'    => $rows->lastPage(),
                'per_page'     => $rows->perPage(),
                'total'        => $rows->total(),
            ]
        );
    }

    /**
     * PATCH /admin/job-reports/{reportId}
     * Update status and/or admin_note.
     */
    public function update(Request $request, int $reportId): JsonResponse
    {
        $report = JobReport::with([
            'jobPost:id,title,company_id,status,location,employment_type,published_at',
            'jobPost.company:id,name,verification_status',
            'user:id,name,email,phone',
        ])->find($reportId);

        if (! $report) {
            return $this->fail('Report not found.', null, 404);
        }

        $validated = $request->validate([
            'status'     => ['nullable', 'in:pending,reviewed,dismissed'],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $report->update(array_filter($validated, fn ($v) => $v !== null));

        $report->refresh()->load([
            'jobPost:id,title,company_id,status,location,employment_type,published_at',
            'jobPost.company:id,name,verification_status',
            'user:id,name,email,phone',
        ]);

        return $this->ok($this->serializeReport($report), 'Report updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeReport(JobReport $report): array
    {
        $job = $report->jobPost;
        $company = $job?->company;
        $user = $report->user;

        return [
            'id' => $report->id,
            'job_post_id' => $report->job_post_id,
            'user_id' => $report->user_id,
            'reason' => $report->reason,
            'description' => $report->description,
            'status' => $report->status,
            'admin_note' => $report->admin_note,
            'created_at' => optional($report->created_at)?->toIso8601String(),
            'updated_at' => optional($report->updated_at)?->toIso8601String(),
            'job_post' => $job ? [
                'id' => $job->id,
                'title' => $job->title,
                'status' => $job->status instanceof \BackedEnum ? $job->status->value : (string) $job->status,
                'location' => $job->location,
                'employment_type' => $job->employment_type,
                'published_at' => optional($job->published_at)?->toIso8601String(),
                'company_id' => $job->company_id,
                'company' => $company ? [
                    'id' => $company->id,
                    'name' => $company->name,
                    'verification_status' => $company->verification_status instanceof \BackedEnum
                        ? $company->verification_status->value
                        : (string) $company->verification_status,
                ] : null,
            ] : null,
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ] : null,
        ];
    }
}
