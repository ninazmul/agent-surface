"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  deleteNotification,
  toggleReadStatusForUser,
} from "@/lib/actions/notification.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortAsc, SortDesc, Trash, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { INotification } from "@/lib/database/models/notification.model";

type NotificationWithStatus = INotification & {
  userStatus: "Read" | "Unread";
};

const NotificationTable = ({
  notifications,
  email,
}: {
  notifications: NotificationWithStatus[];
  email: string;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "userStatus" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isReadingAll, setIsReadingAll] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(
    notifications || []
  );

  const prevCountRef = useRef(localNotifications.length);

  useEffect(() => {
    if (!email) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/cron/notify?agency=${email}`);
        const data = await res.json();

        if (data.success) {
          const newNotifications: NotificationWithStatus[] =
            data.notifications.map((n: INotification) => ({
              ...n,
              userStatus: n.readBy?.some(
                (r) => r.email === email && r.status === "read"
              )
                ? "Read"
                : "Unread",
            }));

          // Play sound if new notifications arrived
          if (newNotifications.length > prevCountRef.current) {
            const audio = new Audio("/notification.mp3");
            audio.play().catch(console.error);
          }

          prevCountRef.current = newNotifications.length;

          // Merge new notifications with existing ones (avoid duplicates)
          setLocalNotifications((prev) => {
            const existingIds = prev.map((n) => n._id);
            const merged = [
              ...prev,
              ...newNotifications.filter((n) => !existingIds.includes(n._id)),
            ];
            return merged;
          });
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications(); // initial fetch
    const interval = setInterval(fetchNotifications, 10000); // poll every 10 sec
    return () => clearInterval(interval);
  }, [email]);

  const filteredNotifications = useMemo(() => {
    const filtered = localNotifications.filter((notification) =>
      [notification.title, notification.userStatus].some((value) =>
        value?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA = a[sortKey]?.toLowerCase?.() || "";
        const valueB = b[sortKey]?.toLowerCase?.() || "";
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
    }

    return filtered;
  }, [localNotifications, searchQuery, sortKey, sortOrder]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await deleteNotification(notificationId);
      if (response) {
        toast.success("Notification deleted successfully");
        setLocalNotifications((prev) =>
          prev.filter((notification) => notification._id !== notificationId)
        );
      }
    } catch (error) {
      console.error("Failed to delete notification", error);
      toast.error("Failed to delete notification");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: "Read" | "Unread"
  ) => {
    if (!email) return toast.error("User email not found");

    try {
      await toggleReadStatusForUser(id, email, currentStatus);
      const newStatus = currentStatus === "Unread" ? "Read" : "Unread";

      toast.success(`Marked as "${newStatus}"`);

      setLocalNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? ({
                ...notification,
                userStatus: newStatus,
              } as NotificationWithStatus)
            : notification
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  const handleSort = (key: "title" | "userStatus") => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleReadAll = async () => {
    if (!email) return toast.error("User email not found");
    setIsReadingAll(true);

    try {
      const unread = localNotifications.filter(
        (n) => n.userStatus === "Unread"
      );
      await Promise.all(
        unread.map((n) => toggleReadStatusForUser(n._id, email, "Unread"))
      );

      toast.success("All notifications marked as Read.");

      setLocalNotifications((prev) =>
        prev.map(
          (notification) =>
            ({
              ...notification,
              userStatus: "Read",
            } as NotificationWithStatus)
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all as read.");
    } finally {
      setIsReadingAll(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      const idsToDelete = localNotifications.map((n) => n._id);
      for (const id of idsToDelete) {
        await deleteNotification(id);
      }
      toast.success("All notifications deleted.");
      setLocalNotifications([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete all notifications.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search notifications..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3 rounded-2xl"
      />

      {/* Sort & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4 text-sm text-muted-foreground">
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl"
            onClick={handleReadAll}
            disabled={!localNotifications.length || isReadingAll}
          >
            {isReadingAll ? "Marking..." : "Mark All as Read"}
          </Button>

          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl"
            onClick={handleDeleteAll}
            disabled={!localNotifications.length || isDeletingAll}
          >
            {isDeletingAll ? "Deleting..." : "Delete All"}
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="grid gap-4">
        {paginatedNotifications.map((notification) => (
          <div
            key={notification._id}
            className={`border border-gray-200 rounded-2xl p-4 shadow-sm space-y-2 transition-opacity ${
              notification.userStatus === "Read"
                ? "bg-gray-100 dark:bg-gray-900 opacity-70"
                : "bg-white dark:bg-gray-800"
            }`}
          >
            <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-4">
              <a href={notification?.route || "/notifications"}>
                <h4
                  className={`${
                    notification.userStatus === "Unread"
                      ? "font-bold text-base text-gray-900 dark:text-gray-100"
                      : "text-base text-muted-foreground"
                  }`}
                >
                  {notification.title}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    notification.userStatus === "Unread"
                      ? "text-red-500 font-semibold"
                      : "text-green-600 text-muted-foreground"
                  }`}
                >
                  {notification.userStatus}
                </p>
              </a>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    handleToggleStatus(
                      notification._id,
                      notification.userStatus
                    )
                  }
                  className={`
                    text-xs font-semibold px-2 py-1 rounded-2xl flex items-center gap-1
                    ${
                      notification.userStatus === "Unread"
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-black"
                        : "bg-green-100 text-green-700 hover:bg-green-500 hover:text-black"
                    }
                  `}
                >
                  Mark as{" "}
                  {notification.userStatus === "Unread" ? "Read" : "Unread"}
                  <RefreshCcw className="ml-1 h-3 w-3" size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmDeleteId(notification._id)}
                  className="rounded-2xl"
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
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
          of {filteredNotifications.length} notifications
        </span>
        <div className="flex items-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            size="sm"
            className="rounded-2xl"
          >
            Previous
          </Button>
          <Button
            disabled={
              currentPage ===
              Math.ceil(filteredNotifications.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
            size="sm"
            className="rounded-2xl"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md space-y-4 shadow-md">
            <p className="text-gray-800 font-medium">
              Are you sure you want to delete this notification?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteNotification(confirmDeleteId)}
                variant="destructive"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTable;
