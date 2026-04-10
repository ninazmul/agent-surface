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
import { IProfile } from "@/lib/database/models/profile.model";
import DownloadForm from "@/app/(root)/components/DownloadForm";
import { ILead } from "@/lib/database/models/lead.model";

interface AddDocDialogProps {
  agency: IProfile[];
  leads: ILead[];
}

const AddDocDialog = ({ agency, leads }: AddDocDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
        >
          <Plus size={16} /> Add Document
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
          <DialogTitle>Add Document</DialogTitle>
        </DialogHeader>

        <DownloadForm
          type="Create"
          leads={leads}
          agency={agency}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddDocDialog;
