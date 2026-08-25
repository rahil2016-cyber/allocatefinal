@extends('legal.layout', [
    'title' => 'Privacy Policy',
    'badge' => 'PRIVACY & DATA PROTECTION',
    'meta' => 'Effective Date: August 2026 | Service Domain: https://joballocate.tech',
    'embed' => $embed ?? false,
])

@section('content')
    <h2>1. Overview</h2>
    <p>
        JobAllocate is dedicated to protecting your privacy. This Privacy Policy explains how we collect, use,
        store, and protect your personal information when you use our website at
        <a href="https://joballocate.tech"><strong>https://joballocate.tech</strong></a>
        and our mobile applications.
    </p>

    <h2>2. Information We Collect</h2>
    <p>We collect information that is strictly necessary to provide our services:</p>
    <ul>
        <li><strong>Account Data:</strong> Name, registered email address, mobile phone number, and profile details.</li>
        <li><strong>Professional Information:</strong> Resumes, work history, skill sets, education, and job preferences uploaded by job seekers.</li>
        <li><strong>Employer Credentials:</strong> Company name, verification documents, GST/Registration details, and job opening specifications.</li>
        <li><strong>Technical Information:</strong> Device tokens for notifications, IP addresses, log data, and browser type for security monitoring.</li>
        <li><strong>Payment Information:</strong> Transaction references and billing metadata processed via Cashfree (we do not store full card or UPI PIN details).</li>
    </ul>

    <h2>3. How We Use Your Information</h2>
    <ul>
        <li>To enable job application workflows between job seekers and verified employers.</li>
        <li>To perform OTP authentication, secure sign-in, and account verification.</li>
        <li>To process subscription payments securely via Cashfree.</li>
        <li>To deliver account updates, job alert notifications, and operational support.</li>
        <li>We <strong>do not sell</strong> your personal data to third parties under any circumstances.</li>
    </ul>

    <h2>4. Data Security &amp; Storage</h2>
    <p>
        We implement robust administrative, technical, and physical security measures, including SSL encryption
        in transit and secure database storage. Access to personal data is restricted to authorized personnel only.
    </p>

    <h2>5. Non-Refundable Policy</h2>
    <div class="notice">
        <strong>All paid digital services on JobAllocate are non-refundable</strong> once payment is successfully
        completed and the related service, credit, subscription, or download entitlement is activated or delivered.
    </div>
    <ul>
        <li>Resume PDF downloads, seeker packages, employer job-posting fees, and company subscriptions are digital goods/services and are <strong>non-refundable</strong>.</li>
        <li>Change of mind, unused remaining credits, plan upgrades/downgrades, or dissatisfaction with hiring outcomes do not qualify for a refund.</li>
        <li>Exceptions are limited to proven duplicate charges or confirmed payment without service delivery, as described in our
            <a href="https://joballocate.tech/refund-policy">Refund Policy</a>.</li>
    </ul>

    <h2>6. Data Retention &amp; Account Deletion Policy</h2>
    <p>
        Users have the right to request deletion of their account and associated personal data at any time.
        You can submit an account deletion request through our web form or by contacting support.
        Pending deletion requests are reviewed and processed within 24 hours.
    </p>

    <h2>7. Third-Party Services</h2>
    <p>
        We work with trusted service providers such as Firebase (for OTP and authentication) and Cashfree
        (for secure payment processing). These services handle data in accordance with their respective
        security and privacy standards.
    </p>

    <h2>8. Platform Operator &amp; Contact</h2>
    <p>
        JobAllocate is managed by the bank-proof account holder for the platform business.
        For privacy, data rights, or payment-related questions, contact:
    </p>
    <ul>
        <li><strong>Managed by:</strong> As per bank proof holder</li>
        <li><strong>Address:</strong> Ram and Co Circle, Davanagere</li>
        <li><strong>Contact number:</strong> <a href="tel:9036980574">9036980574</a></li>
        <li><strong>Email:</strong> <a href="mailto:Joballocate2025@gmail.com"><strong>Joballocate2025@gmail.com</strong></a></li>
        <li><strong>Website:</strong> <a href="https://joballocate.tech">https://joballocate.tech</a></li>
    </ul>
@endsection
