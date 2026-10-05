"use client";

import React, { useRef, useState, useEffect } from "react";
import { useResumeDemoPreviews } from "@/lib/hooks/useResumePreviews";

interface ResumeMiniPreviewProps {
  templateKey: string;
  label?: string;
  customHtml?: string;
  demoVariant?: number;
}

export function ResumeMiniPreview({
  templateKey,
  label,
  customHtml,
  demoVariant = 0,
}: ResumeMiniPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(260);

  // Fetch real server-rendered HTML batch (1 single cached query for all 13 templates)
  const { data: batchPreviews, isLoading } = useResumeDemoPreviews(demoVariant);

  const rawHtml = customHtml || (batchPreviews ? batchPreviews[templateKey] : null);

  // Measure container width to dynamically scale standard A4 (794px width) down to thumbnail
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    updateSize();
    const obs = new ResizeObserver(updateSize);
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Standard A4 width is 794px at 96 DPI
  const scale = Math.max(0.18, containerWidth / 794);

  // Injected CSS to boost readability, contrast, and hide scrollbars inside thumbnail
  const wrappedHtml = rawHtml
    ? rawHtml.replace(
        "</head>",
        `<style>
          ::-webkit-scrollbar { display: none !important; width: 0 !important; }
          html, body {
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-font-smoothing: antialiased !important;
            text-rendering: optimizeLegibility !important;
          }
          body {
            font-weight: 500 !important;
            zoom: 1.08;
          }
          h1, h2, h3, h4, .name, .candidate-name {
            font-weight: 900 !important;
            letter-spacing: -0.01em !important;
          }
          .section-title, .resume-heading {
            font-weight: 800 !important;
            letter-spacing: 0.04em !important;
          }
        </style></head>`
      )
    : null;

  const demoCandidate = {
    name: "Rahul Sharma",
    title: "Senior Software Engineer",
    email: "rahul.sharma@dev.in",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    skills: ["React", "Node.js", "TypeScript", "AWS", "Python"],
  };

  const renderFallbackContent = () => {
    switch (templateKey) {
      case "t1_teal_sidebar":
        return (
          <div className="w-full h-full bg-white flex text-[8px] select-none font-sans overflow-hidden border border-slate-200">
            <div className="w-1/3 bg-[#0D7377] text-white p-2 flex flex-col justify-between space-y-1 shrink-0">
              <div className="space-y-1">
                <div className="h-5 w-5 rounded-full bg-teal-600/80 border border-teal-300 flex items-center justify-center font-black text-[7px] text-white">
                  RS
                </div>
                <div>
                  <p className="font-extrabold text-[8.5px] text-white leading-tight truncate">{demoCandidate.name}</p>
                  <p className="text-[6.5px] text-teal-200 leading-tight truncate">{demoCandidate.title}</p>
                </div>
              </div>
              <div className="space-y-0.5 pt-1 border-t border-teal-600/60">
                <p className="text-[6px] font-bold text-teal-200 uppercase tracking-wider">Skills</p>
                <div className="flex flex-wrap gap-0.5">
                  {demoCandidate.skills.slice(0, 4).map((s) => (
                    <span key={s} className="bg-teal-900/60 px-1 py-0.2 text-[5.5px] rounded text-teal-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-2/3 p-2 space-y-1.5 flex flex-col justify-between bg-white text-slate-800">
              <div className="space-y-1">
                <p className="text-[6.5px] font-extrabold text-[#0D7377] border-b border-teal-100 pb-0.5 uppercase tracking-wider">
                  Work Experience
                </p>
                <div className="space-y-0.5 text-[6px]">
                  <p className="font-bold text-slate-900">Lead Full Stack Engineer</p>
                  <p className="text-[5.5px] text-slate-500">JobAllocate Inc • 2022–Present</p>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[6.5px] font-extrabold text-[#0D7377] border-b border-teal-100 pb-0.5 uppercase tracking-wider">
                  Education
                </p>
                <p className="font-bold text-slate-900 text-[6px]">B.Tech Computer Science</p>
              </div>
            </div>
          </div>
        );

      case "t2_minimal":
        return (
          <div className="w-full h-full bg-white flex flex-col text-[8px] select-none font-sans overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-2 flex items-center justify-between">
              <div>
                <p className="font-black text-[9.5px] text-white leading-tight">{demoCandidate.name}</p>
                <p className="text-[6.5px] text-slate-300 font-medium">{demoCandidate.title}</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center font-black text-[7px] text-white shrink-0">
                RS
              </div>
            </div>
            <div className="p-2 space-y-1 flex-1 bg-white text-slate-800">
              <p className="text-[6.5px] font-extrabold text-[#0F172A] border-b border-slate-200 pb-0.5 uppercase tracking-wider">
                Professional Experience
              </p>
              <p className="text-[6px] font-bold text-slate-900">Senior Software Engineer — TechCorp</p>
            </div>
          </div>
        );

      case "t3_bold_navy":
        return (
          <div className="w-full h-full bg-white flex flex-col text-[8px] select-none font-sans overflow-hidden border border-slate-200">
            <div className="bg-[#174A7E] text-white p-2 space-y-0.5 flex justify-between items-center">
              <div>
                <p className="font-black text-[9.5px] text-white leading-tight">{demoCandidate.name}</p>
                <p className="text-[6.5px] text-sky-200 font-medium">{demoCandidate.title}</p>
              </div>
              <span className="text-[5.5px] font-extrabold bg-sky-900/80 border border-sky-400/50 px-1 py-0.5 rounded text-white uppercase">
                ATS 99%
              </span>
            </div>
            <div className="p-2 space-y-1 flex-1 bg-white text-slate-800">
              <p className="text-[6.5px] font-extrabold text-[#174A7E] border-b border-sky-100 pb-0.5 uppercase tracking-wider">
                Executive Experience
              </p>
              <p className="text-[6px] font-bold text-slate-900">Senior Full Stack Lead</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-white flex flex-col text-[8px] select-none font-sans overflow-hidden border border-slate-200 p-2">
            <div className="border-b border-slate-200 pb-1 mb-1">
              <p className="font-extrabold text-[9px] text-slate-900">{demoCandidate.name}</p>
              <p className="text-[6.5px] text-slate-500">{demoCandidate.title}</p>
            </div>
            <p className="text-[6px] font-bold text-slate-700 uppercase tracking-wider">Experience & Education</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-white select-none rounded-lg"
    >
      {wrappedHtml ? (
        <div
          className="absolute top-0 left-0 pointer-events-none select-none bg-white origin-top-left"
          style={{
            width: "794px",
            height: "1123px",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            srcDoc={wrappedHtml}
            title={label || templateKey}
            className="w-[794px] h-[1123px] border-0 pointer-events-none select-none bg-white"
            tabIndex={-1}
            scrolling="no"
          />
        </div>
      ) : (
        renderFallbackContent()
      )}
    </div>
  );
}
