import React from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, Mail, Phone, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Refund and Cancellation Policy — ALEEN VENTURES PRIVATE LIMITED | JobAllocate",
  description: "Official Refund and Cancellation Policy for JobAllocate, operated by ALEEN VENTURES PRIVATE LIMITED via Cashfree Payment Gateway.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#174A7E] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <RefreshCw className="h-3.5 w-3.5" /> Billing & Returns
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Last Updated: October 2026 | Operating Legal Entity: <strong>ALEEN VENTURES PRIVATE LIMITED</strong> | Domain: https://joballocate.com
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-normal">
            
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Overview & Operating Entity</h2>
              <p>
                At <strong>JobAllocate</strong> (owned, operated, and billed by <strong>ALEEN VENTURES PRIVATE LIMITED</strong> via{" "}
                <Link href="https://joballocate.com" className="text-[#174A7E] font-semibold underline">
                  https://joballocate.com
                </Link>
                ), we are committed to complete transparency regarding our digital services, pricing, and refund policies. All transactions are securely processed in Indian Rupees (INR) through <strong>Cashfree Payment Gateway</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Non-Refundable Digital Services</h2>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 text-xs font-medium">
                Digital services provided by <strong>ALEEN VENTURES PRIVATE LIMITED</strong> — including resume PDF downloads, ATS template packages, job listing fees, and employer subscription credits — are activated immediately upon payment. Because digital credits are instantly available and consumable, payments are generally non-refundable once delivered.
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Eligible Refund Scenarios</h2>
              <p>Refunds will be reviewed and granted in the following valid scenarios:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Duplicate Billing:</strong> If your card, UPI, or bank account was debited multiple times for a single order due to a network or payment gateway timeout.
                </li>
                <li>
                  <strong>Technical Service Failure:</strong> If money was deducted successfully, but the digital package/credits were not added to your account within 24 hours due to a technical server error.
                </li>
                <li>
                  <strong>Verification Failure:</strong> If an employer package was purchased but the company profile could not be verified under regulatory compliance standards, a full refund will be initiated minus applicable gateway transaction charges.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Refund Request Process & Timelines</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  To request a refund, email our support team at{" "}
                  <a href="mailto:info@joballocate.com" className="font-bold text-[#174A7E] underline">
                    info@joballocate.com
                  </a>{" "}
                  or{" "}
                  <a href="mailto:support@joballocate.com" className="font-bold text-[#174A7E] underline">
                    support@joballocate.com
                  </a>{" "}
                  with your <strong>Order ID</strong>, <strong>Payment Reference Number</strong>, registered phone number, and a brief description of the issue.
                </li>
                <li>Refund requests must be raised within <strong>7 business days</strong> of the transaction.</li>
                <li>
                  Once approved, refunds are credited back to the original payment source (Bank account, UPI, or Credit/Debit card via Cashfree) within <strong>5 to 7 working days</strong>.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Cancellation Policy</h2>
              <p>
                Employers can cancel recurring monthly subscription packages at any time from their <strong>Employer Dashboard</strong>. Cancellation halts future billing cycles immediately, while active credits remain valid through the end of the current billing month.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">6. Legal Entity Contact Information</h2>
              <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-1 border border-slate-200">
                <p><strong>Business Legal Name:</strong> ALEEN VENTURES PRIVATE LIMITED</p>
                <p><strong>Brand:</strong> JobAllocate</p>
                <p><strong>Address:</strong> Ram and Co Circle, Davanagere, Karnataka, India</p>
                <p><strong>Phone:</strong> +91 9036980547 / +91 9036980574</p>
                <p><strong>Support Email:</strong> info@joballocate.com / support@joballocate.com</p>
                <p><strong>Operating Hours:</strong> Monday – Saturday: 9:30 AM – 6:30 PM IST</p>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
