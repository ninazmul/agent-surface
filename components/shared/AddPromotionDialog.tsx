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
import { Plus } from "lucide-react";
import { ICourse } from "@/lib/database/models/course.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";
import PromotionForm from "@/app/(root)/components/PromotionForm";

interface AddPromotionDialogProps {
  agency: IProfile[];
  courses: ICourse[];
  services: IServices[];
}

const AddPromotionDialog = ({
  agency,
  courses,
  services,
}: AddPromotionDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
        >
          <Plus size={16} /> Create Promotion
        </Button>
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
          <DialogTitle>Create Promotion</DialogTitle>
        </DialogHeader>
        <PromotionForm type="Create" courses={courses} services={services} agencies={agency} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default AddPromotionDialog;
