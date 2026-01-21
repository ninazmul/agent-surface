"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import ContactAgreementTemplate from "./ContactAgreementTemplate";
import { IProfile } from "@/lib/database/models/profile.model";
import { ISetting } from "@/lib/database/models/setting.model";

/**
 * Load image as base64 for jsPDF
 */
const loadImageAsBase64 = async (src: string): Promise<string> => {
  const res = await fetch(src);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
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

  const handleDownload = async () => {
    if (!agreementRef.current) return;

    // Load logo once
    const logoBase64 = await loadImageAsBase64("/assets/images/logo.png");

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
    const marginTop = 35; // space for header
    const marginBottom = 25; // space for footer
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
      // Slice canvas per page
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
      pdf.addImage(logoBase64, "PNG", marginLeft, 10, 32, 16);

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
  };

  return (
    <div>
      {/* Download Button */}
      <div className="">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Download className="w-4 h-4" />
          Download Agreement
        </button>
      </div>

      {/* Offscreen render target */}
      <div
        ref={agreementRef}
        className="absolute left-[-9999px] top-0 bg-white"
      >
        <ContactAgreementTemplate data={data} settings={settings} />
      </div>
    </div>
  );
}
