<?php

namespace App\Services\AiChat;

use App\Http\Concerns\TransformsPublicJobPost;
use App\Models\JobPost;
use Illuminate\Support\Collection;

class AiChatJobSerializer
{
    use TransformsPublicJobPost;

    /**
     * @param  Collection<int, JobPost>  $jobs
     * @param  list<int>  $appliedJobIds
     * @return list<array<string, mixed>>
     */
    public function serialize(Collection $jobs, array $appliedJobIds = []): array
    {
        $applied = array_flip($appliedJobIds);

        return $jobs->map(function (JobPost $job) use ($applied): array {
            $payload = $this->transformListedJob($job);
            $payload['has_applied'] = isset($applied[$job->id]);

            return $payload;
        })->values()->all();
    }
}
