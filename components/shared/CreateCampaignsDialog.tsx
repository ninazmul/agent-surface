"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import CampaignFormBuilder from "./CampaignFormBuilder";

interface CreateCampaignsDialogProps {
  email: string;
}

const CreateCampaignsDialog = ({ email }: CreateCampaignsDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
        >
          <Plus size={16} /> Create Form
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
    p-0
    rounded-2xl
  "
      >
        {/* Header */}
        <div className="bg-purple-900 text-white px-6 py-5">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold leading-tight">
              Create New Campaign
            </DialogTitle>
            <DialogDescription className="text-sm text-purple-100">
              Configure your campaign settings and target audience.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-6">
          <CampaignFormBuilder
            author={email}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignsDialog;
