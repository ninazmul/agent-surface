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
import { IServices } from "@/lib/database/models/service.model";
import ServiceForm from "@/app/(root)/components/ServiceForm";

interface UpdateServiceDialogProps {
  service: IServices;
  serviceId: string;
}

const UpdateServiceDialog = ({ service, serviceId }: UpdateServiceDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="w-4 h-4 text-black" />
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
          <DialogTitle>Update Service</DialogTitle>
        </DialogHeader>

        <ServiceForm
          Service={service}
          ServiceId={serviceId}
          type="Update"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateServiceDialog;
