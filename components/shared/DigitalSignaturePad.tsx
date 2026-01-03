"use client";

import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onSave: (file: File) => void;
};

export default function DigitalSignaturePad({ onSave }: Props) {
  const sigRef = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    sigRef.current?.clear();
  };

  const saveSignature = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;

    const dataUrl = sigRef.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    const blob = await fetch(dataUrl).then(res => res.blob());

    const file = new File([blob], "signature.png", {
      type: "image/png",
    });

    onSave(file);
  };

  return (
    <div className="space-y-3">
      <div className="border rounded-xl overflow-hidden">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: "bg-white w-full",
          }}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={clearSignature}>
          Clear
        </Button>
        <Button type="button" onClick={saveSignature}>
          Save Signature
        </Button>
      </div>
    </div>
  );
}
