"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Plus } from "lucide-react";
import { IProfile } from "@/lib/database/models/profile.model";
import PaymentForm from "@/app/(root)/components/PaymentForm";

interface AddPaymentDialogProps {
  agency: IProfile;
  isAdmin?: boolean;
  amount?: string;
  type?: "Default" | "Action";
}

const AddPaymentDialog = ({
  agency,
  isAdmin,
  amount,
  type,
}: AddPaymentDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === "Action" ? (
          <Button
            variant="ghost"
            className="w-full justify-start text-purple-500 gap-2"
          >
            <Pencil className="w-4 h-4" />
            Request Payment
          </Button>
        ) : (
          <Button
            size="sm"
            className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
          >
            <Plus size={16} /> Request Payment
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="
        w-full md:w-[95vw]
        max-w-[95vw]
        sm:max-w-3xl
        max-h-[90vh]
        overflow-y-auto
        overflow-x-hidden
        bg-white dark:bg-gray-800
        p-4 sm:p-6
        "
      >
        <DialogHeader>
          <DialogTitle>Add Payment Request</DialogTitle>
        </DialogHeader>

        <PaymentForm
          type="Create"
          agency={agency}
          isAdmin={isAdmin}
          amount={amount}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentDialog;
