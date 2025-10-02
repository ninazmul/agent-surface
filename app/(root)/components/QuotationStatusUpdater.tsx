"use client";

import { useState } from "react";
import { updateLead } from "@/lib/actions/lead.actions";
import { updateQuotation } from "@/lib/actions/quotation.actions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ILead } from "@/lib/database/models/lead.model";
import { IQuotation } from "@/lib/database/models/quotation.model";
import { createTrack } from "@/lib/actions/track.actions";

interface QuotationStatusUpdaterProps {
  data: ILead | IQuotation;
  isVoid?: boolean;
  onAccepted?: () => void;
}

const QuotationStatusUpdater = ({
  data,
  isVoid,
  onAccepted,
}: QuotationStatusUpdaterProps) => {
  const initialStatus =
    "quotationStatus" in data ? data.quotationStatus : false;
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (status || isVoid) return;

    setLoading(true);
    try {
      // update DB status
      if ("quotationNumber" in data) {
        await updateQuotation(data._id, { quotationStatus: true });
      } else {
        await updateLead(data._id, { quotationStatus: true });
      }

      // generate links
      const quotationLink = `https://agentsurface.com/quotation/${data._id}`;
      const invoiceLink = `https://agentsurface.com/quotation/${data._id}/invoice`;

      // send email via new API route
      await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: (data as ILead | IQuotation).email,
          name: (data as ILead | IQuotation).name || "Student",
          subject: "Your Quotation & Invoice",
          html: `
            <p>Dear ${(data as ILead | IQuotation).name || "Student"},</p>
            <p>Your quotation has been accepted successfully ✅</p>
            <p>You can view your documents here:</p>
            <ul>
              <li><a href="${quotationLink}">View Quotation</a></li>
              <li><a href="${invoiceLink}">View Invoice</a></li>
            </ul>
            <p>Thank you for choosing Agent Surface!</p>
          `,
        }),
      });

      setStatus(true);
      onAccepted?.();
      toast.success("Quotation accepted & email sent!");
      await createTrack({
        student: data.email,
        event: `Quotation accepted for ${data.name || "Student"}`,
        route: `/quotation/${data._id}`,
        status: "Accepted",
      });
    } catch (err) {
      console.error("Failed to update quotationStatus or send email", err);
      toast.error("Error while processing quotation acceptance.");
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    if (isVoid) return "❌ Voided";
    if (status) return "✅ Accepted";
    return "⏳ Pending";
  };

  return (
    <div className="my-4 flex flex-wrap gap-4 items-center justify-between">
      <p>
        <strong>Quotation Status:</strong> {renderStatus()}
      </p>
      <Button
        size="sm"
        onClick={handleAccept}
        disabled={status || loading || isVoid}
        className={`${
          isVoid
            ? "bg-gray-400 cursor-not-allowed"
            : status
            ? "bg-blue-500 cursor-not-allowed"
            : "bg-yellow-400 text-black"
        }`}
      >
        {loading
          ? "Updating..."
          : isVoid
          ? "Quotation Void"
          : status
          ? "Quotation Accepted"
          : "Accept Quotation"}
      </Button>
    </div>
  );
};

export default QuotationStatusUpdater;
