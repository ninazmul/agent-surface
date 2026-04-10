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
import MarketingResourceForm from "@/app/(root)/components/MarketingResourceForm";
import { IMarketingResource } from "@/lib/database/models/marketing-resource.model";

interface UpdateMarketingResourceDialogProps {
  resource: IMarketingResource;
  resourceId: string;
}

const UpdateMarketingResourceDialog = ({
  resource,
  resourceId,
}: UpdateMarketingResourceDialogProps) => {
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
          <DialogTitle>Update Marketing Resource</DialogTitle>
        </DialogHeader>

        <MarketingResourceForm
          resource={resource}
          resourceId={resourceId}
          type="Update"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMarketingResourceDialog;
