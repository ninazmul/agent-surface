"use client";

import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRCode = ({ url }: { url: string }) => {
  const qrRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <QRCodeCanvas value={url} size={100} ref={qrRef} />
    </div>
  );
};

export default QRCode;