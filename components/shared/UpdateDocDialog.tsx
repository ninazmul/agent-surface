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
import { IProfile } from "@/lib/database/models/profile.model";
import DownloadForm from "@/app/(root)/components/DownloadForm";
import { ILead } from "@/lib/database/models/lead.model";
import { IDownload } from "@/lib/database/models/download.model";

interface UpdateDocDialogProps {
  agency: IProfile[];
  leads: ILead[];
  download: IDownload;
  downloadId: string;
}

const UpdateDocDialog = ({
  agency,
  leads,
  download,
  downloadId,
}: UpdateDocDialogProps) => {
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
          <DialogTitle>Update Document</DialogTitle>
        </DialogHeader>

        <DownloadForm
          type="Update"
          download={download}
          downloadId={downloadId}
          leads={leads}
          agency={agency}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDocDialog;
