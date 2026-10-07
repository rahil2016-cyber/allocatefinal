/**
 * JobAllocate Isolated Resume PDF Exporter
 * 
 * Exports ONLY the pure resume document/template HTML without capturing
 * any website UI (navbar, header, footer, buttons, controls, breadcrumbs).
 * Formats strictly to A4 (210mm x 297mm) with multi-page page breaks.
 */

export interface ExportResumePdfOptions {
  html: string;
  filename?: string;
  title?: string;
}

/**
 * Clean and isolate resume HTML with A4 print styles
 */
function prepareIsolatedResumeHtml(html: string, title: string = "Resume"): string {
  // If the HTML is an entire document, strip any outer styling or wrap cleanly
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - JobAllocate Resume</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000;
      width: 210mm !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    /* A4 Document Container */
    .resume-a4-root {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      position: relative;
    }
    /* Prevent headers and items from awkwardly breaking across pages */
    h1, h2, h3, h4, h5, h6, .section-title, .header-bar {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }
    .experience-item, .education-item, .project-item, .skill-group, tr, li {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    @media print {
      body {
        width: 210mm !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="resume-a4-root">
    ${html}
  </div>
</body>
</html>`;
}

/**
 * Exports the resume using an isolated print iframe.
 * The browser print dialog targets ONLY the resume content, with zero website UI.
 */
export function exportResumeViaIsolatedFrame(options: ExportResumePdfOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const { html, title = "My_Resume" } = options;
      if (!html || !html.trim()) {
        throw new Error("No resume template HTML provided for export.");
      }

      const fullHtml = prepareIsolatedResumeHtml(html, title);

      // Create a hidden, isolated iframe attached to the document
      const frame = document.createElement("iframe");
      frame.style.position = "fixed";
      frame.style.top = "-9999px";
      frame.style.left = "-9999px";
      frame.style.width = "210mm";
      frame.style.height = "297mm";
      frame.style.border = "none";
      frame.style.opacity = "0";
      frame.style.pointerEvents = "none";
      frame.setAttribute("aria-hidden", "true");

      document.body.appendChild(frame);

      const frameDoc = frame.contentDocument || frame.contentWindow?.document;
      if (!frameDoc) {
        document.body.removeChild(frame);
        throw new Error("Could not access isolated print frame document.");
      }

      frameDoc.open();
      frameDoc.write(fullHtml);
      frameDoc.close();

      // Wait for resources (images, fonts) inside iframe to load before printing
      frame.onload = () => {
        setTimeout(() => {
          try {
            frame.contentWindow?.focus();
            frame.contentWindow?.print();
            resolve();
          } catch (err) {
            reject(err);
          } finally {
            // Clean up frame after print dialog interaction
            setTimeout(() => {
              if (frame.parentNode) {
                document.body.removeChild(frame);
              }
            }, 3000);
          }
        }, 300);
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Direct file download as A4 PDF via html2pdf (if available) with fallback to isolated print frame
 */
export async function downloadResumeA4Pdf(options: ExportResumePdfOptions): Promise<void> {
  const { html, filename = "JobAllocate_Resume.pdf", title = "JobAllocate Resume" } = options;

  // 1. Try loading html2pdf.js dynamically for direct file download
  if (typeof window !== "undefined") {
    try {
      let html2pdfInstance = (window as any).html2pdf;
      if (!html2pdfInstance) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("html2pdf CDN unavailable"));
          document.head.appendChild(script);
        });
        html2pdfInstance = (window as any).html2pdf;
      }

      if (html2pdfInstance) {
        // Create an offscreen isolated container with pure resume HTML
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "-9999px";
        container.style.left = "-9999px";
        container.style.width = "210mm";
        container.style.background = "#ffffff";
        container.innerHTML = html;
        document.body.appendChild(container);

        const opt = {
          margin: 0,
          filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        await html2pdfInstance().set(opt).from(container).save();
        document.body.removeChild(container);
        return;
      }
    } catch (_) {
      // Fallback cleanly to isolated iframe print
    }
  }

  // Fallback to high-quality isolated iframe print
  return exportResumeViaIsolatedFrame({ html, filename, title });
}
