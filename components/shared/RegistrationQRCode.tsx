"use client";

import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";

const LeadQRCode = ({ url }: { url: string }) => {
  const qrRef = useRef<HTMLCanvasElement>(null);

  const shareQRCode = async () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) return;

      // Mobile: use Web Share API if supported
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], "lead-qr.png", { type: "image/png" })] })) {
        await navigator.share({
          files: [new File([blob], "lead-qr.png", { type: "image/png" })],
          title: "Lead QR Code",
          text: "Scan this QR code to access the lead form",
        });
        return;
      }

      // Desktop: copy image to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      alert("QR code copied to clipboard! You can now paste it anywhere.");
    } catch (err) {
      console.error("Failed to share QR code:", err);
      alert("Sharing not supported on this device.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 max-w-48">
      <QRCodeCanvas value={url} size={200} ref={qrRef} />
      <Button onClick={shareQRCode}>Share QR Code</Button>
    </div>
  );
};

export default LeadQRCode;
