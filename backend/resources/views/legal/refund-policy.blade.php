@extends('legal.layout', [
    'title' => 'Refund and Cancellation Policy',
    'badge' => 'CANCELLATION & REFUNDS',
    'meta' => 'Last Updated: August 2026 | Effective Date: August 2026',
    'embed' => $embed ?? false,
])

@section('content')
    <h2>1. Overview</h2>
    <p>
        At <strong>JobAllocate</strong> (operated via
        <a href="https://joballocate.tech"><strong>https://joballocate.tech</strong></a>),
        we aim to ensure complete transparency in our pricing and billing services. This policy outlines the
        conditions under which refunds or cancellations are handled for employer subscriptions, job posting
        credits, resume downloads, and candidate services.
    </p>

    <h2>2. Non-Refundable Digital Services</h2>
    <div class="notice">
        <strong>As a default rule, all payments on JobAllocate are non-refundable</strong> after successful
        payment confirmation and service activation.
    </div>
    <ul>
        <li>Digital services and subscription credits are activated immediately upon successful payment confirmation.</li>
        <li>Once a digital subscription, package, job-posting fee, or resume download entitlement is activated or utilized, the payment is <strong>non-refundable</strong>.</li>
        <li>Unused remaining validity, change of mind, or hiring outcomes do not qualify for a refund.</li>
    </ul>

    <h2>3. Limited Eligible Refund Scenarios</h2>
    <p>Refunds will be evaluated only under the following limited circumstances:</p>
    <ul>
        <li><strong>Duplicate Billing:</strong> Multiple charges for the same transaction due to a technical network or payment gateway glitch.</li>
        <li><strong>Payment Without Service Delivery:</strong> Payment deducted successfully from your account, but subscription credits were not credited due to technical error within 24 hours.</li>
        <li><strong>Verification Rejection:</strong> In the event an employer account payment is made but the employer fails company verification due to administrative criteria, a refund may be initiated minus payment gateway processing fees.</li>
    </ul>

    <h2>4. Refund Request Process &amp; Timeline</h2>
    <ul>
        <li>To request a refund review, email
            <a href="mailto:Joballocate2025@gmail.com"><strong>Joballocate2025@gmail.com</strong></a>
            with your Payment ID, Order ID, Registered Email/Phone, and Reason for Refund.</li>
        <li>Refund requests must be submitted within <strong>7 business days</strong> of the original payment date.</li>
        <li>If approved, refunds will be processed back to the original payment source within <strong>5 to 7 working days</strong>.</li>
    </ul>

    <h2>5. Cancellation Policy</h2>
    <p>
        Users may cancel recurring subscription plans at any time from their account dashboard.
        Cancellation stops future auto-renewals; active plan benefits will remain available until the end of
        the current billing cycle. Cancellation does not create a refund for the current paid period.
    </p>

    <h2>6. Support &amp; Inquiries</h2>
    <p>JobAllocate is managed by the bank-proof account holder. For payment assistance:</p>
    <ul>
        <li><strong>Address:</strong> Ram and Co Circle, Davanagere</li>
        <li><strong>Contact number:</strong> <a href="tel:8884644432">8884644432</a></li>
        <li><strong>Email:</strong> <a href="mailto:Joballocate2025@gmail.com"><strong>Joballocate2025@gmail.com</strong></a></li>
        <li><strong>Website:</strong> <a href="https://joballocate.tech">https://joballocate.tech</a></li>
    </ul>
@endsection
