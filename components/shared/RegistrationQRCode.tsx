"use client";

import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";

const LeadQRCode = ({ url }: { url: string }) => {
  const qrRef = useRef<HTMLCanvasElement>(null);

  const downloadQRCode = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "lead-qr.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center gap-4 max-w-48">
      {/* QR Code */}
      <QRCodeCanvas value={url} size={200} ref={qrRef} />

      {/* Download Button */}
      <Button onClick={downloadQRCode}>Download QR Code</Button>
    </div>
  );
};

export default LeadQRCode;
