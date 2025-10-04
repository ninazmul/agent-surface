"use client";

import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";

export default function SendRemindersButton({iconOnly}: {iconOnly?: boolean}) {
  async function handleReminderClick() {
    try {
      const res = await fetch("/api/send-reminders", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Reminders sent!");
      } else {
        toast.error(data.message || "Failed to send reminders");
      }
    } catch (err) {
      toast.error("Error sending reminders");
      console.error(err);
    }
  }

  return (
    <Button
      onClick={handleReminderClick}
      size="sm"
      variant="outline"
      className="rounded-full flex items-center gap-2 text-blue-600"
    >
      {iconOnly ? (
        <Bell />
      ) : (
        <>
          <Bell /> Send Reminders
        </>
      )}
    </Button>
  );
}
