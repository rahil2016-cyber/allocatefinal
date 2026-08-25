@extends('legal.layout', [
    'title' => 'Terms and Conditions',
    'badge' => 'LEGAL AGREEMENT',
    'meta' => 'Last Updated: August 2026 | Effective Date: August 2026',
    'embed' => $embed ?? false,
])

@section('content')
    <h2>1. Acceptance of Terms</h2>
    <p>
        By accessing or using <strong>JobAllocate</strong> (accessible at
        <a href="https://joballocate.tech">https://joballocate.tech</a>
        and through our mobile application), you agree to be bound by these Terms and Conditions.
        If you do not agree to these terms, please do not use our platform.
    </p>

    <h2>2. Eligibility &amp; Account Registration</h2>
    <p>
        JobAllocate offers job posting and application services for companies and job seekers.
        Users must be at least 18 years of age to register an account. You are responsible for
        maintaining the accuracy of your account information and the security of your login credentials.
    </p>

    <h2>3. Employer Responsibilities</h2>
    <ul>
        <li>Employers must provide authentic and verified business credentials prior to publishing job postings.</li>
        <li>All posted job listings must represent genuine employment opportunities and strictly comply with applicable labor laws.</li>
        <li>Fraudulent job postings, misleading salary information, or requests for upfront fees from applicants are strictly prohibited and will result in immediate termination of the account without refund.</li>
    </ul>

    <h2>4. Job Seeker Responsibilities</h2>
    <ul>
        <li>Job seekers must provide truthful information in their profiles, resumes, and job applications.</li>
        <li>Misrepresentation of work experience, qualifications, or identity may lead to account suspension.</li>
    </ul>

    <h2>5. Pricing &amp; Service Charges</h2>
    <p>
        JobAllocate charges for selected digital services. Prices are shown in Indian Rupees (INR) inside the app
        before you pay via Cashfree. Current standard charges include:
    </p>
    <ul>
        <li><strong>Resume PDF download:</strong> ₹20 per download (resume builder / editing tools remain free).</li>
        <li><strong>Job seeker packages</strong> (as listed in Plans &amp; Packages; may be updated by admin):
            <ul>
                <li>Basic Resume Package — ₹99</li>
                <li>Premium Resume Package — ₹299</li>
                <li>Professional Resume Package — ₹499</li>
            </ul>
        </li>
        <li><strong>Employer job posting:</strong> First job posting is free; additional job postings are charged at ₹399 each (as shown at checkout).</li>
        <li><strong>Company subscription packages:</strong> Monthly plans starting from about ₹499/month (exact plan price is shown before payment and may vary by active admin package).</li>
    </ul>
    <p>
        Taxes, gateway fees, promotional discounts, or admin-configured plan changes may apply.
        The amount displayed at payment confirmation is the final payable amount.
    </p>

    <h2>6. Subscriptions, Payments &amp; Non-Refundable Charges</h2>
    <div class="notice">
        All successful payments for digital services on JobAllocate are <strong>non-refundable</strong>,
        except for limited cases described in the
        <a href="https://joballocate.tech/refund-policy">Refund Policy</a>
        (for example, proven duplicate billing).
    </div>
    <p>
        Premium features, employer subscriptions, resume packages, and featured listings are activated after
        successful Cashfree payment confirmation.
    </p>

    <h2>7. Intellectual Property &amp; Acceptable Use</h2>
    <p>
        All content, trademarks, platform code, and branding on JobAllocate are the exclusive property of JobAllocate.
        Users agree not to scrape, copy, modify, or reverse-engineer any part of the service.
    </p>

    <h2>8. Limitation of Liability</h2>
    <p>
        JobAllocate acts as a venue connecting job seekers and employers. We do not guarantee employment outcomes
        or guarantee that employers will hire applicants. JobAllocate shall not be liable for direct, indirect,
        or consequential damages resulting from platform use.
    </p>

    <h2>9. Governing Law &amp; Contact</h2>
    <p>
        These terms are governed by and construed in accordance with the laws of India.
        JobAllocate is managed by the bank-proof account holder. For inquiries:
    </p>
    <ul>
        <li><strong>Address:</strong> Ram and Co Circle, Davanagere</li>
        <li><strong>Contact number:</strong> <a href="tel:9036980574">9036980574</a></li>
        <li><strong>Email:</strong> <a href="mailto:Joballocate2025@gmail.com"><strong>Joballocate2025@gmail.com</strong></a></li>
    </ul>
@endsection
