"use client";

import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";

const LeadQRCode = ({ url }: { url: string }) => {
  const qrRef = useRef<HTMLCanvasElement>(null);

  const shareQRCode = async () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Check if navigator can share files
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], "lead-qr.png", { type: "image/png" })] })) {
        try {
          await navigator.share({
            files: [new File([blob], "lead-qr.png", { type: "image/png" })],
            title: "Lead QR Code",
            text: "Scan this QR code to access the lead form",
          });
        } catch (err) {
          console.error("Error sharing QR code:", err);
        }
      } else {
        alert("Sharing is not supported on this device.");
      }
    }, "image/png");
  };

  return (
    <div className="flex flex-col items-center gap-4 max-w-48">
      {/* QR Code */}
      <QRCodeCanvas value={url} size={200} ref={qrRef} />

      {/* Share Button */}
      <Button onClick={shareQRCode}>Share QR Code</Button>
    </div>
  );
};

export default LeadQRCode;
