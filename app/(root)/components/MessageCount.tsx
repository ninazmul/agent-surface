"use client";

import { Button } from "@/components/ui/button";
import { getUnreadSummary } from "@/lib/actions/message.actions";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";
import { useUser } from "@clerk/nextjs";
import { MessageCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function MessageCount() {
  const { user } = useUser();
  const userId = user?.id || "";
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const userID = await getUserByClerkId(userId);
      const email = await getUserEmailById(userID);
      const data = await getUnreadSummary(email);
      setUnreadCount(data?.totalUnread ?? 0);
    } catch (error) {
      console.error("Error fetching unreadCount", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 3000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <div>
      <a href="/messages" className="relative inline-block">
        <Button
          size="icon"
          variant="ghost"
          className="w-9 h-9 text-gray-500 rounded-full"
        >
          <MessageCircle className="w-5 h-5 text-gray-500" />
        </Button>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-white"></span>
        )}
      </a>
    </div>
  );
}
