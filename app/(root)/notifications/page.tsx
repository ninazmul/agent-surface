import {
  getAllNotifications,
  getNotificationsByAgency,
} from "@/lib/actions/notification.actions";
import NotificationTable from "../components/NotificationTable";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { INotification } from "@/lib/database/models/notification.model";

type NotificationWithStatus = INotification & {
  userStatus: "Read" | "Unread";
};

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;

  if (!userId) redirect("/");

  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  // ====== ADMIN PATH (profile not required)
  if (adminStatus) {
    if (!rolePermissions.includes("notifications")) {
      redirect("/");
    }
  } 
  // ====== NON-ADMIN PATH (profile required)
  else {
    // Profile must be Approved
    if (myProfile?.status !== "Approved") {
      redirect("/profile");
    }

    // Students are blocked
    if (myProfile?.role === "Student") {
      redirect("/profile");
    }
  }

  let notifications: NotificationWithStatus[] = [];

  if (adminStatus) {
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
  } else {
    const profile = await getProfileByEmail(email);
    const subAgents = profile?.subAgents || [];

    const myNotifications = await getNotificationsByAgency(email);
    const subAgentNotifications: INotification[] = [];

    for (const subAgentEmail of subAgents) {
      const subNotifs = await getNotificationsByAgency(subAgentEmail);
      if (subNotifs) subAgentNotifications.push(...subNotifs);
    }

    const merged = [...myNotifications, ...subAgentNotifications];

    // Avoid duplicates by _id if necessary
    const uniqueMap = new Map();
    for (const notif of merged) {
      uniqueMap.set(notif._id.toString().toString(), notif);
    }

    notifications = Array.from(uniqueMap.values()).map((n) => {
      const readEntry: { email: string; status: string } | undefined =
        n.readBy?.find(
          (r: { email: string; status: string }) => r.email === email
        );
      const status = readEntry?.status === "read" ? "Read" : "Unread";
      return { ...n, userStatus: status };
    });
  }

  return (
    <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
        <h3 className="h3-bold text-center sm:text-left">All Notifications</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-8">
        <NotificationTable notifications={notifications} email={email} />
      </div>
    </section>
  );
};

export default Page;
