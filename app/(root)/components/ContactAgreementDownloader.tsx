"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import ContactAgreementTemplate from "./ContactAgreementTemplate";
import { IProfile } from "@/lib/database/models/profile.model";
import { ISetting } from "@/lib/database/models/setting.model";

/** Load image as base64 */
const loadImageAsBase64 = async (src: string): Promise<string> => {
  const res = await fetch(src);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/** Create a semi-transparent watermark base64 from an existing image base64 */
const createWatermarkBase64 = async (
  srcBase64: string,
  widthPx = 800,
  heightPx = 800,
  alpha = 0.08,
): Promise<string> => {
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // center and scale the logo to fit the watermark canvas
      const scale =
        Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (canvas.width - drawW) / 2;
      const dy = (canvas.height - drawH) / 2;

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.globalAlpha = 1;

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      // fallback: return original base64 if watermark generation fails
      resolve(srcBase64);
    };
    img.src = srcBase64;
  });
};

export default function ContactAgreementDownloader({
  data,
  settings,
}: {
  data: IProfile;
  settings: ISetting;
}) {
  const agreementRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (!agreementRef.current || busy) return;
    setBusy(true);

    try {
      // Load original logo (opaque) and generate watermark base64 dynamically
      const originalLogoBase64 = await loadImageAsBase64(
        "/assets/images/logo.png",
      );
      const watermarkBase64 = await createWatermarkBase64(
        originalLogoBase64,
        800,
        800,
        0.08,
      );

      const scale = 2;
      const canvas = await html2canvas(agreementRef.current, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");

      // A4 dimensions
      const pageWidth = 210;
      const pageHeight = 297;

      // Margins
      const marginTop = 35;
      const marginBottom = 25;
      const marginLeft = 15;
      const marginRight = 15;

      const usableWidth = pageWidth - marginLeft - marginRight;
      const usableHeight = pageHeight - marginTop - marginBottom;

      // Convert px → mm
      const pxPerMm = canvas.width / pageWidth;
      const pageHeightPx = usableHeight * pxPerMm;

      let renderedHeightPx = 0;
      let pageNumber = 1;

      while (renderedHeightPx < canvas.height) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(
          pageHeightPx,
          canvas.height - renderedHeightPx,
        );

        const ctx = pageCanvas.getContext("2d")!;
        ctx.drawImage(
          canvas,
          0,
          renderedHeightPx,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          canvas.width,
          pageCanvas.height,
        );

        const pageImgData = pageCanvas.toDataURL("image/png");

        if (pageNumber > 1) pdf.addPage();

        /* ================= HEADER ================= */
        // Header logo (use original opaque logo, smaller)
        const headerLogoWidth = 32;
        const headerLogoHeight = 16;
        pdf.addImage(
          originalLogoBase64,
          "PNG",
          marginLeft,
          10,
          headerLogoWidth,
          headerLogoHeight,
        );

        pdf.setFontSize(9);
        pdf.text(
          "33 Gardiner Place, Dublin 1 • Ireland\n+353 1 878 8616",
          pageWidth - marginRight,
          14,
          { align: "right" },
        );
        pdf.line(marginLeft, 30, pageWidth - marginRight, 30);

        /* ================= CONTENT ================= */
        pdf.addImage(
          pageImgData,
          "PNG",
          marginLeft,
          marginTop,
          usableWidth,
          pageCanvas.height / pxPerMm,
        );

        /* ================= WATERMARK (draw after content so it sits on top) ================= */
        // Choose watermark size in mm relative to page
        const wmWidthMm = 100;
        const wmHeightMm = 100;
        const wmX = (pageWidth - wmWidthMm) / 2;
        const wmY = (pageHeight - wmHeightMm) / 2;

        // Add watermark (semi-transparent PNG generated above)
        pdf.addImage(watermarkBase64, "PNG", wmX, wmY, wmWidthMm, wmHeightMm);

        /* ================= FOOTER ================= */
        pdf.line(
          marginLeft,
          pageHeight - marginBottom + 5,
          pageWidth - marginRight,
          pageHeight - marginBottom + 5,
        );
        pdf.setFontSize(9);
        pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });

        renderedHeightPx += pageCanvas.height;
        pageNumber++;
      }

      pdf.save(`agreement_${data.name || data._id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={busy}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        aria-disabled={busy}
      >
        <Download className="w-4 h-4" />
        {busy ? "Generating..." : "Download Agreement"}
      </button>

      <div
        ref={agreementRef}
        className="absolute left-[-9999px] top-0 bg-white"
        aria-hidden
      >
        <ContactAgreementTemplate data={data} settings={settings} />
      </div>
    </div>
  );
}
