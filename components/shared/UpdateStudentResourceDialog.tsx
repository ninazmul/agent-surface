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
import StudentResourceForm from "@/app/(root)/components/StudentResourceForm";
import { IStudentResource } from "@/lib/database/models/student-resource.model";

interface UpdateStudentResourceDialogProps {
  resource: IStudentResource;
  resourceId: string;
}

const UpdateStudentResourceDialog = ({
  resource,
  resourceId,
}: UpdateStudentResourceDialogProps) => {
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
          <DialogTitle>Update Student Resource</DialogTitle>
        </DialogHeader>

        <StudentResourceForm
          resource={resource}
          resourceId={resourceId}
          type="Update"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStudentResourceDialog;
