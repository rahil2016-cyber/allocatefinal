<?php

namespace App\Enums;

enum JobPostStatus: string
{
    case Draft = 'draft';
    case PendingReview = 'pending_review';
    case PendingPayment = 'pending_payment';
    case Published = 'published';
    case Closed = 'closed';
    case Expired = 'expired';
    case Rejected = 'rejected';
}
