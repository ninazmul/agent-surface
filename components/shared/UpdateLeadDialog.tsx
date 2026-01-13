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
import LeadForm from "@/app/(root)/components/LeadForm";
import { ICourse } from "@/lib/database/models/course.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { ILead } from "@/lib/database/models/lead.model";

interface UpdateLeadDialogProps {
  email: string;
  agency: IProfile[];
  courses: ICourse[];
  services: IServices[];
  isAdmin: boolean;
  lead: ILead;
  leadId: string;
}

const UpdateLeadDialog = ({
  email,
  agency,
  courses,
  services,
  isAdmin,
  lead,
  leadId,
}: UpdateLeadDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-purple-500 gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit Lead
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
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>

        <LeadForm
          email={email}
          Lead={lead}
          LeadId={leadId}
          agency={agency}
          courses={courses}
          services={services}
          isAdmin={isAdmin}
          type="Update"
          onSuccess={() => setOpen(false)} // optional but recommended
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateLeadDialog;
