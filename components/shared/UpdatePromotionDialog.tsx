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
import { Pencil } from "lucide-react";
import { ICourse } from "@/lib/database/models/course.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";
import PromotionForm from "@/app/(root)/components/PromotionForm";
import { IPromotion } from "@/lib/database/models/promotion.model";

interface UpdatePromotionDialogProps {
  agency: IProfile[];
  courses: ICourse[];
  services: IServices[];
  promotion: IPromotion;
  promotionId: string;
  type: "Card" | "Action";
}

const UpdatePromotionDialog = ({
  agency,
  courses,
  services,
  promotion,
  promotionId,
  type,
}: UpdatePromotionDialogProps) => {
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
            Edit Promotion
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="w-3 h-3" />
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
          <DialogTitle>Update Promotion</DialogTitle>
        </DialogHeader>

        <PromotionForm
          promotion={promotion}
          promotionId={promotionId}
          agencies={agency}
          courses={courses}
          services={services}
          onSuccess={() => setOpen(false)}
          type="Update"
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePromotionDialog;
