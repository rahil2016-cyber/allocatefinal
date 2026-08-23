"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/common/brand-logo";
import { env } from "@/config/env";

type ContactSettings = {
  support_phone: string;
  youtube_url: string;
  facebook_url: string;
  whatsapp_url?: string;
  website_url?: string;
  about_text?: string;
};

const defaults: ContactSettings = {
  support_phone: "9036980547",
  youtube_url: "https://www.youtube.com/@joballocate",
  facebook_url: "https://www.facebook.com/joballocate",
  about_text:
    "JobAllocate connects job seekers and employers with OTP-first authentication, reliable backend APIs, and role-focused dashboards.",
};

function AboutPage() {
  const [contact, setContact] = useState<ContactSettings>(defaults);

  useEffect(() => {
    const origin = (env.apiOrigin || "https://joballocate.tech").replace(/\/+$/, "");
    const url = `${origin}${env.apiPrefix || "/api/v1"}/contact`;
    fetch(url, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json?.data) {
          setContact({ ...defaults, ...json.data });
        }
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  const links = [
    {
      label: `Call ${contact.support_phone}`,
      href: `tel:${contact.support_phone.replace(/\D/g, "")}`,
    },
    { label: "YouTube", href: contact.youtube_url },
    { label: "Facebook", href: contact.facebook_url },
    contact.whatsapp_url
      ? { label: "WhatsApp", href: contact.whatsapp_url }
      : null,
    contact.website_url
      ? { label: "Website", href: contact.website_url }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <BrandLogo />
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black">Contact JobAllocate</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[var(--text-hint)]">
            {contact.about_text || defaults.about_text}
          </p>
          <ul className="mt-6 space-y-3">
            {links.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target={item.href.startsWith("tel:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export { AboutPage };
export default AboutPage;
