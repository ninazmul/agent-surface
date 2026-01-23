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
import ProfileForm from "@/app/(root)/components/ProfileForm";

interface AddSubAgentDialogProps {
  email: string;
  agent?: IProfile[];
  isAgent?: boolean;
  role?: string;
}

const AddSubAgentDialog = ({
  email,
  agent,
  isAgent,
}: AddSubAgentDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-1"
        >
          Add Sub Agent <Plus />
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
          <DialogTitle>Create Profile</DialogTitle>
        </DialogHeader>

        <ProfileForm
          agent={agent}
          isAgent={isAgent}
          email={email}
          type="Create"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddSubAgentDialog;
