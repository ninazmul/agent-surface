"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getUnreadSummary } from "@/lib/actions/message.actions";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";

const POLL_INTERVAL = 5000; // 5s is a safer default

export default function MessageCount() {
  const { user, isLoaded } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const emailRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve user email ONCE
  const resolveUserEmail = useCallback(async () => {
    if (!user?.id || emailRef.current) return;

    const userId = await getUserByClerkId(user.id);
    const email = await getUserEmailById(userId);
    emailRef.current = email;
  }, [user?.id]);

  // Fetch unread count ONLY
  const fetchUnreadCount = useCallback(async () => {
    if (!emailRef.current) return;

    try {
      const data = await getUnreadSummary(emailRef.current);
      setUnreadCount(data?.totalUnread ?? 0);
    } catch (err) {
      console.error("Unread count fetch failed", err);
    }
  }, []);

  // Start polling with visibility awareness
  useEffect(() => {
    if (!isLoaded || !user) return;

    let isActive = true;

    const startPolling = async () => {
      await resolveUserEmail();
      await fetchUnreadCount();

      intervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible" && isActive) {
          fetchUnreadCount();
        }
      }, POLL_INTERVAL);
    };

    startPolling();

    return () => {
      isActive = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoaded, user, resolveUserEmail, fetchUnreadCount]);

  return (
    <a href="/messages" className="relative inline-block">
      <Button
        size="icon"
        variant="ghost"
        className="w-9 h-9 rounded-full text-gray-500 dark:text-gray-100"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>

      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 border border-white" />
      )}
    </a>
  );
}
