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
import { Edit } from "lucide-react";
import { IProfile } from "@/lib/database/models/profile.model";
import ProfileForm from "@/app/(root)/components/ProfileForm";

interface UpdateProfileDialog2Props {
  profile: IProfile;
  profileId: string;
  agent?: IProfile[];
}

const UpdateProfileDialog2 = ({
  profile,
  profileId,
  agent,
}: UpdateProfileDialog2Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-black text-white dark:bg-gray-600 dark:text-gray-100 hover:bg-gray-800 hover:text-white rounded-md w-max"
        >
          <span className="text-xs sm:text-sm md:text-base">Edit Profile</span>
          <Edit className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
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
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>

        <ProfileForm
          profile={profile}
          profileId={profileId}
          agent={agent}
          type="Update"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog2;
