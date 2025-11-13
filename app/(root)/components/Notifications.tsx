"use client";

import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/actions/admin.actions";
import {
  getAllNotifications,
  getNotificationsByAgency,
} from "@/lib/actions/notification.actions";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";
import { useUser } from "@clerk/nextjs";
import { Bell, Circle } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

export type NotificationDTO = {
  _id: string;
  title: string;
  route?: string;
  agency: string;
  country: string;
  readBy?: { email?: string; status: "read" | "unread" }[];
  createdAt: string;
};

export default function NotificationsDropdown() {
  const { user } = useUser();
  const userId = user?.id || "";

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousUnreadCount = useRef<number>(0);

  // Notification sound
  const notificationSound = useRef(new Audio("/notification.mp3"));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Auto-focus dropdown when opened
  useEffect(() => {
    if (open && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    async function fetchNotifications() {
      try {
        const userMongoId = await getUserByClerkId(userId);
        const email = await getUserEmailById(userMongoId);
        const adminStatus = await isAdmin(email);

        if (!email) return;

        let userNotifications: NotificationDTO[];

        if (adminStatus) {
          userNotifications = await getAllNotifications();
        } else {
          userNotifications = await getNotificationsByAgency(email);
        }

        if (isMounted && userNotifications) {
          const unread = userNotifications.filter(
            (n) =>
              !n.readBy?.some((r) => r.email === email && r.status === "read")
          );

          // Play sound if new notifications arrived
          if (unread.length > previousUnreadCount.current) {
            notificationSound.current
              .play()
              .catch((err) => console.log("Sound play error:", err));
          }
          previousUnreadCount.current = unread.length;

          const formatted: NotificationDTO[] = unread.slice(0, 5).map((n) => ({
            ...n,
            createdAt: n.createdAt,
          }));

          setNotifications(formatted);
          setUnreadCount(unread.length);

          if (firstLoad && unread.length > 0) {
            toast(
              `Welcome back! You have ${unread.length} unread notification${
                unread.length > 1 ? "s" : ""
              }`,
              {
                position: "top-right",
                duration: 5000,
                icon: "🔔",
              }
            );
            setFirstLoad(false);
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId, firstLoad]);

  return (
    <div className="relative" ref={dropdownRef} tabIndex={-1}>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle notifications dropdown"
        className="relative w-9 h-9 text-gray-500 rounded-full transition"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-white"></span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-h-[420px] overflow-auto bg-white rounded-2xl shadow-2xl z-50 border border-gray-200 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b font-semibold text-gray-800 flex justify-between items-center">
            <span>Unread Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-500">{unreadCount} total</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              🎉 You’re all caught up!
            </div>
          ) : (
            notifications.map((notification) => (
              <a
                key={notification._id}
                href={notification.route || "/notifications"}
                className="block px-4 py-3 text-sm border-b last:border-0 hover:bg-gray-50 transition"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-start gap-2">
                  <Circle
                    className="w-2 h-2 text-red-500 mt-1"
                    fill="currentColor"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 line-clamp-2">
                      {notification.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {notification.agency} • {notification.country}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}

          <a
            href="/notifications"
            className="block px-4 py-3 text-sm text-center text-blue-600 hover:bg-blue-50 font-medium transition"
            onClick={() => setOpen(false)}
          >
            View all
          </a>
        </div>
      )}
    </div>
  );
}
