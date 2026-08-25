import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";

function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="self-start rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)] sm:self-auto"
          >
            Back to Home
          </Link>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 md:p-8 shadow-sm">
          <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-4">
            LEGAL AGREEMENT
          </div>
          <h1 className="text-3xl font-black text-slate-900">Terms and Conditions</h1>
          <p className="mt-2 text-sm font-semibold text-[var(--text-hint)]">
            Last Updated: August 2026 | Effective Date: August 2026
          </p>

          <div className="mt-6 space-y-6 text-sm font-medium leading-relaxed text-slate-700">
            <div>
              <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing or using <strong>JobAllocate</strong> (accessible at{" "}
                <a href="https://joballocate.tech" className="text-[var(--primary)] underline">
                  https://joballocate.tech
                </a>{" "}
                and through our mobile application), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">2. Eligibility & Account Registration</h2>
              <p className="mt-2">
                JobAllocate offers job posting and application services for companies and job seekers. Users must be at least 18 years of age to register an account. You are responsible for maintaining the accuracy of your account information and the security of your login credentials.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">3. Employer Responsibilities</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Employers must provide authentic and verified business credentials prior to publishing job postings.</li>
                <li>All posted job listings must represent genuine employment opportunities and strictly comply with applicable labor laws.</li>
                <li>Fraudulent job postings, misleading salary information, or requests for upfront fees from applicants are strictly prohibited and will result in immediate termination of the account without refund.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">4. Job Seeker Responsibilities</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Job seekers must provide truthful information in their profiles, resumes, and job applications.</li>
                <li>Misrepresentation of work experience, qualifications, or identity may lead to account suspension.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">5. Pricing & Service Charges</h2>
              <p className="mt-2">
                JobAllocate charges for selected digital services. Prices are shown in Indian Rupees (INR) inside the app before you pay via Cashfree. Current standard charges include:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><strong>Resume PDF download:</strong> ₹20 per download (resume builder / editing tools remain free).</li>
                <li>
                  <strong>Job seeker packages</strong> (as listed in Plans & Packages; may be updated by admin):
                  <ul className="mt-1 list-disc pl-5 space-y-1">
                    <li>Basic Resume Package — ₹99</li>
                    <li>Premium Resume Package — ₹299</li>
                    <li>Professional Resume Package — ₹499</li>
                  </ul>
                </li>
                <li><strong>Employer job posting:</strong> First job posting is free; additional job postings are charged at ₹399 each (as shown at checkout).</li>
                <li><strong>Company subscription packages:</strong> Monthly plans starting from about ₹499/month (exact plan price is shown before payment and may vary by active admin package).</li>
              </ul>
              <p className="mt-2">
                Taxes, gateway fees, promotional discounts, or admin-configured plan changes may apply. The amount displayed at payment confirmation is the final payable amount.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">6. Subscriptions, Payments & Non-Refundable Charges</h2>
              <div className="mt-2 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
                All successful payments for digital services on JobAllocate are <strong>non-refundable</strong>, except for limited cases described in the{" "}
                <Link href="/refund-policy" className="font-bold underline">
                  Refund Policy
                </Link>{" "}
                (for example, proven duplicate billing).
              </div>
              <p className="mt-3">
                Premium features, employer subscriptions, resume packages, and featured listings are activated after successful Cashfree payment confirmation.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">7. Intellectual Property & Acceptable Use</h2>
              <p className="mt-2">
                All content, trademarks, platform code, and branding on JobAllocate are the exclusive property of JobAllocate. Users agree not to scrape, copy, modify, or reverse-engineer any part of the service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">8. Limitation of Liability</h2>
              <p className="mt-2">
                JobAllocate acts as a venue connecting job seekers and employers. We do not guarantee employment outcomes or guarantee that employers will hire applicants. JobAllocate shall not be liable for direct, indirect, or consequential damages resulting from platform use.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">9. Governing Law & Contact</h2>
              <p className="mt-2">
                These terms are governed by and construed in accordance with the laws of India. JobAllocate is managed by the bank-proof account holder. For inquiries:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><strong>Address:</strong> Ram and Co Circle, Davanagere</li>
                <li>
                  <strong>Contact number:</strong>{" "}
                  <a href="tel:9036980574" className="font-bold text-[var(--primary)] underline">
                    9036980574
                  </a>
                </li>
                <li>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:Joballocate2025@gmail.com" className="font-bold text-[var(--primary)] underline">
                    Joballocate2025@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export { TermsAndConditionsPage };
export default TermsAndConditionsPage;
