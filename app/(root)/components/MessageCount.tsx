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
    <div className="relative">
      <a href={"/messages"}>
        <Button
          size="icon"
          variant="ghost"
          className="w-9 h-9 text-gray-500 rounded-full"
        >
          <MessageCircle className="text-gray-500" />
        </Button>

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </a>
    </div>
  );
}
