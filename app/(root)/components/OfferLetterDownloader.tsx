"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { ILead } from "@/lib/database/models/lead.model";
import OfferLetterTemplate from "./OfferLetterTemplate";

export default function OfferLetterDownloader({ lead }: { lead: ILead }) {
  const offerLetterRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!offerLetterRef.current) return;

    const canvas = await html2canvas(offerLetterRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`offer_letter_${lead.name || lead._id.toString()}.pdf`);
  };

  return (
    <div>
      {/* Download Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Download className="w-4 h-4" /> Download Offer Letter
        </button>
      </div>

      {/* Hidden OfferLetter Template */}
      <div ref={offerLetterRef} className="absolute left-[-9999px] top-0">
        <OfferLetterTemplate lead={lead} />
      </div>
    </div>
  );
}
