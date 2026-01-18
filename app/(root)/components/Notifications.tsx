"use client";

import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/actions/admin.actions";
import {
  getAllNotifications,
  getNotificationsByAgency,
  toggleReadStatusForUser,
} from "@/lib/actions/notification.actions";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";
import { useUser } from "@clerk/nextjs";
import { Bell, Circle, X, Volume2, VolumeX, CheckCheck } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

/* ======================= TYPES ======================= */

export type NotificationReadStatus = {
  email?: string;
  status: "read" | "unread";
};

export type NotificationDTO = {
  _id: string;
  title: string;
  route?: string;
  agency: string;
  country: string;
  readBy?: NotificationReadStatus[];
  createdAt: string;
};

/* ======================= COMPONENT ======================= */

export default function NotificationsDropdown() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [isReadingAll, setIsReadingAll] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("notifications-muted") === "true";
  });

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const previousUnreadCount = useRef<number>(0);
  const notificationSound = useRef<HTMLAudioElement>(
    new Audio("/notification.mp3"),
  );

  /* ======================= EFFECTS ======================= */

  // Persist mute state
  useEffect(() => {
    localStorage.setItem("notifications-muted", String(muted));
  }, [muted]);

  // Close on outside click / escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const userMongoId = await getUserByClerkId(userId);
        const userEmail = await getUserEmailById(userMongoId);
        const adminStatus = await isAdmin(userEmail);

        if (!userEmail) return;

        setEmail(userEmail);

        const data: NotificationDTO[] = adminStatus
          ? await getAllNotifications()
          : await getNotificationsByAgency(userEmail);

        if (!mounted) return;

        const unread = data.filter(
          (n) =>
            !n.readBy?.some(
              (r) => r.email === userEmail && r.status === "read",
            ),
        );

        if (!muted && unread.length > previousUnreadCount.current) {
          notificationSound.current.play().catch(() => null);
        }

        previousUnreadCount.current = unread.length;

        setNotifications(unread.slice(0, 5));
        setUnreadCount(unread.length);

        if (firstLoad && unread.length > 0) {
          toast.custom(
            (t) => (
              <div className="relative flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg bg-white text-black border border-gray-200">
                <span className="text-lg">🔔</span>
                <p className="text-sm pr-6">
                  Welcome back! You have {unread.length} unread notification
                  {unread.length > 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ),
            {
              position: "top-right",
              duration: 3000,
            },
          );

          setFirstLoad(false);
        }
      } catch (error) {
        console.error("Notification fetch failed:", error);
      }
    };

    fetchNotifications();
    const interval = (fetchNotifications, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userId, muted, firstLoad]);

  /* ======================= ACTIONS ======================= */

  const handleReadAll = async () => {
    if (!email) return toast.error("User email not found");

    setIsReadingAll(true);

    try {
      const unread = notifications.filter(
        (n) => !n.readBy?.some((r) => r.email === email && r.status === "read"),
      );

      await Promise.all(
        unread.map((n) => toggleReadStatusForUser(n._id, email, "Unread")),
      );

      toast.success("All notifications marked as read");

      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readBy: [...(n.readBy ?? []), { email, status: "read" }],
        })),
      );

      setUnreadCount(0);
      previousUnreadCount.current = 0;
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all as read");
    } finally {
      setIsReadingAll(false);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  /* ======================= UI ======================= */

  return (
    <div className="relative" ref={dropdownRef} tabIndex={-1}>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 text-gray-500 dark:text-gray-100 rounded-full"
      >
        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-100" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-white" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] bg-white text-black rounded-2xl shadow-2xl z-50 border">
          {/* Header */}
          <div className="p-3 border-b flex justify-between items-center">
            <span className="font-semibold text-sm">Unread Notifications</span>

            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMuted((m) => !m)}
              >
                {muted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleReadAll}
                disabled={unreadCount === 0 || isReadingAll}
              >
                <CheckCheck
                  className={`w-4 h-4 ${isReadingAll ? "animate-pulse" : ""}`}
                />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              🎉 You’re all caught up!
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className="px-4 py-3 border-b flex gap-2 hover:bg-gray-50"
              >
                <Circle
                  className="w-2 h-2 text-red-500 mt-1"
                  fill="currentColor"
                />

                <a
                  href={n.route || "/notifications"}
                  className="flex-1 text-sm"
                  onClick={() => setOpen(false)}
                >
                  <div className="font-medium line-clamp-2">{n.title}</div>
                  <div className="text-xs text-gray-500">
                    {n.agency} • {n.country}
                  </div>
                </a>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => dismissNotification(n._id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}

          <a
            href="/notifications"
            className="block text-center py-3 text-sm text-blue-600 hover:bg-blue-50"
            onClick={() => setOpen(false)}
          >
            View all
          </a>
        </div>
      )}
    </div>
  );
}
