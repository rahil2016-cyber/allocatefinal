"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, ZoomIn, ZoomOut, Download, Edit3, CheckCircle2, RotateCcw } from "lucide-react";
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
}: ResumePreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1);
  const { data: batchPreviews } = useResumeDemoPreviews(0);

  // Measure container width responsively to calculate exact proportional A4 scaling
  useEffect(() => {
    if (!isOpen) return;

    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      } else if (typeof window !== "undefined") {
        setContainerWidth(window.innerWidth);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isOpen]);

  // Reset zoom multiplier whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setZoomMultiplier(1);
    }
  }, [isOpen, templateKey]);

  if (!isOpen) return null;

  const html = batchPreviews ? batchPreviews[templateKey] : null;

  // A4 Standard Dimensions (Pixels at 96 DPI): 794px width x 1123px height
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  // Calculate base scale so 100% of resume width fits horizontally inside viewport
  // Margin / padding inside container: 16px on mobile, 32px on desktop
  const paddingOffset = containerWidth < 640 ? 24 : 48;
  const availableWidth = Math.max(280, (containerWidth || (typeof window !== "undefined" ? window.innerWidth : 800)) - paddingOffset);
  const fitScale = Math.min(1, availableWidth / A4_WIDTH);
  const effectiveScale = Math.max(0.3, Math.min(2.5, fitScale * zoomMultiplier));

  const scaledWidth = Math.round(A4_WIDTH * effectiveScale);
  const scaledHeight = Math.round(A4_HEIGHT * effectiveScale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[94vh] sm:h-[92vh] bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
        
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between gap-2">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-[#174A7E] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                CV
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight truncate">
                    {templateTitle || templateKey}
                  </h3>
                  <Badge variant="primary" size="sm" className="bg-[#174A7E] text-white text-[10px] py-0 px-1.5">
                    ATS Compliant
                  </Badge>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden xs:block">
                  Proportional High-Resolution A4 Preview
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Zoom Controls (Accessible on Mobile & Desktop) */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 rounded-lg p-0.5 sm:p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setZoomMultiplier((m) => Math.max(0.6, m - 0.15))}
                  className="p-1 sm:p-1.5 hover:bg-white rounded text-slate-600 transition-colors"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomMultiplier(1)}
                  className="px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-slate-700 hover:bg-white rounded transition-colors"
                  title="Reset to Fit Width"
                >
                  {zoomMultiplier === 1 ? "Fit" : `${Math.round(zoomMultiplier * 100)}%`}
                </button>
                <button
                  type="button"
                  onClick={() => setZoomMultiplier((m) => Math.min(2.0, m + 0.15))}
                  className="p-1 sm:p-1.5 hover:bg-white rounded text-slate-600 transition-colors"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>

              {/* Use Template Link */}
              <Link href={`/seeker/resume?template=${templateKey}&tab=edit`} className="hidden sm:inline-flex">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                  className="bg-[#174A7E] hover:bg-[#0f3459] text-xs font-bold shadow-xs min-h-[36px]"
                >
                  Use Template
                </Button>
              </Link>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close Preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body: Proportional, Responsive & Horizontally Unclipped A4 Document */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-3 sm:p-6 md:p-8 flex justify-center items-start bg-slate-200/90 relative"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {html ? (
            <div
              className="bg-white shadow-2xl rounded-sm border border-slate-300 transition-transform duration-100 shrink-0"
              style={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <iframe
                srcDoc={html}
                title={templateTitle || templateKey}
                className="border-0 bg-white"
                style={{
                  width: `${A4_WIDTH}px`,
                  height: `${A4_HEIGHT}px`,
                  transform: `scale(${effectiveScale})`,
                  transformOrigin: "top left",
                  pointerEvents: "auto",
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm font-semibold">
              Loading document preview...
            </div>
          )}
        </div>

        {/* Modal Footer: Sticky Bottom Bar with Comfortable Touch Targets (>= 44px) */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px] sm:text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Passed 99% ATS parsing rules with formatted sections, fonts, and contact anchors.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Link href={`/seeker/resume?template=${templateKey}&tab=preview`} className="flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                className="w-full text-xs sm:text-sm font-bold min-h-[44px]"
              >
                Export PDF
              </Button>
            </Link>
            <Link href={`/seeker/resume?template=${templateKey}&tab=edit`} className="flex-1 sm:flex-initial">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                className="w-full bg-[#174A7E] hover:bg-[#0f3459] text-xs sm:text-sm font-bold min-h-[44px]"
              >
                Edit & Fill Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
