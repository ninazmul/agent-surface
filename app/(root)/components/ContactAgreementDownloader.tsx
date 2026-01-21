"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { IProfile } from "@/lib/database/models/profile.model";
import { ISetting } from "@/lib/database/models/setting.model";
import ContactAgreementTemplate from "./ContactAgreementTemplate";

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

    const canvas = await html2canvas(agreementRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Header / Footer sizing
    const headerHeight = 25;
    const footerHeight = 20;
    const contentHeight = pageHeight - headerHeight - footerHeight;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let positionY = 0;
    let pageIndex = 0;

    while (positionY < imgHeight) {
      if (pageIndex > 0) pdf.addPage();

      // ---- HEADER ----
      pdf.setFontSize(9);
      pdf.text("Academic Bridge Ltd", 10, 10);
      pdf.text(
        "33 Gardiner Place, Dublin 1 • Ireland • www.academicbridge.ie",
        pageWidth - 10,
        10,
        { align: "right" }
      );
      pdf.line(10, 14, pageWidth - 10, 14);

      // ---- CONTENT ----
      pdf.addImage(
        imgData,
        "PNG",
        0,
        headerHeight - positionY,
        imgWidth,
        imgHeight
      );

      // ---- FOOTER ----
      pdf.line(
        10,
        pageHeight - footerHeight,
        pageWidth - 10,
        pageHeight - footerHeight
      );

      pdf.setFontSize(9);
      pdf.text(
        `Page ${pageIndex + 1}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      positionY += contentHeight;
      pageIndex++;
    }

    pdf.save(`agreement_${data.name || data._id}.pdf`);
  };

  return (
    <div>
      {/* Download Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Download className="w-4 h-4" />
          Download Agreement
        </button>
      </div>

      {/* Hidden Render Target */}
      <div
        ref={agreementRef}
        className="absolute left-[-9999px] top-0 bg-white"
      >
        <ContactAgreementTemplate data={data} settings={settings} />
      </div>
    </div>
  );
}
