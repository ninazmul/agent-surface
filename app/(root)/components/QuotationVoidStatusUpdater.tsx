"use client";

import { useState } from "react";
import { updateLead } from "@/lib/actions/lead.actions";
import { updateQuotation } from "@/lib/actions/quotation.actions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ILead } from "@/lib/database/models/lead.model";
import { IQuotation } from "@/lib/database/models/quotation.model";
import { createTrack } from "@/lib/actions/track.actions";

interface QuotationVoidStatusUpdaterProps {
  data: ILead | IQuotation;
  onVoid?: () => void;
}

const QuotationVoidStatusUpdater = ({
  data,
  onVoid,
}: QuotationVoidStatusUpdaterProps) => {
  const initialStatus = "isVoid" in data ? data.isVoid : false;
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleVoid = async () => {
    if (status) return;

    setLoading(true);
    try {
      if ("quotationNumber" in data) {
        await updateQuotation(data._id, { isVoid: true });
      } else {
        await updateLead(data._id, { isVoid: true });
      }

      setStatus(true);
      onVoid?.();
      toast.success("Quotation marked as void.");
      await createTrack({
        student: data.email,
        event: `${data.name || "Student"}'s quotation marked as void`,
        route: `/quotation/${data._id}`,
        status: "Void",
      });
    } catch (err) {
      console.error("Failed to update quotation void status", err);
      toast.error("Error updating quotation status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4 flex flex-wrap gap-4 items-center justify-between">
      <p>
        <strong>Quotation Status:</strong>{" "}
        {status ? (
          <span className="text-red-600 font-semibold">Void</span>
        ) : (
          <span className="text-green-600 font-semibold">Active</span>
        )}
      </p>

      <div className="flex items-center gap-4">
        <Button
          size="sm"
          onClick={handleVoid}
          disabled={status || loading}
          className={`${
            status
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {loading ? "Updating..." : status ? "Already Void" : "Mark as Void"}
        </Button>
        {status && (
          <a
            href={`/quotations/additional/create`}
            className="w-full sm:w-auto"
          >
            <Button size="sm">Additional Quotes</Button>
          </a>
        )}
      </div>
    </div>
  );
};

export default QuotationVoidStatusUpdater;
