import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";

function RefundPolicyPage() {
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
            CANCELLATION & REFUNDS
          </div>
          <h1 className="text-3xl font-black text-slate-900">Refund and Cancellation Policy</h1>
          <p className="mt-2 text-sm font-semibold text-[var(--text-hint)]">
            Last Updated: August 2026 | Effective Date: August 2026
          </p>

          <div className="mt-6 space-y-6 text-sm font-medium leading-relaxed text-slate-700">
            <div>
              <h2 className="text-lg font-bold text-slate-900">1. Overview</h2>
              <p className="mt-2">
                At <strong>JobAllocate</strong> (operated via{" "}
                <a href="https://joballocate.tech" className="text-[var(--primary)] underline font-bold">
                  https://joballocate.tech
                </a>
                ), we aim to ensure complete transparency in our pricing and billing services. This policy outlines the conditions under which refunds or cancellations are handled for employer subscriptions, job posting credits, resume downloads, and candidate services.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">2. Non-Refundable Digital Services</h2>
              <div className="mt-2 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
                <strong>As a default rule, all payments on JobAllocate are non-refundable</strong> after successful payment confirmation and service activation.
              </div>
              <ul className="mt-3 list-disc pl-5 space-y-1">
                <li>Digital services and subscription credits are activated immediately upon successful payment confirmation.</li>
                <li>Once a digital subscription, package, job-posting fee, or resume download entitlement is activated or utilized, the payment is <strong>non-refundable</strong>.</li>
                <li>Unused remaining validity, change of mind, or hiring outcomes do not qualify for a refund.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">3. Limited Eligible Refund Scenarios</h2>
              <p className="mt-2">Refunds will be evaluated only under the following limited circumstances:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><strong>Duplicate Billing:</strong> Multiple charges for the same transaction due to a technical network or payment gateway glitch.</li>
                <li><strong>Payment Without Service Delivery:</strong> Payment deducted successfully from your account, but subscription credits were not credited due to technical error within 24 hours.</li>
                <li><strong>Verification Rejection:</strong> In the event an employer account payment is made but the employer fails company verification due to administrative criteria, a refund may be initiated minus payment gateway processing fees.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">4. Refund Request Process & Timeline</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  To request a refund review, email{" "}
                  <a href="mailto:Joballocate2025@gmail.com" className="font-bold text-[var(--primary)] underline">
                    Joballocate2025@gmail.com
                  </a>{" "}
                  with your Payment ID, Order ID, Registered Email/Phone, and Reason for Refund.
                </li>
                <li>Refund requests must be submitted within <strong>7 business days</strong> of the original payment date.</li>
                <li>If approved, refunds will be processed back to the original payment source within <strong>5 to 7 working days</strong>.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">5. Cancellation Policy</h2>
              <p className="mt-2">
                Users may cancel recurring subscription plans at any time from their account dashboard. Cancellation stops future auto-renewals; active plan benefits will remain available until the end of the current billing cycle. Cancellation does not create a refund for the current paid period.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">6. Support & Inquiries</h2>
              <p className="mt-2">JobAllocate is managed by the bank-proof account holder. For payment assistance:</p>
              <div className="mt-2 rounded-xl bg-slate-50 p-4 text-slate-800">
                <p><strong>Address:</strong> Ram and Co Circle, Davanagere</p>
                <p>
                  <strong>Contact number:</strong>{" "}
                  <a href="tel:9036980574" className="font-bold text-[var(--primary)] underline">
                    9036980574
                  </a>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:Joballocate2025@gmail.com" className="font-bold text-[var(--primary)] underline">
                    Joballocate2025@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a href="https://joballocate.tech" className="text-[var(--primary)] underline">
                    https://joballocate.tech
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export { RefundPolicyPage };
export default RefundPolicyPage;
