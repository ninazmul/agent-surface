"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import QuotationTemplate from "./QuotationTemplate";
import { IProfile } from "@/lib/database/models/profile.model";
import { Button } from "@/components/ui/button";
import { IQuotation } from "@/lib/database/models/quotation.model";
import { ILead } from "@/lib/database/models/lead.model";

export default function QuotationDownloader({
  data,
  agency,
}: {
  data: ILead | IQuotation;
  agency: IProfile | null;
}) {
  const quotationRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!quotationRef.current) return;

    // Render the quotation into a canvas
    const canvas = await html2canvas(quotationRef.current, {
      scale: 2,
      useCORS: true,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10; // 10mm margin
    const pdfWidth = pageWidth - 2 * margin;
    const pdfHeight = pageHeight - 2 * margin;

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfHeight) {
      // Fits on one page
      pdf.addImage(
        imgToData(canvas),
        "PNG",
        margin,
        margin,
        imgWidth,
        imgHeight
      );
    } else {
      // Multiple pages
      let remainingHeight = canvas.height;
      const pageCanvasHeight = (canvas.width * pdfHeight) / pdfWidth;

      while (remainingHeight > 0) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pageCanvasHeight, remainingHeight);

        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            canvas.height - remainingHeight,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            canvas.width,
            pageCanvas.height
          );
        }

        pdf.addImage(
          imgToData(pageCanvas),
          "PNG",
          margin,
          margin,
          imgWidth,
          (pageCanvas.height * pdfWidth) / canvas.width
        );

        remainingHeight -= pageCanvasHeight;
        if (remainingHeight > 0) pdf.addPage();
      }
    }

    pdf.save(`quotation_${data.name || data._id.toString()}.pdf`);
  };

  const imgToData = (canvas: HTMLCanvasElement) =>
    canvas.toDataURL("image/png");

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Download className="w-4 h-4" /> Download Quotation
        </Button>
      </div>

      <div ref={quotationRef} className="absolute left-[-9999px] top-0">
        <QuotationTemplate data={data} agency={agency} />
      </div>
    </div>
  );
}
