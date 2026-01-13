// components/leads/AddLeadDialog.tsx
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
import LeadForm from "@/app/(root)/components/LeadForm";
import { ICourse } from "@/lib/database/models/course.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";

interface AddLeadDialogProps {
  email: string;
  agency: IProfile[];
  courses: ICourse[];
  services: IServices[];
  isAdmin: boolean;
}

const AddLeadDialog = ({
  email,
  agency,
  courses,
  services,
  isAdmin,
}: AddLeadDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
        >
          <Plus size={16} /> Add <span className="hidden md:block">Lead</span>
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
          agency={agency}
          courses={courses}
          services={services}
          isAdmin={isAdmin}
          type="Create"
          onSuccess={() => setOpen(false)} // optional but recommended
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadDialog;
