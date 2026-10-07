"use client";

import React, { useState } from "react";
import { Sparkles, MessageCircle } from "lucide-react";
import { AiChatModal } from "./AiChatModal";

interface AiChatFabProps {
  jobId?: number | string | null;
  jobTitle?: string | null;
}

export function AiChatFab({ jobId, jobTitle }: AiChatFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-full bg-gradient-to-r from-[#174A7E] to-[#0284C7] hover:from-[#123860] hover:to-[#0369A1] text-white font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer border border-white/20 active:scale-95"
          aria-label="Open AI Career Coach"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
          </span>

          <Sparkles className="h-4 w-4 text-sky-200 group-hover:rotate-12 transition-transform" />
          <span className="tracking-tight">AI Coach</span>
        </button>
      </div>

      <AiChatModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        jobId={jobId}
        jobTitle={jobTitle}
      />
    </>
  );
}
