"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  deleteNotification,
  toggleReadStatusForUser,
} from "@/lib/actions/notification.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortAsc, SortDesc, Trash, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { INotification } from "@/lib/database/models/notification.model";

type NotificationWithStatus = INotification & { userStatus: "Read" | "Unread" };

interface Props {
  notifications: NotificationWithStatus[];
  email: string;
}

const POLL_INTERVAL = 10000; // 10s

export default function NotificationTable({ notifications, email }: Props) {
  const [localNotifications, setLocalNotifications] = useState<
    Map<string, NotificationWithStatus>
  >(() => new Map(notifications.map((n) => [n._id.toString(), n])));
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "userStatus" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isReadingAll, setIsReadingAll] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const prevCountRef = useRef(localNotifications.size);

  // ====== Polling Notifications (Visibility-aware) ======
  const fetchNotifications = useCallback(async () => {
    if (!email || document.visibilityState !== "visible") return;
    try {
      const res = await fetch(`/api/cron/notify?agency=${email}`);
      const data = await res.json();
      if (!data.success) return;

      const newNotifications: NotificationWithStatus[] = data.notifications.map(
        (n: INotification) => ({
          ...n,
          userStatus: n.readBy?.some(
            (r) => r.email === email && r.status === "read",
          )
            ? "Read"
            : "Unread",
        }),
      );

      if (newNotifications.length > prevCountRef.current) {
        new Audio("/notification.mp3").play().catch(() => {});
      }
      prevCountRef.current = newNotifications.length;

      setLocalNotifications((prev) => {
        const map = new Map(prev);
        newNotifications.forEach((n) => map.set(n._id.toString(), n));
        return map;
      });
    } catch (err) {
      console.error(err);
    }
  }, [email]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ====== Derived List ======
  const filteredNotifications = useMemo(() => {
    return Array.from(localNotifications.values())
      .filter((n) =>
        [n.title, n.userStatus].some((val) =>
          val.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
      .sort((a, b) => {
        // Unread first
        if (a.userStatus !== b.userStatus)
          return a.userStatus === "Unread" ? -1 : 1;
        // Optional sorting
        if (!sortKey) return 0;
        const valA = (a[sortKey] || "").toLowerCase();
        const valB = (b[sortKey] || "").toLowerCase();
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
  }, [localNotifications, searchQuery, sortKey, sortOrder]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  // ====== Actions ======
  const toggleStatus = async (id: string, current: "Read" | "Unread") => {
    try {
      await toggleReadStatusForUser(id, email, current);
      const newStatus = current === "Unread" ? "Read" : "Unread";
      setLocalNotifications((prev) => {
        const map = new Map(prev);
        const n = map.get(id);
        if (n) n.userStatus = newStatus;
        return map;
      });
      toast.success(`Marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const deleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await Promise.all(
        Array.from(localNotifications.keys()).map((id) =>
          deleteNotification(id),
        ),
      );
      setLocalNotifications(new Map());
      toast.success("All deleted");
    } catch {
      toast.error("Failed to delete all");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const markAllRead = async () => {
    setIsReadingAll(true);
    try {
      const unreadIds = Array.from(localNotifications.values())
        .filter((n) => n.userStatus === "Unread")
        .map((n) => n._id.toString());
      await Promise.all(
        unreadIds.map((id) => toggleReadStatusForUser(id, email, "Unread")),
      );
      setLocalNotifications((prev) => {
        const map = new Map(prev);
        unreadIds.forEach((id) => {
          const n = map.get(id);
          if (n) n.userStatus = "Read";
        });
        return map;
      });
      toast.success("All marked read");
    } catch {
      toast.error("Failed to mark all read");
    } finally {
      setIsReadingAll(false);
    }
  };

  const handleSort = (key: "title" | "userStatus") => {
    if (sortKey === key)
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search notifications..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-2xl w-full md:w-1/2 lg:w-1/3 mb-4"
      />

      {/* Actions */}
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex gap-4">
          <button
            onClick={() => handleSort("title")}
            className="flex items-center gap-1"
          >
            Sort by Title{" "}
            {sortKey === "title" &&
              (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
          </button>
          <button
            onClick={() => handleSort("userStatus")}
            className="flex items-center gap-1"
          >
            Sort by Status{" "}
            {sortKey === "userStatus" &&
              (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
            onClick={markAllRead}
            disabled={isReadingAll || !localNotifications.size}
          >
            {isReadingAll ? "Marking..." : "Mark All Read"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={deleteAll}
            disabled={isDeletingAll || !localNotifications.size}
          >
            {isDeletingAll ? "Deleting..." : "Delete All"}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="grid gap-4">
        {paginatedNotifications.map((n) => (
          <div
            key={n._id.toString()}
            className={`p-4 rounded-2xl border shadow-sm ${
              n.userStatus === "Read"
                ? "bg-gray-100 dark:bg-gray-900 opacity-70"
                : "bg-white dark:bg-gray-800"
            }`}
          >
            <div className="flex justify-between items-center gap-4">
              <a href={n.route || "/notifications"}>
                <h4
                  className={
                    n.userStatus === "Unread"
                      ? "font-bold text-gray-900 dark:text-gray-100"
                      : "text-muted-foreground"
                  }
                >
                  {n.title}
                </h4>
                <p
                  className={`text-sm ${n.userStatus === "Unread" ? "text-red-500 font-semibold" : "text-green-600 text-muted-foreground"}`}
                >
                  {n.userStatus}
                </p>
              </a>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
                  onClick={() => toggleStatus(n._id.toString(), n.userStatus)}
                >
                  Mark as {n.userStatus === "Unread" ? "Read" : "Unread"}{" "}
                  <RefreshCcw className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    await deleteNotification(n._id.toString());
                    setLocalNotifications((prev) => {
                      const map = new Map(prev);
                      map.delete(n._id.toString());
                      return map;
                    });
                  }}
                >
                  <Trash className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredNotifications.length)}{" "}
          of {filteredNotifications.length}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="rounded-2xl bg-black disabled:bg-muted-foreground  hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 text-white dark:text-gray-100 w-full flex items-center gap-2 justify-center"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            size="sm"
            className="rounded-2xl bg-black disabled:bg-muted-foreground  hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 text-white dark:text-gray-100 w-full flex items-center gap-2 justify-center"
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(
                  Math.ceil(filteredNotifications.length / itemsPerPage),
                  p + 1,
                ),
              )
            }
            disabled={
              currentPage ===
              Math.ceil(filteredNotifications.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
