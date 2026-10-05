"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ZoomIn, ZoomOut, Download, Edit3, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useResumeDemoPreviews } from "@/lib/hooks/useResumePreviews";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateKey: string;
  templateTitle?: string;
  onSelectTemplate?: (key: string) => void;
}

export function ResumePreviewModal({
  isOpen,
  onClose,
  templateKey,
  templateTitle,
  onSelectTemplate,
}: ResumePreviewModalProps) {
  const [zoom, setZoom] = useState(0.9);
  const { data: batchPreviews } = useResumeDemoPreviews(0);

  if (!isOpen) return null;

  const html = batchPreviews ? batchPreviews[templateKey] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#174A7E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              CV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {templateTitle || templateKey}
                </h3>
                <Badge variant="primary" size="sm" className="bg-[#174A7E] text-white text-[10px]">
                  ATS Compliant
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                100% Exact High-Resolution A4 Document Preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 w-11 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
                className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Edit / Use Template Button */}
            <Link href={`/seeker/resume?template=${templateKey}&tab=edit`}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                className="bg-[#174A7E] hover:bg-[#0f3459] text-xs font-bold shadow-xs"
              >
                Use Template
              </Button>
            </Link>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Fully Scrollable & Zoomable A4 Document */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-slate-200/90">
          {html ? (
            <div
              className="bg-white shadow-2xl rounded-sm transition-transform duration-150 origin-top border border-slate-300"
              style={{
                width: `${794 * zoom}px`,
                height: `${1123 * zoom}px`,
              }}
            >
              <iframe
                srcDoc={html}
                title={templateTitle || templateKey}
                className="w-[794px] h-[1123px] border-0 origin-top-left bg-white"
                style={{
                  transform: `scale(${zoom})`,
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm font-semibold">
              Loading document preview...
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Passed 99% ATS parsing rules with formatted sections, fonts, and contact anchors.</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/seeker/resume?template=${templateKey}&tab=preview`}>
              <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                Export PDF
              </Button>
            </Link>
            <Link href={`/seeker/resume?template=${templateKey}&tab=edit`}>
              <Button variant="primary" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />} className="bg-[#174A7E] hover:bg-[#0f3459]">
                Edit & Fill Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
