"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { IProfile } from "@/lib/database/models/profile.model";
import { ILead } from "@/lib/database/models/lead.model";
import QuotesInvoiceTemplate from "./QuotesInvoiceTemplate";
import { IQuotation } from "@/lib/database/models/quotation.model";

export default function QuotesInvoiceDownloader({
  data,
  agency,
}: {
  data: ILead | IQuotation;
  agency: IProfile;
}) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`invoice_${data.name || data._id}.pdf`);
  };

  return (
    <div>
      {/* Download Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Download className="w-4 h-4" /> Download Invoice
        </button>
      </div>

      {/* Hidden Invoice Template */}
      <div ref={invoiceRef} className="absolute left-[-9999px] top-0">
        <QuotesInvoiceTemplate data={data} agency={agency} />
      </div>
    </div>
  );
}