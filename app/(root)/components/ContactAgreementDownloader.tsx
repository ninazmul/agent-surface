"use client";

import jsPDF from "jspdf";
import { Download } from "lucide-react";
import { IProfile } from "@/lib/database/models/profile.model";
import { ISetting } from "@/lib/database/models/setting.model";

/**
 * Load image as base64 (logo only)
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
  const handleDownload = async () => {
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const logoBase64 = await loadImageAsBase64("/assets/images/logo.png");

    // Page setup
    const pageWidth = 210;
    const pageHeight = 297;

    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 40;
    const marginBottom = 25;

    const usableWidth = pageWidth - marginLeft - marginRight;
    const lineHeight = 6;

    let cursorY = marginTop;
    let pageNumber = 1;

    /* ================= HEADER ================= */
    const drawHeader = () => {
      pdf.addImage(logoBase64, "PNG", marginLeft, 12, 32, 16);

      pdf.setFontSize(9);
      pdf.text(
        "33 Gardiner Place, Dublin 1 • Ireland\n+353 1 878 8616",
        pageWidth - marginRight,
        16,
        { align: "right" }
      );

      pdf.line(marginLeft, 32, pageWidth - marginRight, 32);
      cursorY = marginTop;
    };

    /* ================= FOOTER ================= */
    const drawFooter = () => {
      pdf.line(
        marginLeft,
        pageHeight - marginBottom + 5,
        pageWidth - marginRight,
        pageHeight - marginBottom + 5
      );

      pdf.setFontSize(9);
      pdf.text(
        `Page ${pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    };

    const newPage = () => {
      drawFooter();
      pdf.addPage();
      pageNumber++;
      drawHeader();
    };

    drawHeader();

    /* ================= TITLE ================= */
    pdf.setFont("Times", "Bold");
    pdf.setFontSize(14);
    pdf.text("Education Agency Agreement", pageWidth / 2, cursorY, {
      align: "center",
    });
    cursorY += 12;

    /* ================= INTRO ================= */
    pdf.setFont("Times", "Normal");
    pdf.setFontSize(11);

    const introText = [
      `This Education Agency Agreement is made between Academic Bridge Limited, a Private Training School, having its head office at 33 Gardiner Place, Dublin 1, Ireland ("AB").`,
      ``,
      `And ${data?.name || "N/A"}, located at ${data?.location || "N/A"}, ${
        data?.country || "N/A"
      } ("Agent"), which advises, counsels, and recruits prospective international students.`,
      ``,
    ];

    introText.forEach((paragraph) => {
      const lines = pdf.splitTextToSize(paragraph, usableWidth);
      lines.forEach((line: string) => {
        if (cursorY + lineHeight > pageHeight - marginBottom) {
          newPage();
        }
        pdf.text(line, marginLeft, cursorY);
        cursorY += lineHeight;
      });
      cursorY += lineHeight;
    });

    /* ================= AGREEMENT BODY ================= */
    const agreementText =
      settings.contractAgreement
        ?.replace(/<[^>]+>/g, "") // strip HTML
        ?.replace(/\n\s*\n/g, "\n\n") || "";

    const bodyLines = pdf.splitTextToSize(
      agreementText,
      usableWidth
    );

    bodyLines.forEach((line: string) => {
      if (cursorY + lineHeight > pageHeight - marginBottom) {
        newPage();
      }
      pdf.text(line, marginLeft, cursorY);
      cursorY += lineHeight;
    });

    cursorY += 10;

    /* ================= SIGNATURES ================= */
    if (cursorY + 40 > pageHeight - marginBottom) {
      newPage();
    }

    pdf.setFont("Times", "Bold");
    pdf.text("Signed by Academic Bridge Ltd:", marginLeft, cursorY);
    cursorY += 10;

    pdf.setFont("Times", "Normal");
    pdf.text("Fernando Comar — Sales Manager", marginLeft, cursorY);
    cursorY += 6;

    pdf.text(
      `Date: ${
        data?.signatureDate
          ? new Date(data.signatureDate).toLocaleDateString("en-GB")
          : ""
      }`,
      marginLeft,
      cursorY
    );

    cursorY += 16;

    pdf.setFont("Times", "Bold");
    pdf.text("Signed by the Agent:", marginLeft, cursorY);
    cursorY += 10;

    pdf.setFont("Times", "Normal");
    pdf.text(
      `Name: ${data?.name || ""}`,
      marginLeft,
      cursorY
    );
    cursorY += 6;

    pdf.text(
      `Date: ${
        data?.signatureDate
          ? new Date(data.signatureDate).toLocaleDateString("en-GB")
          : ""
      }`,
      marginLeft,
      cursorY
    );

    drawFooter();

    pdf.save(`agreement_${data.name || data._id}.pdf`);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
    >
      <Download className="w-4 h-4" />
      Download Agreement
    </button>
  );
}
