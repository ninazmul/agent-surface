"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

type CopyQuotationButtonProps = {
  quotationId: string;
};

export default function CopyQuotationButton({
  quotationId,
}: CopyQuotationButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const link = `${window.location.origin}/quotation/${quotationId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Quotation link copied!");

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      size={"sm"}
      variant={"outline"}
      className="flex items-center gap-2 transition-all"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}
