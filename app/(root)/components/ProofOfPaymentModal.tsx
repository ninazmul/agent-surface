import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileCheck, FileTextIcon } from "lucide-react";
import { useState } from "react";
import { Types } from "mongoose";

interface ICombinedItem {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  number?: string;
  quotationStatus?: boolean;
  paymentStatus?: string;
  paymentAcceptedAt?: Date;
  isPinned?: boolean;
  discount?: number | string;
  home: {
    address: string;
    zip: string;
    country: string;
    state: string;
    city: string;
  };
  course?: {
    name: string;
    courseDuration?: string;
    courseType?: string;
    courseFee?: string;
  }[];
  services?: {
    _id: string;
    serviceType: string;
    title: string;
    amount?: string;
    description?: string;
  }[];
  transcript?: {
    amount: string;
    method: string;
    fileUrl: string;
  }[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  author?: string;
  isAdditional?: boolean;
  type: "Lead" | "Quotation";
}

const ProofOfPaymentModal = ({ lead }: { lead: ICombinedItem }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-green-500 gap-2"
        >
          <FileCheck /> Proof of Payment
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Proof of Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {Array.isArray(lead.transcript) && lead.transcript.length > 0 ? (
            lead.transcript.map((doc, i) => (
              <a
                key={i}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="w-full justify-start text-blue-500 gap-2"
                >
                  <FileTextIcon className="w-4 h-4 text-purple-500" />
                  {doc.amount || `Proof ${i + 1}`} - {doc.method || "N/A"}
                </Button>
              </a>
            ))
          ) : (
            <p className="text-sm text-gray-500">No proofs uploaded yet.</p>
          )}
        </div>

        <DialogFooter className="flex justify-between mt-4">
          <a href={`/commissions/${lead._id.toString()}/transcript`}>
            <Button>Add Proof of Payment</Button>
          </a>
          <Button variant={"destructive"} onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProofOfPaymentModal;
