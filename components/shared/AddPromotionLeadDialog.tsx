"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IProfile } from "@/lib/database/models/profile.model";
import PromotionLeadForm from "@/app/(root)/components/PromotionLeadForm";
import { IPromotion } from "@/lib/database/models/promotion.model";

interface AddPromotionLeadDialogProps {
  email: string;
  agency: IProfile[];
  promotion?: IPromotion;
  isAdmin?: boolean;
}

const AddPromotionLeadDialog = ({
  email,
  agency,
  promotion,
  isAdmin,
}: AddPromotionLeadDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full px-5 py-2 rounded-lg font-medium shadow transition bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:opacity-90 text-white">
          Get Started
        </button>
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
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>

        <PromotionLeadForm
          email={email}
          agency={agency}
          promotion={promotion}
          isAdmin={isAdmin}
          type="Create"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPromotionLeadDialog;
