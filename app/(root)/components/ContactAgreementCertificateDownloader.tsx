"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { IProfile } from "@/lib/database/models/profile.model";
import ContactAgreementCertificateTemplate from "./ContactAgreementCertificateTemplate";

export default function ContactAgreementCertificateDownloader({
  data,
}: {
  data: IProfile;
}) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`certificate_${data.name || data._id.toString()}.pdf`);
  };

  return (
    <div>
      {/* Download Button */}
      <div className="">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Download className="w-4 h-4" /> Download certificate
        </button>
      </div>

      {/* Hidden certificate Template */}
      <div ref={certificateRef} className="absolute left-[-9999px] top-0">
        <ContactAgreementCertificateTemplate data={data} />
      </div>
    </div>
  );
}
