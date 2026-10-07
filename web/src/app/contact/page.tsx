import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Globe, ArrowLeft, MessageSquare, ShieldCheck, Building } from "lucide-react";

export const metadata = {
  title: "Contact Us — ALEEN VENTURES PRIVATE LIMITED | JobAllocate",
  description: "Official contact details, legal business name, office address, customer support phone and email for ALEEN VENTURES PRIVATE LIMITED (JobAllocate).",
};

export default function ContactPage() {
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#174A7E] border border-blue-100">
              <Phone className="h-3.5 w-3.5" /> Official Helpdesk & Entity Details
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Contact Us
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Official contact and business details for <strong>ALEEN VENTURES PRIVATE LIMITED</strong> (Operating entity of JobAllocate).
            </p>
          </div>

          {/* Legal Business Name Compliance Banner */}
          <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#174A7E]">
                Business Legal Name / Operating Entity
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ALEEN VENTURES PRIVATE LIMITED
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Operating Trade Brand: <strong>JobAllocate</strong> (Website:{" "}
                <Link href="https://joballocate.com" className="text-[#174A7E] underline">
                  https://joballocate.com
                </Link>
                )
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-white text-[#174A7E] font-black border border-sky-200 text-xs shadow-xs shrink-0">
              Incorporated in India
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Registered Office Address */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Registered Office Address</h3>
              <p className="text-xs text-slate-800 leading-relaxed font-semibold pt-1">
                ALEEN VENTURES PRIVATE LIMITED<br />
                Ram and Co Circle, Davanagere,<br />
                Karnataka, India.
              </p>
            </div>

            {/* Card 2: Operating Hours & WhatsApp */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Support Hours & Live Chat</h3>
              <p className="text-xs text-slate-700">
                Monday – Saturday: 9:30 AM – 6:30 PM IST
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/919036980547"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Card 3: Phone Support */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-[#174A7E] flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Direct Phone Support</h3>
              <p className="text-xs text-slate-600">Customer care & payment verification</p>
              <div className="pt-2 space-y-1 text-sm font-bold text-slate-900">
                <a href="tel:+919036980547" className="block text-[#174A7E] hover:underline">
                  +91 9036980547
                </a>
              </div>
            </div>

            {/* Card 4: Email Support */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Official Email Support</h3>
              <p className="text-xs text-slate-600">For billing, refunds, and corporate inquiries</p>
              <div className="pt-2 space-y-1 text-sm font-bold text-slate-900">
                <a href="mailto:info@joballocate.com" className="block text-[#174A7E] hover:underline">
                  info@joballocate.com
                </a>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3 text-xs text-slate-700">
            <ShieldCheck className="h-5 w-5 text-[#174A7E] shrink-0" />
            <span>
              <strong>Payment Gateway Processing:</strong> Digital orders on JobAllocate are billed by <strong>ALEEN VENTURES PRIVATE LIMITED</strong> and processed via <strong>Cashfree Payment Gateway India</strong>.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
