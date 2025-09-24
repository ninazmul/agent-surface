"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Notification, {
  INotification,
  IReadBy,
} from "../database/models/notification.model";
import { NotificationParams } from "@/types";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "./admin.actions";
import { getProfileByEmail } from "./profile.actions";

type NotificationWithStatus = INotification & {
  userStatus: "Read" | "Unread";
};

// ====== CREATE NOTIFICATION
export const createNotification = async (params: NotificationParams) => {
  try {
    await connectToDatabase();
    const newNotification = await Notification.create(params);
    return JSON.parse(JSON.stringify(newNotification));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL NOTIFICATIONS
export const getAllNotifications = async () => {
  try {
    await connectToDatabase();
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(notifications));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET NOTIFICATIONS BY AGENCY
export const getNotificationsByAgency = async (agency: string) => {
  try {
    await connectToDatabase();
    const notifications = await Notification.find({ agency }).sort({
      createdAt: -1,
    }).lean();

    if (!notifications.length) {
      console.warn(`No notifications found for agency: ${agency}`);
      return [];
    }

    return JSON.parse(JSON.stringify(notifications));
  } catch (error) {
    console.error("Error fetching notifications by agency:", error);
    handleError(error);
  }
};

// ====== UPDATE NOTIFICATION
export const updateNotification = async (
  notificationId: string,
  updateData: Partial<NotificationParams>
) => {
  try {
    await connectToDatabase();

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedNotification) {
      throw new Error("Notification not found");
    }

    return JSON.parse(JSON.stringify(updatedNotification));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE NOTIFICATION
export const deleteNotification = async (notificationId: string) => {
  try {
    await connectToDatabase();

    const deletedNotification = await Notification.findByIdAndDelete(
      notificationId
    );

    if (!deletedNotification) {
      throw new Error("Notification not found");
    }

    return { message: "Notification deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

// ====== MARK NOTIFICATION AS READ FOR A USER
export const toggleReadStatusForUser = async (
  notificationId: string,
  email: string,
  currentStatus: "Read" | "Unread"
) => {
  try {
    await connectToDatabase();

    const isRead = currentStatus === "Read";

    const notification = await Notification.findOne({
      _id: notificationId,
      "readBy.email": email,
    });

    if (notification) {
      await Notification.updateOne(
        { _id: notificationId, "readBy.email": email },
        { $set: { "readBy.$.status": isRead ? "unread" : "read" } }
      );
    } else {
      await Notification.updateOne(
        { _id: notificationId },
        { $push: { readBy: { email, status: isRead ? "unread" : "read" } } }
      );
    }

    return { success: true };
  } catch (error) {
    handleError(error);
    return { success: false };
  }
};

export const getNotificationsForUser = async (userEmail: string) => {
  try {
    await connectToDatabase();
    const notifications = await Notification.find().sort({ createdAt: -1 });

    const result = notifications.map((n) => {
      const userReadStatus = n.readBy?.find(
        (r: IReadBy) => r.email === userEmail
      );
      const status =
        userReadStatus?.status?.toLowerCase() === "read" ? "Read" : "Unread";

      return {
        _id: n._id.toString(),
        title: n.title,
        status: n.status,
        route: n.route,
        createdAt: n.createdAt.toISOString(),
        __v: n.__v,
        readBy:
          n.readBy?.map((r: IReadBy) => ({
            email: r.email,
            status: r.status,
          })) || [],
        userStatus: status,
      };
    });

    return result;
  } catch (error) {
    handleError(error);
  }
};

export async function getNotificationsForUserDropdown(
  email: string
): Promise<NotificationWithStatus[]> {
  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);

  let notifications: NotificationWithStatus[] = [];

  if (adminStatus && rolePermissions.includes("notifications")) {
    const allNotifications = await getAllNotifications();
    const filtered = adminCountry.length
      ? allNotifications.filter((n: INotification) =>
          adminCountry.includes(n.country)
        )
      : allNotifications;

    notifications = filtered.map((n: INotification) => {
      const readEntry = n.readBy?.find((r) => r.email === email);
      const status = readEntry?.status === "read" ? "Read" : "Unread";
      return { ...n, userStatus: status };
    });
    // --- Sub-agent support for agency/non-admin users ---
    const profile = await getProfileByEmail(email);
    const subAgents = profile?.subAgents || [];

    // Fetch for current user
    const selfNotifications = await getNotificationsByAgency(email);

    // Fetch for sub-agents
    const subAgentNotifications: INotification[] = [];
    for (const sub of subAgents) {
      const subNotifs = await getNotificationsByAgency(sub);
      subAgentNotifications.push(...subNotifs);
    }

    // Merge and deduplicate
    const combined = [...selfNotifications, ...subAgentNotifications];
    const uniqueMap = new Map<string, INotification>();
    combined.forEach((n) => uniqueMap.set(n._id.toString(), n));

    const uniqueNotifications = Array.from(uniqueMap.values());

    notifications = uniqueNotifications.map((n: INotification) => {
      const plainNotif = n.toObject ? n.toObject() : n;
      const readEntry = plainNotif.readBy?.find(
        (r: IReadBy) => r.email === email
      );
      const status = readEntry?.status === "read" ? "Read" : "Unread";
      return { ...plainNotif, userStatus: status } as NotificationWithStatus;
    });
  }

  return notifications;
}
